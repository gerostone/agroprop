type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetMs: number;
};

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetMs: windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetMs: entry.resetAt - now };
  }

  entry.count += 1;
  memoryStore.set(key, entry);

  return { success: true, remaining: limit - entry.count, resetMs: entry.resetAt - now };
}
