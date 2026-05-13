from schemas import MlFlag, ClaimantPolicyHistory

class BehavioralProcessor:
    def __init__(self):
        # In production, load scikit-learn risk models here
        pass

    def analyze_behavior(self, history: ClaimantPolicyHistory) -> tuple[int, list[MlFlag]]:
        """
        Analyzes historical patterns for fraud indicators.
        """
        # Calculate risk based on claims per month
        claims_rate = history.totalClaims / (max(1, history.monthsOnPolicy))
        
        # Base score starts high and drops with risk
        score = 100
        flags = []
        
        if claims_rate > 0.5: # More than 1 claim every 2 months
            score -= 40
            flags.append(MlFlag(
                module="BEHAVIORAL",
                signal="HIGH_CLAIM_FREQUENCY",
                explanation=f"User has filed {history.totalClaims} claims in {history.monthsOnPolicy} months."
            ))
            
        if history.monthsOnPolicy < 3:
            score -= 20
            flags.append(MlFlag(
                module="BEHAVIORAL",
                signal="NEW_POLICY_CLAIM",
                explanation="Claim filed within first 90 days of policy."
            ))
            
        return max(0, score), flags
