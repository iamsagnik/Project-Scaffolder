async function realistic(ctx = {}) {
  const content = `export type ID = string | number;
export interface ApiResponse<T> {
  data: T;
  error?: string;
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `export {};` };
}

async function enterprise(ctx = {}) {
  const content = `export type ID = string | number;

export interface ApiResponse<T> {
  data: T;
  error?: string;
  timestamp: number;
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = { realistic, minimal, enterprise, default: defaultVariant };
