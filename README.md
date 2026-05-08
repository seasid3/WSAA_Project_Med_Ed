# Web Services And Applications Project
## Author: Orla Woods

This repository contains my project for the Web Services and Applications (WSAA) module at ATU.

---

## Application: RCPI BST Applicant Management System

I work in the Royal College of Physicians of Ireland (RCPI). Each year the College receives applications from doctors who have completed their medical degree and intern year and wish to begin Basic Specialist Training (BST) in one of four specialties: Obstetrics and Gynaecology, Histopathology, General Internal Medicine, and Paediatrics.

This web application allows College administrators to manage those applicants — recording details, logging interview scores, marking offers, and tracking acceptances — through a clean browser interface backed by a REST API.

### Live Application

> **Hosted on PythonAnywhere:** https://OWoods.pythonanywhere.com

---

## Project Structure

```
WSAA_Project_Med_Ed/
├── server.py               # Flask app — all API endpoints
├── BST_DAO.py              # Database access layer (parameterised queries, no SQL injection)
├── db_config.py            # Database file path config
├── schema.sql              # SQLite DDL — applied automatically on first run
├── requirements.txt        # Python dependencies
├── static/
│   ├── BSTApplications.html   # Single-page frontend
│   ├── BST_applications.js    # All AJAX logic
│   └── style.css              # RCPI-branded styling
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/applicants` | All applicants, ranked by interview score (desc) |
| GET | `/applicants/<id>` | Single applicant |
| GET | `/applicants/offers` | Applicants who received an offer, by scheme |
| GET | `/applicants/acceptances` | Offered applicants with acceptance status, by scheme |
| POST | `/applicants` | Create new applicant |
| PUT | `/applicants/<id>` | Update applicant |
| DELETE | `/applicants/<id>` | Delete applicant |

---

## Database

SQLite — single file (`rcppi_bst.db`), created automatically on first run. Single table: `bst_applicants`.

| Column | Type | Notes |
|--------|------|-------|
| `rcppi_id` | INTEGER PRIMARY KEY | Auto-assigned |
| `first_name` | TEXT | Required |
| `surname` | TEXT | Required |
| `dob` | TEXT | Required |
| `bst_scheme` | TEXT | Required — one of the 4 BST specialties |
| `interview_score` | REAL | Optional at creation |
| `place_offered` | INTEGER | 1 = yes, 0 = no, NULL = not yet decided |
| `acceptance` | TEXT | 'accepted' or 'refused', optional |

---

## How to Run Locally

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the server**
   ```bash
   python server.py
   ```
   The SQLite database file is created automatically on first run.  
   Then open `http://127.0.0.1:5000` in your browser.

---

## PythonAnywhere Deployment

1. Open a Bash console on PythonAnywhere and run:
   ```bash
   cd ~ && git clone https://github.com/seasid3/WSAA_Project_Med_Ed /home/OWoods/rcppi_bst
   ```
2. Install Flask:
   ```bash
   pip3.11 install --user flask
   ```
3. Set up the web app — point it to `/home/OWoods/rcppi_bst/server.py`, Python 3.11.
4. Edit the WSGI file to contain:
   ```python
   import sys
   sys.path.insert(0, '/home/OWoods/rcppi_bst')
   from server import app as application
   ```
5. Click **Reload**. The SQLite database is created automatically on first request.

---

## AI Assistance — Prompt Log

This project was built with the assistance of Claude (Anthropic).

### Prompt 1
Provided the full project description, background brief, and technical requirements (Flask, CRUD, MySQL, AJAX, no React, separate files, connection pooling, no SQL injection). Claude summarised the architecture and began generating files.

### Prompt 2
Specified the app should be an RCPI BST Applicant Management System, defined the database columns, CRUD operations needed, read queries (ranked list, offers, acceptances by specialty), and validation rules (first name, surname, DOB and scheme required before creation).

### Prompt 3
Confirmed PythonAnywhere username as `OWoods`, confirmed folder name `rcppi_bst` (double-p). Claude updated all references accordingly.

### Prompt 4 (Claude Code)
Continued in Claude Code CLI. Claude recreated all project files from scratch based on the README and prior conversation context, then pushed them to GitHub.

---

## Technologies Used

- **Python 3.11** / **Flask** — server and REST API
- **SQLite** — lightweight file-based database (built into Python, no server required)
- **Vanilla JavaScript** — frontend AJAX (no React, no framework)
- **HTML5 / CSS3** — single-page interface

## References

- [Flask Documentation](https://flask.palletsprojects.com/)
- [mysql-connector-python docs](https://dev.mysql.com/doc/connector-python/en/)
- [PythonAnywhere help](https://help.pythonanywhere.com/)
- Claude (Anthropic) — AI assistant used throughout (prompts logged above)
