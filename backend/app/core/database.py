import psycopg2
from .config import POSTGRES_URI, NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

# Simple Postgres connection helper
def get_postgres_conn():
    conn = psycopg2.connect(POSTGRES_URI)
    return conn

# Neo4j driver - imported lazily to avoid import-time failures if driver not installed
_neo_driver = None
def get_neo4j_driver():
    global _neo_driver
    try:
        from neo4j import GraphDatabase
    except Exception as e:
        raise ImportError("neo4j driver not installed or failed to import: " + str(e))
    if _neo_driver is None:
        _neo_driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    return _neo_driver
