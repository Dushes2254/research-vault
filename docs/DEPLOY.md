# Деплой (MVP)

## Минимальный вариант (VPS)

1. `docker compose up -d` на сервере (как в README), либо отдельно PostgreSQL + Redis.  
2. Собрать `apps/api` и `apps/web`.  
3. Раздать `web` статикой через `nginx` (корневая папка `dist`).  
4. `nginx` location `/api` → `proxy_pass` на `127.0.0.1:3000` (или запускать `api` за тем же `nginx`).  
5. `apps/api` как systemd unit или `pm2` / `node dist/main.js` с `NODE_ENV=production`.  
6. `JWT_SECRET` — длинный случайный, `CORS_ORIGIN` — публичный origin фронтенда.  
7. `UPLOAD_DIR` — каталог вне webroot; привязка прав пользователя.  
8. (Опционально) `docker build -f apps/api/Dockerfile .` из корня `research-vault/`.  
9. См. пример [docs/nginx.example.conf](nginx.example.conf) для production.

## Переменные

См. `apps/api/.env.example`.
