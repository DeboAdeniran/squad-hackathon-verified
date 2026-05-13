from fastapi import FastAPI
from decimal import Decimal
from schemas import MlScoreRequest, MlScoreResponse
from processors.photo_processor import PhotoProcessor
from processors.doc_processor import DocumentProcessor
from processors.behavioral_processor import BehavioralProcessor

app = FastAPI(title="Verified ML Service")

# Initialize modular processors
photo_engine = PhotoProcessor()
doc_engine = DocumentProcessor()
behavioral_engine = BehavioralProcessor()

@app.get("/health")
def health():
    return {"status": "ready", "engines": ["photo", "document", "behavioral"]}

@app.post("/score", response_model=MlScoreResponse)
async def score_claim(request: MlScoreRequest):
    # 1. Image Analysis
    photo_score, photo_flags = photo_engine.analyze_photos(request.photoUrls)
    
    # 2. Document Analysis (OCR)
    doc_score, doc_flags = doc_engine.analyze_documents(request.documentUrls)
    
    # 3. Behavioral Risk Analysis
    behavioral_score, behavioral_flags = behavioral_engine.analyze_behavior(request.claimantPolicyHistory)
    
    # 4. Identity and Pricing (Placeholders/Static)
    identity_score = 95
    price_score = 80 if request.claimedAmount < 10000 else 60
    
    # 5. Weighted Ensemble Score
    weights = {
        "photo": 0.3,
        "doc": 0.2,
        "behavioral": 0.3,
        "identity": 0.1,
        "price": 0.1
    }
    
    trust_score = int(
        (photo_score * weights["photo"]) +
        (doc_score * weights["doc"]) +
        (behavioral_score * weights["behavioral"]) +
        (identity_score * weights["identity"]) +
        (price_score * weights["price"])
    )
    
    # Determine Tier and Action
    if trust_score > 75:
        tier, action = "FAST_TRACK", "PAY"
    elif trust_score > 40:
        tier, action = "REVIEW", "ESCROW"
    else:
        tier, action = "REJECT", "FREEZE"
        
    # Aggregate all flags
    all_flags = photo_flags + doc_flags + behavioral_flags
    
    return MlScoreResponse(
        claimId=request.claimId,
        trustScore=trust_score,
        tier=tier,
        squadAction=action,
        confidence=Decimal("0.88"),
        photoScore=photo_score,
        documentScore=doc_score,
        behavioralScore=behavioral_score,
        identityScore=identity_score,
        priceScore=price_score,
        flags=all_flags
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
