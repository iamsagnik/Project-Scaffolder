const Parser = require("web-tree-sitter");
const logger = require("../../diagnostics/logger");
const warnings = require("../../diagnostics/warningsCollector");

let initialized = false;

const LANGUAGE_PATHS = {
  "java": "assets/tree-sitter/java.wasm",
  "cpp": "assets/tree-sitter/cpp.wasm",
  "c": "assets/tree-sitter/cpp.wasm",
  "cc": "assets/tree-sitter/cpp.wasm",
  "cxx": "assets/tree-sitter/cpp.wasm",
  "js": "assets/tree-sitter/javascript.wasm",
  "jsx": "assets/tree-sitter/javascript.wasm",
  "ts": "assets/tree-sitter/javascript.wasm",
  "tsx": "assets/tree-sitter/javascript.wasm",
  "py": "assets/tree-sitter/python.wasm"
};

const PARSERS = {};
const LANGUAGES = {};

async function init(context) {
  if (initialized) return;

  await Parser.init();

  for (const [ext, relPath] of Object.entries(LANGUAGE_PATHS)) {
    const absPath = context.asAbsolutePath(relPath);

    try {
      const lang = await Parser.Language.load(absPath);
      LANGUAGES[ext] = lang;

      const parser = new Parser();
      parser.setLanguage(lang);
      PARSERS[ext] = parser;

      logger.info("parserEngine", `Loaded language for ${ext}`, { wasm: relPath });

    } catch (err) {
      const errObj = normalizeErrorResponse(err, { module: "parserEngine" });

      warnings.recordWarning(
        warnings.createWarningResponse(
          "parserEngine",
          "LANGUAGE_LOAD_FAILED",
          errObj.message,
          { severity: "warn", meta: { ext, relPath } }
        )
      );

      logger.error("parserEngine", "Failed to load language", {
        ext,
        wasm: relPath,
        error: err?.message
      });
    }
  }

  initialized = true;
}

async function parseSourceByExt(ext, sourceText) {
  if (!initialized) {
    const warn = warnings.createWarningResponse(
      "parserEngine",
      "NOT_INITIALIZED",
      "ParserEngine not initialized",
      { severity: "error" }
    );
    warnings.recordWarning(warn);
    return { ok: false, error: warn };
  }

  const parser = PARSERS[ext];
  if (!parser) {
    const warn = warnings.createWarningResponse(
      "parserEngine",
      "UNSUPPORTED_EXTENSION",
      `Unsupported extension: ${ext}`,
      { severity: "warn" }
    );
    warnings.recordWarning(warn);
    return { ok: false, error: warn };
  }

  try {
    const tree = parser.parse(sourceText);
    return { ok: true, tree };
  } catch (err) {
    logger.error("parserEngine", "Parse failure", { ext, err: err.message });
    return { ok: false, error: { message: "Parse failed", detail: err.message } };
  }
}

module.exports = {
  init,
  parseSourceByExt
};
