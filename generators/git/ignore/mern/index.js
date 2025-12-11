async function defaultVariant(ctx = {}) {
  const content = `# Node
node_modules/
dist/
build/
.env
.env.local

# Docker
docker-compose.override.yml

# Frontend
.vite
coverage/

# IDE
.vscode/
.idea/
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };