async function realistic(ctx = {}) {
  const content = `apiVersion: v1
kind: Service
metadata:
  name: gateway
spec:
  type: ClusterIP
  selector:
    app: gateway
  ports:
    - port: 8080
      targetPort: 8080
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `apiVersion: v1
kind: Service
metadata:
  name: gateway
spec:
  selector:
    app: gateway
  ports:
    - port: 80
      targetPort: 8080
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `apiVersion: v1
kind: Service
metadata:
  name: gateway
  annotations:
    cloud.google.com/load-balancer-type: "external"
spec:
  type: LoadBalancer
  selector:
    app: gateway
  ports:
    - port: 80
      targetPort: 8080
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
