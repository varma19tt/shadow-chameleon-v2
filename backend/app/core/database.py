import psycopg2
import logging
from .config import POSTGRES_URI, NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

logger = logging.getLogger(__name__)

# Simple Postgres connection helper
def get_postgres_conn():
    """Get synchronous PostgreSQL connection"""
    try:
        conn = psycopg2.connect(POSTGRES_URI)
        conn.autocommit = False
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to PostgreSQL: {e}")
        raise

# Neo4j driver - imported lazily to avoid import-time failures if driver not installed
_neo_driver = None
def get_neo4j_driver():
    global _neo_driver
    try:
        from neo4j import GraphDatabase
    except Exception as e:
        logger.warning("Neo4j driver not installed, graph features disabled")
        return None
    
    if _neo_driver is None:
        try:
            _neo_driver = GraphDatabase.driver(
                NEO4J_URI, 
                auth=(NEO4J_USER, NEO4J_PASSWORD),
                max_connection_lifetime=3600
            )
            # Verify connection
            _neo_driver.verify_connectivity()
            logger.info("Neo4j driver initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Neo4j driver: {e}")
            _neo_driver = None
    
    return _neo_driver

def close_neo4j_driver():
    """Close Neo4j driver connection"""
    global _neo_driver
    if _neo_driver:
        _neo_driver.close()
        _neo_driver = None
        logger.info("Neo4j driver closed")
