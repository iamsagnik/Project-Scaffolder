async function settings(ctx = {}) {
  const content = `
export default function OptionsApp() {
  return (
    <div style={{ padding: 12 }}>
      <h2>Extension Settings</h2>
      <p>Configure your preferences.</p>
    </div>
  );
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `
export default function OptionsApp() {
  return <div>Settings</div>;
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return settings(ctx);
}

module.exports = {
  settings,
  minimal,
  default: defaultVariant
};
