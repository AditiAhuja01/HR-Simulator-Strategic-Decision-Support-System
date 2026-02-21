from typing import List, Optional

class RiskEngine:
    """
    Enterprise Grade Rule Engine.
    Separates 'Business Logic' from 'API Logic'.
    """
    
    @staticmethod
    def calculate_bradford_score(spells: int, days: int) -> int:
        """Formula: B = S^2 * D"""
        return (spells ** 2) * days

    @staticmethod
    def analyze_employee(emp: dict, params: dict) -> Optional[dict]:
        """
        Analyzes a single employee against the rule set.
        params: dictionary of threshold values (bradford_trigger, etc)
        """
        risks = []
        total_risk_score = 0
        
        # --- RULE 1: Absenteeism (Weighted Score: 30) ---
        bradford = RiskEngine.calculate_bradford_score(emp['absence_spells'], emp['total_absent_days'])
        if bradford > params['bradford_trigger']:
            total_risk_score += 30
            risks.append(f"Absenteeism (BF Score: {bradford})")

        # --- RULE 2: Pay Parity (Weighted Score: 40 - MONEY MATTERS) ---
        compa = emp['salary_lpa'] / emp['market_lpa']
        if emp['performance_score'] > 7 and compa < params['market_compa_ratio']:
            total_risk_score += 40
            risks.append(f"Flight Risk (Underpaid: {int(compa*100)}%)")

        # --- RULE 3: Burnout (Weighted Score: 20) ---
        if emp['work_hours'] > params['burnout_hours'] and emp['leaves_left'] > 15:
            total_risk_score += 20
            risks.append(f"Burnout (Hrs: {emp['work_hours']})")

        # --- RULE 4: Ghosting (Weighted Score: 50 - CRITICAL) ---
        if emp['notice_period_days'] > params['notice_period_limit'] and emp['hike_offered_pct'] < 30:
            total_risk_score += 50
            risks.append("Ghosting Risk (Notice > 60d)")

        # --- FINAL DECISION ---
        if not risks:
            # RETURN SAFE EMPLOYEE (But with 0 Score)
            return {
                "id": emp['id'],
                "name": emp['name'],
                "department": emp['department'],
                "risk_score": 0,
                "risk_factors": [] # Empty list = Safe
            }
        
        # Cap score at 100
        final_score = min(total_risk_score, 100)
        
        return {
            "id": emp['id'],
            "name": emp['name'],
            "department": emp['department'],
            "risk_score": final_score,
            "risk_factors": risks
        }
