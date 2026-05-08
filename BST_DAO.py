import mysql.connector
from mysql.connector import pooling
from db_config import DB_CONFIG

ALLOWED_COLUMNS = {
    'first_name', 'surname', 'dob', 'bst_scheme',
    'interview_score', 'place_offered', 'acceptance'
}

connection_pool = pooling.MySQLConnectionPool(
    pool_name="rcppi_pool",
    pool_size=5,
    **DB_CONFIG
)

def get_connection():
    return connection_pool.get_connection()

def get_all():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM bst_applicants ORDER BY interview_score DESC"
    )
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result

def get_by_id(rcppi_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM bst_applicants WHERE rcppi_id = %s", (rcppi_id,)
    )
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return result

def get_offers():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM bst_applicants WHERE place_offered = 1 "
        "ORDER BY bst_scheme, interview_score DESC"
    )
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result

def get_acceptances():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM bst_applicants WHERE place_offered = 1 "
        "ORDER BY bst_scheme, acceptance, interview_score DESC"
    )
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result

def create(data):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO bst_applicants "
        "(first_name, surname, dob, bst_scheme, interview_score, place_offered, acceptance) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (
            data['first_name'], data['surname'], data['dob'], data['bst_scheme'],
            data.get('interview_score'), data.get('place_offered'), data.get('acceptance')
        )
    )
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return new_id

def update(rcppi_id, data):
    valid = {k: v for k, v in data.items() if k in ALLOWED_COLUMNS}
    if not valid:
        return 0
    conn = get_connection()
    cursor = conn.cursor()
    set_clause = ", ".join(f"{col} = %s" for col in valid)
    values = list(valid.values()) + [rcppi_id]
    cursor.execute(
        f"UPDATE bst_applicants SET {set_clause} WHERE rcppi_id = %s", values
    )
    conn.commit()
    rows = cursor.rowcount
    cursor.close()
    conn.close()
    return rows

def delete(rcppi_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM bst_applicants WHERE rcppi_id = %s", (rcppi_id,)
    )
    conn.commit()
    rows = cursor.rowcount
    cursor.close()
    conn.close()
    return rows
