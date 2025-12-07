async function standard(ctx = {}) {
  const content = `
console.log("Content script loaded.");

import "./dom-observer";
import "./messaging";
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `console.log("Content script active.");`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return standard(ctx);
}

module.exports = {
  standard,
  minimal,
  default: defaultVariant
};
