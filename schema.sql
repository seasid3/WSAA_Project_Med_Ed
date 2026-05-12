CREATE TABLE IF NOT EXISTS bst_applicants (
    rcppi_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name       TEXT NOT NULL,
    surname          TEXT NOT NULL,
    dob              TEXT NOT NULL,
    bst_scheme       TEXT NOT NULL,
    application_year INTEGER NOT NULL DEFAULT 2026,
    interview_status TEXT DEFAULT NULL,
    interview_score  REAL DEFAULT NULL,
    place_offered    INTEGER DEFAULT NULL,
    acceptance       TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS bst_schemes (
    scheme_name TEXT PRIMARY KEY,
    max_places  INTEGER NOT NULL
);