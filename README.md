# 📊 HR Attri-Sim: Predictive Decision Support System

An advanced HR Analytics platform that predicts employee attrition risk using a hybrid intelligence approach. It combines a policy-driven **Rule Engine** with a **Machine Learning (Random Forest)** model to provide real-time risk assessments, financial impact analysis, and policy simulation.

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Python 3.13+, FastAPI, SQLAlchemy (ORM) |
| **AI/ML** | Scikit-Learn (Random Forest), Pandas, Joblib |
| **Database** | SQLite (Persistent Storage) |

---

## 🚀 Getting Started

### 1. Backend Setup (AI & Data Engine)
1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate  # Windows
    # source venv/bin/activate  # Mac/Linux
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Start the server:
    ```bash
    uvicorn main:app --reload --port 8000
    ```

### 2. Frontend Setup (Analytics Dashboard)
1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the dashboard:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:5173](http://localhost:5173) in your browser.

> [!NOTE]  
> **Data Persistence:** The `hr_data.db` (Database) and `attrition_model.joblib` (ML Model) files are auto-generated on the first run. You do not need to download or commit these files; the system will seed 500 records and train the model automatically on startup.

---

## 👨‍💻 Developer
**Aditi Ahuja**  
*MCA Graduate | Full Stack Developer*
