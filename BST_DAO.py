import sqlite3
from db_config import DB_PATH

SCHEMES = [
    'Obstetrics and Gynaecology',
    'Histopathology',
    'General Internal Medicine',
    'Paediatrics'
]

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
            interview_status TEXT DEFAULT NULL,
            interview_score  REAL DEFAULT NULL,
            place_offered    INTEGER DEFAULT NULL,
            acceptance       TEXT DEFAULT NULL
        )
    """)
    try:
        conn.execute("ALTER TABLE bst_applicants ADD COLUMN interview_status TEXT DEFAULT NULL")
    except Exception:
        pass
    conn.commit()

    # Seed AUTOINCREMENT so first real ID is 1001
    count = conn.execute("SELECT COUNT(*) FROM bst_applicants").fetchone()[0]
    if count == 0:
        conn.execute(
            "INSERT INTO bst_applicants (rcppi_id, first_name, surname, dob, bst_scheme) "
            "VALUES (1000, '_', '_', '2000-01-01', 'Paediatrics')"
        )
        conn.execute("DELETE FROM bst_applicants WHERE rcppi_id = 1000")
        conn.commit()
    conn.close()

def get_all():
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM bst_applicants ORDER BY rcppi_id ASC"
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

def get_offers():
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM bst_applicants WHERE place_offered = 1 "
        "ORDER BY bst_scheme, interview_score DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_acceptances():
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM bst_applicants WHERE place_offered = 1 "
        "ORDER BY bst_scheme, interview_score DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def create(data):
    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO bst_applicants (first_name, surname, dob, bst_scheme) VALUES (?, ?, ?, ?)",
        (data['first_name'], data['surname'], data['dob'], data['bst_scheme'])
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

def assign_offers():
    conn = get_connection()
    conn.execute(
        "UPDATE bst_applicants SET place_offered = 0, acceptance = NULL "
        "WHERE interview_status IN ('completed', 'no_interview')"
    )
    conn.execute(
        "UPDATE bst_applicants SET place_offered = NULL "
        "WHERE interview_status = 'withdrawn' OR interview_status IS NULL"
    )
    total = 0
    for scheme in SCHEMES:
        top10 = conn.execute(
            "SELECT rcppi_id FROM bst_applicants "
            "WHERE bst_scheme = ? AND interview_status = 'completed' "
            "AND interview_score IS NOT NULL "
            "ORDER BY interview_score DESC LIMIT 10",
            (scheme,)
        ).fetchall()
        ids = [r[0] for r in top10]
        if ids:
            placeholders = ','.join('?' * len(ids))
            conn.execute(
                f"UPDATE bst_applicants SET place_offered = 1 WHERE rcppi_id IN ({placeholders})",
                ids
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

def delete(rcppi_id):
    conn = get_connection()
    cursor = conn.execute(
        "DELETE FROM bst_applicants WHERE rcppi_id = ?", (rcppi_id,)
    )
    conn.commit()
    rows = cursor.rowcount
    conn.close()
    return rows
