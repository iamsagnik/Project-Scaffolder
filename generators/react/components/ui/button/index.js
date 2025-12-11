async function standard(ctx = {}) {
  const content = `
export default function Button({ children, onClick }) {
  return (
    <button
      style={{
        padding: "6px 12px",
        borderRadius: "4px",
        background: "#4c6ef5",
        color: "white",
        border: "none",
        cursor: "pointer"
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `
export default function Button(props) {
  return <button {...props} />;
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
