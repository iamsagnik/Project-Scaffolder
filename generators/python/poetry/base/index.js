async function djangoEnterprise(ctx = {}) {
  const projectName = ctx.options?.projectName || "django-enterprise-app";

  const content = `
[tool.poetry]
name = "${projectName}"
version = "0.1.0"
description = "Enterprise Django application"
authors = ["You <you@example.com>"]

[tool.poetry.dependencies]
python = "^3.10"
Django = "^4.2"
djangorestframework = "^3.14"
psycopg2-binary = "^2.9"
redis = "^5.0"
celery = "^5.3"

[tool.poetry.group.dev.dependencies]
pytest = "^8.0"
pytest-django = "^4.8"
mypy = "^1.7"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
`;

  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `
[tool.poetry]
name = "django-app"
version = "0.1.0"

[tool.poetry.dependencies]
python = "^3.10"
Django = "^4.2"
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return djangoEnterprise(ctx);
}

module.exports = {
  "django-enterprise": djangoEnterprise,
  minimal,
  default: defaultVariant
};
