async function realistic(ctx = {}) {
  const name = (ctx.projectName || "microservices").toLowerCase();
  const content = `apiVersion: v1
kind: Namespace
metadata:
  name: ${name}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `apiVersion: v1
kind: Namespace
metadata:
  name: default
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const name = (ctx.projectName || "microservices").toLowerCase();
  const content = `apiVersion: v1
kind: Namespace
metadata:
  name: ${name}
  labels:
    environment: production
    app: ${name}
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
