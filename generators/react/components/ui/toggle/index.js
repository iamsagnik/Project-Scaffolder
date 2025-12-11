async function standard(ctx = {}) {
  const content = `
export default function Toggle({ checked, onChange }) {
  return (
    <label style={{ display: "inline-block", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span style={{ marginLeft: 6 }}>{checked ? "On" : "Off"}</span>
    </label>
  );
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `
export default function Toggle(props) {
  return <input type="checkbox" {...props} />;
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return standard(ctx);
}

module.exports = {
  standard,
  minimal,
  default: defaultVariant
};
