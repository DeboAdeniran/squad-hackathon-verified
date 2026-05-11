import { ScoreTier } from './enums';

export type TierBreakdown = Record<ScoreTier, number>;

export interface DashboardStats {
  totalClaimsToday: number;
  totalClaimsThisWeek: number;
  totalAmountBlocked: number;
  totalAmountReleased: number;
  approvalRate: number; // e.g. 68.4 (percentage)
  flaggedCount: number;
  reviewCount: number;
  tierBreakdown: TierBreakdown;
}
