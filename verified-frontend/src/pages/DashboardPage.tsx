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

  const topStats = [
    {
      label: 'Claims today',
      value: stats?.totalClaimsToday ?? 0,
      delta: 'vs yesterday',
      deltaIcon: ArrowUp,
      deltaUp: true,
      icon: Banknote,
      color: 'default',
    },
    {
      label: 'This week',
      value: stats?.totalClaimsThisWeek ?? 0,
      delta: 'vs last week',
      deltaIcon: ArrowUp,
      deltaUp: true,
      icon: Banknote,
      color: 'default',
    },
    {
      label: 'Amount released',
      value: fmtNaira(stats?.totalAmountReleased ?? 0),
      delta: `${stats?.approvalRate ?? 0}% approval rate`,
      deltaIcon: ArrowUp,
      deltaUp: true,
      icon: Banknote,
      color: 'green',
    },
    {
      label: 'Amount blocked',
      value: fmtNaira(stats?.totalAmountBlocked ?? 0),
      delta: 'Prevented payout',
      deltaIcon: ShieldAlert,
      deltaUp: false,
      icon: Blocks,
      color: 'red',
    },
  ];

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
            <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-100 border border-white/20 bg-white text-stone-900 shadow-[0_1px_0_rgba(20,17,13,0.04),0_1px_2px_rgba(20,17,13,0.06)] hover:border-stone-900/15 hover:shadow-[0_2px_0_rgba(20,17,13,0.03),0_8px_16px_-4px_rgba(20,17,13,0.08),0_2px_4px_rgba(20,17,13,0.05)] hover:-translate-y-px">
              <Filter size={14} />{' '}
              <span className="hidden sm:flex items-center gap-1">
                Last 7 days <ChevronDown size={12} />
              </span>
            </button>
            <button
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-100 bg-stone-900 text-amber-50 border-stone-900 shadow-[0_2px_0_#d63a1f,0_4px_12px_-2px_rgba(20,17,13,0.25)] hover:bg-black hover:shadow-[0_2px_0_#d63a1f,0_8px_20px_-4px_rgba(20,17,13,0.35)]"
              onClick={() => navigate('/claims/new')}
            >
              <Plus size={14} />
              <span className="hidden sm:flex items-center gap-1">
                New claim
              </span>
            </button>
          </>
        }
      />

      {/* Top row stats - responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        {topStats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden p-5 rounded-xl flex flex-col gap-1.5 min-h-32.5 bg-white/75 backdrop-blur-sm border border-black/5 shadow-[0_2px_0_rgba(20,17,13,0.03),0_8px_16px_-4px_rgba(20,17,13,0.08),0_2px_4px_rgba(20,17,13,0.05)]"
          >
            <div
              className={`absolute left-0 top-4.5 w-0.5 h-4.5 rounded-r-sm ${
                stat.color === 'green'
                  ? 'bg-green-700'
                  : stat.color === 'red'
                    ? 'bg-red-700'
                    : 'bg-black'
              }`}
            />

            <div className="text-[10px] text-black/40 tracking-[0.14em] uppercase font-mono font-medium">
              {stat.label}
            </div>

            <div
              className={`font-['Bricolage_Grotesque'] text-[32px] sm:text-[42px] font-semibold tracking-[-0.045em] tabular-nums leading-[0.95] ${
                stat.color === 'green'
                  ? 'text-green-700'
                  : stat.color === 'red'
                    ? 'text-red-700'
                    : 'text-black'
              }`}
            >
              {statsLoading ? '—' : stat.value}
            </div>

            <div
              className={`text-[11px] font-mono flex items-center gap-1 mt-auto tracking-[0.02em] ${
                stat.deltaUp ? 'text-green-700' : 'text-red-700'
              }`}
            >
              <stat.deltaIcon size={11} /> {statsLoading ? '—' : stat.delta}
            </div>

            <div
              className={`absolute top-4.5 right-4.5 size-7.5 rounded-md grid place-items-center border ${
                stat.color === 'green'
                  ? 'bg-green-700/10 text-green-700 border-green-700/20'
                  : stat.color === 'red'
                    ? 'bg-red-700/10 text-red-700 border-red-700/20'
                    : 'bg-black/5 text-black/30 border-black/5'
              }`}
            >
              <stat.icon size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Second row: tier donut + queue cards - responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr] gap-3.5 mb-4">
        {/* Tier breakdown with MUI Donut */}
        <div className="col-span-2 lg:col-span-1 bg-white/75 backdrop-blur-lg border border-black/10 rounded-xl shadow-[0_2px_0_rgba(20,17,13,0.03),0_8px_16px_-4px_rgba(20,17,13,0.08),0_2px_4px_rgba(20,17,13,0.05)] p-5">
          <div className="font-['Bricolage_Grotesque'] text-[17px] font-semibold text-stone-900 tracking-[-0.02em] mb-3.5 flex items-center gap-2.5">
            Tier breakdown
            <span className="font-mono text-[9.5px] text-black/40 tracking-[0.14em] uppercase font-medium px-2 py-0.5 bg-black/5 rounded-full border border-black/10">
              tierBreakdown
            </span>
          </div>

          {statsLoading ? (
            <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
              Loading…
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:grid md:grid-cols-[auto_1fr] gap-6 items-center">
              <div className="relative shrink-0">
                <PieChart
                  series={[
                    {
                      data: donutData,
                      innerRadius: 40,
                      outerRadius: 70,
                      paddingAngle: 2,
                      cornerRadius: 4,
                      startAngle: -90,
                      endAngle: 270,
                      cx: 90,
                      cy: 90,
                      highlightScope: { fade: 'global', highlight: 'item' },
                      faded: {
                        innerRadius: 40,
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
              <div className="flex-1 w-full">
                <div className="flex flex-col gap-1.5">
                  {donutData.map((d) => (
                    <div
                      key={d.id}
                      className="grid grid-cols-[10px_1fr_auto_auto] gap-3 items-center text-[13px] py-2 border-b border-black/10 cursor-pointer transition-opacity hover:opacity-70"
                      onClick={() => navigate(`/claims?tier=${d.id}`)}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-xs"
                        style={{ background: d.color }}
                      />
                      <div className="text-sm text-gray-700">{d.label}</div>
                      <div className="font-['Bricolage_Grotesque'] tabular-nums text-stone-900 font-semibold text-[17px] tracking-[-0.02em]">
                        {d.value}
                      </div>
                      <div className="font-mono text-[11px] text-black/40 w-10 text-right">
                        {tierTotal > 0
                          ? Math.round((d.value / tierTotal) * 100)
                          : 0}
                        %
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Review queue */}
        <div className="p-5 rounded-xl flex flex-col gap-1.5 min-h-32.5 relative overflow-hidden bg-white/75 backdrop-blur-sm border border-black/10 shadow-[0_2px_0_rgba(20,17,13,0.03),0_8px_16px_-4px_rgba(20,17,13,0.08),0_2px_4px_rgba(20,17,13,0.05)] before:absolute before:left-0 before:top-4.5 before:w-0.5 before:h-4.5 before:rounded-r-sm before:bg-amber-700">
          <div className="text-[10px] text-black/40 tracking-[0.14em] uppercase font-mono font-medium">
            Review queue
          </div>
          <div className="font-['Bricolage_Grotesque'] text-[42px] font-semibold tracking-[-0.045em] tabular-nums leading-[0.95] text-amber-700">
            {statsLoading ? '—' : (stats?.reviewCount ?? 0)}
          </div>
          <div className="text-[11px] font-mono flex items-center gap-1 mt-auto tracking-[0.02em] text-amber-700">
            <Clock size={11} className="hidden md:block" /> Awaiting
            adjudication
          </div>
          <div className="mt-2.5">
            <button
              className="inline-flex items-center justify-center gap-2 w-full px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-100 border border-black/10 bg-white text-stone-900 shadow-[0_1px_0_rgba(20,17,13,0.04),0_1px_2px_rgba(20,17,13,0.06)] hover:border-stone-900/15 hover:shadow-[0_2px_0_rgba(20,17,13,0.03),0_8px_16px_-4px_rgba(20,17,13,0.08),0_2px_4px_rgba(20,17,13,0.05)] hover:-translate-y-px"
              onClick={() => navigate('/claims?status=UNDER_REVIEW')}
            >
              <p>
                <span className="hidden md:inline">Open</span> review queue
              </p>
              <ArrowRight size={12} />
            </button>
          </div>
          <div className="absolute top-4.5 right-4.5 w-7.5 h-7.5 rounded-md grid place-items-center bg-amber-700/10 text-amber-700 border border-amber-700/20" />
        </div>

        {/* Flagged */}
        <div className="p-5 rounded-xl flex flex-col gap-1.5 min-h-32.5 relative overflow-hidden bg-white/75 backdrop-blur-sm border border-black/10 shadow-[0_2px_0_rgba(20,17,13,0.03),0_8px_16px_-4px_rgba(20,17,13,0.08),0_2px_4px_rgba(20,17,13,0.05)] before:absolute before:left-0 before:top-4.5 before:w-0.5 before:h-4.5 before:rounded-r-sm before:bg-red-700">
          <div className="text-[10px] text-black/40 tracking-[0.14em] uppercase font-mono font-medium">
            Flagged claims
          </div>
          <div className="font-['Bricolage_Grotesque'] text-[42px] font-semibold tracking-[-0.045em] tabular-nums leading-[0.95] text-red-700">
            {statsLoading ? '—' : (stats?.flaggedCount ?? 0)}
          </div>
          <div className="text-[11px] font-mono flex items-center gap-1 mt-auto tracking-[0.02em] text-red-700">
            <Flame size={11} className="hidden md:block" /> Active fraud signals
          </div>
          <div className="mt-2.5">
            <button
              className="inline-flex items-center justify-center gap-2 w-full px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-100 border border-black/10 bg-white text-stone-900 shadow-[0_1px_0_rgba(20,17,13,0.04),0_1px_2px_rgba(20,17,13,0.06)] hover:border-stone-900/15 hover:shadow-[0_2px_0_rgba(20,17,13,0.03),0_8px_16px_-4px_rgba(20,17,13,0.08),0_2px_4px_rgba(20,17,13,0.05)] hover:-translate-y-px"
              onClick={() => navigate('/claims?tier=FLAGGED')}
            >
              <p>
                <span className="hidden md:inline">View</span> flagged
              </p>
              <ArrowRight size={12} />
            </button>
          </div>
          <div className="absolute top-4.5 right-4.5 w-7.5 h-7.5 rounded-md grid place-items-center bg-red-700/10 text-red-700 border border-red-700/20">
            <ShieldAlert size={16} />
          </div>
        </div>
      </div>

      {/* Recent activity - responsive table */}
      <div className="bg-white/75 backdrop-blur-lg border border-black/10 rounded-xl shadow-[0_2px_0_rgba(20,17,13,0.03),0_8px_16px_-4px_rgba(20,17,13,0.08),0_2px_4px_rgba(20,17,13,0.05)] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="font-['Bricolage_Grotesque'] text-[17px] font-semibold text-stone-900 tracking-[-0.02em] flex items-center gap-2.5">
            Recent activity
          </div>
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium cursor-pointer transition-all duration-100 bg-transparent shadow-none border-transparent hover:bg-black/5"
            onClick={() => navigate('/claims')}
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          {claimsLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Loading claims…
            </div>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="[&_th]:text-left [&_th]:text-[9.5px] [&_th]:uppercase [&_th]:tracking-[0.16em] [&_th]:text-black/40 [&_th]:font-mono [&_th]:font-medium [&_th]:px-3.5 [&_th]:py-3 [&_th]:border-b border-black/15 bg-black/5">
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
                    key={c.claimId}
                    className="cursor-pointer transition-colors hover:bg-red-700/5 [&_td]:p-3.5 [&_td]:border-b border-black/10 [&_td]:align-middle"
                    onClick={() => navigate(`/claims/${c.claimId}`)}
                  >
                    <td>
                      <div className="font-medium">{c.claimantName}</div>
                      <div className="font-mono text-xs text-gray-400">
                        {c.policyNumber}
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/5 border border-black/10 text-[10px] text-black/50 font-mono tracking-[0.08em] uppercase font-medium">
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
