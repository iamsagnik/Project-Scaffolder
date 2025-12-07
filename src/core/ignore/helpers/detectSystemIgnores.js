const path = require("path");
const { safeStat } = require("../../utils/fsUtils");

async function detectSystemIgnores(workspaceRoot) {
  const always = [
    ".git/",
    ".gitignore",
    ".sgmtr",
    ".vscode/",
    ".sgmtrignore"
  ];

  const conditional = [
    "node_modules/",
    "dist/",
    "build/",
    ".DS_Store"
  ];

  const detected = [];

  for (const p of conditional) {
    const abs = path.join(workspaceRoot, p.replace(/\/$/, ""));
    const stat = await safeStat(abs);
    if (stat) detected.push(p);
  }

  return [...always, ...detected];
}

module.exports = detectSystemIgnores;
