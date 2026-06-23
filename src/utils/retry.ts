// src/utils/retry.ts

/**
 * Determines if an error is a transient/retryable API error (e.g. 503 / UNAVAILABLE).
 */
function isRetryableError(error: unknown): boolean {
  if (!error) return false;
  const err = error as Record<string, unknown>;

  // Check numeric status code
  if (err.status === 503) return true;

  // Check string status
  if (typeof err.status === 'string' && err.status.toUpperCase() === 'UNAVAILABLE') return true;

  // Check error message content
  if (typeof err.message === 'string') {
    const msg = err.message.toLowerCase();
    if (
      msg.includes('503') ||
      msg.includes('unavailable') ||
      msg.includes('high demand') ||
      msg.includes('temporarily') ||
      msg.includes('overload') ||
      msg.includes('quota') ||
      msg.includes('rate limit') ||
      msg.includes('too many requests')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Wraps an async function with exponential backoff retry logic.
 * Retries up to `maxRetries` times on transient errors.
 *
 * @param fn - The async function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param initialDelay - Initial delay in ms before first retry (default: 1000)
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries && isRetryableError(error)) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(
          `[Gemini API] Transient error detected. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // Not retryable or no retries left
        throw error;
      }
    }
  }

  throw lastError;
}
