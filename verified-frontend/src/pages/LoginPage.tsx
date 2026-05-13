import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/dashboard', { replace: true });
    } catch {
      // error is already set in AuthContext
    }
  };

  return (
    <div
      className="fixed inset-0 grid place-items-center"
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
        className="relative z-10 w-105 p-9 rounded-2xl overflow-hidden"
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
          <div className="relative w-10 h-10 rounded-lg bg-gray-900 text-[#f3eee4] grid place-items-center font-display font-bold text-xl shadow-md">
            V
            <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-accent shadow-[0_0_0_2px_var(--bg-1)]" />
          </div>
          <div>
            <div
              className="text-lg font-semibold tracking-tight"
              style={{ color: 'var(--t-1)' }}
            >
              Verified
            </div>
            <div
              className="text-[9px] font-mono tracking-[0.18em] uppercase mt-0.5"
              style={{ color: 'var(--t-3)' }}
            >
              CLAIMS AI · ADMIN
            </div>
          </div>
        </div>

        {/* Title */}
        <div
          className="text-2xl font-semibold tracking-tight mb-1"
          style={{ color: 'var(--t-1)' }}
        >
          Sign in
        </div>
        <div className="text-sm mb-6" style={{ color: 'var(--t-3)' }}>
          Access the claims adjudication console.
        </div>

        {/* API error */}
        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-mono">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="field">
              <label>Work email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full justify-center py-3 px-4 mt-4"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in…' : 'Sign in'} <ArrowRight size={14} />
          </button>
        </form>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4">
          <div
            className="text-xs cursor-pointer transition-colors"
            style={{ color: 'var(--t-3)' }}
          >
            Forgot password?
          </div>
        </div>

        <div className="divider my-4" />
      </div>
    </div>
  );
};

export default LoginPage;
