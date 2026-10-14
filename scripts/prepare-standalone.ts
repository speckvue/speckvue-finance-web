import { cpSync, existsSync } from 'node:fs';

const prepareStandalone = () => {
  if (!existsSync('.next/standalone/server.js'))
    throw new Error('Run npm run build before standalone verification.');
  cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
  if (existsSync('public'))
    cpSync('public', '.next/standalone/public', { recursive: true });
};

export default prepareStandalone;
