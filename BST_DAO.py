import sqlite3
from db_config import DB_PATH

ALLOWED_COLUMNS = {
    'first_name', 'surname', 'dob', 'bst_scheme',
    'interview_score', 'place_offered', 'acceptance'
}

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    conn.execute("""
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
        )
    """)
    conn.commit()
    conn.close()

def get_all():
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM bst_applicants ORDER BY interview_score DESC"
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
        "ORDER BY bst_scheme, acceptance, interview_score DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def create(data):
    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO bst_applicants "
        "(first_name, surname, dob, bst_scheme, interview_score, place_offered, acceptance) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            data['first_name'], data['surname'], data['dob'], data['bst_scheme'],
            data.get('interview_score'), data.get('place_offered'), data.get('acceptance')
        )
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return new_id

def update(rcppi_id, data):
    valid = {k: v for k, v in data.items() if k in ALLOWED_COLUMNS}
    if not valid:
        return 0
    conn = get_connection()
    set_clause = ", ".join(f"{col} = ?" for col in valid)
    values = list(valid.values()) + [rcppi_id]
    cursor = conn.execute(
        f"UPDATE bst_applicants SET {set_clause} WHERE rcppi_id = ?", values
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
