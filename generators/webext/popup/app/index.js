async function dashboard(ctx = {}) {
  const content = `
export default function PopupApp() {
  return (
    <div style={{ padding: 12 }}>
      <h2>Extension Dashboard</h2>
      <p>Status: Active</p>
    </div>
  );
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `
export default function PopupApp() {
  return <div>Popup</div>;
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return dashboard(ctx);
}

module.exports = {
  dashboard,
  minimal,
  default: defaultVariant
};
