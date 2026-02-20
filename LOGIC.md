# 🧠 The "Intelligence" Behind HR Attri-Sim

This document explains the mathematical formulas and machine learning logic that make this project a **Decision Support System**, not just a simple dashboard.

---

## 📂 Summary of the 5 Core Algorithms

### 1. Absenteeism Risk (Bradford Factor)
*   **The Formula:** $B = S^2 \times D$
    *   $S$ = Total number of spells (instances) of absence.
    *   $D$ = Total number of days absent.
*   **Why it's smart:** In HR, taking 10 leaves of 1 day each ($10^2 \times 10 = 1000$) is much more disruptive than taking 1 leave of 10 days ($1^2 \times 10 = 10$). A high score indicates a pattern of "Monday/Friday" absenteeism.
*   **Weight:** 30% of the total risk score.

### 2. Pay Parity Risk (Compa-Ratio)
*   **The Concept:** It compares an employee's salary to the Market Benchmark.
*   **The Logic:** If `(Salary / Market_Benchmark) < Threshold` AND `Performance > 7`.
*   **Why it's smart:** It specifically flags **"High Performers who are Underpaid."** These are the people most likely to be headhunted by competitors.
*   **Weight:** 40% of the total risk score.

### 3. Burnout Risk (Work-Life Balance)
*   **The Logic:** `Work_Hours > Threshold` AND `Leaves_Left > 15`.
*   **Why it's smart:** An employee working 60+ hours a week who *refuses* to take their earned leaves is at a high risk of "Silent Burnout," leading to sudden resignation.
*   **Weight:** 20% of the total risk score.

### 4. Ghosting Risk (Notice Period Friction)
*   **The Logic:** `Notice_Period > 60 days` AND `Hike_Offered < 30%`.
*   **Why it's smart:** Employees with very long notice periods who receive low hikes often feel "trapped." This leads to "Ghosting" behavior where they resign and stop performing during their 3-month wait.
*   **Weight:** 50% of the total risk score.

> [!IMPORTANT]
> **Score Normalization:** You may notice the individual weights (30+40+20+50) add up to **140**. In the code (`rule_engine.py`), the final score is **capped at 100**. This ensures that if an employee is a "Multi-Risk" candidate, their score stays normalized on a 0-100 scale while representing maximum severity.

---

### 5. Strategic Attrition Prediction (Machine Learning)
*   **The Model:** Random Forest Classifier.
*   **The Logic:** Unlike the rules above which are "If/Else," this model looks for **Multi-dimensional Patterns**.
    *   *Example:* A person might have a low Rule Score, but the AI sees that their Department + Tenure + Salary Gap matches the pattern of 50 people who quit last year.
*   **Technology:** Trained using `Scikit-Learn` and saved via `Joblib`.

---

## 🎓 Why this is an MCA-level project?
1.  **Full Stack Integration:** FastAPI (Python) + React (JS).
2.  **ML Pipeline:** Real-time prediction and model persistence.
3.  **Domain Expertise:** Implementing real HR formulas like the Bradford Factor.
4.  **Performance:** Optimized batch processing for 500+ records.
