const path = require("path");
const Ajv = require("ajv");

const { readFile } = require("../../src/core/utils/fsUtils");

const ajv = new Ajv({ allErrors: true });

let validateFn = null;

async function loadSchema() {
  if (validateFn) return validateFn;

  const schemaPath = path.join(__dirname, "template-header.schema.json");
  const res = await readFile(schemaPath);

  if (!res.ok) {
    return {
      ok: false,
      error: {
        type: "SCHEMA_LOAD_FAILED",
        message: "Failed to read template-header.schema.json"
      }
    };
  }

  let schema;
  try {
    schema = JSON.parse(res.content);
  } catch (err) {
    return {
      ok: false,
      error: {
        type: "SCHEMA_PARSE_FAILED",
        message: "Invalid JSON in template-header.schema.json",
        meta: { stack: err?.stack }
      }
    };
  }

  validateFn = ajv.compile(schema);
  return validateFn;
}


async function validateTemplateHeader(templateMeta) {
  const validator = await loadSchema();

  if (!validator || typeof validator !== "function") {
    return {
      ok: false,
      error: {
        type: "SCHEMA_INIT_FAILED",
        message: "Template header validator could not be initialized"
      }
    };
  }

  const valid = validator(templateMeta);

  if (!valid) {
    return {
      ok: false,
      error: {
        type: "SCHEMA_VALIDATION_ERROR",
        message: "Template header schema validation failed",
        details: validator.errors
      }
    };
  }

  if (!templateMeta?.id || typeof templateMeta.id !== "string") {
    return {
      ok: false,
      error: {
        type: "SEMANTIC_VALIDATION_ERROR",
        message: "templateMeta.id must be a non-empty string"
      }
    };
  }

  if (!templateMeta?.name || typeof templateMeta.name !== "string") {
    return {
      ok: false,
      error: {
        type: "SEMANTIC_VALIDATION_ERROR",
        message: "templateMeta.name must be a non-empty string"
      }
    };
  }

  if (!templateMeta?.description || typeof templateMeta.description !== "string") {
    return {
      ok: false,
      error: {
        type: "SEMANTIC_VALIDATION_ERROR",
        message: "templateMeta.description must be a non-empty string"
      }
    };
  }

  return { ok: true };
}

module.exports = validateTemplateHeader;