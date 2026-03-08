from pydantic import BaseModel
from typing import List, Dict

class ComparisonRequest(BaseModel):
    comparisons: List[float]

class LaptopScore(BaseModel):
    name: str
    score: float

class RankingResponse(BaseModel):
    weights: Dict[str, float]
    cr: float
    ranking: List[LaptopScore]
