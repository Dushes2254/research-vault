---
name: web-refactor-tests-lint
overview: Рефакторим фронтенд с декомпозицией компонентов, добавляем стандарты кода (ESLint+Prettier) и разворачиваем максимальное покрытие тестами на базе Vitest + React Testing Library.
todos:
  - id: setup-quality-tooling
    content: Добавить и настроить ESLint + Prettier со скриптами проверки/исправления
    status: pending
  - id: setup-web-testing
    content: Подключить Vitest + RTL + jsdom и покрытие, настроить test setup
    status: pending
  - id: decompose-core-components
    content: Провести декомпозицию ключевых web-компонентов и страниц без изменения поведения
    status: pending
  - id: implement-max-coverage
    content: Постепенно покрыть максимальную часть apps/web тестами по приоритету бизнес-флоу
    status: pending
  - id: raise-quality-gates
    content: Зафиксировать и повысить lint/coverage пороги, подготовить к CI-контролю
    status: pending
  - id: todo-1777116704210-tf9ujgoeq
    content: Добавить CI в github actions на тесты и линтеры
    status: pending
  - id: todo-1777116875833-c5vd0dwu1
    content: Провести код-ревью всего проекта
    status: pending
isProject: false
---

# План рефакторинга web, тестов и качества кода

## 1) Базовая инфраструктура качества
- Добавить ESLint (flat config) и Prettier в workspace, с фокусом на web-приложение.
- Добавить npm-скрипты: `lint`, `lint:fix`, `format`, `format:check` на уровне root и/или `apps/web`.
- Настроить игнор-листы (`.eslintignore` при необходимости, `.prettierignore`) для `dist`, coverage, generated-файлов.
- Включить проверку стиля/линта в локальный workflow (и, при необходимости, в CI следующим шагом).

Ключевые файлы:
- [package.json](package.json)
- [apps/web/package.json](apps/web/package.json)
- [apps/web/tsconfig.app.json](apps/web/tsconfig.app.json)
- [apps/web/src](apps/web/src)

## 2) Тестовая платформа для Vite
- Подключить `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`.
- Добавить конфиг Vitest и общий setup-файл тестов.
- Добавить скрипты: `test`, `test:watch`, `test:coverage`.
- Настроить отчёт покрытия и пороговые значения (поэтапно, начиная с реалистичных, затем поднимать до максимально возможных).

Ключевые файлы:
- [apps/web/package.json](apps/web/package.json)
- [apps/web/vite.config.ts](apps/web/vite.config.ts)
- [apps/web/src/main.tsx](apps/web/src/main.tsx)
- [apps/web/src](apps/web/src)

## 3) Декомпозиция компонентов (рефактор без смены поведения)
- Провести инвентаризацию страниц и выделить крупные компоненты/блоки, которые стоит вынести.
- Разбить страницы на более мелкие презентационные и контейнерные части (в первую очередь auth/layout/list/detail).
- Вынести повторяемую UI-логику и утилиты в переиспользуемые модули.
- Стабилизировать публичные пропсы компонентов и минимизировать связанность между страницами.

Приоритетные зоны:
- [apps/web/src/pages/Login.tsx](apps/web/src/pages/Login.tsx)
- [apps/web/src/components/Layout.tsx](apps/web/src/components/Layout.tsx)
- [apps/web/src/components/RequireAuth.tsx](apps/web/src/components/RequireAuth.tsx)
- [apps/web/src/auth/AuthContext.tsx](apps/web/src/auth/AuthContext.tsx)
- [apps/web/src/pages](apps/web/src/pages)

## 4) Стратегия покрытия тестами “по максимуму”
- Сформировать тестовую пирамиду для web:
  - unit: утилиты, хелперы, чистая логика;
  - component: изолированные UI-блоки;
  - page-level integration: ключевые пользовательские флоу.
- Начать с критических сценариев (Auth, guard, навигация, формы), затем расширять на остальные страницы.
- Для каждой декомпозированной части сразу добавлять тесты на поведение (а не на реализацию).
- Добавить smoke-тесты на рендер основных маршрутов и основные edge-case состояния (loading/error/empty).

Ключевые зоны покрытия:
- [apps/web/src/App.tsx](apps/web/src/App.tsx)
- [apps/web/src/auth/AuthContext.tsx](apps/web/src/auth/AuthContext.tsx)
- [apps/web/src/components/RequireAuth.tsx](apps/web/src/components/RequireAuth.tsx)
- [apps/web/src/pages](apps/web/src/pages)
- [apps/web/src/api/client.ts](apps/web/src/api/client.ts)

## 5) Пошаговое поднятие quality gates
- Этап 1: гарантировать стабильность тест-раннера и lint/format без массовых падений.
- Этап 2: зафиксировать базовый coverage threshold и довести до прохождения.
- Этап 3: последовательно поднимать threshold (lines/functions/branches/statements) по мере расширения тестов.
- Этап 4: закрепить требования в CI (lint + test + coverage), чтобы качество не откатывалось.

## 6) Оркестрация задач между агентами (для ускорения)
- Агент A: декомпозиция и целевая архитектура компонентов (без массового кода).
- Агент B: настройка ESLint/Prettier + scripts.
- Агент C: настройка Vitest/RTL + test setup.
- Агент D: написание тестов по приоритетным флоу.
- Агент E: ревью регрессий, стабильности и пробелов покрытия.

Правило синхронизации:
- Сначала B/C (инфраструктура), затем A/D (рефактор + тесты), после — E (review/hardening).
- Не запускать параллельно агентов, меняющих одни и те же файлы в `pages`/`auth`.

## Критерии готовности этапа
- В `apps/web` работают `lint`, `format:check`, `test`, `test:coverage`.
- Рефактор не меняет поведение ключевых флоу.
- Покрытие существенно увеличено и закреплено порогами.
- Кодовая база страниц стала более модульной и проще для дальнейших изменений.