#!/usr/bin/env node
/**
 * Первичная настройка после клонирования: зависимости, .env, Docker, Prisma.
 * Запуск: npm run setup (из корня; на свежем клоне не требует предварительного npm install).
 */
import { copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, args) {
  const isWin = process.platform === 'win32';
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: root, shell: isWin });
  if (r.error) {
    console.error(r.error);
    process.exit(1);
  }
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

function copyIfMissing(relFrom, relTo) {
  const to = join(root, relTo);
  if (existsSync(to)) {
    console.log(`[setup] skip (exists): ${relTo}`);
    return;
  }
  const from = join(root, relFrom);
  if (!existsSync(from)) {
    console.warn(`[setup] missing template: ${relFrom}`);
    return;
  }
  copyFileSync(from, to);
  console.log(`[setup] created ${relTo} from ${relFrom}`);
}

console.log('[setup] Research Vault\n');
console.log('[setup] 1/4 npm install (workspaces)…\n');
run('npm', ['install']);

console.log('\n[setup] 2/4 env files from .env.example…\n');
copyIfMissing('apps/api/.env.example', 'apps/api/.env');
copyIfMissing('apps/web/.env.example', 'apps/web/.env');

console.log('\n[setup] 3/4 docker compose up -d (PostgreSQL + Redis)…\n');
const docker = spawnSync('docker', ['compose', 'up', '-d'], {
  stdio: 'inherit',
  cwd: root,
  shell: process.platform === 'win32',
});
if (docker.status !== 0) {
  console.error(
    '\n[setup] docker compose failed. Запусти Docker Desktop и повтори, или вручную:\n' +
      '  docker compose up -d\n',
  );
  process.exit(docker.status ?? 1);
}

console.log('\n[setup] 4/4 prisma: db push (схема в БД)…\n');
run('npm', ['run', 'db:push', '-w', '@research-vault/api']);

console.log(
  '\n[setup] готово.\n' +
    '  Запуск: npm start  (API + web + Swagger)\n' +
    '  — http://localhost:5173  web\n' +
    '  — http://localhost:3000  API\n' +
    '  — http://localhost:3000/docs  Swagger\n',
);
