async function postgresRedisCelery(ctx = {}) {
  const content = `
version: "3.9"

services:
  web:
    build: .
    command: poetry run python manage.py runserver 0.0.0.0:8000
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: app_db

  redis:
    image: redis:7

  worker:
    build: .
    command: poetry run celery -A config worker -l info

  beat:
    build: .
    command: poetry run celery -A config beat -l info
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `
version: "3"
services:
  web:
    build: .
    ports:
      - "8000:8000"
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return postgresRedisCelery(ctx);
}

module.exports = {
  "postgres-redis-celery": postgresRedisCelery,
  minimal,
  default: defaultVariant
};
