async function enterprise(ctx = {}) {
  const projectName = ctx.options?.projectName || "Web Extension Enterprise";

  const content = `
# ${projectName}

Enterprise-grade Chrome/Web Extension using React, TypeScript, MV3, and Vite.

## Features
- MV3 service worker
- Popup & Options UI (React)
- Background events
- Content scripts
- Jest testing
- CI pipeline

## Development
\`\`\`
npm install
npm run dev
\`\`\`
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `# Web Extension\nA minimal MV3 extension.`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return enterprise(ctx);
}

module.exports = {
  enterprise,
  minimal,
  default: defaultVariant
};
