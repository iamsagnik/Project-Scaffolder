// generators/mern/frontend/hook/use-todos.js

async function defaultVariant(ctx = {}) {
  const content = `// src/hooks/useTodos.ts
import { useEffect } from 'react';
import { useTodoStore } from '../store/todo.store';
import { listTodos } from '../services/todo.service';

export default function useTodos() {
  const todos = useTodoStore((s) => s.todos);
  const setTodos = useTodoStore((s) => s.setTodos);

  useEffect(() => {
    let mounted = true;
    listTodos()
      .then((data) => {
        if (mounted) setTodos(data);
      })
      .catch(() => {
        if (mounted) setTodos([]);
      });
    return () => { mounted = false; };
  }, [setTodos]);

  return { todos, setTodos };
}
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };
