import { ClaimStatus } from '../../types';
import { CLAIM_STATUS_LABELS } from '../../constants';

export function StatusBadge({ status }: { status: ClaimStatus }) {
  const colorVariants: Record<ClaimStatus, string> = {
    [ClaimStatus.SUBMITTED]: 'bg-blue-50 text-blue-700 border-blue-200',
    [ClaimStatus.PROCESSING]: 'bg-purple-50 text-purple-700 border-purple-200',
    [ClaimStatus.SCORED]: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    [ClaimStatus.PAID]: 'bg-green-50 text-green-700 border-green-200',
    [ClaimStatus.UNDER_REVIEW]:
      'bg-orange-50 text-orange-700 border-orange-200',
    [ClaimStatus.BLOCKED]: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-semibold uppercase border ${colorVariants[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {CLAIM_STATUS_LABELS[status]}
    </span>
  );
}
