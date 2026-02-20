from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models, ml_model, rule_engine
from data_generator import generate_fake_employees
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- INITIALIZE DATABASE TABLES ---
# This creates the 'hr_data.db' file and the 'employees' table on first run.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HR Attri-Sim: Decision Support System", version="1.0.0")

# --- CORS SETUP ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL MODEL STATE ---
# We keep the ML model in memory for fast predictions
ATTRITION_MODEL = None

# --- PYDANTIC MODELS (API Schema) ---
class SimulationParams(BaseModel):
    bradford_trigger: int = 400
    market_compa_ratio: float = 0.8
    burnout_hours: float = 60.0
    notice_period_limit: int = 60

class PredictionResponse(BaseModel):
    id: int
    name: str
    rule_risk_score: int
    ml_risk_probability: float
    status: str

# --- STARTUP LOGIC ---
@app.on_event("startup")
def startup_populate_db():
    global ATTRITION_MODEL
    db = next(get_db())
    
    # 1. CHECK DB FIRST: Persistence Logic
    # We check if the table has any rows. If it does, we NEVER regenerate.
    # This prevents creating new "fake people" every time the server restarts.
    existing_count = db.query(models.Employee).count()
    
    if existing_count == 0:
        logger.info("Database is empty. Generating seed data...")
        fake_data = generate_fake_employees(500)
        
        # We need default params to calculate the initial scores
        default_params = {"bradford_trigger": 400, "market_compa_ratio": 0.8, "burnout_hours": 60, "notice_period_limit": 60}
        
        for emp in fake_data:
            # 1. Calculate Risk using the Rule Engine
            analysis = rule_engine.RiskEngine.analyze_employee(emp, default_params)
            
            # 2. Calculate Attrition Cost
            cost = (emp['salary_lpa'] * 100000) * 0.20
            
            # 3. Create DB Model
            db_emp = models.Employee(
                **emp,
                risk_score=analysis['risk_score'],
                attrition_cost=round(cost, 2),
                risk_factors=", ".join(analysis['risk_factors'])
            )
            db.add(db_emp)
        db.commit()
        logger.info(f"Generated 500 employees.")
    else:
        logger.info(f"Loading {existing_count} existing employees from Persistent Storage.")

    # 2. TRAIN ML MODEL:
    # After data is confirmed, we train or load our Random Forest model.
    all_emps = db.query(models.Employee).all()
    ATTRITION_MODEL, msg = ml_model.load_or_train_model(all_emps)
    logger.info(msg)

class RiskAssessment(BaseModel):
    id: int
    name: str
    department: str
    risk_score: int
    risk_factors: List[str]
    attrition_cost: float
    ml_probability: float  # The AI's opinion

# --- API ENDPOINTS ---

@app.get("/")
def health_check():
    return {"status": "Online", "mode": "Decision Support System (DSS)"}

@app.get("/api/employees")
def get_all_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()

@app.post("/api/simulate", response_model=List[RiskAssessment])
def run_full_simulation(params: SimulationParams, db: Session = Depends(get_db)):
    """
    Core Analytics Engine (High Performance):
    Processes every employee through Rule Engine + ML Model in optimized batches.
    """
    global ATTRITION_MODEL
    employees = db.query(models.Employee).all()
    results = []
    
    engine_params = params.dict()
    
    # 1. OPTIMIZATION: Get all ML Predictions in one single batch call
    # This avoids the overhead of creating 500 individual pandas DataFrames.
    ml_probabilities, _ = ml_model.predict_attrition_batch(ATTRITION_MODEL, employees)
    
    for idx, emp in enumerate(employees):
        # 1. Rule Engine Scan
        analysis = rule_engine.RiskEngine.analyze_employee(emp.__dict__, engine_params)
        
        # 2. Financial Impact
        cost = (emp.salary_lpa * 100000) * 0.20
        
        results.append({
            "id": emp.id,
            "name": emp.name,
            "department": emp.department,
            "risk_score": analysis['risk_score'],
            "risk_factors": analysis['risk_factors'],
            "attrition_cost": round(cost, 2),
            "ml_probability": ml_probabilities[idx] # Use result from batch
        })
        
    # Sort by Rule-Based score (Standard logic)
    results.sort(key=lambda x: x['risk_score'], reverse=True)
    return results

@app.post("/api/predict-ml")
def predict_attrition_hybrid(emp_id: int, db: Session = Depends(get_db)):
    """
    The 'Pro' Feature: Hybrid Analytics.
    Returns both the algorithmic (Rule-Based) and statistical (ML) scores.
    """
    emp = db.query(models.Employee).filter(models.Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # 1. Rule-Based Score (RiskEngine)
    # We use a standard set of parameters for comparison
    params = {"bradford_trigger": 400, "market_compa_ratio": 0.8, "burnout_hours": 60, "notice_period_limit": 60}
    rule_results = rule_engine.RiskEngine.analyze_employee(emp.__dict__, params)
    
    # 2. ML-Based Probability (Random Forest)
    ml_prob, _ = ml_model.predict_attrition(ATTRITION_MODEL, emp.__dict__)

    return {
        "id": emp.id,
        "name": emp.name,
        "rule_risk_score": rule_results['risk_score'],
        "ml_risk_probability": ml_prob,
        "comparison": "Critical" if (rule_results['risk_score'] > 60 and ml_prob > 0.6) else "Monitoring"
    }

@app.post("/api/regenerate-data")
def force_data_refresh(db: Session = Depends(get_db)):
    """
    Why this exists?
    For testing only. It wipes everything and resets the simulation.
    Crucial for validating model updates or data variety.
    """
    global ATTRITION_MODEL
    
    # 1. Wipe DB
    db.query(models.Employee).delete()
    db.commit()
    
    # 2. Generate Brand New 500
    fake_data = generate_fake_employees(500)
    default_params = {"bradford_trigger": 400, "market_compa_ratio": 0.8, "burnout_hours": 60, "notice_period_limit": 60}
    
    for emp in fake_data:
        analysis = rule_engine.RiskEngine.analyze_employee(emp, default_params)
        cost = (emp['salary_lpa'] * 100000) * 0.20
        db_emp = models.Employee(
            **emp,
            risk_score=analysis['risk_score'],
            attrition_cost=round(cost, 2),
            risk_factors=", ".join(analysis['risk_factors'])
        )
        db.add(db_emp)
    db.commit()
    
    # 3. Retrain Model
    all_emps = db.query(models.Employee).all()
    # We use train_model directly to force a fresh fit on new data
    ATTRITION_MODEL, msg = ml_model.train_model(all_emps)
    
    return {
        "message": "Data Wiped and Regenerated Successfully",
        "new_count": len(all_emps),
        "ml_retrain_status": msg
    }
