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
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(laptops.router)
app.include_router(ranking.router)

# Compatibility routes for the current frontend (no auth required)
@app.post("/calculate", response_model=ranking_schemas.RankingResponse, tags=["compatibility"])
def legacy_calculate(
    request: ranking_schemas.ComparisonRequest,
    db: Session = Depends(database.get_db)
):
    from app.routers.ranking import calculate_ranking
    # We call the same logic but without requiring current_user
    # Note: In a real production app, you might want to still require a user or rate limit
    return calculate_ranking(request, db, current_user=None)

@app.get("/laptops-list", tags=["compatibility"])
def legacy_get_laptops(db: Session = Depends(database.get_db)):
    laptops = db.query(models.Laptop).all()
    return [l.name for l in laptops]

@app.get("/")
def read_root():
    return {"message": "Welcome to AHP TOPSIS Ranking API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
