const { writeFile } = require("../../utils/fsUtils");

async function writeSgmtrIgnore(targetPath, patterns) {
  const content = patterns.join("\n") + "\n";
  await writeFile(targetPath, content);
}

module.exports = writeSgmtrIgnore;