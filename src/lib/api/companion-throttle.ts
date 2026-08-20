/**
 * The aoe2companion API allows roughly 16 requests per 10 second window per IP,
 * and publishes the current budget in `x-ratelimit-*` headers. In production
 * every visitor shares the server's IP, so scouting an 8-player lobby (one
 * profile + several match pages per slot) will blow the budget unless every
 * call goes through a single process-wide queue.
 *
 * Exceeding it is not harmless: a 429 used to surface as "this player has no
 * match history", which silently turned into invented scouting data.
 */

const DEFAULT_LIMIT = 16;
const DEFAULT_WINDOW_MS = 10_000;
/** Leave headroom so a burst never lands exactly on the limit. */
const SAFETY_MARGIN = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let limit = DEFAULT_LIMIT;
let windowMs = DEFAULT_WINDOW_MS;

/** Timestamps of recent requests, oldest first. */
let recent: number[] = [];
/** Serialises slot acquisition so concurrent callers cannot claim the same slot. */
let queue: Promise<void> = Promise.resolve();

function usableLimit(): number {
  return Math.max(1, limit - SAFETY_MARGIN);
}

async function acquireSlot(): Promise<void> {
  const now = Date.now();
  recent = recent.filter((t) => now - t < windowMs);

  if (recent.length >= usableLimit()) {
    const oldest = recent[0];
    const waitMs = windowMs - (now - oldest) + 50;
    await sleep(Math.max(waitMs, 50));
    return acquireSlot();
  }

  recent.push(Date.now());
}

/** Queue a request so the whole process stays inside the published budget. */
export function scheduleCompanionRequest<T>(run: () => Promise<T>): Promise<T> {
  const ready = queue.then(() => acquireSlot());
  // Keep the chain alive even when a caller rejects.
  queue = ready.catch(() => undefined);
  return ready.then(run);
}

/** Re-tune the budget from the server's own accounting. */
export function recordRateLimitHeaders(res: Response): void {
  const headerLimit = Number(res.headers.get("x-ratelimit-limit"));
  if (Number.isFinite(headerLimit) && headerLimit > 0) limit = headerLimit;

  const reset = Number(res.headers.get("x-ratelimit-reset"));
  if (Number.isFinite(reset) && reset > 0) windowMs = Math.min(reset * 1000, 60_000);
}

/** How long to wait after a 429, using the server's own reset hint. */
export function rateLimitCooldownMs(res: Response): number {
  const retryAfter = Number(res.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, 15_000);

  const reset = Number(res.headers.get("x-ratelimit-reset"));
  if (Number.isFinite(reset) && reset > 0) return Math.min(reset * 1000, 15_000);

  return windowMs;
}

/** Pause the queue so queued callers do not spend the window that just reset. */
export function blockQueueFor(ms: number): void {
  recent = Array.from({ length: usableLimit() }, () => Date.now() + ms - windowMs);
}
