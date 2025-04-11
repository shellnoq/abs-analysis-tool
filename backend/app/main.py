from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import calculation, optimization

app = FastAPI(
    title="ABS Analysis Tool",
    description="Cash flow analysis for securitization",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(calculation.router, prefix="/api", tags=["Calculation"])
app.include_router(optimization.router, prefix="/api", tags=["Optimization"])

@app.get("/")
async def root():
    return {"message": "ABS Analysis Tool API is running"}