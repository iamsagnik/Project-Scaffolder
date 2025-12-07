// generators/mern/frontend/component/todos/list.js

async function defaultVariant(ctx = {}) {
  const content = `// src/components/todos/TodoList.tsx
import React from 'react';
import TodoItem from './TodoItem';

export default function TodoList({ items = [] }: { items: any[] }) {
  return (
    <ul>
      {items.map((todo) => (
        <TodoItem key={todo._id} todo={todo} />
      ))}
    </ul>
  );
}
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
