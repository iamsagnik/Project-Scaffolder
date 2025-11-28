const { extname } = require("./pathUtils");

const logger = require("../diagnostics/logger");
const warnings = require("../diagnostics/warningsCollector");

function detect(relPath, content) {
  const ext = extname(relPath);

  switch (ext) {
    case ".js":   return "javascript";
    case ".jsx":  return "javascript";
    case ".ts":   return "typescript";
    case ".tsx":  return "typescript";
    case ".py":   return "python";
    case ".json": return "json";
    case ".css":  return "css";
    case ".html": return "html";
    case ".md":   return "markdown";
    case ".cpp":  return "cpp";
    case ".c":    return "c";
    case ".java": return "java";
    default:
      if (typeof content === "string" && /import\s+|export\s+/g.test(content)) {
        return "javascript";
      }

      warnings.recordWarning({
        code: "UNKNOWN_LANGUAGE",
        message: "Unable to detect language from extension or content",
        severity: "info",
        filePath: relPath,
        module: "langDetector"
      });

      logger.debug("langDetector", "Unknown language detected", { relPath });

      return "unknown";
  }
}

module.exports = { detect };
