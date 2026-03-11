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
    from app.main import perform_calculation
    result = perform_calculation(request, db)
    if result is None:
        raise HTTPException(status_code=400, detail="No laptops found in database")
    return result

@router.get("/criteria")
def get_criteria():
    return CRITERIA
