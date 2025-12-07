// generators/mern/frontend/store/todo.js

async function zustand(ctx = {}) {
  const content = `// src/store/todo.store.ts
import create from 'zustand';

type Todo = { _id: string; title: string; completed: boolean };

export const useTodoStore = create((set) => ({
  todos: [] as Todo[],
  setTodos: (todos: Todo[]) => set({ todos }),
}));
`;

  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return zustand(ctx);
}

module.exports = {
  zustand,
  default: defaultVariant,
};
