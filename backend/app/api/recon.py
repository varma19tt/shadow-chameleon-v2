from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.services.db_helpers import add_target, get_target_by_id

router = APIRouter(prefix="/api/recon", tags=["recon"])

class ScanRequest(BaseModel):
    target: str = Field(..., example="scanme.nmap.org")
    note: Optional[str] = Field(None, example="short note about scope")

class ScanResponse(BaseModel):
    target_id: int

class TargetOut(BaseModel):
    id: int
    target: str
    created_at: Optional[str]  # Will return ISO formatted string

@router.post("/scan-request", response_model=ScanResponse)
async def create_scan_request(req: ScanRequest):
    try:
        target_id = add_target(req.target)
        return {"target_id": target_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"failed to create scan request: {e}")

@router.get("/target/{target_id}", response_model=TargetOut)
async def get_target(target_id: int):
    try:
        row = get_target_by_id(target_id)
        if not row:
            raise HTTPException(status_code=404, detail="target not found")
        
        # Convert datetime to ISO 8601 string
        created_at_str = row[2].isoformat() if row[2] else None

        return {
            "id": row[0],
            "target": row[1],
            "created_at": created_at_str
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
