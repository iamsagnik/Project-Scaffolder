// generators/react/component/ui/input.js

async function defaultVariant(ctx = {}) {
  const content = `// src/components/ui/Input.tsx
import React from 'react';

export default function Input(props: any) {
  return (
    <input
      {...props}
      style={{
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        width: "100%"
      }}
    />
  );
}
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
