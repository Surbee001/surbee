import crypto from 'crypto';

/**
 * Create HMAC-signed headers for Modal sandbox requests.
 */
export function createSignedHeaders(body: string): Record<string, string> {
  const apiKey = process.env.SANDBOX_API_KEY;
  const signingSecret = process.env.SANDBOX_SIGNING_SECRET;

  if (!apiKey || !signingSecret) {
    throw new Error('Sandbox API credentials not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payload = `${timestamp}.${body}`;

  const signature = crypto
    .createHmac('sha256', signingSecret)
    .update(payload)
    .digest('hex');

  return {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
    'X-Timestamp': timestamp,
    'X-Signature': signature,
  };
}

/**
 * Create simple API key headers (for non-signed requests).
 */
export function createApiKeyHeaders(): Record<string, string> {
  const apiKey = process.env.SANDBOX_API_KEY;
  if (!apiKey) {
    throw new Error('SANDBOX_API_KEY not configured');
  }
  return {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
  };
}

/**
 * Get the Modal sandbox endpoint URL.
 */
export function getModalEndpoint(): string | null {
  const endpoint = process.env.MODAL_SANDBOX_ENDPOINT;
  if (!endpoint) {
    console.error('[Sandbox] MODAL_SANDBOX_ENDPOINT not configured');
    return null;
  }
  return endpoint;
}
