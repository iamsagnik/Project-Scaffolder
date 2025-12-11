async function realistic(ctx = {}) {
  const content = `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs"
  }
}
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  default: defaultVariant,
};
