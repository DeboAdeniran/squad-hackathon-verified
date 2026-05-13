import type {
  ClaimDetail,
  ClaimResult,
  ClaimsQueryParams,
  ClaimSubmitRequest,
  ClaimSummary,
  FileItem,
  FlagItem,
  ModuleScores,
  PaginatedClaims,
  ReviewRequest,
  SquadTransaction,
} from '../types';
import {
  ClaimType,
  ClaimStatus,
  ScoreTier,
  SquadAction,
  FileType,
  ReviewDecision,
  TxStatus,
} from '../types';

// Helper function to generate random dates
const randomPastDate = (daysBack: number = 30): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
};

// const randomFutureDate = (daysForward: number = 30): string => {
//   const date = new Date();
//   date.setDate(date.getDate() + Math.floor(Math.random() * daysForward));
//   return date.toISOString();
// };

// Sample data pools

const firstNames = [
  'John',
  'Jane',
  'Michael',
  'Sarah',
  'David',
  'Emma',
  'Robert',
  'Lisa',
  'William',
  'Maria',
];
const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
];
const policyPrefixes = ['POL', 'INS', 'PLC', 'CNT', 'REF'];

const claimDescriptions = [
  'Vehicle was involved in a multi-car collision on the highway resulting in significant front-end damage.',
  'Water damage from burst pipe affecting living room and kitchen areas including flooring and furniture.',
  'Medical expenses related to injury sustained during a slip and fall accident at a commercial property.',
  'Theft of personal belongings from vehicle including laptop, camera, and other electronics.',
  'Property damage caused by fallen tree during severe storm, damaging roof and windows.',
  'Fire damage to kitchen from cooking accident, requiring smoke remediation and appliance replacement.',
  'Wind damage to exterior of home including missing shingles and damaged siding.',
  'Identity theft resulting in fraudulent charges and credit impacts over several months.',
];

// Generate random files
const generateFiles = (): FileItem[] => {
  const fileTypes = [FileType.PHOTO, FileType.DOCUMENT];
  const fileCount = Math.floor(Math.random() * 5) + 1;
  const files: FileItem[] = [];

  for (let i = 0; i < fileCount; i++) {
    files.push({
      fileUrl: `https://storage.example.com/files/${Math.random().toString(36).substring(7)}.${Math.random() > 0.5 ? 'jpg' : 'pdf'}`,
      fileType: fileTypes[Math.floor(Math.random() * fileTypes.length)],
    });
  }

  return files;
};

// Generate squad transactions
const generateSquadTransactions = (status: ClaimStatus): SquadTransaction[] => {
  if (
    status === ClaimStatus.PROCESSING ||
    status === ClaimStatus.SUBMITTED ||
    status === ClaimStatus.SCORED
  ) {
    return [];
  }

  const actions = [
    SquadAction.RELEASE_PAYMENT,
    SquadAction.BLOCK_PAYMENT,
    SquadAction.HOLD_ESCROW,
  ];
  const transactionCount = Math.floor(Math.random() * 3) + 1;
  const transactions: SquadTransaction[] = [];

  for (let i = 0; i < transactionCount; i++) {
    transactions.push({
      action: actions[Math.floor(Math.random() * actions.length)],
      squadReference: `SQ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      amount: Math.random() * 50000,
      status: [TxStatus.SUCCESS, TxStatus.PENDING, TxStatus.FAILED][
        Math.floor(Math.random() * 3)
      ],
      calledAt: randomPastDate(15),
    });
  }

  return transactions;
};

// Generate module scores
const generateModuleScores = (status: ClaimStatus): ModuleScores | null => {
  if (status === ClaimStatus.PROCESSING || status === ClaimStatus.SUBMITTED) {
    return null;
  }

  const generateScore = () => Math.floor(Math.random() * 101);
  const maybeNull = () => (Math.random() > 0.9 ? null : generateScore());

  return {
    photoScore: maybeNull(),
    documentScore: maybeNull(),
    behavioralScore: maybeNull(),
    identityScore: maybeNull(),
    priceScore: maybeNull(),
  };
};

// Generate flags
const generateFlags = (status: ClaimStatus): FlagItem[] => {
  if (status === ClaimStatus.PROCESSING || status === ClaimStatus.SUBMITTED) {
    return [];
  }

  const flagTemplates = [
    {
      module: 'Photo Analysis',
      signal: 'INCONSISTENT_METADATA',
      explanation: "Photo timestamps don't match incident date",
    },
    {
      module: 'Document Analysis',
      signal: 'MISSING_REQUIRED_FIELDS',
      explanation: 'Police report missing officer signature',
    },
    {
      module: 'Behavioral',
      signal: 'UNUSUAL_PATTERN',
      explanation: 'Claim filed outside normal business hours',
    },
    {
      module: 'Identity',
      signal: 'ADDRESS_MISMATCH',
      explanation: 'Claimant address differs from policy address',
    },
    {
      module: 'Price Analysis',
      signal: 'ABOVE_THRESHOLD',
      explanation: 'Claimed amount exceeds historical average by 40%',
    },
    {
      module: 'Cross Reference',
      signal: 'DUPLICATE_CLAIM',
      explanation: 'Similar claim filed within 30 days',
    },
  ];

  const flagCount = Math.floor(Math.random() * 3);
  const flags: FlagItem[] = [];

  for (let i = 0; i < flagCount; i++) {
    const template =
      flagTemplates[Math.floor(Math.random() * flagTemplates.length)];
    if (!flags.some((f) => f.signal === template.signal)) {
      flags.push({ ...template });
    }
  }

  return flags;
};

// Generate trust score and tier (based on your actual ScoreTier enum)
const generateTrustScoreAndTier = (
  status: ClaimStatus,
): { trustScore: number | null; tier: ScoreTier | null } => {
  if (status === ClaimStatus.PROCESSING || status === ClaimStatus.SUBMITTED) {
    return { trustScore: null, tier: null };
  }

  const score = Math.floor(Math.random() * 101);
  let tier: ScoreTier;

  if (score >= 70) tier = ScoreTier.VERIFIED;
  else if (score >= 40) tier = ScoreTier.REVIEW;
  else tier = ScoreTier.FLAGGED;

  return { trustScore: score, tier };
};

// Generate squad action (based on your actual SquadAction enum)
const generateSquadAction = (
  status: ClaimStatus,
  trustScore: number | null,
): SquadAction | null => {
  if (status !== ClaimStatus.PAID || trustScore === null) {
    return null;
  }

  if (trustScore >= 70) return SquadAction.RELEASE_PAYMENT;
  if (trustScore >= 40) return SquadAction.HOLD_ESCROW;
  return SquadAction.BLOCK_PAYMENT;
};

// Get random claim status with realistic distribution
const getRandomClaimStatus = (): ClaimStatus => {
  const statuses = [
    ClaimStatus.SUBMITTED,
    ClaimStatus.PROCESSING,
    ClaimStatus.SCORED,
    ClaimStatus.UNDER_REVIEW,
    ClaimStatus.PAID,
    ClaimStatus.BLOCKED,
  ];

  // Weighted distribution (more SUBMITTED/PROCESSING, fewer PAID/BLOCKED)
  const weights = [0.25, 0.25, 0.2, 0.15, 0.1, 0.05];
  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < statuses.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      return statuses[i];
    }
  }

  return ClaimStatus.SUBMITTED;
};

// Main generator functions
export const generateClaimSummary = (id?: string): ClaimSummary => {
  const status = getRandomClaimStatus();
  const { trustScore, tier } = generateTrustScoreAndTier(status);

  return {
    id: id || `CLM-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    claimantName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    policyNumber: `${policyPrefixes[Math.floor(Math.random() * policyPrefixes.length)]}-${Math.floor(Math.random() * 90000 + 10000)}`,
    claimType:
      Object.values(ClaimType)[
        Math.floor(Math.random() * Object.values(ClaimType).length)
      ],
    claimedAmount: Math.floor(Math.random() * 100000) + 500,
    status,
    tier,
    trustScore,
    createdAt: randomPastDate(60),
  };
};

export const generateClaimResult = (
  id: string,
  status: ClaimStatus,
): ClaimResult => {
  const { trustScore, tier } = generateTrustScoreAndTier(status);
  const moduleScores = generateModuleScores(status);
  const flags = generateFlags(status);
  const squadAction = generateSquadAction(status, trustScore);

  return {
    id,
    status,
    trustScore,
    tier,
    squadAction,
    confidence:
      status === ClaimStatus.PROCESSING || status === ClaimStatus.SUBMITTED
        ? null
        : parseFloat((Math.random() * 0.6 + 0.2).toFixed(2)), // 0.2-0.8 range
    moduleScores,
    flags,
    scoredAt:
      status === ClaimStatus.PROCESSING || status === ClaimStatus.SUBMITTED
        ? null
        : randomPastDate(5),
  };
};

export const generateClaimDetail = (id?: string): ClaimDetail => {
  const summary = generateClaimSummary(id);
  const result = generateClaimResult(summary.id, summary.status);
  const files = generateFiles();

  return {
    ...result,
    claimantName: summary.claimantName,
    policyNumber: summary.policyNumber,
    claimType: summary.claimType,
    claimedAmount: summary.claimedAmount,
    incidentDate: randomPastDate(90).split('T')[0], // YYYY-MM-DD
    description:
      claimDescriptions[Math.floor(Math.random() * claimDescriptions.length)],
    createdAt: summary.createdAt,
    files,
    squadTransactions: generateSquadTransactions(summary.status),
  };
};

export const generatePaginatedClaims = (
  page: number = 0,
  size: number = 20,
  totalElements: number = 100,
): PaginatedClaims => {
  const start = page * size;
  const end = Math.min(start + size, totalElements);
  const content: ClaimSummary[] = [];

  for (let i = start; i < end; i++) {
    content.push(generateClaimSummary());
  }

  return {
    content,
    totalElements,
    totalPages: Math.ceil(totalElements / size),
    number: page,
    size,
  };
};

// Generate multiple claims at once
export const generateClaimList = (count: number = 10): ClaimSummary[] => {
  const claims: ClaimSummary[] = [];
  for (let i = 0; i < count; i++) {
    claims.push(generateClaimSummary());
  }
  return claims;
};

export const generateClaimDetailsList = (count: number = 10): ClaimDetail[] => {
  const claims: ClaimDetail[] = [];
  for (let i = 0; i < count; i++) {
    claims.push(generateClaimDetail());
  }
  return claims;
};

// Mock API responses
export const mockApiResponses = {
  // GET /api/claims
  getClaims: (params?: ClaimsQueryParams): PaginatedClaims => {
    const page = params?.page || 0;
    const size = params?.size || 20;
    let claims = generateClaimList(100);

    // Apply filters
    if (params?.tier && params.tier !== 'ALL') {
      claims = claims.filter((c) => c.tier === params.tier);
    }
    if (params?.claimType) {
      claims = claims.filter((c) => c.claimType === params.claimType);
    }
    if (params?.status) {
      claims = claims.filter((c) => c.status === params.status);
    }

    const start = page * size;
    const end = Math.min(start + size, claims.length);

    return {
      content: claims.slice(start, end),
      totalElements: claims.length,
      totalPages: Math.ceil(claims.length / size),
      number: page,
      size,
    };
  },

  // GET /api/claims/:id
  getClaimById: (id: string): ClaimDetail | null => {
    const claim = generateClaimDetail(id);
    return claim.id === id ? claim : null;
  },

  // GET /api/claims/:id/result
  getClaimResult: (id: string): ClaimResult | null => {
    const claim = generateClaimDetail(id);
    if (claim.id !== id) return null;

    return {
      id: claim.id,
      status: claim.status,
      trustScore: claim.trustScore,
      tier: claim.tier,
      squadAction: claim.squadAction,
      confidence: claim.confidence,
      moduleScores: claim.moduleScores,
      flags: claim.flags,
      scoredAt: claim.scoredAt,
    };
  },

  // POST /api/claims (submit new claim)
  submitClaim: (request: ClaimSubmitRequest): ClaimSummary => {
    // Create a new claim based on the request
    const newClaim: ClaimSummary = {
      id: `CLM-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      claimantName: request.claimantName,
      policyNumber: request.policyNumber,
      claimType: request.claimType,
      claimedAmount: request.claimedAmount,
      status: ClaimStatus.SUBMITTED,
      tier: null,
      trustScore: null,
      createdAt: new Date().toISOString(),
    };
    return newClaim;
  },

  // POST /api/claims/:id/review
  submitReview: (id: string, request: ReviewRequest): ClaimDetail => {
    const claim = generateClaimDetail(id);
    // Update status based on review decision
    if (request.decision === ReviewDecision.APPROVE) {
      claim.status = ClaimStatus.PAID;
    } else {
      claim.status = ClaimStatus.BLOCKED;
    }
    // Add review notes to flags if provided
    if (request.notes) {
      claim.flags.push({
        module: 'Manual Review',
        signal: 'REVIEW_DECISION',
        explanation: request.notes,
      });
    }
    return claim;
  },
};

// Export individual generators for specific use cases
export const dummyData = {
  generateClaimSummary,
  generateClaimDetail,
  generatePaginatedClaims,
  generateClaimList,
  generateClaimDetailsList,
  mockApiResponses,
};

// Export a function to generate claims with specific status for testing
export const generateClaimsByStatus = (
  status: ClaimStatus,
  count: number = 10,
): ClaimSummary[] => {
  const claims: ClaimSummary[] = [];
  for (let i = 0; i < count; i++) {
    const claim = generateClaimSummary();
    claim.status = status;
    const { trustScore, tier } = generateTrustScoreAndTier(status);
    claim.trustScore = trustScore;
    claim.tier = tier;
    claims.push(claim);
  }
  return claims;
};
