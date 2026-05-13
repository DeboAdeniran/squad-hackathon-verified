import Topbar from '../components/Topbar';
import {
  Filter,
  ChevronDown,
  Plus,
  ArrowUp,
  Banknote,
  ShieldAlert,
  Blocks,
  Clock,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { ClaimType, ScoreTier } from '../types/enums';
import { TierBadge, StatusBadge, TrustMini } from '../components/ui';
import { CLAIM_TYPE_LABELS, TIER_LABELS } from '../constants';
import { PieChart } from '@mui/x-charts/PieChart';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useClaims } from '../hooks/useClaims';

const ClaimTypeIcon = ({ type }: { type: ClaimType }) => {
  const icons = {
    [ClaimType.AUTO]: '🚗',
    [ClaimType.HEALTH]: '🏥',
    [ClaimType.PROPERTY]: '🏠',
  };
  return <span className="mr-1">{icons[type]}</span>;
};

const fmtNaira = (amount: number) => {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`;
  return `₦${amount.toLocaleString()}`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboard();
  const { data: claimsPage, isLoading: claimsLoading } = useClaims({ size: 5 });

  const recent = claimsPage?.content ?? [];

  const donutData = stats
    ? [
        {
          id: ScoreTier.VERIFIED,
          label: TIER_LABELS[ScoreTier.VERIFIED],
          value: stats.tierBreakdown[ScoreTier.VERIFIED],
          color: '#15803d',
        },
        {
          id: ScoreTier.REVIEW,
          label: TIER_LABELS[ScoreTier.REVIEW],
          value: stats.tierBreakdown[ScoreTier.REVIEW],
          color: '#b45309',
        },
        {
          id: ScoreTier.FLAGGED,
          label: TIER_LABELS[ScoreTier.FLAGGED],
          value: stats.tierBreakdown[ScoreTier.FLAGGED],
          color: '#b91c1c',
        },
      ]
    : [];

  const tierTotal = donutData.reduce((a, b) => a + b.value, 0);

  return (
    <div>
      <Topbar
        title="Dashboard"
        crumb={
          <>
            <b>Workspace</b> · Overview
          </>
        }
        actions={
          <>
            <button className="btn">
              <Filter size={14} /> Last 7 days <ChevronDown size={12} />
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/claims/new')}
            >
              <Plus size={14} /> New claim
            </button>
          </>
        }
      />

      {/* Top row stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-4">
        <div className="stat">
          <div className="stat-label">Claims today</div>
          <div className="stat-value">
            {statsLoading ? '—' : (stats?.totalClaimsToday ?? 0)}
          </div>
          <div className="stat-delta up">
            <ArrowUp size={11} /> vs yesterday
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">This week</div>
          <div className="stat-value">
            {statsLoading ? '—' : (stats?.totalClaimsThisWeek ?? 0)}
          </div>
          <div className="stat-delta up">
            <ArrowUp size={11} /> vs last week
          </div>
        </div>
        <div className="stat good">
          <div className="stat-label">Amount released</div>
          <div className="stat-value">
            {statsLoading ? '—' : fmtNaira(stats?.totalAmountReleased ?? 0)}
          </div>
          <div className="stat-delta up">
            <ArrowUp size={11} />{' '}
            {statsLoading ? '—' : (stats?.approvalRate ?? 0)}% approval rate
          </div>
          <div className="stat-icon">
            <Banknote size={16} />
          </div>
        </div>
        <div className="stat danger">
          <div className="stat-label">Amount blocked</div>
          <div className="stat-value">
            {statsLoading ? '—' : fmtNaira(stats?.totalAmountBlocked ?? 0)}
          </div>
          <div className="stat-delta down">
            <ShieldAlert size={11} /> Prevented payout
          </div>
          <div className="stat-icon">
            <Blocks size={16} />
          </div>
        </div>
      </div>

      {/* Second row: tier donut + queue cards */}
      <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-3.5 mb-4">
        {/* Tier breakdown with MUI Donut */}
        <div className="glass p-5">
          <div className="section-title">
            Tier breakdown
            <span className="label-pill">tierBreakdown</span>
          </div>

          {statsLoading ? (
            <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
              Loading…
            </div>
          ) : (
            <div className="grid grid-cols-[auto_1fr] gap-6 items-center">
              <div className="relative">
                <PieChart
                  series={[
                    {
                      data: donutData,
                      innerRadius: 50,
                      outerRadius: 80,
                      paddingAngle: 2,
                      cornerRadius: 4,
                      startAngle: -90,
                      endAngle: 270,
                      cx: 90,
                      cy: 90,
                      highlightScope: { fade: 'global', highlight: 'item' },
                      faded: {
                        innerRadius: 50,
                        additionalRadius: -30,
                        color: 'gray',
                      },
                    },
                  ]}
                  width={180}
                  height={180}
                  slotProps={{ legend: { hidden: true } }}
                  sx={{
                    '& .MuiPieArc-root': {
                      stroke: 'none',
                      transition: 'transform 0.2s ease, filter 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        filter: 'brightness(0.95)',
                        cursor: 'pointer',
                      },
                    },
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-gray-900">
                    {tierTotal}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Total
                  </span>
                </div>
              </div>
              <div className="donut-legend">
                {donutData.map((d) => (
                  <div
                    key={d.id}
                    className="donut-legend-item"
                    onClick={() => navigate(`/claims?tier=${d.id}`)}
                  >
                    <div
                      className="donut-legend-dot"
                      style={{ background: d.color }}
                    />
                    <div className="text-sm text-gray-700">{d.label}</div>
                    <div className="donut-legend-val">{d.value}</div>
                    <div className="donut-legend-pct">
                      {tierTotal > 0
                        ? Math.round((d.value / tierTotal) * 100)
                        : 0}
                      %
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Review queue */}
        <div className="stat warn">
          <div className="stat-label">Review queue</div>
          <div className="stat-value">
            {statsLoading ? '—' : (stats?.reviewCount ?? 0)}
          </div>
          <div className="stat-delta" style={{ color: '#b45309' }}>
            <Clock size={11} /> Awaiting adjudication
          </div>
          <div className="mt-2.5">
            <button
              className="btn w-full justify-center"
              onClick={() => navigate('/claims?status=UNDER_REVIEW')}
            >
              Open review queue <ArrowRight size={12} />
            </button>
          </div>
          <div className="stat-icon" />
        </div>

        {/* Flagged */}
        <div className="stat danger">
          <div className="stat-label">Flagged claims</div>
          <div className="stat-value">
            {statsLoading ? '—' : (stats?.flaggedCount ?? 0)}
          </div>
          <div className="stat-delta" style={{ color: '#b91c1c' }}>
            <Flame size={11} /> Active fraud signals
          </div>
          <div className="mt-2.5">
            <button
              className="btn w-full justify-center"
              onClick={() => navigate('/claims?tier=FLAGGED')}
            >
              View flagged <ArrowRight size={12} />
            </button>
          </div>
          <div className="stat-icon">
            <ShieldAlert size={16} />
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="section-title m-0">
            Recent activity
            <span className="label-pill">live · 60s polling</span>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/claims')}>
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          {claimsLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Loading claims…
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Claimant</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Tier</th>
                  <th>Trust</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => navigate(`/claims/${c.id}`)}
                  >
                    <td>
                      <div className="font-medium">{c.claimantName}</div>
                      <div className="font-mono text-xs text-gray-400">
                        {c.policyNumber}
                      </div>
                    </td>
                    <td>
                      <span className="chip">
                        <ClaimTypeIcon type={c.claimType} />
                        {CLAIM_TYPE_LABELS[c.claimType]}
                      </span>
                    </td>
                    <td className="font-mono tabular-nums font-medium">
                      ₦{c.claimedAmount.toLocaleString()}
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>
                      <TierBadge tier={c.tier} />
                    </td>
                    <td>
                      <TrustMini score={c.trustScore} />
                    </td>
                    <td className="font-mono text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
