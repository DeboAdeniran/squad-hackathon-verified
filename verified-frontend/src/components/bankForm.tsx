// BankDetailsSection.tsx
import { useState } from 'react';
import {
  Building2,
  CreditCard,
  UserCheck,
  Check,
  AlertCircle,
} from 'lucide-react';
import { claimsApi } from '../api';
import banks from '../data/nigerian_banks.json';

interface BankFormState {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
  isVerifying: boolean;
  isVerified: boolean;
  verificationError: string | null;
}

interface BankFormProps {
  bankDetails: BankFormState;
  onBankDetailsChange: (details: BankFormState) => void;
  disabled?: boolean;
}

export function BankForm({
  bankDetails,
  onBankDetailsChange,
  disabled = false,
}: BankFormProps) {
  const [touched, setTouched] = useState<Set<keyof BankFormState>>(new Set());

  const verifyBankAccount = async () => {
    if (!bankDetails.accountNumber || !bankDetails.bankCode) {
      onBankDetailsChange({
        ...bankDetails,
        verificationError: 'Please enter account number and select a bank',
      });
      return;
    }

    if (bankDetails.accountNumber.length !== 10) {
      onBankDetailsChange({
        ...bankDetails,
        verificationError: 'Account number must be 10 digits',
      });
      return;
    }

    onBankDetailsChange({
      ...bankDetails,
      isVerifying: true,
      verificationError: null,
    });

    try {
      const response = await claimsApi.verifyAccount({
        accountNumber: bankDetails.accountNumber,
        bankCode: bankDetails.bankCode,
      });

      onBankDetailsChange({
        ...bankDetails,
        isVerifying: false,
        isVerified: true,
        accountName: response.accountName,
        verificationError: null,
      });

      setTouched((prev) => new Set(prev).add('accountNumber').add('bankCode'));
    } catch (error) {
      onBankDetailsChange({
        ...bankDetails,
        isVerifying: false,
        isVerified: false,
        verificationError:
          'Unable to verify account. Please check the details and try again.',
      });
      console.error(error);
    }
  };

  const handleBankFieldChange = (field: keyof BankFormState, value: string) => {
    onBankDetailsChange({
      ...bankDetails,
      [field]: value,
      isVerified:
        field === 'accountNumber' || field === 'bankCode'
          ? false
          : bankDetails.isVerified,
      accountName:
        field === 'accountNumber' || field === 'bankCode'
          ? ''
          : bankDetails.accountName,
      verificationError:
        field === 'accountNumber' || field === 'bankCode'
          ? null
          : bankDetails.verificationError,
    });
    setTouched((prev) => new Set(prev).add(field));
  };

  const handleEditVerification = () => {
    onBankDetailsChange({
      ...bankDetails,
      isVerified: false,
      accountName: '',
      verificationError: null,
    });
  };

  const showBankError = (field: keyof BankFormState): boolean => {
    return touched.has(field) && !!bankDetails.verificationError;
  };

  return (
    <div className="glass p-4 sm:p-5">
      <div className="section-title flex flex-wrap items-center justify-between gap-2 mb-4">
        Bank Details for Settlement
        <span className="label-pill text-xs">Required</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="field">
          <label className="text-sm font-medium flex items-center gap-2">
            <CreditCard size={14} />
            Account Number
          </label>
          <input
            type="text"
            maxLength={10}
            pattern="\d*"
            className={`input w-full ${
              showBankError('accountNumber')
                ? 'border-flagged'
                : bankDetails.isVerified
                  ? 'border-verified'
                  : ''
            }`}
            placeholder="0123456789"
            value={bankDetails.accountNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 10) {
                handleBankFieldChange('accountNumber', value);
              }
            }}
            disabled={
              disabled || bankDetails.isVerifying || bankDetails.isVerified
            }
          />
          <div className="hint text-xs text-gray-400 mt-1">
            10-digit account number
          </div>
        </div>

        <div className="field">
          <label className="text-sm font-medium flex items-center gap-2">
            <Building2 size={14} />
            Bank Name
          </label>
          <select
            className={`select w-full ${
              showBankError('bankCode')
                ? 'border-flagged'
                : bankDetails.isVerified
                  ? 'border-verified'
                  : ''
            }`}
            value={bankDetails.bankCode}
            onChange={(e) => {
              const code = e.target.value;
              const selectedBank = banks.find((b) => b.bank_code === code);

              onBankDetailsChange({
                ...bankDetails,
                bankCode: code,
                bankName: selectedBank?.bank_name || '',
                isVerified: false,
                accountName: '',
                verificationError: null,
              });
              setTouched((prev) => new Set(prev).add('bankCode'));
            }}
            disabled={
              disabled || bankDetails.isVerifying || bankDetails.isVerified
            }
          >
            <option value="">Select bank...</option>
            {banks
              .sort((a, b) => a.bank_name.localeCompare(b.bank_name))
              .map((bank) => (
                <option key={bank.bank_code} value={bank.bank_code}>
                  {bank.bank_name}
                </option>
              ))}
          </select>
          <div className="hint text-xs text-gray-400 mt-1">
            Select your bank
          </div>
        </div>

        <div className="sm:col-span-2">
          {!bankDetails.isVerified && !bankDetails.isVerifying && (
            <button
              type="button"
              className="btn btn-secondary w-full mt-2"
              onClick={verifyBankAccount}
              disabled={
                !bankDetails.accountNumber || !bankDetails.bankCode || disabled
              }
            >
              Verify Account
            </button>
          )}

          {bankDetails.isVerifying && (
            <div className="flex items-center justify-center gap-2 mt-2 p-3 bg-accent/5 rounded-lg">
              <span className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">
                Verifying account...
              </span>
            </div>
          )}

          {bankDetails.verificationError && (
            <div className="text-flagged text-xs flex items-center gap-1 mt-2 p-2 bg-red-50 rounded-lg">
              <AlertCircle size={12} /> {bankDetails.verificationError}
            </div>
          )}

          {bankDetails.isVerified && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-verified/10 rounded-lg border border-verified/20">
                <UserCheck size={16} className="text-verified shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-verified">
                    Account Verified
                  </div>
                  <div className="text-sm font-semibold">
                    {bankDetails.accountName}
                  </div>
                </div>
                <Check size={14} className="text-verified" />
              </div>
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={handleEditVerification}
                disabled={disabled}
              >
                Edit Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
