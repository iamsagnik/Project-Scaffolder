async function django(ctx = {}) {
  const content = `
DJANGO_DEBUG=True
DATABASE_URL=postgres://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `DJANGO_DEBUG=True`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return django(ctx);
}

module.exports = {
  django,
  minimal,
  default: defaultVariant
};
