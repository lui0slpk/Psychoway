// Backend test setup - defines required env vars BEFORE any module is imported.
// This prevents config/environment.js from throwing "FATAL: JWT_SECRET no está definido"
// at import time (there is no .env file, and tests must NOT touch the real DB).
import { vi } from 'vitest';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
process.env.SUPABASE_DB_URL =
  process.env.SUPABASE_DB_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'API_KEY_AQUI';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';