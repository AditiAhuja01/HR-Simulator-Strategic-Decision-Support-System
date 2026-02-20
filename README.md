# HR Attri-Sim: Predictive Decision Support System

A proactive HR analytics platform that predicts employee attrition risk before it happens — combining a policy-driven Rule Engine with a Machine Learning (Random Forest) model for real-time risk assessment, financial impact analysis, and interactive policy simulation.

🔗 **Live Demo:** Coming Soon

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | Python, FastAPI |
| **AI / ML** | Scikit-Learn (Random Forest), Pandas, Joblib |
| **Database** | SQLite |

---

## ⚙️ Core Features

- **Policy Risk Engine** — 5 HR algorithms (Bradford Factor, Compa-Ratio, Burnout Analysis, Ghosting Risk, Risk Stratification) calculate a Policy Risk Score (0–100).
- **ML Attrition Risk** — Random Forest Classifier predicts attrition probability based on employee data patterns, independent of policy settings.
- **Financial Impact Analyzer** — Translates risk into money using industry standard 20% replacement cost formula.
- **Interactive Policy Simulator** — Adjust sliders and see real-time impact on team stability.
- **Data Persistence** — SQLite stores employee data on first run, fetched on every restart without regeneration.

---

## 🚀 Getting Started

### Backend
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dashboard:
   ```bash
   npm run dev
   ```

Open `http://localhost:5173` in your browser.

> [!NOTE]  
> **Data Note:** `hr_data.db` and `attrition_model.joblib` are auto-generated on the first run — do not manually create them.

---

## 🧠 Algorithm & ML Logic
For a detailed breakdown of all 5 algorithms and the Random Forest model, see [LOGIC.md](./LOGIC.md).

---

## 👨‍💻 Developer
**Aditi Ahuja**  
*MCA Graduate | Full Stack Developer*
