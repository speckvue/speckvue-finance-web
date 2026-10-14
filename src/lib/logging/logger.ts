import 'server-only';
import createLogger from './create-logger';

const state = globalThis as typeof globalThis & {
  speckvueLogger?: ReturnType<typeof createLogger>;
};

/** Keep one transport set per process, including Next development reloads. */
export default function getLogger() {
  if (!state.speckvueLogger)
    state.speckvueLogger = createLogger({
      service: 'speckvue-finance-web',
      level: process.env.LOG_LEVEL ?? 'info',
      directory: process.env.LOG_DIRECTORY ?? 'logs',
      fileEnabled: process.env.LOG_FILE_ENABLED !== 'false',
      maxSize: process.env.LOG_MAX_SIZE ?? '20m',
      maxFiles: process.env.LOG_MAX_FILES ?? '14d',
    });
  return state.speckvueLogger;
}
