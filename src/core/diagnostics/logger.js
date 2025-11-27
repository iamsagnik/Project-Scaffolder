// NOTE:
// `module` is a logical diagnostic tag (e.g., "ReversePipeline", "FileScanner"),
// NOT a filesystem path. File paths must be passed via diagnostics context objects.

const vscode = require("vscode");

let currentLevel = "warn";
let debugChannel = vscode.window.createOutputChannel("SGMTR Debug");

const LEVEL_PRIORITY = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4
};

function shouldLog(level) {
  return LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[currentLevel];
}

function logCreate(level) {
  return (module, message, data = {}) => {
    if (module?.includes?.("/") || module?.includes?.("\\")) {
      console.warn("[SGMTR] Logger module tag looks like a file path:", module);
    }

    if (!shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`;

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
  currentLevel = level;
}

function error(message, data, module) {
  logCreate("error", message, data, module);
}

function warn(message, data, module) {
  logCreate("warn", message, data, module);
}

function info(message, data, module) {
  logCreate("info", message, data, module);
}

function debug(message, data, module) {
  logCreate("debug", message, data, module);
}

module.exports = {
  setLevel,
  error,
  warn,
  info,
  debug
};
