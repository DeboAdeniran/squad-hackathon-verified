from fastapi import FastAPI
from decimal import Decimal
from schemas import MlScoreRequest, MlScoreResponse
from processors.photo_processor import PhotoProcessor
from processors.doc_processor import DocumentProcessor
from processors.behavioral_processor import BehavioralProcessor
from settings import settings

app = FastAPI(title="Verified ML Service - Squad Hackathon 3.0")

# Engines initialized with dynamic settings
photo_engine = PhotoProcessor(settings.PHOTO_SCORE_PER_URL, settings.PHOTO_MIN_URLS_FOR_TRUST)
doc_engine = DocumentProcessor(settings.DOC_SCORE_PER_URL, settings.DOC_ERROR_CHANCE)
behavioral_engine = BehavioralProcessor(
    settings.BEHAVIORAL_MAX_CLAIM_RATE, 
    settings.BEHAVIORAL_NEW_POLICY_THRESHOLD_DAYS,
    settings.BEHAVIORAL_HIGH_FREQ_PENALTY,
    settings.BEHAVIORAL_NEW_POLICY_PENALTY
)

@app.post("/score", response_model=MlScoreResponse)
async def score_claim(request: MlScoreRequest):
    # 1-3. Run Engines
    photo_score, photo_flags = photo_engine.analyze_photos(request.photoUrls)
    doc_score, doc_flags = doc_engine.analyze_documents(request.documentUrls)
    behavioral_score, behavioral_flags = behavioral_engine.analyze_behavior(request.claimantPolicyHistory)
    
    # 4. Identity & Price Scoring
    identity_score = settings.DEFAULT_IDENTITY_SCORE
    price_score = settings.PRICE_LOW_RISK_SCORE if request.claimedAmount < settings.PRICE_THRESHOLD_AMOUNT else settings.PRICE_HIGH_RISK_SCORE
    
    # 5. Weighted Ensemble Calculation 
    weights = {
        "photo": settings.WEIGHT_PHOTO, "doc": settings.WEIGHT_DOC,
        "behavioral": settings.WEIGHT_BEHAVIORAL, "identity": settings.WEIGHT_IDENTITY,
        "price": settings.WEIGHT_PRICE
    }
    
    trust_score = int(
        (photo_score * weights["photo"]) +
        (doc_score * weights["doc"]) +
        (behavioral_score * weights["behavioral"]) +
        (identity_score * weights["identity"]) +
        (price_score * weights["price"])
    )
    
    # Determine Tier and Squad Action 
    if trust_score > settings.THRESHOLD_VERIFIED:
        tier, action = "VERIFIED", "RELEASE_PAYMENT"
    elif trust_score > settings.THRESHOLD_REVIEW:
        tier, action = "REVIEW", "HOLD_ESCROW"
    else:
        tier, action = "FLAGGED", "BLOCK_PAYMENT"
        
    return MlScoreResponse(
        claimId=request.claimId,
        trustScore=trust_score,
        tier=tier,
        squadAction=action,
        confidence=Decimal("0.88"), # Reliability metric 
        photoScore=photo_score,
        documentScore=doc_score,
        behavioralScore=behavioral_score,
        identityScore=identity_score,
        priceScore=price_score,
        flags=photo_flags + doc_flags + behavioral_flags
    )