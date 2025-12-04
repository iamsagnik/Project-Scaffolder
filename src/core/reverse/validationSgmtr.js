const vscode = require("vscode");
const path = require("path");
const Ajv = require("ajv");

const logger = require("../diagnostics/logger");
const { throwError } = require("../diagnostics/errorHandler");

const ajv = new Ajv({ allErrors: true, strict: false });

function getDefaultSchemaUri() {
  try {
    const ext = vscode.extensions.getExtension("sagnikMitra12.project-scaffolder");

    if (ext && ext.extensionUri) {
      return vscode.Uri.joinPath(
        ext.extensionUri,
        "schema",
        "sgmtr-schema-rev.json"
      );
    }
  } catch {}

  return vscode.Uri.file(
    path.join(__dirname, "../../../../schema/sgmtr-schema-rev.json")
  );
}

async function validateSgmtr(sgmtrObject, schemaUriOverride = null) {
  const schemaUri = schemaUriOverride || getDefaultSchemaUri();

  let schemaBytes;
  try {
    schemaBytes = await vscode.workspace.fs.readFile(schemaUri);
  } catch (err) {
    console.log(
      "SCHEMA ERRORS:",
      JSON.stringify(validateFn.errors, null, 2)
    );

    throwError({
      code: "SCHEMA_READ_FAILED",
      message: "Failed to read schema",
      severity: "critical",
      filePath: schemaUri.fsPath,
      module: "validateSgmtr",
      stack: err?.stack
    });
    return { ok: false, error: "SCHEMA_READ_FAILED" };
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
    return { ok: false, error: "SCHEMA_PARSE_FAILED" };
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
    return { ok: false, error: "SCHEMA_COMPILE_FAILED" };
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
    return {
      ok: false,
      error: "SCHEMA_VALIDATION_FAILED",
      details: validateFn.errors
    };
  }

  logger.info("validateSgmtr", "SGMTR schema validation passed");

  return { ok: true };
}

module.exports = validateSgmtr;
