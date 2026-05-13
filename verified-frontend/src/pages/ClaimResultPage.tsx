import { Gauge } from '@mui/x-charts/Gauge';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClaimResult } from '../hooks/useClaimResult';
import { StatusBadge, TierBadge } from '../components/ui';
import { SQUAD_ACTION_LABELS } from '../constants';
import type { ModuleScores } from '../types';
import { ClaimStatus, SquadAction } from '../types/enums';

// ── Helpers ───────────────────────────────────────────────────────────────────

const getGaugeColor = (score: number | null) => {
  if (score === null) return '#9ca3af';
  if (score >= 75) return '#15803d';
  if (score >= 45) return '#b45309';
  return '#b91c1c';
};

const MODULE_META: { key: keyof ModuleScores; label: string }[] = [
  { key: 'identityScore', label: 'Identity' },
  { key: 'photoScore', label: 'Photo' },
  { key: 'documentScore', label: 'Document' },
  { key: 'priceScore', label: 'Price' },
  { key: 'behavioralScore', label: 'Behavior' },
];

const ModuleCard = ({
  label,
  score,
}: {
  label: string;
  score: number | null;
}) => (
  <div className="module">
    <div className="module-head">
      <div className="module-icon">
        <span className="text-sm">📊</span>
      </div>
      <div className="module-name">{label}</div>
    </div>
    <div className="module-score">{score !== null ? score : '—'}</div>
    <div className="module-bar">
      <div
        className="module-bar-fill"
        style={{
          width: score !== null ? `${score}%` : '0%',
          background: getGaugeColor(score),
        }}
      />
    </div>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

export default function ClaimResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: result, isLoading, isError } = useClaimResult(id);

  const isProcessing =
    !result ||
    result.status === ClaimStatus.PROCESSING ||
    result.status === ClaimStatus.SUBMITTED;

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading && !result) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
          <div className="text-gray-500 text-sm">Connecting…</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass p-8 text-center">
        <AlertTriangle size={48} className="text-flagged mx-auto mb-4" />
        <div className="text-lg font-medium text-gray-900 mb-2">
          Failed to load result
        </div>
        <div className="text-gray-500 mb-4">
          We couldn't retrieve the claim result. Please try again.
        </div>
        <button className="btn" onClick={() => navigate('/claims')}>
          Back to Claims
        </button>
      </div>
    );
  }

  // ── Processing state ──────────────────────────────────────────────────────

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="glass-hero p-10 max-w-md w-full text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
            <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={28} className="text-accent animate-spin" />
            </div>
          </div>

          <div className="text-2xl font-semibold tracking-tight mb-2">
            Analysing claim
          </div>
          <div className="text-sm text-gray-500 mb-6">
            Verified AI is scoring this claim across 5 modules. This usually
            takes 5–15 seconds.
          </div>

          <div className="grid grid-cols-5 gap-2">
            {MODULE_META.map((m, i) => (
              <div key={m.key} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-accent animate-spin"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
                <div className="font-mono text-[9px] text-gray-400 uppercase tracking-wide text-center">
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-6 font-mono text-xs text-gray-400">
            <Clock size={12} />
            Polling GET /api/claims/{id?.slice(0, 8)}…/result
          </div>
        </div>
      </div>
    );
  }

  // ── Scored result ─────────────────────────────────────────────────────────

  const gaugeColor = getGaugeColor(result.trustScore);

  const squadBg = {
    [SquadAction.RELEASE_PAYMENT]: 'bg-green-50 border-green-200',
    [SquadAction.HOLD_ESCROW]: 'bg-orange-50 border-orange-200',
    [SquadAction.BLOCK_PAYMENT]: 'bg-red-50 border-red-200',
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success header */}
      <div className="glass-hero p-8 mb-4 text-center">
        <CheckCircle size={36} className="text-verified mx-auto mb-3" />
        <div className="text-2xl font-semibold tracking-tight mb-1">
          Analysis complete
        </div>
        <div className="text-sm text-gray-500 mb-4">
          Claim <span className="font-mono">{result.id}</span> has been scored.
        </div>
        <div className="flex justify-center gap-2 flex-wrap">
          {result.tier && <TierBadge tier={result.tier} />}
          <StatusBadge status={result.status} />
        </div>
      </div>

      {/* Trust score gauge */}
      <div className="glass p-6 mb-4 flex flex-col items-center">
        <div className="section-title self-start mb-4">
          Trust Score
          <span className="label-pill">0 – 100</span>
        </div>
        <div className="relative">
          <Gauge
            value={result.trustScore ?? 0}
            valueMin={0}
            valueMax={100}
            startAngle={-90}
            endAngle={90}
            innerRadius="78%"
            outerRadius="100%"
            cornerRadius="50%"
            width={240}
            height={240}
            sx={{
              '& .MuiGauge-valueArc': {
                fill: gaugeColor,
                filter: `drop-shadow(0 0 10px ${gaugeColor}55)`,
              },
              '& .MuiGauge-referenceArc': { fill: '#e5e7eb' },
              '& .MuiGauge-valueText': { display: 'none' },
            }}
          />
          <div className="absolute inset-x-0 bottom-0 translate-y-[-60%] flex flex-col items-center justify-center pointer-events-none">
            <span
              className="text-6xl font-bold tabular-nums"
              style={{ color: gaugeColor }}
            >
              {result.trustScore ?? 0}
            </span>
            <span className="text-gray-400 text-sm font-mono">/ 100</span>
          </div>
        </div>

        {result.confidence !== null && (
          <div className="mt-2 font-mono text-xs text-gray-400">
            Model confidence: {Math.round((result.confidence ?? 0) * 100)}%
          </div>
        )}
      </div>

      {/* Module scores */}
      {result.moduleScores && (
        <div className="glass p-5 mb-4">
          <div className="section-title">
            Module scores
            <span className="label-pill">moduleScores</span>
          </div>
          <div className="module-grid">
            {MODULE_META.map((m) => (
              <ModuleCard
                key={m.key}
                label={m.label}
                score={result.moduleScores?.[m.key] ?? null}
              />
            ))}
          </div>
        </div>
      )}

      {/* Flags */}
      <div className="glass p-5 mb-4">
        <div className="section-title">
          Flags raised
          <span className="label-pill">flags[] · {result.flags.length}</span>
        </div>
        {result.flags.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            <ShieldCheck size={28} className="text-verified mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">
              No flags raised
            </div>
            <div className="text-xs mt-1">
              This claim passed all ML modules cleanly.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {result.flags.map((f, i) => (
              <div key={i} className="flag-card">
                <div className="flag-icon">
                  <ShieldAlert size={14} />
                </div>
                <div>
                  <div className="flag-signal">
                    {f.module} · {f.signal}
                  </div>
                  <div className="flag-explanation">{f.explanation}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Squad action */}
      {result.squadAction && (
        <div
          className={`glass p-5 mb-4 border ${squadBg[result.squadAction] ?? 'bg-gray-50 border-gray-200'}`}
        >
          <div className="section-title">
            Squad action taken
            <span className="label-pill">squadAction</span>
          </div>
          <div className="text-lg font-semibold">
            {SQUAD_ACTION_LABELS[result.squadAction]}
          </div>
          <div className="font-mono text-xs text-gray-400 mt-1">
            Automatically triggered via Squad API based on trust score
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="glass p-4 flex justify-between items-center">
        <button className="btn" onClick={() => navigate('/claims')}>
          Back to Claims
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/claims/${result.id}`)}
        >
          View full detail <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
