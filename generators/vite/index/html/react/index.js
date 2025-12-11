// generators/vite/index/html/react.js

async function defaultVariant(ctx = {}) {
  const title = ctx.options?.title || "MERN Frontend";

  const content = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
