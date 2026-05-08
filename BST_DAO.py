import sqlite3
from db_config import DB_PATH

SCHEME_LIMITS = {
    'Obstetrics and Gynaecology': 7,
    'Histopathology':             4,
    'General Internal Medicine':  15,
    'Paediatrics':                8
}

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    conn.execute("""
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
        )
    """)
    for col, definition in [
        ('interview_status', 'TEXT DEFAULT NULL'),
        ('application_year', 'INTEGER NOT NULL DEFAULT 2026'),
    ]:
        try:
            conn.execute(f"ALTER TABLE bst_applicants ADD COLUMN {col} {definition}")
        except Exception:
            pass
    conn.commit()

    count = conn.execute("SELECT COUNT(*) FROM bst_applicants").fetchone()[0]
    if count == 0:
        conn.execute(
            "INSERT INTO bst_applicants (rcppi_id, first_name, surname, dob, bst_scheme, application_year) "
            "VALUES (1000, '_', '_', '2000-01-01', 'Paediatrics', 2026)"
        )
        conn.execute("DELETE FROM bst_applicants WHERE rcppi_id = 1000")
        conn.commit()
    conn.close()

def get_years():
    conn = get_connection()
    rows = conn.execute(
        "SELECT DISTINCT application_year FROM bst_applicants ORDER BY application_year"
    ).fetchall()
    conn.close()
    years = [r[0] for r in rows]
    return years if years else [2026]

def get_all(year):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM bst_applicants WHERE application_year = ? "
        "ORDER BY interview_score DESC, rcppi_id ASC", (year,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_by_id(rcppi_id):
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM bst_applicants WHERE rcppi_id = ?", (rcppi_id,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None

def get_offers(year):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM bst_applicants WHERE place_offered = 1 AND application_year = ? "
        "ORDER BY bst_scheme, interview_score DESC", (year,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_acceptances(year):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM bst_applicants WHERE place_offered = 1 AND application_year = ? "
        "ORDER BY bst_scheme, interview_score DESC", (year,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def create(data, year):
    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO bst_applicants (first_name, surname, dob, bst_scheme, application_year) "
        "VALUES (?, ?, ?, ?, ?)",
        (data['first_name'], data['surname'], data['dob'], data['bst_scheme'], year)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return new_id

def update_interview(rcppi_id, status, score=None):
    conn = get_connection()
    if status == 'completed':
        cursor = conn.execute(
            "UPDATE bst_applicants SET interview_status = ?, interview_score = ? WHERE rcppi_id = ?",
            (status, score, rcppi_id)
        )
    else:
        cursor = conn.execute(
            "UPDATE bst_applicants SET interview_status = ?, interview_score = NULL WHERE rcppi_id = ?",
            (status, rcppi_id)
        )
    conn.commit()
    rows = cursor.rowcount
    conn.close()
    return rows

def assign_offers(year):
    conn = get_connection()
    conn.execute(
        "UPDATE bst_applicants SET place_offered = 0, acceptance = NULL "
        "WHERE interview_status IN ('completed', 'no_interview') AND application_year = ?", (year,)
    )
    conn.execute(
        "UPDATE bst_applicants SET place_offered = NULL "
        "WHERE (interview_status = 'withdrawn' OR interview_status IS NULL) AND application_year = ?", (year,)
    )
    total = 0
    for scheme, limit in SCHEME_LIMITS.items():
        top_n = conn.execute(
            "SELECT rcppi_id FROM bst_applicants "
            "WHERE bst_scheme = ? AND application_year = ? AND interview_status = 'completed' "
            "AND interview_score IS NOT NULL "
            "ORDER BY interview_score DESC LIMIT ?",
            (scheme, year, limit)
        ).fetchall()
        ids = [r[0] for r in top_n]
        if ids:
            placeholders = ','.join('?' * len(ids))
            conn.execute(
                f"UPDATE bst_applicants SET place_offered = 1 WHERE rcppi_id IN ({placeholders})", ids
            )
            total += len(ids)
    conn.commit()
    conn.close()
    return total

def update_acceptance(rcppi_id, acceptance):
    conn = get_connection()
    cursor = conn.execute(
        "UPDATE bst_applicants SET acceptance = ? WHERE rcppi_id = ? AND place_offered = 1",
        (acceptance, rcppi_id)
    )
    conn.commit()
    rows = cursor.rowcount
    conn.close()
    return rows

def cascade_offer(rcppi_id):
    conn = get_connection()
    applicant = conn.execute(
        "SELECT bst_scheme, application_year FROM bst_applicants WHERE rcppi_id = ?", (rcppi_id,)
    ).fetchone()
    if not applicant:
        conn.close()
        return None
    scheme, year = applicant['bst_scheme'], applicant['application_year']
    next_one = conn.execute(
        "SELECT rcppi_id, first_name, surname FROM bst_applicants "
        "WHERE bst_scheme = ? AND application_year = ? AND interview_status = 'completed' "
        "AND interview_score IS NOT NULL AND place_offered = 0 "
        "ORDER BY interview_score DESC LIMIT 1",
        (scheme, year)
    ).fetchone()
    if next_one:
        conn.execute(
            "UPDATE bst_applicants SET place_offered = 1 WHERE rcppi_id = ?", (next_one['rcppi_id'],)
        )
        conn.commit()
        conn.close()
        return dict(next_one)
    conn.close()
    return None

def delete(rcppi_id):
    conn = get_connection()
    cursor = conn.execute(
        "DELETE FROM bst_applicants WHERE rcppi_id = ?", (rcppi_id,)
    )
    conn.commit()
    rows = cursor.rowcount
    conn.close()
    return rows
