// setup for direct typescript excution
import { execSync } from 'child_process';
execSync('ts-node --esm ./src/app.mts', { stdio: 'inherit' });
