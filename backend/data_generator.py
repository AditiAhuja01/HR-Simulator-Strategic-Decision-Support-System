from faker import Faker
import random

fake = Faker('en_IN') # Indian Names!

DEPARTMENTS = ["Engineering", "Sales", "HR", "Marketing", "Operations"]

def generate_fake_employees(count=100):
    employees = []
    
    for i in range(count):
        dept = random.choice(DEPARTMENTS)
        
        # Salary Logic (Engineers get paid more)
        base_lpa = 12 if dept == "Engineering" else 8
        salary_lpa = round(random.uniform(base_lpa - 4, base_lpa + 15), 1)
        market_lpa = round(salary_lpa * random.uniform(0.8, 1.3), 1)
        
        # Risk Factors (More Realistic Probability Distribution)
        # Smoother curve: 0, 1, 2, 3, 4, 5, 6, 8 spells
        # Scores: 0, 2, 16, 54, 128, 250, 432, 1024
        absence_spells = random.choices(
            [0, 1, 2, 3, 4, 5, 6, 8], 
            weights=[35, 25, 15, 5, 5, 10, 3, 2]
        )[0]
        
        # Most people have standard 30-60 day notice
        notice_period_days = random.choices([30, 60, 90], weights=[50, 40, 10])[0]
        
        # Hike percentages: Most get 10-20%
        hike_offered_pct = round(random.uniform(5.0, 35.0), 1)

        # Total days absent (e.g. 1-3 days per spell)
        total_absent_days = absence_spells * random.randint(1, 3) if absence_spells > 0 else 0

        emp = {
            "id": 1000 + i,
            "name": fake.name(),
            "department": dept,
            "salary_lpa": salary_lpa,
            "market_lpa": market_lpa,
            "work_hours": round(random.uniform(35, 65), 1),
            "leaves_left": random.randint(0, 30),
            "performance_score": random.randint(1, 10),
            "absence_spells": absence_spells,
            "total_absent_days": total_absent_days,
            "notice_period_days": notice_period_days,
            "hike_offered_pct": hike_offered_pct
        }
        employees.append(emp)
        
    return employees

if __name__ == "__main__":
    # Test it out
    data = generate_fake_employees(5)
    print(data)
