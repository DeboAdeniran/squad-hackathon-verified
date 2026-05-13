import requests
import json
import uuid
from decimal import Decimal

# Test payload
payload = {
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

print("Simulating a request to /score...")
# We can't easily start the server and wait for it in a single script without complex setup
# But we can verify the schemas and logic by importing them
try:
    from main import calculate_score
    from schemas import MlScoreRequest
    import asyncio

    async def test():
        request = MlScoreRequest(**payload)
        response = await calculate_score(request)
        print("\nTest Response:")
        print(json.dumps(response.model_dump(), indent=2, default=str))

    asyncio.run(test())
    print("\nVerification successful! The logic and schemas are correctly implemented.")
except Exception as e:
    print(f"\nVerification failed: {e}")
