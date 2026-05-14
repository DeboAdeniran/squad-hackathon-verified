import os
from typing import Dict

class Settings:
    def __init__(self):
        # Overall Weights
        self.WEIGHT_PHOTO = float(os.environ.get("WEIGHT_PHOTO", 0.3))
        self.WEIGHT_DOC = float(os.environ.get("WEIGHT_DOC", 0.2))
        self.WEIGHT_BEHAVIORAL = float(os.environ.get("WEIGHT_BEHAVIORAL", 0.3))
        self.WEIGHT_IDENTITY = float(os.environ.get("WEIGHT_IDENTITY", 0.1))
        self.WEIGHT_PRICE = float(os.environ.get("WEIGHT_PRICE", 0.1))

        # Trust Score Thresholds
        self.THRESHOLD_VERIFIED = int(os.environ.get("THRESHOLD_VERIFIED", 75))
        self.THRESHOLD_REVIEW = int(os.environ.get("THRESHOLD_REVIEW", 40))

        # Photo Processor Settings
        self.PHOTO_SCORE_PER_URL = int(os.environ.get("PHOTO_SCORE_PER_URL", 30))
        self.PHOTO_MIN_URLS_FOR_TRUST = int(os.environ.get("PHOTO_MIN_URLS_FOR_TRUST", 2))

        # Document Processor Settings
        self.DOC_SCORE_PER_URL = int(os.environ.get("DOC_SCORE_PER_URL", 40))
        self.DOC_ERROR_CHANCE = float(os.environ.get("DOC_ERROR_CHANCE", 0.1))

        # Behavioral Processor Settings
        self.BEHAVIORAL_MAX_CLAIM_RATE = float(os.environ.get("BEHAVIORAL_MAX_CLAIM_RATE", 0.5))
        self.BEHAVIORAL_NEW_POLICY_THRESHOLD_DAYS = int(os.environ.get("BEHAVIORAL_NEW_POLICY_THRESHOLD_DAYS", 90))
        self.BEHAVIORAL_HIGH_FREQ_PENALTY = int(os.environ.get("BEHAVIORAL_HIGH_FREQ_PENALTY", 40))
        self.BEHAVIORAL_NEW_POLICY_PENALTY = int(os.environ.get("BEHAVIORAL_NEW_POLICY_PENALTY", 20))

        # Pricing Settings
        self.PRICE_THRESHOLD_AMOUNT = float(os.environ.get("PRICE_THRESHOLD_AMOUNT", 10000.0))
        self.PRICE_LOW_RISK_SCORE = int(os.environ.get("PRICE_LOW_RISK_SCORE", 80))
        self.PRICE_HIGH_RISK_SCORE = int(os.environ.get("PRICE_HIGH_RISK_SCORE", 60))

        # Identity Settings (Placeholder)
        self.DEFAULT_IDENTITY_SCORE = int(os.environ.get("DEFAULT_IDENTITY_SCORE", 95))

settings = Settings()
