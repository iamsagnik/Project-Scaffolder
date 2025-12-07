const path = require("path");
const { readFile, safeStat } = require("../../utils/fsUtils");

async function loadGitignore(workspaceRoot) {
  const gitignorePath = path.join(workspaceRoot, ".gitignore");

  const stat = await safeStat(gitignorePath);
  if (!stat) {
    return {
      found: false,
      patterns: []
    };
  }

  const readRes = await readFile(gitignorePath);
  if (!readRes.ok) {
    return {
      found: true,
      patterns: []
    };
  }

  const raw = readRes.content || "";
  const lines = raw
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean); // remove empty lines

  return {
    found: true,
    patterns: lines
  };
}

module.exports = loadGitignore;