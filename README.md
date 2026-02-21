# HR Attri-Sim: Predictive Decision Support System

A proactive HR analytics platform that predicts employee attrition risk before it happens by combining a policy-driven Rule Engine with a Machine Learning (Random Forest) model for real-time risk assessment, financial impact analysis, and interactive policy simulation.

Project Access: [Explore the Interactive System](https://hr-simulator-strategic-decision-sup.vercel.app)

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

## API Access

The backend is hosted on Render and can be accessed via the following endpoints:
- **Base URL:** `https://hr-simulator-strategic-decision-support.onrender.com`
- **Documentation:** `https://hr-simulator-strategic-decision-support.onrender.com/docs`

---

## Algorithm and ML Logic
For a detailed breakdown of the algorithms and the machine learning model, refer to [LOGIC.md](./LOGIC.md).
