import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ fullName, email, password, role: 'ADJUDICATOR' });
      navigate('/dashboard', { replace: true });
    } catch {
      // error is already set in AuthContext
    }
  };

  return (
    <div
      className="fixed inset-0 grid place-items-center p-4 sm:p-6 md:p-8 overflow-y-auto"
      style={{ background: 'var(--bg-0, #ede7d9)' }}
    >
      {/* Background with paper texture */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 12% 8%, rgba(214, 58, 31, 0.06), transparent 60%),
                       radial-gradient(ellipse 50% 40% at 88% 92%, rgba(180, 130, 60, 0.08), transparent 60%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(20,17,13,0.045) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
            maskImage:
              'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent 90%)',
            opacity: 0.7,
          }}
        />
      </div>

      {/* Login Card */}
      <div
        className="relative z-10 w-full sm:w-120 md:w-140 lg:w-150 max-w-[90%] sm:max-w-none p-6 sm:p-8 md:p-9 rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(20, 17, 13, 0.08)',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.85) inset, 0 40px 80px -24px rgba(20,17,13,0.22), 0 16px 32px -8px rgba(20,17,13,0.10)',
        }}
      >
        {/* Accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />

        {/* Brand */}
        <div className="flex gap-3 mb-6">
          <div className="relative w-10 h-10 rounded-lg bg-gray-900 text-[#f3eee4] grid place-items-center font-display font-bold text-xl shadow-md shrink-0">
            V
            <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-accent shadow-[0_0_0_2px_var(--bg-1)]" />
          </div>
          <div>
            <div
              className="text-base sm:text-lg font-semibold tracking-tight"
              style={{ color: 'var(--t-1)' }}
            >
              Verified
            </div>
            <div
              className="text-[8px] sm:text-[9px] font-mono tracking-[0.18em] uppercase mt-0.5"
              style={{ color: 'var(--t-3)' }}
            >
              CLAIMS AI · ADMIN
            </div>
          </div>
        </div>

        {/* Title */}
        <div
          className="text-xl sm:text-2xl font-semibold tracking-tight mb-1"
          style={{ color: 'var(--t-1)' }}
        >
          Create account
        </div>
        <div
          className="text-xs sm:text-sm mb-6"
          style={{ color: 'var(--t-3)' }}
        >
          Set up your Verified claims account.
        </div>

        {/* API error */}
        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-mono wrap-break-word">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="field">
              <label className="text-[10px] sm:text-[11px]">Full name</label>
              <input
                type="text"
                className="input w-full text-sm sm:text-[13.5px]"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="field">
              <label className="text-[10px] sm:text-[11px]">Work email</label>
              <input
                type="email"
                className="input w-full text-sm sm:text-[13.5px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="field">
              <label className="text-[10px] sm:text-[11px]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input w-full text-sm sm:text-[13.5px] pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full justify-center py-2.5 sm:py-3 px-4 mt-6 text-sm sm:text-[13px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in…
              </>
            ) : (
              <>
                Sign in <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6">
          <div
            className="text-[10px] sm:text-xs cursor-pointer transition-colors hover:opacity-70"
            style={{ color: 'var(--t-3)' }}
          >
            Forgot password?
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
