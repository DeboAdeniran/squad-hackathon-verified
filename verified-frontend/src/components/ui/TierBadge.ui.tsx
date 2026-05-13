import { TIER_LABELS } from '../../constants';
import { ScoreTier } from '../../types';

export function TierBadge({ tier }: { tier: ScoreTier | null }) {
  const colorVariants: Record<ScoreTier, string> = {
    [ScoreTier.VERIFIED]: 'bg-green-50 text-green-700 border-green-200',
    [ScoreTier.REVIEW]: 'bg-orange-50 text-orange-700 border-orange-200',
    [ScoreTier.FLAGGED]: 'bg-red-50 text-red-700 border-red-200',
  };

  if (!tier)
    return (
      <span className="badge badge-neutral">
        <span className="badge-dot"></span>—
      </span>
    );

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold uppercase border ${colorVariants[tier]}`}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}
