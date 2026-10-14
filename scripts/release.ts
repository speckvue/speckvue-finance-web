import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import loadEnv from './load-env';

const require = createRequire(import.meta.url);

const release = () => {
  loadEnv();
  const entry = join(
    dirname(require.resolve('semantic-release')),
    'bin/semantic-release.js',
  );
  const result = spawnSync(
    process.execPath,
    [entry, ...process.argv.slice(2)],
    { stdio: 'inherit', shell: false },
  );
  process.exitCode = result.status ?? 1;
};

release();

export default release;
