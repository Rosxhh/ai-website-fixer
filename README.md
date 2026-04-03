# AI Website Auto-Fixer & SEO Auditor

Welcome! To run this project after closing your current terminals, follow these simple steps:

## 1. Start the Backend (Django)
Open a **new terminal** and run the following:
```powershell
cd backend
# Activate the virtual environment
.venv\Scripts\activate
# Start the server
python manage.py runserver
```
*The backend handles the AI analysis and scans URLs.*

## 2. Start the Frontend (React)
Open a **second terminal** and run:
```powershell
cd frontend
npm start
```
*The frontend provides the premium "Antigravity" user interface.*

---

### Additional Tips:
- **Troubleshooting**: If you see an error about `framer-motion` or `lucide-react`, run `npm install` again in the `frontend` folder.
- **Port Conflicts**: If port 3000 or 8000 is busy, make sure no other instances of the servers are running.
