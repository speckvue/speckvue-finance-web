import { spawnSync } from 'node:child_process';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

const commit = async () => {
  if (process.argv.includes('--help')) {
    stdout.write(
      'Interactive Conventional Commit helper. Stages nothing; commits only the existing index.\n',
    );
    return;
  }
  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    const type = (
      await prompt.question(
        'Type (feat/fix/docs/refactor/test/chore/build/ci/perf/style/revert): ',
      )
    ).trim();
    if (
      !/^(feat|fix|docs|refactor|test|chore|build|ci|perf|style|revert)$/.test(
        type,
      )
    )
      throw new Error('Choose a supported commit type.');
    const scope = (await prompt.question('Scope (optional): ')).trim();
    if (scope && !/^[a-z0-9-]+$/.test(scope))
      throw new Error(
        'Scope must contain lowercase letters, digits or hyphens.',
      );
    const description = (await prompt.question('Short description: ')).trim();
    if (!description || /[\r\n]/.test(description))
      throw new Error('Enter a one-line description.');
    const result = spawnSync(
      'git',
      ['commit', '-m', `${type}${scope ? `(${scope})` : ''}: ${description}`],
      { stdio: 'inherit', shell: false },
    );
    process.exitCode = result.status ?? 1;
  } finally {
    prompt.close();
  }
};

await commit();

export default commit;
