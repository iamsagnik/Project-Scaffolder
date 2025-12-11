// generators/typescript/config/react.js

async function defaultVariant(ctx = {}) {
  const content = `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
`;

  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "rootDir": "src",
    "outDir": "dist",
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


module.exports = { 
  "references" : references,
  default: defaultVariant 
};
