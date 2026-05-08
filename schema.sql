CREATE TABLE IF NOT EXISTS bst_applicants (
    rcppi_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name      TEXT NOT NULL,
    surname         TEXT NOT NULL,
    dob             TEXT NOT NULL,
    bst_scheme      TEXT NOT NULL CHECK(bst_scheme IN (
                        'Obstetrics and Gynaecology',
                        'Histopathology',
                        'General Internal Medicine',
                        'Paediatrics'
                    )),
    interview_score REAL    DEFAULT NULL,
    place_offered   INTEGER DEFAULT NULL,
    acceptance      TEXT    DEFAULT NULL CHECK(acceptance IN ('accepted','refused',NULL))
);
