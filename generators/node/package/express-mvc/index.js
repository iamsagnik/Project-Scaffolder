async function realistic(ctx = {}) {
  const content = `{
  "name": "backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc -p .",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4",
    "cors": "^2"
  },
  "devDependencies": {
    "typescript": "^5",
    "nodemon": "^3"
  }
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `{
  "name": "backend",
  "private": true
}
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `{
  "name": "backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "clean": "rimraf dist",
    "dev": "nodemon src/index.ts",
    "build": "npm run clean && tsc -p .",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "express": "^4",
    "cors": "^2",
    "helmet": "^7"
  },
  "devDependencies": {
    "typescript": "^5",
    "nodemon": "^3",
    "eslint": "^8",
    "rimraf": "^5"
  }
}
`;
  return { type: "single", content };
}

/* variant: monorepo */
async function monorepo(ctx = {}) {
  return realistic(ctx);
}

async function defaultVariant(ctx) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  monorepo,
  default: defaultVariant
};
