import random
from schemas import MlFlag

class DocumentProcessor:
    def __init__(self, score_per_url, error_chance):
        self.score_per_url = score_per_url
        self.error_chance = error_chance

    def analyze_documents(self, urls):
        flags = []
        if not urls:
            return 0, [MlFlag(module="doc", signal="MISSING_DOCS", explanation="No documents provided for OCR verification.")]

        # Simulating OCR Analysis (e.g., EasyOCR or Tesseract) [cite: 93]
        score = 90 
        
        # Randomly simulate an OCR mismatch flag (10% chance)
        if random.random() < self.error_chance:
            score -= 30
            flags.append(MlFlag(
                module="doc",
                signal="OCR_MISMATCH",
                explanation="Discrepancy found between document text and claim details."
            ))

        return score, flags