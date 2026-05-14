import Topbar from '../components/Topbar';
import {
  Filter,
  ChevronDown,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TierBadge, StatusBadge, TrustMini } from '../components/ui';
import { CLAIM_STATUS_LABELS, CLAIM_TYPE_LABELS } from '../constants';
import { ClaimStatus, ClaimType, ScoreTier } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useClaims } from '../hooks/useClaims';
import { useState } from 'react';
import type { ClaimsQueryParams } from '../types';

const ClaimTypeIcon = ({ type }: { type: ClaimType }) => {
  const icons = {
    [ClaimType.AUTO]: '🚗',
    [ClaimType.HEALTH]: '🏥',
    [ClaimType.PROPERTY]: '🏠',
  };
  return <span className="mr-1">{icons[type]}</span>;
};

const PAGE_SIZE = 20;

export default function ClaimsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  // Read initial filter values from URL query params (used by sidebar links)
  const [tier, setTier] = useState<ScoreTier | 'ALL'>(
    (searchParams.get('tier') as ScoreTier) || 'ALL',
  );
  const [claimType, setClaimType] = useState<ClaimType | ''>('');
  const [status, setStatus] = useState<ClaimStatus | ''>(
    (searchParams.get('status') as ClaimStatus) || '',
  );

  const params: ClaimsQueryParams = {
    page,
    size: PAGE_SIZE,
    ...(tier !== 'ALL' && { tier }),
    ...(claimType && { claimType }),
    ...(status && { status }),
  };

  const { data, isLoading, isError } = useClaims(params);

  const claims = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  // Client-side search filter (name / policy number)
  const filtered = search.trim()
    ? claims.filter(
        (c) =>
          c.claimantName.toLowerCase().includes(search.toLowerCase()) ||
          c.policyNumber.toLowerCase().includes(search.toLowerCase()),
      )
    : claims;

  const handleFilterChange = () => setPage(0); // reset page on any filter change

  return (
    <div>
      <Topbar
        title="Claims"
        crumb={
          <>
            <b>Workspace</b> · Claims
          </>
        }
        actions={
          <>
            <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-100 border border-white/20 bg-white text-stone-900 shadow-[0_1px_0_rgba(20,17,13,0.04),0_1px_2px_rgba(20,17,13,0.06)] hover:border-stone-900/15 hover:shadow-[0_2px_0_rgba(20,17,13,0.03),0_8px_16px_-4px_rgba(20,17,13,0.08),0_2px_4px_rgba(20,17,13,0.05)] hover:-translate-y-px">
              <Filter size={14} />{' '}
              <span className="hidden lg:flex items-center gap-1">
                Last 7 days <ChevronDown size={12} />
              </span>
            </button>
            <button
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-100 bg-stone-900 text-amber-50 border-stone-900 shadow-[0_2px_0_#d63a1f,0_4px_12px_-2px_rgba(20,17,13,0.25)] hover:bg-black hover:shadow-[0_2px_0_#d63a1f,0_8px_20px_-4px_rgba(20,17,13,0.35)]"
              onClick={() => navigate('/claims/new')}
            >
              <Plus size={14} />
              <span className="hidden lg:flex items-center gap-1">
                New claim
              </span>
            </button>
          </>
        }
      />

      {/* Filter bar - responsive grid */}
      <div className="glass p-3.5 mb-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-2.5 items-center">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Search size={14} />
          </div>
          <input
            className="input w-full pl-9"
            placeholder="Search by claimant or policy number…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilterChange();
            }}
          />
        </div>
        <div className="lg:flex gap-2.5 hidden">
          <select
            className="select w-full sm:w-auto"
            value={tier}
            onChange={(e) => {
              setTier(e.target.value as ScoreTier | 'ALL');
              handleFilterChange();
            }}
          >
            <option value="ALL">All tiers</option>
            <option value={ScoreTier.VERIFIED}>Verified</option>
            <option value={ScoreTier.REVIEW}>Review</option>
            <option value={ScoreTier.FLAGGED}>Flagged</option>
          </select>
          <select
            className="select w-full sm:w-auto"
            value={claimType}
            onChange={(e) => {
              setClaimType(e.target.value as ClaimType | '');
              handleFilterChange();
            }}
          >
            <option value="">All types</option>
            {Object.values(ClaimType).map((t) => (
              <option key={t} value={t}>
                {CLAIM_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <select
            className="select w-full sm:w-auto"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ClaimStatus | '');
              handleFilterChange();
            }}
          >
            <option value="">All statuses</option>
            {Object.values(ClaimStatus).map((s) => (
              <option key={s} value={s}>
                {CLAIM_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="glass flex gap-2.5 mb-4 lg:hidden">
        <select
          className="select w-full sm:w-auto"
          value={tier}
          onChange={(e) => {
            setTier(e.target.value as ScoreTier | 'ALL');
            handleFilterChange();
          }}
        >
          <option value="ALL">All tiers</option>
          <option value={ScoreTier.VERIFIED}>Verified</option>
          <option value={ScoreTier.REVIEW}>Review</option>
          <option value={ScoreTier.FLAGGED}>Flagged</option>
        </select>
        <select
          className="select w-full sm:w-auto"
          value={claimType}
          onChange={(e) => {
            setClaimType(e.target.value as ClaimType | '');
            handleFilterChange();
          }}
        >
          <option value="">All types</option>
          {Object.values(ClaimType).map((t) => (
            <option key={t} value={t}>
              {CLAIM_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          className="select w-full sm:w-auto"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ClaimStatus | '');
            handleFilterChange();
          }}
        >
          <option value="">All statuses</option>
          {Object.values(ClaimStatus).map((s) => (
            <option key={s} value={s}>
              {CLAIM_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Table with horizontal scroll on mobile */}
      <div className="glass overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            Loading claims…
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500 text-sm">
            Failed to load claims. Please try again.
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No claims match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table min-w-160 md:min-w-full">
              <thead>
                <tr>
                  <th>Claimant</th>
                  <th className="hidden sm:table-cell">Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="hidden md:table-cell">Tier</th>
                  <th className="hidden lg:table-cell">Trust</th>
                  <th className="hidden sm:table-cell">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.claimId}
                    onClick={() => navigate(`/claims/${c.claimId}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div className="font-medium">{c.claimantName}</div>
                      <div className="mono text-xs text-gray-400">
                        {c.policyNumber}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="chip">
                        <ClaimTypeIcon type={c.claimType} />
                        {CLAIM_TYPE_LABELS[c.claimType]}
                      </span>
                    </td>
                    {/* Show type as badge on mobile */}
                    <td className="sm:hidden">
                      <span className="chip text-xs">
                        <ClaimTypeIcon type={c.claimType} />
                        {CLAIM_TYPE_LABELS[c.claimType]}
                      </span>
                    </td>
                    <td className="num">₦{c.claimedAmount.toLocaleString()}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="hidden md:table-cell">
                      <TierBadge tier={c.tier} />
                    </td>
                    <td className="hidden lg:table-cell">
                      <TrustMini score={c.trustScore} />
                    </td>
                    <td className="hidden sm:table-cell mono text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination - responsive */}
        {!isLoading && totalElements > 0 && (
          <div className="px-5 py-3 border-t border-gray-200 flex flex-row items-center justify-between gap-3">
            <div className="font-mono text-xs text-gray-400">
              {totalElements} total <span className="hidden sm:inline">· </span>
              <span className="block sm:inline">
                page {page + 1} of {totalPages}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-ghost"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                className="btn btn-ghost"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
