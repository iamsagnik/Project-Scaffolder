// generators/mern/frontend/main.js

async function defaultVariant(ctx = {}) {
  const content = `// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
