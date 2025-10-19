from app.core.database import get_postgres_conn

def add_target(target: str) -> int:
    """
    Inserts a target into the Postgres DB and returns its new ID.
    """
    conn = get_postgres_conn()
    cur = conn.cursor()
    cur.execute("INSERT INTO targets (target) VALUES (%s) RETURNING id;", (target,))
    target_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return target_id

def get_target_by_id(target_id: int):
    conn = get_postgres_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, target, created_at FROM targets WHERE id = %s;", (target_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row
