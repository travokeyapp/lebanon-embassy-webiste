// Per-process limiter for failed logins. On Vercel each warm function instance
// keeps its own counter, which still blunts brute-force attempts; the bcrypt
// cost does the rest.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;

type Entry = { failures: number; resetAt: number };

const store = (globalThis as typeof globalThis & { __adminLoginAttempts?: Map<string, Entry> }).__adminLoginAttempts ??
  new Map<string, Entry>();
(globalThis as typeof globalThis & { __adminLoginAttempts?: Map<string, Entry> }).__adminLoginAttempts = store;

export function isLoginBlocked(key: string): boolean {
  const entry = store.get(key);
  if (!entry) {
    return false;
  }
  if (Date.now() > entry.resetAt) {
    store.delete(key);
    return false;
  }
  return entry.failures >= MAX_FAILURES;
}

export function recordFailedLogin(key: string): void {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { failures: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.failures += 1;
}

export function clearFailedLogins(key: string): void {
  store.delete(key);
}
