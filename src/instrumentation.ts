/** Winston runs only on the Node server; credentials and filesystem transports stay out of browser bundles. */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: getLogger } = await import('./lib/logging/logger');
    getLogger().info('Web server initialized', { event: 'web_started' });
  }
}

export async function onRequestError(
  error: { name?: string },
  request: { method: string },
) {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: getLogger } = await import('./lib/logging/logger');
    getLogger().error('Server request failed', {
      event: 'request_failed',
      method: request.method,
      errorType: error.name ?? 'Unknown',
    });
  }
}
