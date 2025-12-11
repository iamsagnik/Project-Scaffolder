async function realistic(ctx = {}) {
  const service = ctx.variant || ctx.options?.variant || "service";
  const content = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${service}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${service}
  template:
    metadata:
      labels:
        app: ${service}
    spec:
      containers:
        - name: ${service}
          image: ${service}:latest
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const service = ctx.variant || ctx.options?.variant || "service";
  const content = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${service}
spec:
  selector:
    matchLabels:
      app: ${service}
  template:
    metadata:
      labels:
        app: ${service}
    spec:
      containers:
        - name: ${service}
          image: ${service}:latest
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const service = ctx.variant || ctx.options?.variant || "service";
  const content = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${service}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${service}
  template:
    metadata:
      labels:
        app: ${service}
        tier: backend
    spec:
      containers:
        - name: ${service}
          image: registry.example.com/${service}:stable
          resources:
            limits:
              cpu: "500m"
              memory: "512Mi"
            requests:
              cpu: "250m"
              memory: "256Mi"
`;
  return { type: "single", content };
}

/* Template-specific variants used in the file tree: "users" and "orders".
   Provide direct exports so scaffolder can call module["users"](ctx) etc. */

async function users(ctx = {}) {
  // set variant to support downstream usage
  ctx = { ...ctx, variant: "users" };
  return realistic(ctx);
}

async function orders(ctx = {}) {
  ctx = { ...ctx, variant: "orders" };
  return realistic(ctx);
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  users,
  orders,
  default: defaultVariant,
};
