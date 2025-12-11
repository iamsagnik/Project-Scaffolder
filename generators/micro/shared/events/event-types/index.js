async function realistic(ctx = {}) {
  const content = `export const EVENT_TYPES = {
  USER_CREATED: "USER_CREATED",
  ORDER_PLACED: "ORDER_PLACED",
};
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `export const EVENT_TYPES = {};`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `export const EVENT_TYPES = {
  USER_CREATED: "USER_CREATED",
  ORDER_PLACED: "ORDER_PLACED",
  USER_UPDATED: "USER_UPDATED",
  ORDER_CANCELLED: "ORDER_CANCELLED"
};
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return realistic(ctx);
}

module.exports = { realistic, minimal, enterprise, default: defaultVariant };
