import joblib
import numpy as np
from schemas import MlFlag

class BehavioralProcessor:
    def __init__(self, max_claim_rate, new_policy_threshold_days, high_freq_penalty, new_policy_penalty):
        self.max_claim_rate = max_claim_rate
        self.new_policy_penalty = new_policy_penalty
        # In a real app, load the trained model:
        # self.model = joblib.load("models/behavioral_model.pkl")
        
    def analyze_behavior(self, history):
        flags = []
        # Logical signals for Trust Scoring [cite: 93]
        claims_rate = history.totalClaims / max(history.monthsOnPolicy, 1)
        
        # Base Score (Simulating model.predict_proba)
        score = 100
        
        if claims_rate > self.max_claim_rate:
            score -= 40
            flags.append(MlFlag(
                module="behavioral", 
                signal="HIGH_CLAIM_FREQUENCY", 
                explanation="Claimant exceeds average claims per month threshold."
            ))
            
        if history.monthsOnPolicy < 3:
            score -= self.new_policy_penalty
            flags.append(MlFlag(
                module="behavioral", 
                signal="NEW_POLICY_RISK", 
                explanation="Policy is less than 90 days old; higher scrutiny required."
            ))

        return max(score, 0), flags