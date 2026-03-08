from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import numpy as np
from typing import List, Optional
from app.database import models, database
from app.schemas import ranking as ranking_schemas
from app.services.ahp import calculate_ahp, CRITERIA
from app.services.topsis import calculate_topsis
from app.core import security

router = APIRouter(prefix="/ranking", tags=["ranking"])

@router.post("/calculate", response_model=ranking_schemas.RankingResponse)
def calculate_ranking(
    request: ranking_schemas.ComparisonRequest,
    db: Session = Depends(database.get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user)
):
    # 1. Fetch laptops from DB
    laptops = db.query(models.Laptop).all()
    if not laptops:
        raise HTTPException(status_code=400, detail="No laptops found in database")
    
    # 2. Build decision matrix dynamically
    # Criteria: [Performance, Resolution, Capacity, Portability, Battery, Price]
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
            "score": float(scores[i])
        })
    
    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "weights": {CRITERIA[i]: float(weights[i]) for i in range(len(CRITERIA))},
        "cr": float(cr),
        "ranking": results
    }

@router.get("/criteria")
def get_criteria():
    return CRITERIA
