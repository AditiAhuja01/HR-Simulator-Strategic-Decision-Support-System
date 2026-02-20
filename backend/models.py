from sqlalchemy import Column, Integer, String, Float
from database import Base

class Employee(Base):
    """
    SQLAlchemy Model for the 'employees' table.
    This defines the structure of our database storage.
    """
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    department = Column(String)
    salary_lpa = Column(Float)  # Salary in Lakhs Per Annum
    market_lpa = Column(Float)  # Market Benchmark for comparison
    performance_score = Column(Integer)  # 1 to 10
    absence_spells = Column(Integer)  # How many times they were absent
    total_absent_days = Column(Integer)
    work_hours = Column(Integer)  # Hours per week
    leaves_left = Column(Integer)
    notice_period_days = Column(Integer)
    hike_offered_pct = Column(Integer)
    
    # Simulation Results (Stored for history/benchmarking)
    risk_score = Column(Integer)  # 0 to 100
    attrition_cost = Column(Float)  # Estimated replacement cost
    risk_factors = Column(String)  # Stored as a comma-separated string
