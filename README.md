# HR Attri-Sim: Predictive Decision Support System

A HR analytics platform that predicts employee attrition risk **before** it happens. It combines a policy-driven **Rule Engine** with a **Machine Learning (Random Forest)** model to deliver real-time risk assessments, financial impact analysis, and interactive policy simulation.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Python 3.13+, FastAPI, SQLAlchemy (ORM) |
| **AI / ML** | Scikit-Learn (Random Forest), Pandas, Joblib |
| **Database** | SQLite (Persistent Storage) |

---

## ⚙️ Core Features

- **Policy Risk Engine** — 5 HR algorithms (Bradford Factor, Compa-Ratio, Burnout, Ghosting Risk, Risk Stratification) calculate a Policy Risk Score (0–100)
- **ML Attrition Risk** — Random Forest Classifier predicts attrition probability based on employee data patterns
- **Financial Impact** — Calculates estimated replacement cost per at-risk employee
- **Interactive Simulator** — Adjust policy parameters via sliders and see real-time impact on team stability
- **Data Persistence** — Employee data stored in SQLite, fetched on every restart without regeneration

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
> **Data Note:** `hr_data.db` and `attrition_model.joblib` are auto-generated on the first run.

---

## 👨‍💻 Developer
**Aditi Ahuja**  
*MCA Graduate | Full Stack Developer*
