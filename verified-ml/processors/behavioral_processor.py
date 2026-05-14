from schemas import MlFlag, ClaimantPolicyHistory

class BehavioralProcessor:
    def __init__(
        self, 
        max_claim_rate: float = 0.5, 
        new_policy_threshold_days: int = 90,
        high_freq_penalty: int = 40,
        new_policy_penalty: int = 20
    ):
        self.max_claim_rate = max_claim_rate
        self.new_policy_threshold_days = new_policy_threshold_days
        self.high_freq_penalty = high_freq_penalty
        self.new_policy_penalty = new_policy_penalty
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
        
        if claims_rate > self.max_claim_rate:
            score -= self.high_freq_penalty
            flags.append(MlFlag(
                module="BEHAVIORAL",
                signal="HIGH_CLAIM_FREQUENCY",
                explanation=f"User has filed {history.totalClaims} claims in {history.monthsOnPolicy} months (Rate: {claims_rate:.2f})."
            ))
            
        # Approximately 30 days per month
        months_threshold = self.new_policy_threshold_days / 30
        if history.monthsOnPolicy < months_threshold:
            score -= self.new_policy_penalty
            flags.append(MlFlag(
                module="BEHAVIORAL",
                signal="NEW_POLICY_CLAIM",
                explanation=f"Claim filed within first {self.new_policy_threshold_days} days of policy."
            ))
            
        return max(0, score), flags
