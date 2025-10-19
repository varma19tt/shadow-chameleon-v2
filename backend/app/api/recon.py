from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import logging

from app.services.db_helpers import add_target, get_target_by_id, get_all_targets

# Import recon_engine conditionally - it might not exist yet
try:
    from app.services.recon_engine import recon_engine
    RECON_ENGINE_AVAILABLE = True
except ImportError:
    RECON_ENGINE_AVAILABLE = False
    logging.warning("Recon engine not available - scanning disabled")

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recon", tags=["reconnaissance"])

class ScanRequest(BaseModel):
    target: str = Field(..., example="scanme.nmap.org", description="Target hostname or IP address")
    note: Optional[str] = Field(None, example="Initial reconnaissance scan", description="Optional note about the target")
    scan_type: str = Field("quick", example="quick", description="Type of scan: quick, comprehensive, stealth")
    
    @validator('target')
    def validate_target(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Target cannot be empty')
        if len(v) > 255:
            raise ValueError('Target too long')
        return v.strip()
    
    @validator('scan_type')
    def validate_scan_type(cls, v):
        allowed_types = ['quick', 'comprehensive', 'stealth', 'osint_only']
        if v not in allowed_types:
            raise ValueError(f'Scan type must be one of: {", ".join(allowed_types)}')
        return v

class ScanResponse(BaseModel):
    target_id: int
    status: str
    message: str
    scan_type: str

class TargetOut(BaseModel):
    id: int
    target: str
    status: str
    created_at: Optional[str]
    scan_started_at: Optional[str]
    scan_completed_at: Optional[str]
    note: Optional[str]
    scan_results: Optional[dict]

class TargetListResponse(BaseModel):
    targets: List[TargetOut]
    total: int
    page: int
    page_size: int

@router.post("/scan-request", response_model=ScanResponse)
async def create_scan_request(req: ScanRequest, background_tasks: BackgroundTasks):
    """
    Submit a new target for reconnaissance scanning.
    
    The scan will be performed in the background and results will be stored
    for later retrieval.
    """
    try:
        logger.info(f"Received scan request for target: {req.target}")
        
        # Add target to database
        target_id = add_target(req.target, req.note, req.scan_type)
        
        # Start background scan if engine is available
        if RECON_ENGINE_AVAILABLE:
            background_tasks.add_task(
                recon_engine.start_scan,
                target_id,
                req.target,
                req.scan_type
            )
            message = f"Scan initiated for {req.target}"
            status = "started"
        else:
            # If no recon engine, mark as completed immediately
            from app.services.db_helpers import update_target_status
            update_target_status(target_id, "completed", {
                "scan_type": req.scan_type,
                "status": "completed",
                "message": "Scan engine not available - simulated completion",
                "target": req.target
            })
            message = f"Target added (scan engine not available - simulated completion)"
            status = "completed"
        
        return ScanResponse(
            target_id=target_id,
            status=status,
            message=message,
            scan_type=req.scan_type
        )
        
    except ValueError as e:
        logger.warning(f"Validation error for scan request: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create scan request: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create scan request: {str(e)}")

@router.get("/target/{target_id}", response_model=TargetOut)
async def get_target(target_id: int):
    """Get target details and scan status by ID"""
    try:
        target = get_target_by_id(target_id)
        if not target:
            raise HTTPException(status_code=404, detail="Target not found")
        
        # Convert datetime objects to ISO strings
        created_at_str = target.created_at.isoformat() if target.created_at else None
        scan_started_str = target.scan_started_at.isoformat() if target.scan_started_at else None
        scan_completed_str = target.scan_completed_at.isoformat() if target.scan_completed_at else None
        
        return TargetOut(
            id=target.id,
            target=target.target,
            status=target.status,
            created_at=created_at_str,
            scan_started_at=scan_started_str,
            scan_completed_at=scan_completed_str,
            note=target.note,
            scan_results=target.scan_results
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving target {target_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/targets", response_model=TargetListResponse)
async def list_targets(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """List all targets with pagination and filtering"""
    try:
        targets_data = get_all_targets(page, page_size, status)
        
        targets_list = []
        for target in targets_data["targets"]:
            created_at_str = target.created_at.isoformat() if target.created_at else None
            scan_started_str = target.scan_started_at.isoformat() if target.scan_started_at else None
            scan_completed_str = target.scan_completed_at.isoformat() if target.scan_completed_at else None
            
            targets_list.append(TargetOut(
                id=target.id,
                target=target.target,
                status=target.status,
                created_at=created_at_str,
                scan_started_at=scan_started_str,
                scan_completed_at=scan_completed_str,
                note=target.note,
                scan_results=target.scan_results
            ))
        
        return TargetListResponse(
            targets=targets_list,
            total=targets_data["total"],
            page=page,
            page_size=page_size
        )
        
    except Exception as e:
        logger.error(f"Error listing targets: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/target/{target_id}")
async def delete_target(target_id: int):
    """Delete a target and its associated scan data"""
    try:
        # TODO: Implement target deletion logic
        logger.info(f"Delete request for target {target_id}")
        return {"message": f"Target {target_id} deletion scheduled"}
    except Exception as e:
        logger.error(f"Error deleting target {target_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
