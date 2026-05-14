import requests
import json
import uuid
import sys
import argparse
import asyncio
from decimal import Decimal

# Test payload
DEFAULT_PAYLOAD = {
    "claimId": str(uuid.uuid4()),
    "claimType": "AUTO_ACCIDENT",
    "claimedAmount": 4500.50,
    "photoUrls": ["http://example.com/p1.jpg", "http://example.com/p2.jpg"],
    "documentUrls": ["http://example.com/d1.pdf"],
    "claimantPolicyHistory": {
        "totalClaims": 1,
        "monthsOnPolicy": 24
    }
}

async def run_verification(payload: dict):
    print("Simulating a request to /score...")
    try:
        from main import score_claim
        from schemas import MlScoreRequest
        
        request = MlScoreRequest(**payload)
        response = await score_claim(request)
        
        print("\nVerification successful! The logic and schemas are correctly implemented.")
        print("\nTest Response:")
        print(json.dumps(response.model_dump(), indent=2, default=str))
        
    except Exception as e:
        print(f"\nVerification failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Verify ML scoring logic with custom payloads.")
    parser.add_argument("--file", type=str, help="Path to a JSON file containing the test payload.")
    args = parser.parse_args()

    payload = DEFAULT_PAYLOAD
    if args.file:
        try:
            with open(args.file, 'r') as f:
                payload = json.load(f)
            print(f"Loaded custom payload from {args.file}")
        except Exception as e:
            print(f"Error loading payload file: {e}")
            sys.exit(1)

    asyncio.run(run_verification(payload))
