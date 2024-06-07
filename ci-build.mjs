import process from 'node:process';
import path from 'node:path';
import { command } from './repo/scripts/helper.mjs';

const repo = path.join(process.cwd(), 'repo');

await command('npm', ['run', 'install'], repo);
await command('npm', ['run', 'build'], repo);