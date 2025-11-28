const vscode = require("vscode");
const path = require("path");
const Ajv = require("ajv");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const { throwError } = require("../diagnostics/errorHandler");

const ajv = new Ajv({ allErrors: true, strict: false });

function getDefaultSchemaUri() {
  try {
    const ext = vscode.extensions.all.find(e =>
      e.packageJSON?.name?.includes("sgmtr")
    );

    if (ext && ext.extensionUri) {
      return vscode.Uri.joinPath(
        ext.extensionUri,
        "schema",
        "sgmtr-schema.json"
      );
    }
  } catch {}

  return vscode.Uri.file(
    path.join(__dirname, "../../../schema/sgmtr-schema.json")
  );
}

async function validateSgmtr(sgmtrObject, schemaUriOverride = null) {
  const schemaUri = schemaUriOverride || getDefaultSchemaUri();

  let schemaBytes;
  try {
    schemaBytes = await vscode.workspace.fs.readFile(schemaUri);
  } catch (err) {
    throwError({
      code: "SCHEMA_READ_FAILED",
      message: "Failed to read schema",
      severity: "critical",
      filePath: schemaUri.fsPath,
      module: "validateSgmtr",
      stack: err?.stack
    });
  }

  let schema;
  try {
    schema = JSON.parse(Buffer.from(schemaBytes).toString("utf8"));
  } catch (err) {
    throwError({
      code: "SCHEMA_PARSE_FAILED",
      message: "Invalid JSON schema",
      severity: "critical",
      filePath: schemaUri.fsPath,
      module: "validateSgmtr",
      stack: err?.stack
    });
  }

  let validateFn;
  try {
    validateFn = ajv.compile(schema);
  } catch (err) {
    throwError({
      code: "SCHEMA_COMPILE_FAILED",
      message: "Schema compilation failed",
      severity: "critical",
      filePath: schemaUri.fsPath,
      module: "validateSgmtr",
      stack: err?.stack
    });
  }

  const valid = validateFn(sgmtrObject);

  if (!valid) {
    throwError({
      code: "SCHEMA_VALIDATION_FAILED",
      message: "SGMTR schema validation failed",
      severity: "error",
      filePath: null,
      module: "validateSgmtr",
      meta: validateFn.errors
    });
  }

  stats.increment("schemaValidations");

  logger.info("validateSgmtr", "SGMTR schema validation passed");

  return { ok: true };
}

module.exports = { validateSgmtr };
