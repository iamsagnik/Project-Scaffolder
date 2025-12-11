async function realistic(ctx = {}) {
  const content = `version: "3.9"

services:
  gateway:
    build: ./services/gateway
    ports:
      - "8080:8080"

  users-service:
    build: ./services/users-service

  orders-service:
    build: ./services/orders-service

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `version: "3.9"
services:
  gateway:
    build: ./services/gateway
    ports:
      - "8080:8080"
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `version: "3.9"

services:
  gateway:
    build: ./services/gateway
    env_file: ./services/gateway/.env
    ports:
      - "8080:8080"
    deploy:
      replicas: 2

  users-service:
    build: ./services/users-service
    deploy:
      replicas: 3

  orders-service:
    build: ./services/orders-service
    deploy:
      replicas: 3

  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
`;
  return { type: "single", content };
}

/* Template-specific variant: "gateway-and-services" */
async function gatewayAndServices(ctx = {}) {
  const content = `version: "3.9"

services:
  gateway:
    build: ./services/gateway
    ports:
      - "8080:8080"
  users-service:
    build: ./services/users-service
  orders-service:
    build: ./services/orders-service
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
  "gateway-and-services": gatewayAndServices,
  default: defaultVariant,
};
