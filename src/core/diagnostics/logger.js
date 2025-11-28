// NOTE:
// `module` is a logical diagnostic tag (e.g., "ReversePipeline", "FileScanner"),
// NOT a filesystem path. File paths must be passed via diagnostics context objects.

const vscode = require("vscode");

let currentLevel = "info";
let outputChannel = vscode.window.createOutputChannel("SGMTR Debug");

const LEVEL_PRIORITY = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4
};

function shouldLog(level) {
  const currentPriority = LEVEL_PRIORITY[currentLevel];
  const targetPriority = LEVEL_PRIORITY[level];
  if (currentPriority == null || targetPriority == null) {
    return false;
  }
  return targetPriority <= currentPriority;
}

function logCreate(level) {
  return (moduleTag, message, data = {}) => {
    if (moduleTag && (moduleTag.includes("/") || moduleTag.includes("\\"))) {
      console.warn("[SGMTR] Logger module tag looks like a file path:", moduleTag);
    }

    if (!shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${moduleTag}] ${message}`;

    outputChannel.appendLine(logEntry);
    if (data && Object.keys(data).length) {
      outputChannel.appendLine(JSON.stringify(data, null, 2));
    }

    if (process.env.NODE_ENV === "development") {
      console[level === "error" ? "error" : "log"](logEntry, data);
    }
  };
}

function setLevel(level) {
  if (!LEVEL_PRIORITY.hasOwnProperty(level)) {
    console.warn("[SGMTR] Invalid log level:", level);
    return;
  }
  currentLevel = level;
}

const logger = {
  setLevel,
  error: logCreate("error"),
  warn: logCreate("warn"),
  info: logCreate("info"),
  debug: logCreate("debug"),
};

module.exports = {
  logger
};
