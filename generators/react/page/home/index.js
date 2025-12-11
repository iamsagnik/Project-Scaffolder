async function realistic(ctx = {}) {
  const content = `export default function HomePage() {
  return <h2>Home</h2>;
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `export default () => "home";` };
}

async function enterprise(ctx = {}) {
  const content = `export default function HomePage() {
  return (
    <section>
      <h2>Home</h2>
      <p>Welcome to the enterprise monorepo frontend.</p>
    </section>
  );
}
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
