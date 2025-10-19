#!/usr/bin/env python3
from app.core.database import get_postgres_conn, get_neo4j_driver
import time

print("Testing Postgres connection...")
try:
    conn = get_postgres_conn()
    cur = conn.cursor()
    cur.execute("SELECT 1;")
    print("Postgres response:", cur.fetchone())
    cur.close()
    conn.close()
except Exception as e:
    print("Postgres connection failed:", e)

print("Testing Neo4j connection...")
try:
    driver = get_neo4j_driver()
    with driver.session() as session:
        res = session.run("RETURN 1 AS result")
        for record in res:
            print("Neo4j response:", record["result"])
except Exception as e:
    print("Neo4j connection failed:", e)
