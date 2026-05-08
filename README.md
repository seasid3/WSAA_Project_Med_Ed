# Web Services And Applications Project
## Author: Orla Woods

This repository contains my project for the Web Services and Applications (WSAA) module at ATU.

---

## Application: RCPI BST Applicant Management System

I work in the Royal College of Physicians of Ireland (RCPI). Each year the College receives applications from doctors who have completed their medical degree and intern year and wish to begin Basic Specialist Training (BST) in one of four specialties: Obstetrics and Gynaecology, Histopathology, General Internal Medicine, and Paediatrics.

This web application allows College administrators to manage those applicants — recording details, logging interview scores, marking offers, and tracking acceptances — through a clean browser interface backed by a REST API.

### Live Application

> **Hosted on PythonAnywhere:** https://owoods.eu.pythonanywhere.com

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
│   ├── style.css              # RCPI-branded styling
│   └── rcpi_logo.webp         # RCPI crest logo
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/applicants?year=YYYY` | All applicants for a given year, ranked by interview score |
| GET | `/applicants/<id>` | Single applicant |
| GET | `/applicants/offers?year=YYYY` | Applicants who received an offer |
| GET | `/applicants/acceptances?year=YYYY` | Offered applicants with acceptance status |
| GET | `/years` | All years with applicant data |
| POST | `/applicants` | Create new applicant |
| PUT | `/applicants/<id>/interview` | Record interview outcome |
| POST | `/applicants/assign-offers?year=YYYY` | Auto-assign top 10 offers per specialty |
| PUT | `/applicants/<id>/acceptance` | Record acceptance or refusal (triggers cascade offer if refused) |
| DELETE | `/applicants/<id>` | Delete applicant |

---

## Database

SQLite — single file (`rcppi_bst.db`), created automatically on first run. Single table: `bst_applicants`.

| Column | Type | Notes |
|--------|------|-------|
| `rcppi_id` | INTEGER PRIMARY KEY | Auto-assigned, starts at 1001 |
| `first_name` | TEXT | Required |
| `surname` | TEXT | Required |
| `dob` | TEXT | Required |
| `bst_scheme` | TEXT | Required — one of the 4 BST specialties |
| `application_year` | INTEGER | Defaults to 2026, used to separate yearly cohorts |
| `interview_status` | TEXT | completed / no_interview / withdrawn |
| `interview_score` | REAL | Recorded after interview |
| `place_offered` | INTEGER | 1 = yes, 0 = no, NULL = not yet decided |
| `acceptance` | TEXT | accepted / refused |

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
3. On the **Web** tab, select **Manual configuration**, Python 3.11.
4. Edit the WSGI file to contain:
   ```python
   import sys
   sys.path.insert(0, '/home/OWoods/rcppi_bst')
   from server import app as application
   ```
5. Click **Reload**. The SQLite database is created automatically on first request.

---

## AI Assistance — Prompt Log

This project was built with the assistance of Claude (Anthropic) across two sessions: Claude.ai (web chat) and Claude Code (CLI). All prompts are documented below, with notes indicating where AI help was required for technical implementation and where design decisions were made by the author for usability.

---

### Session 1 — Claude.ai (Web Chat)

#### Prompt 1 — Project Brief
> *"I have to do this assignment: Create a Web application that uses RESTful APIs to perform CRUD operations to some data in one or more database tables, and/or some third party API..."*

Provided the full assignment description. Claude summarised what was needed and asked clarifying questions about the application idea and technology preferences.

**AI helped with:** Understanding how to structure the project to meet assignment requirements.

---

#### Prompt 2 — Application Design and Technical Spec
> *"I have my own idea... [full project description including RCPI BST context, database columns, CRUD operations, front-end requirements, file structure, and coding standards]*"

Provided the full application concept and design, including the workflow (applications → interviews → offers → acceptances), required database fields, and technical constraints (no React, no template rendering, separate files, parameterised queries, connection pooling).

**Author designed:** The entire application concept, workflow, and data model based on real workplace requirements at RCPI.  
**AI helped with:** Translating the design into a file structure and generating the initial code.

---

#### Prompt 3 — PythonAnywhere Setup
> *"What version of Python should I select for the PythonAnywhere setup (Flask)?"*  
> *"use rcppi so rename relevant files"*

Asked for guidance on Python version selection. Confirmed folder name as `rcppi_bst` (double-p to match PythonAnywhere path).

**AI helped with:** Hosting configuration and renaming references across files.

---

### Session 2 — Claude Code (CLI)

#### Prompt 4 — Recreating Files from Context
> *[Shared full Claude.ai conversation transcript]*  
> *"yes [create all the files]"*

Continued in Claude Code. Claude recreated all project files from scratch based on the prior conversation context and pushed them to GitHub.

**AI helped with:** Code generation and GitHub setup.

---

#### Prompt 5 — Database Hosting Decision
> *"I need my database to be hosted separately to the DAO, flask server, etc. will this be ok"*  
> *"is there no other option to use full mysql and not sqlite"*  
> *"yes finish sqlite"*

Explored MySQL hosting options. Free PythonAnywhere plan does not support MySQL or external database connections. Decided to use SQLite after understanding the trade-offs.

**AI helped with:** Explaining hosting constraints and implementing the SQLite switch.

---

#### Prompt 6 — Usability and Workflow Redesign
> *"I need some changes made:*
> *1. Main heading on webpage should be RCPI Basic Specialist Training Applicant Management System*
> *2. I need a standalone function to add applicants using their first name, surname, date of birth and BST scheme only.*
> *3. I need an autoincrement RCPI ID number assigned to each applicant, this must start at 1001*
> *4. I need to be able to see all applicants with a 'View all applicants' button*
> *5. When applications are no longer being taken, I need to be able to add an interview score for each applicant, also an option of no interview completed, and withdrawn at this stage*
> *6. When all interview scores are complete, I need to rank the top 10 applicants for each specialty and then automatically assign them as offer made*
> *7. When an offer made or no offer made has been added, I need to be able to input accepted or not accepted"*

**Author designed:** The complete staged workflow (applications → interviews → offers → acceptances) reflecting the real RCPI BST process. Specified that RCPPI IDs must start at 1001 to align with existing RCPI numbering conventions. Defined the exact validation rules and business logic.  
**AI helped with:** Implementing the workflow in code across server, DAO, HTML, and JavaScript.

---

#### Prompt 7 — Ranking Display
> *"They are ranked by interview score"*

Clarified that the View All Applicants table should display a rank column ordered by interview score descending.

**Author designed:** The decision to surface the ranking to administrators for transparency.  
**AI helped with:** Implementing the rank column.

---

#### Prompt 8 — Bug Fix: View All Not Loading
> *"The view all applicants button isn't bringing them up. When I add the address bar goes to this: http://127.0.0.1:5000/?first_name=..."*

**AI helped with:** Diagnosing and fixing a static file path bug — CSS and JS were not loading due to missing `/static/` prefix, causing the form to submit as a plain HTML GET request instead of AJAX.

---

#### Prompt 9 — DOB Validation
> *"Limit calendar on date of birth field so that applicants must be 21 years or older. This will need to update daily"*

**Author designed:** The business rule that BST applicants must be at least 21 years old, derived from eligibility requirements.  
**AI helped with:** Implementing dynamic date restriction in JavaScript.

---

#### Prompt 10 — Branding and Visual Design
> *"Make the blue banner colour #11217D. Also include this logo in the top right corner of the webpage, in the banner. Get rid of the line through the banner."*  
> *"Make the banner slightly darker, make the logo the height of the banner"*  
> *"Increase it by 50% of its current size"* / *"There is blue banner below the logo, remove most of this"*  
> *"Increase the text size of this by 25%"*  
> *"Change the title to Basic Specialist Training Applicant Management System"*

**Author designed:** All visual and branding decisions — colour (#11217D matches RCPI brand), logo placement, banner proportions, typography, and the final title wording.  
**AI helped with:** Translating design decisions into CSS.

---

#### Prompt 11 — Year-Based Access Control
> *"I need this system to be locked down to 2026 applicants only, but can select a new year to commence tracking that year e.g. 2027"*

**Author designed:** The requirement to isolate applicant cohorts by year, reflecting how RCPI runs a new BST intake annually. The "Start New Year" concept mirrors the real administrative workflow.  
**AI helped with:** Adding `application_year` column, filtering all queries by year, building the year selector UI.

---

#### Prompt 12 — Offer Ranking Display
> *"In offer management, include a ranking score for interview score, starting with 1 for the highest. This needs to be for each of the medical specialties"*

**Author designed:** The decision to show all scored applicants (not just offered ones) in the ranking, so administrators can see the full picture of who was ranked and why.  
**AI helped with:** Restructuring the Offers tab to show full per-specialty rankings with offer status badges.

---

#### Prompt 13 — Bug Fix: Apostrophe in Names
> *"Caoimhe O'Neill entry, her button for Set Result won't work. All of the other buttons do"*

**AI helped with:** Diagnosing and fixing a JavaScript bug where apostrophes in surnames (O'Neill, O'Brien etc.) broke inline `onclick` attributes. Fixed using HTML data attributes.

---

#### Prompt 14 — Trainees Tab and Cascade Offer Logic
> *"Move the final list of trainees button to its own tab beside 'acceptances'. Also, if someone is 'not accepted' the system needs to automatically assign the next ranked person in that specialty to an offer made status"*

**Author designed:** The cascade offer logic reflects the real RCPI process where a declined offer is passed to the next eligible candidate on the ranked list. The decision to separate the Trainees list into its own tab improves clarity for administrators.  
**AI helped with:** Implementing the cascade function in the DAO and server, and building the Trainees tab.

---

#### Prompt 15 — Trainees Tab Labelling
> *"On the Trainees Tab, call this Scheme Trainees. Also change the text from 'Applicants who have accepted...' to 'To print a CSV file listing Trainees accepted onto a BST scheme, click here.' Remove the button 'Final list of trainees' and instead include a link when you click 'click here'"*

**Author designed:** The decision to use inline link text rather than a button for a cleaner, less cluttered interface.  
**AI helped with:** Implementing the HTML/CSS change.

---

## Technologies Used

- **Python 3.11** / **Flask** — server and REST API
- **SQLite** — lightweight file-based database (built into Python, no server required)
- **Vanilla JavaScript** — frontend AJAX (no React, no framework)
- **HTML5 / CSS3** — single-page interface with RCPI branding

---

## References

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [PythonAnywhere help](https://help.pythonanywhere.com/)
- Claude (Anthropic) — AI assistant used throughout; all prompts logged above
