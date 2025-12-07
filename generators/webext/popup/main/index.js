async function react(ctx = {}) {
  const content = `
import React from "react";
import ReactDOM from "react-dom/client";
import PopupApp from "./PopupApp";

ReactDOM.createRoot(document.getElementById("root")).render(<PopupApp />);
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `
document.body.innerHTML = "<h1>Popup Loaded</h1>";
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return react(ctx);
}

module.exports = {
  react,
  minimal,
  default: defaultVariant
};
