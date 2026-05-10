export const ClaimType = {
  AUTO: 'AUTO',
  HEALTH: 'HEALTH',
  PROPERTY: 'PROPERTY',
} as const;
export type ClaimType = (typeof ClaimType)[keyof typeof ClaimType];

export const ClaimStatus = {
  SUBMITTED: 'SUBMITTED',
  PROCESSING: 'PROCESSING',
  SCORED: 'SCORED',
  PAID: 'PAID',
  UNDER_REVIEW: 'UNDER_REVIEW',
  BLOCKED: 'BLOCKED',
} as const;
export type ClaimStatus = (typeof ClaimStatus)[keyof typeof ClaimStatus];

export const ScoreTier = {
  VERIFIED: 'VERIFIED',
  REVIEW: 'REVIEW',
  FLAGGED: 'FLAGGED',
} as const;
export type ScoreTier = (typeof ScoreTier)[keyof typeof ScoreTier];

export const SquadAction = {
  RELEASE_PAYMENT: 'RELEASE_PAYMENT',
  HOLD_ESCROW: 'HOLD_ESCROW',
  BLOCK_PAYMENT: 'BLOCK_PAYMENT',
} as const;
export type SquadAction = (typeof SquadAction)[keyof typeof SquadAction];

export const FileType = {
  PHOTO: 'PHOTO',
  DOCUMENT: 'DOCUMENT',
} as const;
export type FileType = (typeof FileType)[keyof typeof FileType];

export const ReviewDecision = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
} as const;
export type ReviewDecision =
  (typeof ReviewDecision)[keyof typeof ReviewDecision];

export const TxStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
} as const;
export type TxStatus = (typeof TxStatus)[keyof typeof TxStatus];

export const UserRole = {
  ADJUDICATOR: 'ADJUDICATOR',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
