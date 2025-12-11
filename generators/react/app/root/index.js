async function realistic(ctx = {}) {
  const content = `export default function App() {
  return <h1>Frontend App</h1>;
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `export default () => null;` };
}

async function enterprise(ctx = {}) {
  const content = `export default function App() {
  return (
    <div>
      <h1>Monorepo Frontend Shell</h1>
    </div>
  );
}
`;
  return { type: "single", content };
}

/* variant: monorepo-shell */
async function monorepoShell(ctx = {}) {
  return enterprise(ctx);
}

async function defaultVariant(ctx) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  "monorepo-shell": monorepoShell,
  default: defaultVariant
};
