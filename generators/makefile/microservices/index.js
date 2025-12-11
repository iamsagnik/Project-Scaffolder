async function realistic(ctx = {}) {
  const content = `dev:
\tdocker-compose up --build

down:
\tdocker-compose down

logs:
\tdocker-compose logs -f
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `dev:
\tdocker-compose up`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `dev:
\tdocker-compose up --build

down:
\tdocker-compose down

logs:
\tdocker-compose logs -f

test:
\tnpm test --workspaces

lint:
\tnpm run lint --workspaces
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  default: defaultVariant,
};
