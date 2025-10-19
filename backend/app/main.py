from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
import logging

from app.api import recon as recon_router
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-assisted red teaming and reconnaissance platform",
    version="1.0.0",
    debug=settings.DEBUG
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(recon_router.router, prefix=settings.API_V1_STR)

# Middleware for request logging
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    
    # Skip logging for health endpoints
    if request.url.path not in ["/alive", "/health"]:
        logger.info(f"Request: {request.method} {request.url.path}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

@app.get("/alive")
async def alive():
    """Simple liveness probe"""
    return {"status": "ok", "timestamp": time.time()}

@app.get("/health")
async def health():
    """Comprehensive health check"""
    from app.core.database import get_postgres_conn, get_neo4j_driver
    
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "services": {}
    }
    
    # Check PostgreSQL
    try:
        conn = get_postgres_conn()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        health_status["services"]["postgresql"] = "healthy"
    except Exception as e:
        health_status["services"]["postgresql"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    # Check Neo4j
    try:
        driver = get_neo4j_driver()
        if driver:
            driver.verify_connectivity()
            health_status["services"]["neo4j"] = "healthy"
        else:
            health_status["services"]["neo4j"] = "not_configured"
    except Exception as e:
        health_status["services"]["neo4j"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    return health_status

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }
