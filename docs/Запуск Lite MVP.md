# Запуск Lite MVP без Vercel

Lite MVP работает через Telegram Long Polling. Публичный домен и webhook не нужны.

## Требования

- любой Linux-сервер или VPS;
- Docker + Docker Compose;
- файл `.env` с секретами.

## Переменные

```
TELEGRAM_BOT_TOKEN_LITE=
LLM_API_KEY=
LLM_BASE_URL=
LLM_MODEL=gpt-6-luna
LLM_API_STYLE=chat_completions
```

`LLM_API_STYLE`:
- `chat_completions` — если API Master совместим с OpenAI Chat Completions;
- `responses` — если API Master проксирует Responses API.

## Запуск

```bash
docker compose up -d --build
```

## Проверка

```bash
docker compose logs -f anait-lite
```

При успешном подключении в логе появляется:

```
Anait Lite started as @username
```

В Telegram:
- `/start` — стартовый сценарий;
- `/status` — проверка подключения модели.

## Обновление

```bash
git pull
docker compose up -d --build
```

## Важное

Файл `.env` не коммитится в Git. Реальные Telegram/API-токены должны находиться только на сервере.
