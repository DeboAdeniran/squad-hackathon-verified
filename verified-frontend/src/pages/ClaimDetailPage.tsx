import { Gauge } from '@mui/x-charts/Gauge';
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Eye,
  File as FileIcon,
  Image as ImageIcon,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  X,
  Building2,
  CreditCard,
} from 'lucide-react';
import Topbar from '../components/Topbar';
import { StatusBadge, TierBadge } from '../components/ui';
import { SkeletonCard, SkeletonText } from '../components/LoadingSkeleton';
import {
  CLAIM_TYPE_LABELS,
  REVIEW_DECISION_LABELS,
  SQUAD_ACTION_LABELS,
  TX_STATUS_LABELS,
} from '../constants';
import type {
  FileItem,
  FlagItem,
  ModuleScores,
  SquadTransaction,
} from '../types';
import {
  ClaimStatus,
  ClaimType,
  FileType,
  ReviewDecision,
  ScoreTier,
  SquadAction,
  TxStatus,
} from '../types/enums';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClaimDetail } from '../hooks/useClaimDetail';
import { useReviewClaimMutation } from '../hooks';
import { getApiErrorMessage } from '../api';
import { PDFViewerModal } from '../components/PDFViewerModal';
import banks from '../data/nigerian_banks.json';

// ── Helpers ───────────────────────────────────────────────────────────────────

const truncUuid = (id: string) => id?.slice(0, 8) + '...' || '';
const fmtNaira = (amount: number) => `₦${amount?.toLocaleString() || 0}`;
const fmtDate = (date: string) =>
  date ? new Date(date).toLocaleDateString() : 'N/A';
const fmtDateTime = (date: string) =>
  date ? new Date(date).toLocaleString() : 'N/A';

const getBankNameByCode = (code: string): string => {
  const bank = banks.find((b) => b.bank_code === code);
  return bank?.bank_name || code;
};

const getGaugeColor = (score: number | null) => {
  if (score === null) return '#9ca3af';
  if (score >= 75) return '#15803d';
  if (score >= 45) return '#b45309';
  return '#b91c1c';
};

const SquadActionLabel = ({ action }: { action: SquadAction | null }) => {
  if (!action) return <span>—</span>;
  return <span>{SQUAD_ACTION_LABELS[action]}</span>;
};

// ── Main Component ─────────────────────────────────────────────────────────

export default function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reviewMutation = useReviewClaimMutation();

  const { data: claim, isLoading, isError } = useClaimDetail(id);

  const [reviewDecision, setReviewDecision] = useState<ReviewDecision | null>(
    null,
  );
  const [reviewNotes, setReviewNotes] = useState('');
  const [tab, setTab] = useState('overview');
  const [pdfViewer, setPdfViewer] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const handleReviewSubmit = async () => {
    if (!reviewDecision || !id) return;
    try {
      await reviewMutation.mutateAsync({
        claimId: id,
        reviewData: {
          decision: reviewDecision,
          notes: reviewNotes || undefined,
        },
      });
    } catch (err) {
      // Error is handled by the mutation's error state
      console.error('Review submission failed:', err);
    }
  };

  // ── Loading / error states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonText lines={4} />
      </div>
    );
  }

  if (isError || !claim) {
    return (
      <div className="glass p-8 text-center">
        <AlertTriangle size={48} className="text-flagged mx-auto mb-4" />
        <div className="text-lg font-medium text-gray-900 mb-2">
          Failed to load claim
        </div>
        <div className="text-gray-500 mb-4">
          The claim could not be found or an error occurred.
        </div>
        <button className="btn" onClick={() => navigate('/claims')}>
          Back to Claims
        </button>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const showReview = claim.trustScore?.status === ClaimStatus.UNDER_REVIEW;
  const photos =
    claim.files?.filter((f) => f.fileType === FileType.PHOTO) || [];
  const docFiles =
    claim.files?.filter((f) => f.fileType === FileType.DOCUMENT) || [];
  const gaugeColor = getGaugeColor(claim.trustScore?.trustScore);

  const MODULE_META = [
    { key: 'identityScore', label: 'Identity' },
    { key: 'photoScore', label: 'Photo' },
    { key: 'documentScore', label: 'Document' },
    { key: 'priceScore', label: 'Price' },
    { key: 'behavioralScore', label: 'Behavior' },
  ] as const;

  const ModuleCard = ({
    label,
    score,
  }: {
    label: string;
    score: number | null;
  }) => (
    <div className="module  w-full">
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

  const handleViewDocument = (fileUrl: string) => {
    const fileName = fileUrl.split('/').pop() || 'document.pdf';
    setPdfViewer({ url: fileUrl, name: fileName });
  };

  return (
    <div>
      <Topbar
        title={claim.claimantName}
        crumb={
          <>
            <span
              className="cursor-pointer"
              onClick={() => navigate('/claims')}
            >
              Claims
            </span>
            <span className="mx-1">·</span>
            <b>{truncUuid(claim.claimId)}</b>
            <span className="mx-1">·</span>
            {claim.trustScore?.tier ? 'Result' : 'Detail'}
          </>
        }
        actions={
          <>
            <button className="btn">
              <ExternalLink size={14} /> Export
            </button>
            <button className="btn">
              <MoreVertical size={14} />
            </button>
          </>
        }
      />

      {/* Hero section - fully responsive */}
      <div className="glass-hero px-4 pb-4 xl:pb-0 sm:px-7 mb-4 grid grid-cols-1 md:grid-cols-[auto_auto] xl:grid-cols-[0.4fr_1fr_0.4fr] gap-6 md:gap-7 items-start md:items-center">
        {/* Gauge - centered on mobile */}
        <div className="relative mx-auto md:mx-0 md:col-span-2 xl:col-span-1">
          <div className="relative w-48 h-48 sm:w-55 sm:h-55 mx-auto">
            <Gauge
              value={claim.trustScore?.trustScore ?? 0}
              valueMin={0}
              valueMax={100}
              startAngle={-90}
              endAngle={90}
              innerRadius="85%"
              outerRadius="105%"
              cornerRadius="50%"
              width={220}
              height={220}
              sx={{
                '& .MuiGauge-valueArc': {
                  fill: gaugeColor,
                  filter: `drop-shadow(0 0 8px ${gaugeColor}60)`,
                },
                '& .MuiGauge-referenceArc': { fill: '#e5e7eb' },
                '& .MuiGauge-valueText': { display: 'none' },
              }}
            />
            <div className="absolute inset-x-0 bottom-0 -translate-y-1/2 flex flex-col items-center justify-center">
              <div
                className="text-2xl text-gray-500"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span
                  className="text-4xl sm:text-5xl font-bold"
                  style={{ color: gaugeColor }}
                >
                  {claim.trustScore?.trustScore ?? 0}
                </span>
                / 100
              </div>
              <div className="text-xs text-gray-400 font-mono uppercase mt-1 tracking-wide">
                Trust Score
              </div>
            </div>
          </div>

          {claim.trustScore?.confidence && (
            <div className="text-center mt-3 py-2 border-t border-gray-200">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/80 border border-gray-200 shadow-sm">
                <span className="text-xs font-mono text-gray-500 uppercase tracking-wide">
                  Confidence
                </span>
                <span
                  className="text-lg sm:text-xl font-bold"
                  style={{ color: gaugeColor }}
                >
                  {Math.round(claim.trustScore?.confidence * 100)} %
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Meta - responsive grid */}
        <div>
          <div className="flex gap-2 mb-3 flex-wrap justify-center md:justify-start">
            {claim.trustScore?.tier && (
              <TierBadge tier={claim.trustScore.tier} />
            )}
            <StatusBadge status={claim.trustScore?.status} />
            <span className="chip">
              <span className="mr-1">
                {claim.claimType === ClaimType.AUTO && '🚗'}
                {claim.claimType === ClaimType.HEALTH && '🏥'}
                {claim.claimType === ClaimType.PROPERTY && '🏠'}
              </span>
              {CLAIM_TYPE_LABELS[claim.claimType]}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center md:text-left">
            <div>
              <div className="stat-label">Policy</div>
              <div className="font-mono text-xs sm:text-sm text-gray-900 mt-1 break-all">
                {claim.policyNumber}
              </div>
            </div>
            <div>
              <div className="stat-label">Amount</div>
              <div className="text-base sm:text-lg font-semibold tabular-nums mt-0.5">
                {fmtNaira(claim.claimedAmount)}
              </div>
            </div>
            <div>
              <div className="stat-label">Incident</div>
              <div className="text-xs sm:text-sm mt-1">
                {fmtDate(claim.incidentDate)}
              </div>
            </div>
            <div>
              <div className="stat-label">Scored</div>
              <div className="font-mono text-xs text-gray-500 mt-1">
                {claim.trustScore?.scoredAt
                  ? fmtDateTime(claim.trustScore.scoredAt)
                  : 'Pending'}
              </div>
            </div>
          </div>
        </div>

        {/* Squad action callout - full width on mobile */}
        <div
          className={`
            p-4 rounded-xl border min-w-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85)] w-full
            ${claim.trustScore?.squadAction === SquadAction.RELEASE_PAYMENT && 'bg-green-50 border-green-200'}
            ${claim.trustScore?.squadAction === SquadAction.HOLD_ESCROW && 'bg-orange-50 border-orange-200'}
            ${claim.trustScore?.squadAction === SquadAction.BLOCK_PAYMENT && 'bg-red-50 border-red-200'}
            ${!claim.trustScore?.squadAction && 'bg-gray-50 border-gray-200'}
          `}
        >
          <div className="stat-label">Squad action</div>
          <div className="mt-1.5 text-base font-semibold">
            <SquadActionLabel action={claim.trustScore?.squadAction} />
          </div>
          <div className="font-mono text-xs text-gray-400 mt-1 break-all">
            via Squad API ·{' '}
            {claim.squadTransactions?.[0]?.status
              ? TX_STATUS_LABELS[claim.squadTransactions[0].status]
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Tabs - responsive with horizontal scroll on mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3.5">
        <div className="flex w-full sm:w-auto">
          {['overview', 'evidence', 'transactions'].map((t) => (
            <div
              key={t}
              className={`tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </div>
          ))}
        </div>
      </div>

      {/* ── Overview tab ── */}
      {tab === 'overview' && (
        <div
          className={`w-full overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_auto] ${showReview ? '' : ''} gap-4`}
        >
          <div className={`flex flex-col gap-4 ${showReview ? '' : ''}`}>
            {/* Module scores */}
            {claim.trustScore?.moduleScores && (
              <div className="glass p-4 sm:p-5 w-full">
                <div className="section-title flex flex-wrap items-center gap-2">
                  Module scores
                  <span className="label-pill">moduleScores</span>
                </div>
                <div className="flex gap-3 overflow-x-auto">
                  {MODULE_META.map((m) => (
                    <ModuleCard
                      key={m.key}
                      label={m.label}
                      score={
                        claim.trustScore?.moduleScores?.[
                          m.key as keyof ModuleScores
                        ] ?? null
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Flags */}
            <div className="glass p-4 sm:p-5">
              <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                <div className="section-title m-0">
                  Flags raised
                  <span className="label-pill">
                    flags[] · {claim.trustScore?.flags?.length || 0}
                  </span>
                </div>
                {claim.trustScore?.flags &&
                  claim.trustScore.flags.length > 0 && (
                    <span className="badge badge-flagged">
                      <AlertTriangle size={11} />{' '}
                      {claim.trustScore.flags.length} signal
                      {claim.trustScore.flags.length > 1 ? 's' : ''}
                    </span>
                  )}
              </div>
              {!claim.trustScore?.flags ||
              claim.trustScore.flags.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  <ShieldCheck
                    size={28}
                    className="text-verified mx-auto mb-2"
                  />
                  <div className="text-sm text-gray-900 font-medium">
                    No flags raised
                  </div>
                  <div className="text-xs mt-1">
                    This claim passed all ML modules cleanly.
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {claim.trustScore?.flags.map((f: FlagItem, i: number) => (
                    <div
                      key={i}
                      className={`flag-card flex flex-wrap sm:flex-nowrap items-start gap-2 ${claim.trustScore?.tier === ScoreTier.REVIEW ? 'review' : ''}`}
                    >
                      <div className="flag-icon shrink-0">
                        {claim.trustScore?.tier === ScoreTier.REVIEW ? (
                          <AlertTriangle size={14} />
                        ) : (
                          <ShieldAlert size={14} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flag-signal font-medium">
                          {f.module} · {f.signal}
                        </div>
                        <div className="flag-explanation text-sm text-gray-600">
                          {f.explanation}
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost shrink-0"
                        title="More info"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="glass p-4 sm:p-5">
              <div className="section-title">
                Claimant description
                <span className="label-pill">description</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                {claim.description}
              </p>
            </div>

            {/* Bank Details */}
            <div className="glass p-4 sm:p-5">
              <div className="section-title">
                Settlement account
                <span className="label-pill">bankDetails</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={14} className="text-gray-400" />
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Account Number
                    </label>
                  </div>
                  <div className="font-mono text-sm font-semibold text-gray-900">
                    {claim?.accountNumber || '—'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={14} className="text-gray-400" />
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Bank
                    </label>
                  </div>
                  <div className="font-mono text-sm font-semibold text-gray-900">
                    {claim.bankDetails?.bankCode
                      ? getBankNameByCode(claim?.bankCode)
                      : '—'}
                  </div>
                </div>
                {claim?.accountName && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Verified Account Name
                    </label>
                    <div className="mt-2 flex items-center gap-2 p-3 bg-verified/10 rounded-lg border border-verified/20">
                      <Check size={14} className="text-verified shrink-0" />
                      <span className="text-sm font-semibold text-gray-900">
                        {claim?.accountName}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Review panel - responsive positioning */}
          {showReview && (
            <div className="glass-elev p-5 lg:sticky lg:top-0 lg:self-start w-full lg:w-90-[400px]">
              <div className="section-title">
                Review panel
                <span className="label-pill">role: ADJUDICATOR</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                This claim is in <b className="text-review">UNDER_REVIEW</b>{' '}
                with funds in escrow. Your decision finalises payment.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className={`seg-btn flex-1 approve ${reviewDecision === ReviewDecision.APPROVE ? 'selected' : ''}`}
                  onClick={() => setReviewDecision(ReviewDecision.APPROVE)}
                >
                  <div className="seg-title">
                    <Check size={14} />{' '}
                    {REVIEW_DECISION_LABELS[ReviewDecision.APPROVE]}
                  </div>
                  <div className="seg-desc text-xs">
                    Release ₦{(claim.claimedAmount / 1000).toFixed(0)}K from
                    escrow
                  </div>
                </button>
                <button
                  className={`seg-btn flex-1 reject ${reviewDecision === ReviewDecision.REJECT ? 'selected' : ''}`}
                  onClick={() => setReviewDecision(ReviewDecision.REJECT)}
                >
                  <div className="seg-title">
                    <X size={14} />{' '}
                    {REVIEW_DECISION_LABELS[ReviewDecision.REJECT]}
                  </div>
                  <div className="seg-desc text-xs">
                    Block payment & mark fraudulent
                  </div>
                </button>
              </div>

              <div className="field mt-4">
                <label className="text-sm">Notes (optional)</label>
                <textarea
                  className="textarea w-full"
                  placeholder="Add adjudicator commentary for the audit trail…"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  style={{ minHeight: 90 }}
                />
              </div>

              {reviewMutation.error && (
                <div className="mt-2 text-xs text-red-600 font-mono flex items-center gap-1">
                  <AlertTriangle size={12} />{' '}
                  {getApiErrorMessage(reviewMutation.error)}
                </div>
              )}

              <div className="divider my-4" />

              <button
                className={`
                  btn w-full justify-center py-3 px-4
                  ${reviewDecision === ReviewDecision.APPROVE && 'btn-success'}
                  ${reviewDecision === ReviewDecision.REJECT && 'btn-danger'}
                  ${!reviewDecision && 'btn-primary'}
                `}
                disabled={!reviewDecision || reviewMutation.isPending}
                onClick={handleReviewSubmit}
              >
                {reviewMutation.isPending ? (
                  'Submitting…'
                ) : reviewDecision === ReviewDecision.APPROVE ? (
                  <>
                    <Check size={14} /> Confirm approval
                  </>
                ) : reviewDecision === ReviewDecision.REJECT ? (
                  <>
                    <X size={14} /> Confirm rejection
                  </>
                ) : (
                  'Select a decision'
                )}
              </button>

              <div className="font-mono text-[10px] text-gray-400 mt-2.5 text-center break-all">
                POST /api/claims/{truncUuid(claim.claimId)}/review
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Evidence tab ── */}
      {tab === 'evidence' && (
        <div className="flex flex-col gap-4">
          {photos.length > 0 && (
            <div className="glass p-4 sm:p-5">
              <div className="section-title">
                Photos
                <span className="label-pill">{photos.length} files</span>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((p: FileItem, i: number) => (
                  <div key={i} className="flex flex-col">
                    {p.fileUrl && (
                      <div className="grid place-items-center">
                        <img
                          src={p.fileUrl}
                          alt=""
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                    {!p.fileType && (
                      <div className="file-thumb">
                        <div className="grid place-items-center gap-1.5">
                          <ImageIcon size={28} className="file-icon" />
                        </div>
                      </div>
                    )}
                    <div className="font-mono text-xs text-gray-500 mt-1.5 truncate text-center">
                      {p.fileUrl.split('/').pop() || 'photo.jpg'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {docFiles.length > 0 && (
            <div className="glass p-4 sm:p-5">
              <div className="section-title">
                Documents
                <span className="label-pill">{docFiles.length} files</span>
              </div>
              <div className="flex flex-col gap-2">
                {docFiles.map((d: FileItem, i: number) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 rounded-lg bg-white/55 border border-gray-200 hover:bg-white/80 transition-colors cursor-pointer"
                    onClick={() => handleViewDocument(d.fileUrl)}
                  >
                    <div className="w-9 h-11 rounded bg-blue-50 text-blue-700 grid place-items-center border border-blue-200 shrink-0">
                      <FileIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {d.fileUrl.split('/').pop() || 'document.pdf'}
                      </div>
                      <div className="font-mono text-xs text-gray-400">
                        fileType: DOCUMENT · Click to view
                      </div>
                    </div>
                    <button
                      className="btn shrink-0 w-full sm:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDocument(d.fileUrl);
                      }}
                    >
                      <Eye size={14} /> View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {photos.length === 0 && docFiles.length === 0 && (
            <div className="glass p-5 text-center text-gray-400 py-12">
              <FileIcon size={32} className="mx-auto mb-3 opacity-40" />
              <div className="text-sm">No evidence files uploaded</div>
            </div>
          )}
        </div>
      )}

      {/* ── Transactions tab ── */}
      {tab === 'transactions' && (
        <div className="glass overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-200">
            <div className="section-title m-0">
              Squad transactions
              <span className="label-pill">squadTransactions[]</span>
            </div>
          </div>
          {!claim.squadTransactions || claim.squadTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-sm">No transactions recorded</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table min-w-160 w-full">
                <thead>
                  <tr>
                    <th className="text-left">Action</th>
                    <th className="text-left">Squad Reference</th>
                    <th className="text-left">Amount</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {claim.squadTransactions.map(
                    (t: SquadTransaction, i: number) => (
                      <tr key={i}>
                        <td className="py-2">
                          <SquadActionLabel action={t.action} />
                        </td>
                        <td className="font-mono py-2 break-all">
                          {t.squadReference}
                        </td>
                        <td className="num py-2">{fmtNaira(t.amount)}</td>
                        <td className="py-2">
                          <span
                            className={`
                            badge inline-flex
                            ${t.status === TxStatus.SUCCESS && 'badge-verified'}
                            ${t.status === TxStatus.FAILED && 'badge-flagged'}
                            ${t.status === TxStatus.PENDING && 'badge-review'}
                          `}
                          >
                            <span className="badge-dot" />
                            {TX_STATUS_LABELS[t.status]}
                          </span>
                        </td>
                        <td className="font-mono text-gray-400 py-2 text-xs">
                          {fmtDateTime(t.calledAt)}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {pdfViewer && (
        <PDFViewerModal
          fileUrl={pdfViewer.url}
          fileName={pdfViewer.name}
          onClose={() => setPdfViewer(null)}
        />
      )}
    </div>
  );
}
