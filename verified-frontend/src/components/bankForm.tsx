// BankDetailsSection.tsx
import { useState } from 'react';
import {
  Building2,
  CreditCard,
  UserCheck,
  Check,
  AlertCircle,
} from 'lucide-react';

interface BankFormState {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  verifiedAccountName: string;
  isVerifying: boolean;
  isVerified: boolean;
  verificationError: string | null;
}

interface BankFormProps {
  bankDetails: BankFormState;
  onBankDetailsChange: (details: BankFormState) => void;
  disabled?: boolean;
}

// Mock bank data - replace with actual API call
const banks = [
  { code: '001', name: 'Access Bank' },
  { code: '002', name: 'UBA' },
  { code: '003', name: 'GTBank' },
  { code: '004', name: 'First Bank' },
  { code: '005', name: 'Zenith Bank' },
  { code: '006', name: 'Fidelity Bank' },
  { code: '007', name: 'Stanbic IBTC' },
  { code: '008', name: 'Union Bank' },
  { code: '009', name: 'Wema Bank' },
];

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
      // Replace with actual API call
      // const response = await api.verifyBankAccount({
      //   accountNumber: bankDetails.accountNumber,
      //   bankCode: bankDetails.bankCode
      // });

      // Mock verification delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock response - replace with actual API response
      const mockVerification = {
        accountName: `John Doe`, // This would come from your verification API
        status: 'success',
      };

      onBankDetailsChange({
        ...bankDetails,
        isVerifying: false,
        isVerified: true,
        verifiedAccountName: mockVerification.accountName,
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
      verifiedAccountName:
        field === 'accountNumber' || field === 'bankCode'
          ? ''
          : bankDetails.verifiedAccountName,
      verificationError:
        field === 'accountNumber' || field === 'bankCode'
          ? null
          : bankDetails.verificationError,
    });
    setTouched((prev) => new Set(prev).add(field));
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
            disabled={disabled || bankDetails.isVerifying}
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
              const selectedBank = banks.find((b) => b.code === e.target.value);
              handleBankFieldChange('bankCode', e.target.value);
              if (selectedBank) {
                handleBankFieldChange('bankName', selectedBank.name);
              }
            }}
            disabled={disabled || bankDetails.isVerifying}
          >
            <option value="">Select bank...</option>
            {banks.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
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
            <div className="flex items-center gap-2 mt-2 p-3 bg-verified/10 rounded-lg border border-verified/20">
              <UserCheck size={16} className="text-verified shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-medium text-verified">
                  Account Verified
                </div>
                <div className="text-sm font-semibold">
                  {bankDetails.verifiedAccountName}
                </div>
              </div>
              <Check size={14} className="text-verified" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
