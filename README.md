# HR Attri-Sim: Predictive Decision Support System

A proactive HR analytics platform that predicts employee attrition risk before it happens by combining a policy-driven Rule Engine with a Machine Learning (Random Forest) model for real-time risk assessment, financial impact analysis, and interactive policy simulation.

Live Demo: Coming Soon

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | Python, FastAPI |
| **AI / ML** | Scikit-Learn (Random Forest), Pandas, Joblib |
| **Database** | SQLite |

---

## Core Features

- **Policy Risk Engine** — 5 HR algorithms calculate a Policy Risk Score (0–100).
- **ML Attrition Risk** — Random Forest Classifier predicts attrition probability independent of policy settings.
- **Financial Impact Analyzer** — Translates risk into financial metrics using standardized replacement cost formulas.
- **Interactive Policy Simulator** — Adjust parameters and see real-time impact on team stability.
- **Data Persistence** — SQLite storage ensures data consistency across server restarts.

---

## Getting Started

Note: First load may take 30-60 seconds as the server initializes data on Render's free tier.

### Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

Note: hr_data.db and attrition_model.joblib are auto-generated on the first run.

---

## Algorithm and ML Logic
For a detailed breakdown of the algorithms and the machine learning model, refer to [LOGIC.md](./LOGIC.md).
