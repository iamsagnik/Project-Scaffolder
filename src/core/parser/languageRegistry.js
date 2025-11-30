const js = require("./languages/javascriptParser");
const ts = require("./languages/typescriptParser");
const py = require("./languages/pythonParser");
const cpp = require("./languages/cppParser");
const java = require("./languages/javaParser");
const base = require("./languages/baseParser");

const logger = require("../diagnostics/logger");
const warnings = require("../diagnostics/warningsCollector");

const registry = {
  javascript: js,
  typescript: ts,
  python: py,
  cpp: cpp,
  java: java,
  unknown: base
};

function getParser(lang) {
  if (!lang || !registry[lang]) {
    warnings.recordWarning(
      warnings.createWarningResponse(
        "languageRegistry",
        "PARSER_NOT_FOUND",
        "No parser registered for detected language, falling back to base",
        {
          severity: "info",
          filePath: null,
          meta: { lang }
        }
      )
    );

    logger.debug("languageRegistry", "Fallback to base parser", { lang });
    return base;
  }

  logger.debug("languageRegistry", "Parser resolved", { lang });
  return registry[lang];
}

module.exports = { getParser };