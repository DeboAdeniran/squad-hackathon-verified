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
import { claimsApi } from '../api';
import { getApiErrorMessage } from '../api';

// Form state
interface FormState {
  claimantName: string;
  policyNumber: string;
  claimType: ClaimType | '';
  claimedAmount: number | '';
  incidentDate: string;
  description: string;
}

interface FormErrors {
  claimantName?: string;
  policyNumber?: string;
  claimType?: string;
  claimedAmount?: string;
  incidentDate?: string;
  description?: string;
}

interface StagedFile {
  file: File;
  previewName: string;
  previewSize: string;
  url?: string; // set after upload
  uploading: boolean;
  error?: string;
}

const fmtBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function SubmitClaimPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    claimantName: '',
    policyNumber: '',
    claimType: '',
    claimedAmount: '',
    incidentDate: '',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<keyof FormState>>(new Set());
  const [photos, setPhotos] = useState<StagedFile[]>([]);
  const [docs, setDocs] = useState<StagedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

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
        photoUrls: [],
        documentUrls: [],
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
        photoUrls: [],
        documentUrls: [],
      });
      return true;
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

  // ── File handling ─────────────────────────────────────────────────────────

  const stageFiles = (
    files: FileList,
    type: 'PHOTO' | 'DOCUMENT',
    claimId: string,
  ) => {
    const newFiles: StagedFile[] = Array.from(files).map((f) => ({
      file: f,
      previewName: f.name,
      previewSize: fmtBytes(f.size),
      uploading: true,
    }));

    const setter = type === 'PHOTO' ? setPhotos : setDocs;
    setter((prev) => [...prev, ...newFiles]);

    // Upload each file
    claimsApi
      .uploadFiles(claimId, Array.from(files), type)
      .then((urls) => {
        setter((prev) =>
          prev.map((sf, i) => {
            const idx = prev.length - newFiles.length + i;
            if (idx >= prev.length - newFiles.length) {
              const urlIdx = i - (prev.length - newFiles.length);
              if (urls[urlIdx] !== undefined) {
                return { ...sf, url: urls[urlIdx], uploading: false };
              }
            }
            return sf;
          }),
        );
      })
      .catch((err) => {
        const msg = getApiErrorMessage(err);
        setter((prev) =>
          prev.map((sf) =>
            sf.uploading ? { ...sf, uploading: false, error: msg } : sf,
          ),
        );
      });
  };

  const removeFile = (type: 'PHOTO' | 'DOCUMENT', index: number) => {
    const setter = type === 'PHOTO' ? setPhotos : setDocs;
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ────────────────────────────────────────────────────────────────

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

    setSubmitting(true);
    setSubmitError(null);

    try {
      const { id } = await claimsApi.submitClaim({
        claimantName: form.claimantName,
        policyNumber: form.policyNumber,
        claimType: form.claimType as ClaimType,
        claimedAmount: form.claimedAmount as number,
        incidentDate: form.incidentDate,
        description: form.description,
        photoUrls: photos.filter((p) => p.url).map((p) => p.url!),
        documentUrls: docs.filter((d) => d.url).map((d) => d.url!),
      });

      navigate(`/claims/${id}/result`);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* Stepper */}
      <div className="stepper">
        <div className="step active">
          <div className="step-num">1</div>
          <div className="step-label">Claim details</div>
        </div>
        <div className="step-connector" />
        <div className="step">
          <div className="step-num">2</div>
          <div className="step-label">Files</div>
        </div>
        <div className="step-connector" />
        <div className="step">
          <div className="step-num">3</div>
          <div className="step-label">Analysis</div>
        </div>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        {/* Left: form */}
        <div className="glass p-6">
          <div className="section-title">
            Claim details
            <span className="label-pill">ClaimSubmitRequest</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="field">
              <label>Full name</label>
              <input
                className={`input ${showError('claimantName') ? 'border-flagged' : ''}`}
                placeholder="e.g. Adaeze Okonkwo"
                value={form.claimantName}
                onChange={(e) => update('claimantName', e.target.value)}
                onBlur={() => handleBlur('claimantName')}
              />
              <div className="hint">claimantName · required</div>
              {showError('claimantName') && (
                <div className="text-flagged text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {showError('claimantName')}
                </div>
              )}
            </div>

            <div className="field">
              <label>Policy number</label>
              <input
                className={`input ${showError('policyNumber') ? 'border-flagged' : ''}`}
                placeholder="PN-2024-XXXXX"
                value={form.policyNumber}
                onChange={(e) => update('policyNumber', e.target.value)}
                onBlur={() => handleBlur('policyNumber')}
              />
              <div className="hint">policyNumber · must be unique</div>
              {showError('policyNumber') && (
                <div className="text-flagged text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {showError('policyNumber')}
                </div>
              )}
            </div>

            <div className="field">
              <label>Claim type</label>
              <select
                className={`select ${showError('claimType') ? 'border-flagged' : ''}`}
                value={form.claimType}
                onChange={(e) =>
                  update('claimType', e.target.value as ClaimType | '')
                }
                onBlur={() => handleBlur('claimType')}
              >
                <option value="">Select type…</option>
                <option value={ClaimType.AUTO}>Auto</option>
                <option value={ClaimType.HEALTH}>Health</option>
                <option value={ClaimType.PROPERTY}>Property</option>
              </select>
              <div className="hint">claimType · AUTO | HEALTH | PROPERTY</div>
              {showError('claimType') && (
                <div className="text-flagged text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {showError('claimType')}
                </div>
              )}
            </div>

            <div className="field">
              <label>Claimed amount</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">
                  ₦
                </div>
                <input
                  type="number"
                  className={`input pl-7 ${showError('claimedAmount') ? 'border-flagged' : ''}`}
                  placeholder="0"
                  value={form.claimedAmount}
                  onChange={(e) =>
                    update(
                      'claimedAmount',
                      e.target.value === '' ? '' : parseFloat(e.target.value),
                    )
                  }
                  onBlur={() => handleBlur('claimedAmount')}
                />
              </div>
              <div className="hint">claimedAmount · must be {'>'} 0</div>
              {showError('claimedAmount') && (
                <div className="text-flagged text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {showError('claimedAmount')}
                </div>
              )}
            </div>

            <div className="field col-span-2">
              <label>Incident date</label>
              <input
                type="date"
                className={`input ${showError('incidentDate') ? 'border-flagged' : ''}`}
                value={form.incidentDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => update('incidentDate', e.target.value)}
                onBlur={() => handleBlur('incidentDate')}
              />
              <div className="hint">incidentDate · cannot be a future date</div>
              {showError('incidentDate') && (
                <div className="text-flagged text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {showError('incidentDate')}
                </div>
              )}
            </div>

            <div className="field col-span-2">
              <label>Description of incident</label>
              <textarea
                className={`textarea ${showError('description') ? 'border-flagged' : ''}`}
                placeholder="What happened? Where? When did it occur? Include any relevant context…"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                onBlur={() => handleBlur('description')}
                style={{ minHeight: 120 }}
              />
              <div className="flex justify-between">
                <div className="hint">description · minimum 20 characters</div>
                <div
                  className={`hint ${charCount >= 20 ? 'text-verified' : 'text-gray-400'}`}
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

        {/* Right: file uploads */}
        <div className="flex flex-col gap-4">
          {/* Photos */}
          <div className="glass p-5">
            <div className="section-title">
              Photos
              <span className="label-pill">fileType: PHOTO</span>
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && form.claimType) {
                  // We use a temp ID here; files are re-attached on final submit
                  stageFiles(e.target.files, 'PHOTO', 'temp-' + Date.now());
                }
              }}
            />

            <div
              className="dropzone"
              onClick={() => photoInputRef.current?.click()}
            >
              <Upload size={22} />
              <div className="dropzone-title mt-2">
                Drop images or click to upload
              </div>
              <div className="dropzone-sub">JPG, PNG · Max 10MB per file</div>
            </div>

            <div className="flex flex-col gap-2 mt-3">
              {photos.map((p, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 items-center p-2 rounded-lg bg-white/55 border border-gray-200"
                >
                  <div className="w-7 h-7 rounded-md bg-verified/10 text-verified grid place-items-center">
                    <ImageIcon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                      {p.previewName}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {p.previewSize} ·{' '}
                      {p.uploading
                        ? 'uploading…'
                        : p.error
                          ? 'failed'
                          : 'uploaded'}
                    </div>
                  </div>
                  {p.uploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  ) : p.error ? (
                    <AlertCircle size={14} className="text-flagged" />
                  ) : (
                    <Check size={14} className="text-verified" />
                  )}
                  <button
                    className="btn btn-ghost p-1"
                    onClick={() => removeFile('PHOTO', i)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="glass p-5">
            <div className="section-title">
              Documents
              <span className="label-pill">fileType: DOCUMENT</span>
            </div>

            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.docx"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  stageFiles(e.target.files, 'DOCUMENT', 'temp-' + Date.now());
                }
              }}
            />

            <div
              className="dropzone"
              onClick={() => docInputRef.current?.click()}
            >
              <FileIcon size={22} />
              <div className="dropzone-title mt-2">
                Drop files or click to upload
              </div>
              <div className="dropzone-sub">PDF, DOCX · Max 10MB per file</div>
            </div>

            <div className="flex flex-col gap-2 mt-3">
              {docs.map((d, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 items-center p-2 rounded-lg bg-white/55 border border-gray-200"
                >
                  <div className="w-7 h-7 rounded-md bg-info/10 text-info grid place-items-center">
                    <FileIcon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                      {d.previewName}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {d.previewSize} ·{' '}
                      {d.uploading
                        ? 'uploading…'
                        : d.error
                          ? 'failed'
                          : 'uploaded'}
                    </div>
                  </div>
                  {d.uploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  ) : d.error ? (
                    <AlertCircle size={14} className="text-flagged" />
                  ) : (
                    <Check size={14} className="text-verified" />
                  )}
                  <button
                    className="btn btn-ghost p-1"
                    onClick={() => removeFile('DOCUMENT', i)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-mono flex items-center gap-2">
          <AlertCircle size={14} /> {submitError}
        </div>
      )}

      {/* Footer actions */}
      <div className="glass mt-4 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2.5 text-gray-500 text-sm">
          <Sparkles size={16} className="text-accent" />
          On submit, Verified AI scores the claim across 5 modules in about 5–15
          seconds.
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => navigate('/claims')}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={!isFormValid() || submitting}
          >
            {submitting ? 'Submitting…' : 'Submit for analysis'}{' '}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
