const js = require("./javascriptParser");

function parse(content) {
  return js.parse(content);
}

module.exports = {
  parse
};