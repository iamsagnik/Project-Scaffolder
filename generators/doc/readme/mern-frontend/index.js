// generators/doc/readme/mern-frontend.js

async function defaultVariant(ctx = {}) {
  const content = `# MERN Frontend

React + Vite + TypeScript application.

## Commands

npm run dev
npm run build
npm run preview
npm test

## Tech Stack
- React 18
- React Router v6
- Vite
- Zustand
- Axios
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
