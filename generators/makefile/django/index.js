async function standard(ctx = {}) {
  const content = `
run:
\tpoetry run python manage.py runserver

migrate:
\tpoetry run python manage.py migrate

worker:
\tpoetry run celery -A config worker -l info

beat:
\tpoetry run celery -A config beat -l info
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `
run:
\tpython manage.py runserver
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return standard(ctx);
}

module.exports = {
  standard,
  minimal,
  default: defaultVariant
};
