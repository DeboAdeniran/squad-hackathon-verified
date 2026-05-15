import {
  ClaimType,
  ClaimStatus,
  ScoreTier,
  SquadAction,
  FileType,
  ReviewDecision,
  TxStatus,
} from './enums';

// ── Requests ──────────────────────────────────────────────────────────────────

export interface BankDetails {
  accountNumber: string;
  bankCode: string;
  accountName?: string;
}

export interface ClaimSubmitRequest {
  claimantName: string;
  policyNumber: string;
  claimType: ClaimType;
  claimedAmount: number;
  incidentDate: string; // ISO date string: "YYYY-MM-DD"
  description: string; // min 20 chars
  accountNumber: string;
  bankCode: string;
}
export interface verifyAccountRequest {
  accountNumber: string;
  bankCode: string;
}
export interface ReviewRequest {
  decision: ReviewDecision;
  notes?: string;
}

// ── Sub-shapes ────────────────────────────────────────────────────────────────

export interface ModuleScores {
  photoScore: number | null;
  documentScore: number | null;
  behavioralScore: number | null;
  identityScore: number | null;
  priceScore: number | null;
}

export interface FlagItem {
  module: string;
  signal: string;
  explanation: string;
}

export interface FileItem {
  fileUrl: string;
  fileType: FileType;
}

export interface SquadTransaction {
  action: SquadAction;
  squadReference: string;
  amount: number;
  status: TxStatus;
  calledAt: string; // LocalDateTime as ISO string
}

// ── Responses ─────────────────────────────────────────────────────────────────

/** Row in the claims list table */
export interface ClaimSummary {
  claimId: string;
  claimantName: string;
  policyNumber: string;
  claimType: ClaimType;
  claimedAmount: number;
  status: ClaimStatus;
  tier: ScoreTier | null;
  trustScore: number | null;
  createdAt: string; // LocalDateTime as ISO string
}

/** Polling response — returned by GET /api/claims/:id/result */
export interface ClaimResult {
  claimId: string;
  status: ClaimStatus;
  trustScore: number | null; // 0–100, null while PROCESSING
  tier: ScoreTier | null;
  squadAction: SquadAction | null;
  confidence: number | null; // 0.0–1.0, null while PROCESSING
  moduleScores: ModuleScores | null;
  flags: FlagItem[];
  scoredAt: string | null; // LocalDateTime, null while PROCESSING
}

/** Full detail — returned by GET /api/claims/:id */
export interface ClaimDetail {
  claimId: string;
  claimantName: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  policyNumber: string;
  claimType: ClaimType;
  claimedAmount: number;
  incidentDate: string; // LocalDate as ISO string
  description: string;
  bankDetails: BankDetails;
  createdAt: string;
  files: FileItem[];
  squadTransactions: SquadTransaction[];
  trustScore: ClaimResult; // embed the ClaimResult for convenience, even though it's technically redundant with some fields
}

/** Paginated list wrapper */
export interface PaginatedClaims {
  content: ClaimSummary[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
  size: number;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface ClaimsQueryParams {
  page?: number;
  size?: number;
  tier?: ScoreTier | 'ALL';
  claimType?: ClaimType;
  status?: ClaimStatus;
}
