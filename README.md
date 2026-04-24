# Research Vault (MVP)

Личный knowledge hub: ссылки, заметки, файлы, теги, коллекции, фоновая обработка ссылок, опционально AI (OpenAI).

## Требования

- **Node.js 20+**
- **Docker Desktop** (для PostgreSQL + Redis) — [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

## Для нового разработчика (2 команды из корня репозитория)

```bash
git clone <url> && cd research-vault
```

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

- [docs/MVP.md](docs/MVP.md) — границы MVP  
- [docs/STACK.md](docs/STACK.md) — стек

## Прод-деплой (MVP)

См. [docs/DEPLOY.md](docs/DEPLOY.md).
