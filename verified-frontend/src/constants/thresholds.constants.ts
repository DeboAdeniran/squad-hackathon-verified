/** Trust score thresholds — used by TrustScoreGauge and module score bars */
export const TRUST_SCORE_THRESHOLDS = {
  HIGH: 75, // >= 75 → green
  MID: 45, // >= 45 → amber  |  < 45 → red
} as const;

export type ScoreVariant = 'high' | 'mid' | 'low';

export function getScoreVariant(score: number | null): ScoreVariant {
  if (score === null) return 'low';
  if (score >= TRUST_SCORE_THRESHOLDS.HIGH) return 'high';
  if (score >= TRUST_SCORE_THRESHOLDS.MID) return 'mid';
  return 'low';
}
