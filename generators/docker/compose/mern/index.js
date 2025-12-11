async function mongoBackendFrontend(ctx = {}) {
  const backendPort = ctx.options?.backendPort || 4000;
  const frontendPort = ctx.options?.frontendPort || 3000;

  const content = `version: '3.8'
services:
  mongo:
    image: mongo:6
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./backend
    env_file: ./backend/.env
    ports:
      - "${backendPort}:${backendPort}"
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    env_file: ./frontend/.env
    ports:
      - "${frontendPort}:80"
    depends_on:
      - backend

volumes:
  mongo-data:
`;
  return { type: "single", content };
}

async function mongoOnly(ctx = {}) {
  const content = `version: '3.8'
services:
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return mongoBackendFrontend(ctx);
}

module.exports = {
  "mongo-backend-frontend": mongoBackendFrontend,
  "mongo-only": mongoOnly,
  default: defaultVariant,
};