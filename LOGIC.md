# The Intelligence Behind HR Attri-Sim

This document explains the mathematical formulas and machine learning logic that make this project a Decision Support System, not just a simple dashboard.

---

## Summary of the Core Algorithms

### 1. Absenteeism Risk (Bradford Factor)
*   **The Formula:** $B = S^2 \times D$
    *   $S$ = Total number of spells (instances) of absence.
    *   $D$ = Total number of days absent.
*   **Why it's smart:** In HR, taking 10 leaves of 1 day each ($10^2 \times 10 = 1000$) is much more disruptive than taking 1 leave of 10 days ($1^2 \times 10 = 10$). A high score indicates a pattern of disruption.
*   **Weight:** 30% of the total risk score.

### 2. Pay Parity Risk (Compa-Ratio)
*   **The Concept:** It compares an employee's salary to the Market Benchmark.
*   **The Logic:** If `(Salary / Market_Benchmark) < Threshold` AND `Performance > 7`.
*   **Why it's smart:** It specifically flags "High Performers who are Underpaid." These are the individuals most likely to be headhunted by competitors.
*   **Weight:** 40% of the total risk score.

### 3. Burnout Risk (Work-Life Balance)
*   **The Logic:** `Work_Hours > Threshold` AND `Leaves_Left > 15`.
*   **Why it's smart:** An employee working high overtime hours who maintains a high balance of unused leave is at a high risk of burnout.
*   **Weight:** 20% of the total risk score.

### 4. Ghosting Risk (Notice Period Friction)
*   **The Logic:** `Notice_Period > 60 days` AND `Hike_Offered < 30%`.
*   **Why it's smart:** Employees with very long notice periods who receive low hikes often feel a lack of career progression, leading to a higher probability of resignation during the waiting period.
*   **Weight:** 50% of the total risk score.

### 5. Risk Stratification (Normalization)
*   **The Logic:** Scores are weighted based on severity and then capped at 100.
*   **Why it's smart:** Individual weights (30+40+20+50) sum to 140. In the processing logic, the final score is capped at 100 to ensure a normalized 0-100 scale while representing maximum severity for multi-risk candidates.
*   **Output Scale:** 0-50 (Low/Moderate), 50-75 (Elevated), 75-100 (Critical).

### 6. Strategic Attrition Prediction (Machine Learning)
*   **The Model:** Random Forest Classifier.
*   **The Logic:** Unlike rule-based "If/Else" logic, this model identifies multi-dimensional patterns.
    *   Example: An individual might have a low Rule Score, but the AI identifies that their Department, Tenure, and Salary Gap align with historical attrition patterns.
*   **Technology:** Implemented using Scikit-Learn with model persistence via Joblib.
