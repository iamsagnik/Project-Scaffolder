async function realistic(ctx = {}) {
  const content = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs"
  }
}
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noImplicitAny": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
`;
  return { type: "single", content };
}

/* exported variant names for services */
async function gateway(ctx = {}) {
  return realistic(ctx);
}
async function users(ctx = {}) {
  return realistic(ctx);
}
async function orders(ctx = {}) {
  return realistic(ctx);
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  gateway,
  users,
  orders,
  default: defaultVariant
};
