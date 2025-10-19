from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
import json
from app.core.database import get_postgres_conn

logger = logging.getLogger(__name__)

class Target:
    """Target data model"""
    def __init__(self, id: int, target: str, status: str = "pending", 
                 created_at: Optional[datetime] = None, 
                 scan_started_at: Optional[datetime] = None,
                 scan_completed_at: Optional[datetime] = None,
                 note: Optional[str] = None,
                 scan_type: Optional[str] = None,
                 scan_results: Optional[Dict[str, Any]] = None):
        self.id = id
        self.target = target
        self.status = status
        self.created_at = created_at
        self.scan_started_at = scan_started_at
        self.scan_completed_at = scan_completed_at
        self.note = note
        self.scan_type = scan_type
        self.scan_results = scan_results

def add_target(target: str, note: Optional[str] = None, scan_type: str = "quick") -> int:
    """
    Inserts a target into the Postgres DB and returns its new ID.
    """
    conn = None
    try:
        conn = get_postgres_conn()
        cur = conn.cursor()
        
        # Insert new target
        query = """
            INSERT INTO targets (target, note, status, scan_type, created_at) 
            VALUES (%s, %s, 'pending', %s, NOW()) 
            RETURNING id;
        """
        cur.execute(query, (target, note, scan_type))
        target_id = cur.fetchone()[0]
        conn.commit()
        
        logger.info(f"Added target '{target}' with ID: {target_id}")
        return target_id
        
    except Exception as e:
        logger.error(f"Failed to add target '{target}': {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            cur.close()
            conn.close()

def update_target_status(target_id: int, status: str, scan_results: Dict = None):
    """Update target status and scan results"""
    conn = None
    try:
        conn = get_postgres_conn()
        cur = conn.cursor()
        
        import json
        
        if status == "scanning":
            query = """
                UPDATE targets 
                SET status = %s, scan_started_at = NOW(), scan_results = %s
                WHERE id = %s;
            """
        elif status in ["completed", "failed"]:
            query = """
                UPDATE targets 
                SET status = %s, scan_completed_at = NOW(), scan_results = %s
                WHERE id = %s;
            """
        else:
            query = """
                UPDATE targets 
                SET status = %s, scan_results = %s
                WHERE id = %s;
            """
        
        # Convert scan_results to JSON string if provided
        scan_results_json = json.dumps(scan_results) if scan_results else None
        
        cur.execute(query, (status, scan_results_json, target_id))
        conn.commit()
        
        logger.info(f"Updated target {target_id} status to: {status}")
        
    except Exception as e:
        logger.error(f"Failed to update target {target_id}: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            cur.close()
            conn.close()

def get_target_by_id(target_id: int) -> Optional[Target]:
    """Get target by ID"""
    conn = None
    try:
        conn = get_postgres_conn()
        cur = conn.cursor()
        
        query = """
            SELECT id, target, status, created_at, scan_started_at, 
                   scan_completed_at, note, scan_type, scan_results
            FROM targets 
            WHERE id = %s;
        """
        cur.execute(query, (target_id,))
        row = cur.fetchone()
        
        if not row:
            return None
        
        # Parse JSON results if they exist
        scan_results = None
        if row[8]:  # scan_results is at index 8
            try:
                scan_results = json.loads(row[8])
            except (json.JSONDecodeError, TypeError):
                logger.warning(f"Failed to parse scan_results for target {target_id}")
        
        # Handle None values for datetime fields
        created_at = row[3]
        scan_started_at = row[4]
        scan_completed_at = row[5]
        note = row[6]
        scan_type = row[7]
            
        return Target(
            id=row[0],
            target=row[1],
            status=row[2],
            created_at=created_at,
            scan_started_at=scan_started_at,
            scan_completed_at=scan_completed_at,
            note=note,
            scan_type=scan_type,
            scan_results=scan_results
        )
        
    except Exception as e:
        logger.error(f"Failed to get target {target_id}: {e}")
        raise
    finally:
        if conn:
            cur.close()
            conn.close()

def get_all_targets(page: int = 1, page_size: int = 50, status: Optional[str] = None) -> Dict[str, Any]:
    """Get paginated list of targets with optional status filtering"""
    conn = None
    try:
        conn = get_postgres_conn()
        cur = conn.cursor()
        
        offset = (page - 1) * page_size
        
        # Build query based on filters
        base_query = """
            SELECT id, target, status, created_at, scan_started_at, 
                   scan_completed_at, note, scan_type, scan_results
            FROM targets
        """
        count_query = "SELECT COUNT(*) FROM targets"
        
        where_clause = ""
        params = []
        
        if status:
            where_clause = " WHERE status = %s"
            params.append(status)
        
        # Get total count
        cur.execute(count_query + where_clause, params)
        total = cur.fetchone()[0]
        
        # Get paginated results
        order_query = " ORDER BY created_at DESC LIMIT %s OFFSET %s"
        params.extend([page_size, offset])
        
        cur.execute(base_query + where_clause + order_query, params)
        rows = cur.fetchall()
        
        targets = []
        for row in rows:
            # Parse JSON results if they exist
            scan_results = None
            if row[8]:  # scan_results is at index 8
                try:
                    scan_results = json.loads(row[8])
                except (json.JSONDecodeError, TypeError):
                    logger.warning(f"Failed to parse scan_results for target {row[0]}")
            
            targets.append(Target(
                id=row[0],
                target=row[1],
                status=row[2],
                created_at=row[3],
                scan_started_at=row[4],
                scan_completed_at=row[5],
                note=row[6],
                scan_type=row[7],
                scan_results=scan_results
            ))
        
        return {
            "targets": targets,
            "total": total,
            "page": page,
            "page_size": page_size
        }
        
    except Exception as e:
        logger.error(f"Failed to get targets list: {e}")
        # Return empty result instead of crashing
        return {
            "targets": [],
            "total": 0,
            "page": page,
            "page_size": page_size
        }
    finally:
        if conn:
            cur.close()
            conn.close()
