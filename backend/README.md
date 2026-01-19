
# Investra Backend

This project now uses a Django backend.

## Setup

1. Navigate to `backend` folder: `cd backend`
2. Create virtual env: `python -m venv venv`
3. Activate: `venv\Scripts\activate` (Windows)
4. Install: `pip install -r requirements.txt` (or manually as done in setup)

## Running

1. Make sure you are in `backend` folder with venv activated.
2. Set Gemini API Key (PowerShell):
   `$env:GEMINI_API_KEY="your_api_key_here"`
3. Run server:
   `python manage.py runserver`

The API will be available at `http://localhost:8000/api/`.

## Frontend

The frontend is configured to proxy requests to `http://localhost:8000/api` via the `services/djangoApi.ts` file.
