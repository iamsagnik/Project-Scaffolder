// generators/mern/frontend/service/todo.js

async function defaultVariant(ctx = {}) {
  const content = `// src/services/todo.service.ts
import http from './http.service';

export const listTodos = () =>
  http.get("/todos").then((res) => res.data);

export const createTodo = (payload: any) =>
  http.post("/todos", payload).then((res) => res.data);
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
