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

function logCreate(level, message, data = null, module = "unknown") {
  if (!shouldLog(level)) return;

  const payload = {
    level,
    message,
    data,
    module,
    timestamp: new Date().toISOString()
  };

  const formatted = `[${payload.timestamp}] [${level.toUpperCase()}] [${module}] ${message}`;

  debugChannel.appendLine(formatted);

  if (process.env.NODE_ENV === "development") {
    console[level === "error" ? "error" : "log"](formatted, data || "");
  }
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
