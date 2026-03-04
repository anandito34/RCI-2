# RCI Legal Consultation API (FastAPI)

This is the Python backend for the Roys Counsel Indonesia Marketplace.

## Prerequisites
You need **Python 3.9+** installed on your system.
Karena sepertinya Python belum terdaftar di komputer Anda, silakan unduh Python dari [python.org](https://www.python.org/downloads/) atau Microsoft Store.

## Installation & Running

1. Open a terminal in this `backend` folder.
2. Create standard virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the API Server:
   ```bash
   uvicorn main:app --reload
   ```

The backend API will start on `http://localhost:8000`.

Frontend is already configured to point to `http://localhost:8000/api/auth/login` and `http://localhost:8000/api/auth/register`.
