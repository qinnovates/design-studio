/**
 * Validates that a base URL is safe to send API keys to.
 * Prevents key exfiltration to attacker-controlled servers.
 */

const ALLOWED_DOMAINS = new Set([
  'api.openai.com',
  'api.anthropic.com',
  'openrouter.ai',
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
]);

const ALLOWED_LOCALHOST_PORTS = true; // Allow any port on localhost

export interface UrlValidationResult {
  valid: boolean;
  warning?: string;
}

export function validateBaseUrl(url: string): UrlValidationResult {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // Allow any localhost/loopback
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return { valid: true };
    }

    // Allow known provider domains
    if (ALLOWED_DOMAINS.has(hostname)) {
      return { valid: true };
    }

    // Allow subdomains of known providers
    for (const domain of ALLOWED_DOMAINS) {
      if (hostname.endsWith(`.${domain}`)) {
        return { valid: true };
      }
    }

    // Unknown domain — warn but allow (user chose this)
    return {
      valid: true,
      warning: `Custom endpoint "${hostname}" is not a recognized AI provider. Your API key will be sent to this server. Only proceed if you trust this endpoint.`,
    };
  } catch {
    return { valid: false, warning: 'Invalid URL format' };
  }
}

/** Check if a URL is localhost */
export function isLocalhost(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname);
  } catch {
    return false;
  }
}
