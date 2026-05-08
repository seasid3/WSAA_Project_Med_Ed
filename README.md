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
├── BST_DAO.py              # Database access layer (connection pooling, parameterised queries)
├── db_config.py            # DB credentials — NOT committed (see db_config_example.py)
├── db_config_example.py    # Template showing required config keys
├── schema.sql              # MySQL DDL — run once on PythonAnywhere to create the table
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

Single table: `bst_applicants`

| Column | Type | Notes |
|--------|------|-------|
| `rcppi_id` | INT AUTO_INCREMENT | Primary key, assigned automatically |
| `first_name` | VARCHAR(50) | Required |
| `surname` | VARCHAR(50) | Required |
| `dob` | DATE | Required |
| `bst_scheme` | ENUM | Required — one of the 4 BST specialties |
| `interview_score` | DECIMAL(5,2) | Optional at creation |
| `place_offered` | TINYINT(1) | 1 = yes, 0 = no, NULL = not yet decided |
| `acceptance` | ENUM('accepted','refused') | Optional |

---

## How to Run Locally

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up the database**  
   Run `schema.sql` against a local MySQL instance.

3. **Configure credentials**  
   Copy `db_config_example.py` to `db_config.py` and fill in your credentials.

4. **Start the server**
   ```bash
   python server.py
   ```
   Then open `http://127.0.0.1:5000` in your browser.

---

## PythonAnywhere Deployment

1. Create a PythonAnywhere account and a MySQL database named `rcppi_bst`.
2. Run `schema.sql` in the MySQL console.
3. Upload all files to `/home/OWoods/rcppi_bst/`.
4. Create `db_config.py` manually on PythonAnywhere (do **not** push it to GitHub).
5. Set up a new web app pointing to `/home/OWoods/rcppi_bst/server.py`, Python 3.11.
6. Install requirements: `pip3.11 install --user flask mysql-connector-python`
7. Reload the web app.

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
- **MySQL** — database (hosted on PythonAnywhere)
- **mysql-connector-python** — DB driver with connection pooling
- **Vanilla JavaScript** — frontend AJAX (no React, no framework)
- **HTML5 / CSS3** — single-page interface

## References

- [Flask Documentation](https://flask.palletsprojects.com/)
- [mysql-connector-python docs](https://dev.mysql.com/doc/connector-python/en/)
- [PythonAnywhere help](https://help.pythonanywhere.com/)
- Claude (Anthropic) — AI assistant used throughout (prompts logged above)
