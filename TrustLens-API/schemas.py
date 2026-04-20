from pydantic import BaseModel, Field
from typing import List, Optional

class PastTransaction(BaseModel):
    id: Optional[str] = None
    amount: float
    deviceId: Optional[str] = None
    location: Optional[str] = None
    isFlagged: Optional[bool] = False
    fraudScore: Optional[float] = 0.0

class ScoringRequest(BaseModel):
    userId: str
    amount: float
    deviceId: str
    location: str
    transactions: List[PastTransaction] = []

class ScoringResponse(BaseModel):
    score: int
    riskLevel: str
    decision: str
    reasons: List[str]
