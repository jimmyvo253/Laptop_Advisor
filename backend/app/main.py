from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import models, database
from app.routers import auth, laptops, ranking
from app.core.config import settings
from app.schemas import ranking as ranking_schemas
from sqlalchemy.orm import Session

# Initialize database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://laptop-advisor-ruddy.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_origin_regex="https://.*\.vercel\.app",  # Allow all Vercel deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(laptops.router)
app.include_router(ranking.router)

def perform_calculation(request: ranking_schemas.ComparisonRequest, db: Session):
    from app.services.ahp import calculate_ahp, CRITERIA
    from app.services.topsis import calculate_topsis
    import numpy as np

    # 1. Fetch laptops
    laptops = db.query(models.Laptop).all()
    if not laptops:
        return None

    # 2. Build decision matrix
    matrix_data = []
    for laptop in laptops:
        matrix_data.append([
            laptop.performance,
            laptop.resolution,
            laptop.capacity,
            laptop.portability,
            laptop.battery,
            laptop.price
        ])
    
    X = np.array(matrix_data, dtype=float)
    
    # 3. Calculate AHP Weights
    weights, cr = calculate_ahp(request.comparisons)
    
    # 4. Apply TOPSIS
    scores = calculate_topsis(weights, X)
    
    # 5. Format results
    results = []
    for i in range(len(laptops)):
        results.append({
            "name": laptops[i].name,
            "score": float(scores[i]),
            "performance": float(laptops[i].performance),
            "resolution": float(laptops[i].resolution),
            "capacity": float(laptops[i].capacity),
            "portability": float(laptops[i].portability),
            "battery": float(laptops[i].battery),
            "price": float(laptops[i].price)
        })
    
    results.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "weights": {CRITERIA[i]: float(weights[i]) for i in range(len(CRITERIA))},
        "cr": float(cr),
        "ranking": results
    }

# Compatibility routes for the current frontend (no auth required)
@app.post("/calculate", response_model=ranking_schemas.RankingResponse, tags=["compatibility"])
def legacy_calculate(
    request: ranking_schemas.ComparisonRequest,
    db: Session = Depends(database.get_db)
):
    result = perform_calculation(request, db)
    if result is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="No laptops found")
    return result

@app.get("/laptops-list", tags=["compatibility"])
def legacy_get_laptops(db: Session = Depends(database.get_db)):
    laptops = db.query(models.Laptop).all()
    return [l.name for l in laptops]

from sqlalchemy import text

@app.get("/health", methods=["GET", "HEAD"], tags=["system"])
def health_check(db: Session = Depends(database.get_db)):
    """
    Health check endpoint for monitoring services like UptimeRobot.
    Verifies that the API is up and the database is reachable.
    """
    try:
        # Execute a simple query to verify database connectivity
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "message": "AHP-TOPSIS API is fully operational"
        }
    except Exception as e:
        from fastapi import Response
        return Response(
            content=f'{{"status": "unhealthy", "error": "{str(e)}"}}',
            status_code=503,
            media_type="application/json"
        )

@app.get("/ping", tags=["system"])
def ping():
    """Ultra-fast endpoint for keeping the server awake."""
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Welcome to AHP TOPSIS Ranking API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
