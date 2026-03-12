# AHP-TOPSIS Laptop Ranking System

A decision support system that uses the **Analytic Hierarchy Process (AHP)** and **TOPSIS** (Technique for Order of Preference by Similarity to Ideal Solution) to help users choose the best laptop based on multiple criteria (Performance, Resolution, Capacity, Portability, Battery, Price).

## 👥 Project Members

| Name | Student ID |
|------|------------|
| Pham Duc Manh | 10422047 |
| Vo Tan Sang | 10422114 |
| Tran Si Nguyen | 10422057 |
| Nguyen Thanh Son | 10422072 |

## 🚀 Features

- **AHP Algorithm:** Weighs criteria using pairwise comparisons.
- **TOPSIS Algorithm:** Ranks laptops by their distance from the ideal and anti-ideal solutions.
- **Interactive Web UI:** Intuitive frontend for adjusting criteria importance.
- **Admin Dashboard:** Manage laptop database and user accounts.
- **Authentication:** Secure login for administrators and regular users.
- **RESTful API:** Robust backend built with FastAPI.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Axios.
- **Backend:** FastAPI (Python 3.10+), SQLAlchemy.
- **Database:** PostgreSQL (Recommended) or SQLite.
- **Algorithms:** NumPy for matrix operations.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/download/) (If using Postgres)
- [Git](https://git-scm.com/)

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/votan/ahp-topsis-project.git
cd ahp-topsis-project
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment:

```bash
cd backend
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configuration (.env)
Create a `.env` file in the `backend/` directory to configure your database:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/db_name
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```
*Note: If `DATABASE_URL` is not provided, it defaults to a local SQLite database (`sqlite:///./sql_app.db`).*

#### Seed the Database
Run the seed script to create database tables and add default laptops and users:
```bash
python seed_db.py
```

### 3. Frontend Setup
Navigate to the frontend directory and install npm packages:

```bash
cd ../frontend
npm install
```

---

## 🏃 Running the Application

### Start the Backend
From the `backend` directory (with virtual environment active):
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```
The API will be available at `http://localhost:8001`.

### Start the Frontend
From the `frontend` directory:
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## 🔑 Default Credentials

After running `seed_db.py`, you can use these default accounts for testing:

| Role  | Email              | Password |
|-------|--------------------|----------|
| Admin | admin@example.com  | admin123 |
| User  | user@example.com   | user123  |

---

## 📖 API Documentation

Once the backend is running, you can access the interactive API docs:
- **Swagger UI:** [http://localhost:8001/docs](http://localhost:8001/docs)
- **ReDoc:** [http://localhost:8001/redoc](http://localhost:8001/redoc)

## 📁 Project Structure

- `backend/`: FastAPI application, database models, and algorithms.
- `frontend/`: React application with Vite.
- `seed_db.py`: Database initialization script.
