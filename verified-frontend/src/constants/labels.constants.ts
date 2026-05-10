import {
  ClaimType,
  ClaimStatus,
  ScoreTier,
  SquadAction,
  FileType,
  ReviewDecision,
  TxStatus,
  UserRole,
} from '../types';

export const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  [ClaimType.AUTO]: 'Auto',
  [ClaimType.HEALTH]: 'Health',
  [ClaimType.PROPERTY]: 'Property',
};

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  [ClaimStatus.SUBMITTED]: 'Submitted',
  [ClaimStatus.PROCESSING]: 'Processing',
  [ClaimStatus.SCORED]: 'Scored',
  [ClaimStatus.PAID]: 'Paid',
  [ClaimStatus.UNDER_REVIEW]: 'Under Review',
  [ClaimStatus.BLOCKED]: 'Blocked',
};

export const TIER_LABELS: Record<ScoreTier, string> = {
  [ScoreTier.VERIFIED]: 'Verified',
  [ScoreTier.REVIEW]: 'Review',
  [ScoreTier.FLAGGED]: 'Flagged',
};

export const SQUAD_ACTION_LABELS: Record<SquadAction, string> = {
  [SquadAction.RELEASE_PAYMENT]: 'Payment Released',
  [SquadAction.HOLD_ESCROW]: 'Held in Escrow',
  [SquadAction.BLOCK_PAYMENT]: 'Payment Blocked',
};

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  [FileType.PHOTO]: 'Photo',
  [FileType.DOCUMENT]: 'Document',
};

export const REVIEW_DECISION_LABELS: Record<ReviewDecision, string> = {
  [ReviewDecision.APPROVE]: 'Approve',
  [ReviewDecision.REJECT]: 'Reject',
};

export const TX_STATUS_LABELS: Record<TxStatus, string> = {
  [TxStatus.SUCCESS]: 'Success',
  [TxStatus.FAILED]: 'Failed',
  [TxStatus.PENDING]: 'Pending',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADJUDICATOR]: 'Adjudicator',
  [UserRole.ADMIN]: 'Admin',
};

// Claim type select options — used in the submission form
export const CLAIM_TYPE_OPTIONS = Object.values(ClaimType).map((value) => ({
  value,
  label: CLAIM_TYPE_LABELS[value],
}));
