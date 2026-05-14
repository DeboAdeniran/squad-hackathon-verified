from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from decimal import Decimal

class ClaimantPolicyHistory(BaseModel):
    totalClaims: int
    monthsOnPolicy: int

class MlScoreRequest(BaseModel):
    claimId: UUID
    claimType: str
    claimedAmount: Decimal
    photoUrls: List[str]
    documentUrls: List[str]
    claimantPolicyHistory: ClaimantPolicyHistory

class MlFlag(BaseModel):
    module: str
    signal: str
    explanation: str

class MlScoreResponse(BaseModel):
    claimId: UUID
    trustScore: int
    tier: str
    squadAction: str
    confidence: Decimal
    photoScore: int
    documentScore: int
    behavioralScore: int
    identityScore: int
    priceScore: int
    flags: List[MlFlag]
