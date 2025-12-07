async function variant16(ctx = {}) {
  return { type: "single", content: "<binary-16px-icon>" };
}

async function variant48(ctx = {}) {
  return { type: "single", content: "<binary-48px-icon>" };
}

async function variant128(ctx = {}) {
  return { type: "single", content: "<binary-128px-icon>" };
}

async function defaultVariant(ctx) {
  return variant16(ctx);
}

module.exports = {
  16: variant16,
  48: variant48,
  128: variant128,
  default: defaultVariant
};
