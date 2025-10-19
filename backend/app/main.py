from fastapi import FastAPI
from app.api import recon as recon_router  # import our router module

app = FastAPI(title="Shadow Chameleon - Backend")

# Include API routers
app.include_router(recon_router.router)

@app.get("/alive")
async def alive():
    return {"status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
