// generators/react/component/ui/button.js

async function defaultVariant(ctx = {}) {
  const content = `// src/components/ui/Button.tsx
import React from 'react';

export default function Button({ children, ...props }: any) {
  return (
    <button
      {...props}
      style={{
        padding: "8px 14px",
        borderRadius: "6px",
        cursor: "pointer",
        background: "#222",
        color: "#fff",
        border: "none"
      }}
    >
      {children}
    </button>
  );
}
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
