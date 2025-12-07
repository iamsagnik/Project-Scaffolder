// generators/react/service/http.js

async function axios(ctx = {}) {
  const api = ctx.options?.apiBase || "http://localhost:4000/api";

  const content = `// src/services/http.service.ts
import axios from 'axios';

const client = axios.create({
  baseURL: "${api}"
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});

export default client;
`;

  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return axios(ctx);
}

module.exports = {
  axios,
  default: defaultVariant,
};
