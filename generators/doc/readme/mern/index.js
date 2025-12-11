async function enterprise(ctx = {}) {
  const proj = ctx.options?.projectName || 'mern-enterprise-app';
  const content = `# ${proj}

Enterprise MERN starter — backend (Express + MongoDB), frontend (React + Vite + TypeScript), Docker, CI, tests.

## Overview
- Backend: Express + MongoDB + JWT
- Frontend: React + Vite + TS
- CI via GitHub Actions
- Docker support
- Layered architecture

## Quickstart
cd backend && npm ci && npm run dev
cd frontend && npm ci && npm run dev

`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const proj = ctx.options?.projectName || "mern-app";
  const content = `# ${proj}

Minimal MERN boilerplate.

- Express backend
- React frontend
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return enterprise(ctx);
}

module.exports = {
  enterprise,
  minimal,
  default: defaultVariant,
};