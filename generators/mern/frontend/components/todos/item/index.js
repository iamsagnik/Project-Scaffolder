// generators/mern/frontend/component/todos/item.js

async function defaultVariant(ctx = {}) {
  const content = `// src/components/todos/TodoItem.tsx
import React from 'react';

export default function TodoItem({ todo }: { todo: any }) {
  return (
    <li style={{ marginBottom: "6px" }}>
      <strong>{todo.title}</strong>
      {todo.completed ? " (done)" : ""}
    </li>
  );
}
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
