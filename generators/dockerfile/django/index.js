async function enterprise(ctx = {}) {
  const pythonVersion = ctx.options?.pythonVersion || "3.10";

  const content = `
FROM python:${pythonVersion}-slim

WORKDIR /app

COPY pyproject.toml poetry.lock* /app/

RUN pip install poetry && poetry install --no-dev

COPY . /app/

CMD ["poetry", "run", "gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `
FROM python:3.10-slim
WORKDIR /app
COPY . /app
RUN pip install django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return enterprise(ctx);
}

module.exports = {
  enterprise,
  minimal,
  default: defaultVariant
};
