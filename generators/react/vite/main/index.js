async function realistic(ctx = {}) {
  const content = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `console.log("vite main");` };
}

async function enterprise(ctx = {}) {
  const content = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Environment:", import.meta.env);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
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
  default: defaultVariant
};
