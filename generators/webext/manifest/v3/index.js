async function reactPopupOptionsContent(ctx = {}) {
  const appName = ctx.options?.appName || "My Extension";

  const content = JSON.stringify(
    {
      manifest_version: 3,
      name: appName,
      version: "1.0.0",
      action: { default_popup: "popup.html" },
      options_page: "options.html",
      background: { service_worker: "background.js" },
      content_scripts: [
        {
          matches: ["<all_urls>"],
          js: ["content.js"]
        }
      ],
      permissions: ["storage"]
    },
    null,
    2
  );

  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = JSON.stringify(
    {
      manifest_version: 3,
      name: "Extension",
      version: "1.0.0"
    },
    null,
    2
  );

  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return reactPopupOptionsContent(ctx);
}

module.exports = {
  "react-popup-options-content": reactPopupOptionsContent,
  minimal,
  default: defaultVariant
};
