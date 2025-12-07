async function standard(ctx = {}) {
  const content = `
export default function Header({ title = "Extension" }) {
  return (
    <header style={{ padding: "10px 0", borderBottom: "1px solid #ddd" }}>
      <h1 style={{ fontSize: 18 }}>{title}</h1>
    </header>
  );
}
`;
  return { type: "single", content };
}

async function compact(ctx = {}) {
  const content = `
export default function Header({ title }) {
  return <h1>{title}</h1>;
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return standard(ctx);
}

module.exports = {
  standard,
  compact,
  default: defaultVariant
};
