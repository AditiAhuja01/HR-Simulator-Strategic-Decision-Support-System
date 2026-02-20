import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os

# --- ML CONFIGURATION ---
MODEL_PATH = "attrition_model.joblib"

# Why Random Forest? 
# 1. It handles non-linear relationships better than Logistic Regression. 
#    Example: High salary + Low absenteeism might be safe, but High salary + High hours might be risk.
#    Logistic Regression assumes a straight line; Random Forest uses 'Decision Trees' (if/else logic).
# 2. It is less prone to 'Overfitting' because it combines many trees (an 'Ensemble').
# 3. It gives a 'Probability' score, which is more useful for HR than a simple 'Yes/No'.

def train_model(db_employees: list):
    """
    Trains a Random Forest Classifier on the current database records.
    """
    if not db_employees:
        return None, "No data to train on"

    # 1. Convert DB objects to a Pandas DataFrame
    data = []
    for emp in db_employees:
        data.append({
            "salary_lpa": emp.salary_lpa,
            "absence_spells": emp.absence_spells,
            "total_absent_days": emp.total_absent_days,
            "work_hours": emp.work_hours,
            "leaves_left": emp.leaves_left,
            "notice_period_days": emp.notice_period_days,
            "hike_offered_pct": emp.hike_offered_pct,
            "performance_score": emp.performance_score,
            "target": 1 if emp.risk_score > 60 else 0  # Derive target from rule engine
        })
    
    df = pd.DataFrame(data)
    
    # 2. Split Features (X) and Target (y)
    X = df.drop("target", axis=1)
    y = df["target"]
    
    # 3. Train the Model
    # n_estimators=100 means we build 100 decision trees and average them.
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # 4. Save the Model for future use
    joblib.dump(model, MODEL_PATH)
    return model, "Model trained successfully"

def load_or_train_model(db_employees: list):
    """
    Tries to load an existing model; if not found, trains a new one.
    """
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            return model, "Model loaded from disk"
        except:
            pass # If load fails, retrain
            
    return train_model(db_employees)

def predict_attrition_batch(model, employees_list: list):
    """
    Predicts probabilities for a list of employees in one go.
    This is significantly faster than calling predict_attrition 500 times
    because it avoids the overhead of creating 500 small DataFrames.
    """
    if model is None:
        return [0] * len(employees_list), "Model not trained"

    # 1. Create one big DataFrame for all employees
    data = []
    for emp in employees_list:
        # Check if emp is a dict or a DB object
        if hasattr(emp, '__dict__'):
            emp_data = emp.__dict__
        else:
            emp_data = emp
            
        data.append({
            "salary_lpa": emp_data['salary_lpa'],
            "absence_spells": emp_data['absence_spells'],
            "total_absent_days": emp_data['total_absent_days'],
            "work_hours": emp_data['work_hours'],
            "leaves_left": emp_data['leaves_left'],
            "notice_period_days": emp_data['notice_period_days'],
            "hike_offered_pct": emp_data['hike_offered_pct'],
            "performance_score": emp_data['performance_score']
        })
    
    X = pd.DataFrame(data)
    
    # 2. Get all predictions at once
    # Result is a list of [prob_safe, prob_risk]
    probs = model.predict_proba(X)
    
    # 3. Extract only the 'risk' probability (index 1) for everyone
    return [round(float(p[1]), 2) for p in probs], "Batch prediction successful"

def predict_attrition(model, emp_data: dict):
    """
    Predicts the probability of an employee leaving.
    The output is a percentage (e.g., 0.75 = 75% risk).
    """
    if model is None:
        return 0, "Model not trained"

    # Prepare input for prediction
    # Must match the order used in training
    features = pd.DataFrame([{
        "salary_lpa": emp_data['salary_lpa'],
        "absence_spells": emp_data['absence_spells'],
        "total_absent_days": emp_data['total_absent_days'],
        "work_hours": emp_data['work_hours'],
        "leaves_left": emp_data['leaves_left'],
        "notice_period_days": emp_data['notice_period_days'],
        "hike_offered_pct": emp_data['hike_offered_pct'],
        "performance_score": emp_data['performance_score']
    }])
    
    # predict_proba returns [prob_safe, prob_risk]
    # We want index 1 (the probability of leaving)
    probability = model.predict_proba(features)[0][1]
    return round(float(probability), 2), "Prediction successful"
