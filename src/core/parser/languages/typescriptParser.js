const js = require("./javascriptParser");

function parseContent(content) {
  return js.parseContent(content);
}

module.exports = parseContent;