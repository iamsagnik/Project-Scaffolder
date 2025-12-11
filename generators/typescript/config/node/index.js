async function realistic(ctx = {}) {
  const content = `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
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
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "composite": true
  },
  "references": [
    { "path": "../../packages/shared-types" },
    { "path": "../../packages/shared-utils" }
  ],
  "include": ["src"]
}
`;
  return { type: "single", content };
}

/* variant: references */
async function references(ctx = {}) {
  return enterprise(ctx);
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  references,
  default: defaultVariant
};
