const vscode = require("vscode");
const logger = require("../diagnostics/logger");

async function pickTemplate(registry) {
  if (!(registry instanceof Map) || registry.size === 0) {
    vscode.window.showWarningMessage("No templates available.");
    return null;
  }

  const items = Array.from(registry.values()).map(t => ({
    label: t.templateMeta.name,
    description: t.templateMeta.description || "",
    detail: t.templateMeta.id,
    _id: t.templateMeta.id
  }));

  const picked = await vscode.window.showQuickPick(items, {
    placeHolder: "Select an SGMTR template"
  });

  if (!picked) {
    logger.info("templatePicker", "Template selection cancelled by user");
    return null;
  }

  const pickedTemplateId = picked._id;

  logger.info("templatePicker", "Template selected", {
    templateId: pickedTemplateId
  });

  return pickedTemplateId;
}

module.exports = pickTemplate;