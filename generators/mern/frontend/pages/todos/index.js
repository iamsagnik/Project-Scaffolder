// generators/mern/frontend/page/todos.js

async function defaultVariant(ctx = {}) {
  const content = `// src/pages/Todos.page.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../config/api';

export default function Todos() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    api.get("/todos").then((res) => setTodos(res.data));
  }, []);

  return (
    <div>
      <h2>Todos</h2>
      <ul>
        {todos.map((t: any) => (
          <li key={t._id}>{t.title}</li>
        ))}
      </ul>
    </div>
  );
}
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
