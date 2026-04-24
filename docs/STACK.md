# Утверждённый стек (MVP)

| Слой        | Технология |
| ---------- | ---------- |
| Frontend   | React 18, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod |
| Backend    | NestJS, TypeScript |
| ORM        | Prisma |
| DB         | PostgreSQL 16 |
| Auth       | JWT (access в header), bcrypt |
| Очередь    | BullMQ + Redis (docker-compose) |
| Файлы      | Локальная папка `uploads/` (MVP) |
| AI         | OpenAI SDK, модель по `OPENAI_MODEL` (по умолчанию `gpt-4o-mini`) |
| Dev        | npm workspaces, concurrently |
| Deploy     | Docker Compose: postgres, redis, api (опционально web через nginx) |

## Переменные окружения (см. `apps/api/.env.example`, корень `docker-compose.yml`)

- `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `OPENAI_API_KEY` (опционально), `UPLOAD_DIR`, `CORS_ORIGIN`, `VITE_API_URL` (для web).

## Границы первой версии

- Один владелец на аккаунт; коллекции и теги в рамках пользователя.
- Файлы до разумного размера; без S3 в MVP.
- Семантический поиск: позже; в v1 full-text + AI-поиск по выбору материалов.
