import asyncio
import json
import uuid
import sys
from schemas import MlScoreRequest
# Ensure main.py is in the same directory
try:
    from main import score_claim
except ImportError:
    print("Error: main.py not found.")
    sys.exit(1)

async def run_test_cases():
    print("--- Starting ML Logic Verification ---")

    test_payload = {
        "claimId": str(uuid.uuid4()),
        "claimType": "AUTO_ACCIDENT",
        "claimedAmount": 4500.0,
        "photoUrls": ["http://example.com/p1.jpg", "http://example.com/p2.jpg"],
        "documentUrls": ["http://example.com/doc1.pdf"],
        "claimantPolicyHistory": {
            "totalClaims": 1,
            "monthsOnPolicy": 24
        }
    }

    try:
        request = MlScoreRequest(**test_payload)
        response = await score_claim(request)
        
        print(f"\n[SUCCESS] Verification Complete")
        print(f"Trust Score: {response.trustScore}")
        print(f"Tier: {response.tier}")
        print(f"Squad Action: {response.squadAction}")
        print("\nFlags Detected:")
        for flag in response.flags:
            print(f"- [{flag.module.upper()}] {flag.signal}: {flag.explanation}")

    except Exception as e:
        print(f"\n[FAILED] Verification Error: {e}")

if __name__ == "__main__":
    asyncio.run(run_test_cases())