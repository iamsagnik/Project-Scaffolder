async function realistic(ctx = {}) {
  const content = `export async function httpGet(url, options = {}) {
  const res = await fetch(url, options);
  return res.json();
}

export async function httpPost(url, body = {}, options = {}) {
  const res = await fetch(url, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: JSON.stringify(body)
  });
  return res.json();
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return {
    type: "single",
    content: `export const httpGet = async () => null;`
  };
}

async function enterprise(ctx = {}) {
  const content = `export async function httpGet(url, options = {}) {
  const start = Date.now();
  const res = await fetch(url, options);
  const data = await res.json();
  console.log("[HTTP][GET]", url, "status:", res.status, "ms:", Date.now() - start);
  return data;
}

export async function httpPost(url, body = {}, options = {}) {
  const start = Date.now();
  const res = await fetch(url, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  console.log("[HTTP][POST]", url, "status:", res.status, "ms:", Date.now() - start);
  return data;
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  default: defaultVariant
};
