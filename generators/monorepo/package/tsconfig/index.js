async function realistic(ctx = {}) {
  const content = `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `{}` };
}

async function enterprise(ctx = {}) {
  const content = `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "declaration": true,
    "emitDeclarationOnly": true,
    "composite": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
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
  default: defaultVariant
};
