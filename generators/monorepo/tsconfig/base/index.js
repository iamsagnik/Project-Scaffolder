async function realistic(ctx = {}) {
  const content = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
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
    "module": "ESNext",
    "moduleResolution": "node",
    "rootDir": ".",
    "composite": true,
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = { realistic, minimal, enterprise, default: defaultVariant };
