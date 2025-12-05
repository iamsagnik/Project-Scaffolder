const vscode = require("vscode");
const path = require("path");

const logger = require("../diagnostics/logger");
const { throwError } = require("../diagnostics/errorHandler");

const BUILTIN_TEMPLATES_DIR = path.join(
  __dirname,
  "../../../templates"
);

const USER_TEMPLATES_REL_PATH = ".sgmtr/templates";


async function loadTemplates(workspaceRoot) {

  const registry = new Map();

  try {
    const builtinUri = vscode.Uri.file(BUILTIN_TEMPLATES_DIR);
    const builtinEntries = await vscode.workspace.fs.readDirectory(builtinUri);

    for (const [name, type] of builtinEntries) {
      if (type !== vscode.FileType.File) continue;
      if (!name.endsWith(".template.json")) continue;

      const fileUri = vscode.Uri.file(
        path.join(BUILTIN_TEMPLATES_DIR, name)
      );

      const data = await vscode.workspace.fs.readFile(fileUri);
      const parsed = JSON.parse(Buffer.from(data).toString("utf8"));

      if (!parsed?.templateMeta?.id) {
        logger.warn("templateLoader", "Built-in template missing id", {
          file: name
        });
        continue;
      }

      registry.set(parsed.templateMeta.id, parsed);
    }

  } catch (err) {
    throwError({
      code: "BUILTIN_TEMPLATE_LOAD_FAILED",
      message: "Failed to load built-in templates",
      severity: "critical",
      module: "templateLoader",
      stack: err?.stack
    });
  }

  if (workspaceRoot) {
    const userDir = path.join(workspaceRoot, USER_TEMPLATES_REL_PATH);

    try {
      const userUri = vscode.Uri.file(userDir);
      const stat = await vscode.workspace.fs.stat(userUri);

      if (stat.type === vscode.FileType.Directory) {
        const userEntries = await vscode.workspace.fs.readDirectory(userUri);

        for (const [name, type] of userEntries) {
          if (type !== vscode.FileType.File) continue;
          if (!name.endsWith(".template.json")) continue;

          const fileUri = vscode.Uri.file(path.join(userDir, name));
          const data = await vscode.workspace.fs.readFile(fileUri);
          const parsed = JSON.parse(Buffer.from(data).toString("utf8"));

          if (!parsed?.templateMeta?.id) {
            logger.warn("templateLoader", "User template missing id", {
              file: name
            });
            continue;
          }

          registry.set(parsed.templateMeta.id, parsed);
        }
      }
    } catch {
      logger.info("templateLoader", "No user templates folder found");
    }
  }

  logger.info("templateLoader", "Templates loaded", {
    count: registry.size
  });

  return registry;
}

module.exports = loadTemplates;