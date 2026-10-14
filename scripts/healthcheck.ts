import { pathToFileURL } from 'node:url';

// Read host, port and timeout from the injected central configuration.

const healthcheck = async () => {
  try {
    const response = await fetch(
      `http://${process.env.HEALTHCHECK_HOST}:${process.env.PORT}/api/health`,
      {
        signal: AbortSignal.timeout(Number(process.env.HEALTHCHECK_TIMEOUT_MS)),
      },
    );
    process.exitCode = response.status === 200 ? 0 : 1;
  } catch {
    process.exitCode = 1;
  }
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href)
  await healthcheck();

export default healthcheck;
