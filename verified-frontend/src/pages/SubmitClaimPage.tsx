import { useRef, useState } from 'react';
import Topbar from '../components/Topbar';
import {
  Image as ImageIcon,
  File as FileIcon,
  Check,
  ArrowRight,
  Sparkles,
  Upload,
  AlertCircle,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClaimType } from '../types/enums';
import { claimSubmitSchema, type ClaimSubmitFormValues } from '../schemas';
import { ZodError } from 'zod';
import { useSubmitClaimMutation } from '../hooks';
import { getApiErrorMessage } from '../api';
import { BankForm } from '../components/bankForm';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormState {
  claimantName: string;
  policyNumber: string;
  claimType: ClaimType | '';
  claimedAmount: number | '';
  incidentDate: string;
  description: string;
}

interface BankDetailsState {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
  isVerifying: boolean;
  isVerified: boolean;
  verificationError: string | null;
}

interface FormErrors {
  claimantName?: string;
  policyNumber?: string;
  claimType?: string;
  claimedAmount?: string;
  incidentDate?: string;
  description?: string;
  bankDetails?: string;
}

/** Staged locally — no upload until submit */
interface StagedFile {
  file: File;
  previewName: string;
  previewSize: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function SubmitClaimPage() {
  const navigate = useNavigate();
  const submitMutation = useSubmitClaimMutation();

  const [form, setForm] = useState<FormState>({
    claimantName: '',
    policyNumber: '',
    claimType: '',
    claimedAmount: '',
    incidentDate: '',
    description: '',
  });
  const [bankDetails, setBankDetails] = useState<BankDetailsState>({
    accountNumber: '',
    bankCode: '',
    bankName: '',
    accountName: '',
    isVerifying: false,
    isVerified: false,
    verificationError: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<keyof FormState>>(new Set());
  const [photos, setPhotos] = useState<StagedFile[]>([]);
  const [docs, setDocs] = useState<StagedFile[]>([]);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = submitMutation.isPending;

  const charCount = form.description.length;

  // ── Validation ────────────────────────────────────────────────────────────

  const validateField = (
    name: keyof FormState,
    value: string | number | ClaimType | '',
  ): string => {
    try {
      const partialSchema =
        claimSubmitSchema.shape[name as keyof ClaimSubmitFormValues];
      if (partialSchema) {
        partialSchema.parse(
          name === 'claimedAmount' && value === '' ? 0 : value,
        );
      }
      return '';
    } catch (error) {
      if (error instanceof ZodError) return error.issues[0]?.message || '';
      return '';
    }
  };

  const validateForm = (): boolean => {
    try {
      claimSubmitSchema.parse({
        ...form,
        claimType: form.claimType as ClaimType,
        claimedAmount: form.claimedAmount === '' ? 0 : form.claimedAmount,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: FormErrors = {};
        error.issues.forEach((err) => {
          const path = err.path[0] as keyof FormErrors;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const isFormValid = (): boolean => {
    try {
      claimSubmitSchema.parse({
        ...form,
        claimType: form.claimType as ClaimType,
        claimedAmount: form.claimedAmount === '' ? 0 : form.claimedAmount,
      });
      // Also check if bank details are verified
      return bankDetails.isVerified;
    } catch {
      return false;
    }
  };

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setTouched((prev) => new Set(prev).add(k));
    setErrors((prev) => ({ ...prev, [k]: validateField(k, v) }));
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => new Set(prev).add(field));
  };

  const showError = (field: keyof FormState): string | null =>
    touched.has(field) && errors[field] ? errors[field]! : null;

  // ── File staging (local only — uploaded on submit) ────────────────────────

  const stageFiles = (files: FileList, type: 'PHOTO' | 'DOCUMENT') => {
    const incoming: StagedFile[] = Array.from(files).map((f) => ({
      file: f,
      previewName: f.name,
      previewSize: fmtBytes(f.size),
    }));
    if (type === 'PHOTO') setPhotos((p) => [...p, ...incoming]);
    else setDocs((d) => [...d, ...incoming]);
  };

  const removeFile = (type: 'PHOTO' | 'DOCUMENT', index: number) => {
    if (type === 'PHOTO') setPhotos((p) => p.filter((_, i) => i !== index));
    else setDocs((d) => d.filter((_, i) => i !== index));
  };

  // ── Submit — one multipart request: data + photos + documents + bank details ─────────────

  const submit = async () => {
    if (!isFormValid()) {
      const allFields: Array<keyof FormState> = [
        'claimantName',
        'policyNumber',
        'claimType',
        'claimedAmount',
        'incidentDate',
        'description',
      ];
      setTouched(new Set(allFields));
      validateForm();
      return;
    }

    try {
      const { claimId } = await submitMutation.mutateAsync({
        data: {
          claimantName: form.claimantName,
          policyNumber: form.policyNumber,
          claimType: form.claimType as ClaimType,
          claimedAmount: form.claimedAmount as number,
          incidentDate: form.incidentDate,
          description: form.description,
          bankDetails: {
            accountNumber: bankDetails.accountNumber,
            bankCode: bankDetails.bankCode,
            accountName: bankDetails.accountName,
          },
        },
        photos: photos.map((p) => p.file),
        documents: docs.map((d) => d.file),
      });
      navigate(`/claims/${claimId}/result`);
    } catch (err) {
      // Error is automatically captured by submitMutation.error
      console.error('Claim submission failed:', err);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      <Topbar
        title="Submit a new claim"
        crumb={
          <>
            <b>Workspace</b> · Claims · New
          </>
        }
      />

      {/* Main content - responsive grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1.4fr_1fr] gap-4">
        {/* Left: form */}
        <div className="glass p-4 sm:p-6 my-auto">
          <div className="section-title flex flex-wrap items-center justify-between gap-2 mb-4">
            Claim details
            <span className="label-pill text-xs">ClaimSubmitRequest</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="field">
              <label className="text-sm font-medium">Full name</label>
              <input
                className={`input w-full ${showError('claimantName') ? 'border-flagged' : ''}`}
                placeholder="e.g. Adaeze Okonkwo"
                value={form.claimantName}
                onChange={(e) => update('claimantName', e.target.value)}
                onBlur={() => handleBlur('claimantName')}
                disabled={isSubmitting}
              />
              <div className="hint text-xs text-gray-400 mt-1">
                claimantName · required
              </div>
              {showError('claimantName') && (
                <div className="text-flagged text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {showError('claimantName')}
                </div>
              )}
            </div>

            <div className="field">
              <label className="text-sm font-medium">Policy number</label>
              <input
                className={`input w-full ${showError('policyNumber') ? 'border-flagged' : ''}`}
                placeholder="PN-2024-XXXXX"
                value={form.policyNumber}
                onChange={(e) => update('policyNumber', e.target.value)}
                onBlur={() => handleBlur('policyNumber')}
                disabled={isSubmitting}
              />
              <div className="hint text-xs text-gray-400 mt-1">
                policyNumber · must be unique
              </div>
              {showError('policyNumber') && (
                <div className="text-flagged text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {showError('policyNumber')}
                </div>
              )}
            </div>

            <div className="field">
              <label className="text-sm font-medium">Claim type</label>
              <select
                className={`select w-full ${showError('claimType') ? 'border-flagged' : ''}`}
                value={form.claimType}
                onChange={(e) =>
                  update('claimType', e.target.value as ClaimType | '')
                }
                onBlur={() => handleBlur('claimType')}
                disabled={isSubmitting}
              >
                <option value="">Select type…</option>
                <option value={ClaimType.AUTO}>Auto</option>
                <option value={ClaimType.HEALTH}>Health</option>
                <option value={ClaimType.PROPERTY}>Property</option>
              </select>
              <div className="hint text-xs text-gray-400 mt-1">
                claimType · AUTO | HEALTH | PROPERTY
              </div>
              {showError('claimType') && (
                <div className="text-flagged text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {showError('claimType')}
                </div>
              )}
            </div>

            <div className="field">
              <label className="text-sm font-medium">Claimed amount</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">
                  ₦
                </div>
                <input
                  type="number"
                  className={`input w-full pl-7 ${showError('claimedAmount') ? 'border-flagged' : ''}`}
                  placeholder="0"
                  value={form.claimedAmount}
                  onChange={(e) =>
                    update(
                      'claimedAmount',
                      e.target.value === '' ? '' : parseFloat(e.target.value),
                    )
                  }
                  onBlur={() => handleBlur('claimedAmount')}
                  disabled={isSubmitting}
                />
              </div>
              <div className="hint text-xs text-gray-400 mt-1">
                claimedAmount · must be &gt; 0
              </div>
              {showError('claimedAmount') && (
                <div className="text-flagged text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {showError('claimedAmount')}
                </div>
              )}
            </div>

            <div className="field sm:col-span-2">
              <label className="text-sm font-medium">Incident date</label>
              <input
                type="date"
                className={`input w-full ${showError('incidentDate') ? 'border-flagged' : ''}`}
                value={form.incidentDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => update('incidentDate', e.target.value)}
                onBlur={() => handleBlur('incidentDate')}
                disabled={isSubmitting}
              />
              <div className="hint text-xs text-gray-400 mt-1">
                incidentDate · cannot be a future date
              </div>
              {showError('incidentDate') && (
                <div className="text-flagged text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {showError('incidentDate')}
                </div>
              )}
            </div>

            <div className="field sm:col-span-2">
              <label className="text-sm font-medium">
                Description of incident
              </label>
              <textarea
                className={`textarea w-full ${showError('description') ? 'border-flagged' : ''}`}
                placeholder="What happened? Where? When did it occur? Include any relevant context…"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                onBlur={() => handleBlur('description')}
                style={{ minHeight: 120 }}
                disabled={isSubmitting}
              />
              <div className="flex justify-between mt-1">
                <div className="hint text-xs text-gray-400">
                  description · minimum 20 characters
                </div>
                <div
                  className={`hint text-xs ${charCount >= 20 ? 'text-verified' : 'text-gray-400'}`}
                >
                  {charCount} / 20+
                </div>
              </div>
              {showError('description') && (
                <div className="text-flagged text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {showError('description')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: file uploads and bank details */}
        <div className="flex flex-col gap-4">
          <BankForm
            bankDetails={bankDetails}
            onBankDetailsChange={setBankDetails}
            disabled={isSubmitting}
          />

          {/* Photos */}
          <div className="glass p-4 sm:p-5">
            <div className="section-title flex flex-wrap items-center justify-between gap-2 mb-4">
              Photos
              <span className="label-pill text-xs">fileType: PHOTO</span>
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) stageFiles(e.target.files, 'PHOTO');
                e.target.value = '';
              }}
            />

            <div
              className="dropzone border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all hover:border-accent hover:bg-accent/5"
              onClick={() => !isSubmitting && photoInputRef.current?.click()}
              style={{
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              <Upload size={22} className="mx-auto text-gray-400" />
              <div className="dropzone-title mt-2 text-sm font-medium">
                Drop images or click to upload
              </div>
              <div className="dropzone-sub text-xs text-gray-400 mt-1">
                JPG, PNG · Max 10MB per file
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-3">
              {photos.map((p, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 items-center p-2 rounded-lg bg-white/55 border border-gray-200"
                >
                  <div className="w-7 h-7 rounded-md bg-verified/10 text-verified grid place-items-center shrink-0">
                    <ImageIcon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                      {p.previewName}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {p.previewSize} ·{' '}
                      {isSubmitting ? (
                        <span className="text-accent">uploading…</span>
                      ) : (
                        'ready'
                      )}
                    </div>
                  </div>
                  {isSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <div className="flex items-center gap-1 shrink-0">
                      <Check size={14} className="text-gray-300" />
                      <button
                        className="btn btn-ghost p-1 hover:bg-red-50 rounded"
                        onClick={() => removeFile('PHOTO', i)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="glass p-4 sm:p-5">
            <div className="section-title flex flex-wrap items-center justify-between gap-2 mb-4">
              Documents
              <span className="label-pill text-xs">fileType: DOCUMENT</span>
            </div>

            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.docx"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) stageFiles(e.target.files, 'DOCUMENT');
                e.target.value = '';
              }}
            />

            <div
              className="dropzone border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all hover:border-accent hover:bg-accent/5"
              onClick={() => !isSubmitting && docInputRef.current?.click()}
              style={{
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              <FileIcon size={22} className="mx-auto text-gray-400" />
              <div className="dropzone-title mt-2 text-sm font-medium">
                Drop files or click to upload
              </div>
              <div className="dropzone-sub text-xs text-gray-400 mt-1">
                PDF, DOCX · Max 10MB per file
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-3">
              {docs.map((d, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 items-center p-2 rounded-lg bg-white/55 border border-gray-200"
                >
                  <div className="w-7 h-7 rounded-md bg-info/10 text-info grid place-items-center shrink-0">
                    <FileIcon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                      {d.previewName}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {d.previewSize} ·{' '}
                      {isSubmitting ? (
                        <span className="text-accent">uploading…</span>
                      ) : (
                        'ready'
                      )}
                    </div>
                  </div>
                  {isSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <div className="flex items-center gap-1 shrink-0">
                      <Check size={14} className="text-gray-300" />
                      <button
                        className="btn btn-ghost p-1 hover:bg-red-50 rounded"
                        onClick={() => removeFile('DOCUMENT', i)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit error */}
      {submitMutation.error && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-mono flex items-center gap-2">
          <AlertCircle size={14} /> {getApiErrorMessage(submitMutation.error)}
        </div>
      )}

      {/* Footer actions - responsive */}
      <div className="glass mt-4 p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2.5 text-gray-500 text-xs sm:text-sm">
          <Sparkles size={16} className="text-accent shrink-0" />
          <span className="text-center sm:text-left">
            On submit, Verified AI scores the claim across 5 modules.
          </span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            className="btn flex-1 sm:flex-none px-4 py-2"
            onClick={() => navigate('/claims')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary flex-1 sm:flex-none px-4 py-2 flex items-center justify-center gap-2"
            onClick={submit}
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isSubmitting ? (
              <span>Submitting…</span>
            ) : (
              <span>
                Submit <span className="hidden md:inline">for analysis</span>
              </span>
            )}{' '}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
