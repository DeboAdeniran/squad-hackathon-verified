import { UserRole } from './enums';

// ── Requests ──────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

// ── Responses ─────────────────────────────────────────────────────────────────

export interface LoginResponse {
  tokenType: string; // always "Bearer"
  expiresIn: number; // seconds — 86400 (24 hrs)
  userId: string;
  role: UserRole;
}
