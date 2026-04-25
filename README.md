# Research Vault (MVP)

Личный knowledge hub: ссылки, заметки, файлы, теги, коллекции, фоновая обработка ссылок, опционально AI (OpenAI).

Сайт: [https://research-vault.ru/](https://research-vault.ru/)

## Требования

- **Node.js 20+**
- **Docker Desktop** (для PostgreSQL + Redis)

## Установка и запуск

```bash
git clone <url> && cd research-vault
```

Перед `npm run setup` обязательно запусти Docker Desktop (или Docker Engine), иначе скрипт остановится на шаге `docker compose up -d`.

**1. Установка зависимостей, `.env`, БД, Prisma (одна команда):**

```bash
npm run setup
```

Скрипт: `npm install` → копии `apps/api/.env` и `apps/web/.env` из `.env.example` (если ещё нет) → `docker compose up -d` → `prisma db push`.

**2. Запуск всего стека (API + Vite + Swagger на бэкенде):**

```bash
npm start
```

То же: `npm run dev`.

| Сервис | URL |
|--------|-----|
| Web | [http://localhost:5173](http://localhost:5173) |
| API | [http://localhost:3000](http://localhost:3000) |
| Swagger | [http://localhost:3000/docs](http://localhost:3000/docs) |

`Vite` проксирует `/api/*` на бэкенд (см. [apps/web/vite.config.ts](apps/web/vite.config.ts)).

### Если `npm run setup` упал на Docker

Убедись, что Docker Desktop запущен, затем:

```bash
docker compose up -d
npm run db:push
```

---

## Скрипты (корень)

| Команда | Назначение |
|---------|------------|
| `npm run setup` | Первый запуск: зависимости, env, Docker, схема БД |
| `npm start` / `npm run dev` | Dev: API + web + `SWAGGER_ENABLED=1` |
| `npm run build` | Сборка API и web |
| `npm run db:push` | Применить схему Prisma к БД |
| `npm run db:generate` | Сгенерировать Prisma Client |

После `npm install` в корне срабатывает `postinstall` → `prisma generate` в API.

## Swagger (OpenAPI)

`npm start` поднимает API с `SWAGGER_ENABLED=1` → **http://localhost:3000/docs** (тот же процесс, что и REST).

Авторизация: `POST /auth/login` → скопируй `accessToken` → **Authorize** в Swagger.

## AI

Добавь `OPENAI_API_KEY` в `apps/api/.env` — тогда заработают `POST /ai/*` и кнопки на деталке.

## Документация

- [docs/PROJECT.md](docs/PROJECT.md) — **шпаргалка по репо** (архитектура, стек, где смотреть в коде; дата внутри файла)
- [docs/MVP.md](docs/MVP.md) — границы MVP  
- [docs/STACK.md](docs/STACK.md) — стек
- [docs/SERVER-TIMEWEB.md](docs/SERVER-TIMEWEB.md) — **прод на VPS** (Timeweb/аналог): что на сервере, nginx, пути, обновления

## Прод-деплой (MVP)

См. [docs/DEPLOY.md](docs/DEPLOY.md) и пошаговая карта сервера: [docs/SERVER-TIMEWEB.md](docs/SERVER-TIMEWEB.md).

### Автодеплой через GitHub Actions (main -> VPS)

Workflow: `.github/workflows/deploy-timeweb.yml`.

Запуск: любой `push` в `main` (включая merge PR в `main`).

Нужные секреты в GitHub (`Settings` -> `Secrets and variables` -> `Actions`):

- `TIMEWEB_HOST` — IP или домен VPS
- `TIMEWEB_USER` — пользователь для SSH (обычно `root`)
- `TIMEWEB_SSH_KEY` — приватный SSH-ключ (полное содержимое файла)
- `TIMEWEB_SSH_PASSPHRASE` — passphrase от SSH-ключа (если ключ защищён; для ключа без passphrase можно не заполнять)
- `TIMEWEB_PORT` — SSH-порт (обычно `22`)

Что делает деплой:

1. `git fetch` + `git reset --hard origin/main` в `/opt/research-vault/app`
2. Если на VPS нет swap, workflow автоматически создаёт `/swapfile` (2GB), чтобы не падать по OOM
3. `npm ci --no-audit --no-fund`
4. `NODE_OPTIONS=--max-old-space-size=768 npm run build`
5. `npx prisma db push` в `apps/api`
6. `pm2 restart research-api`
