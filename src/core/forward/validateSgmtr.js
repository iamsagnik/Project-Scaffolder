const logger = require("../diagnostics/logger")
const generatorsRegistry = require("../../../snippets")


async function validateSgmtr(rawTree, context = {}) {
  const errors = [];
  const moduleName = "validateSgmtr";

  logger.debug(moduleName, "Semantic validation started", {
    filePath: context.filePath
  });

  if (rawTree === null || typeof rawTree !== "object" || Array.isArray(rawTree)) {
    errors.push(
      makeError("ROOT_NOT_OBJECT",
        "SGMTR root must be a single object.",
        context,
        ""
      )
    );

    logger.error(moduleName, "Root is not a valid object", {
      filePath: context.filePath
    });

    return { ok: false, errors };
  }

  const rootEntries = Object.entries(rawTree);
  for (const [key, value] of rootEntries) {
    validateNode({
      key,
      node: value,
      pathSegments: [key],
      context,
      errors
    });
  }

  const ok = errors.length === 0;

  if (!ok) {
    logger.error(moduleName, "Semantic validation failed", {
      filePath: context.filePath,
      errorCount: errors.length
    });
    return { ok: false, errors };
  }

  logger.debug(moduleName, "Semantic validation passed", {
    filePath: context.filePath
  });

  return { ok: true };
}

function validateNode({ key, node, pathSegments, context, errors }) {
  const path = pathSegmentsToString(pathSegments);
  const moduleName = "validateSgmtr";

  // Empty file: "index.js": null
  if (node === null) {
    // No extra semantics for empty files in V1
    return;
  }

  const nodeType = typeof node;

  // Folder or generated file must be a non-null object
  if (nodeType !== "object" || Array.isArray(node)) {
    errors.push(
      makeError(
        "INVALID_NODE_TYPE",
        `Node at "${path}" must be either null (empty file) or an object.`,
        context,
        path
      )
    );
    return;
  }

  const keys = Object.keys(node);
  const hasMeta = Object.prototype.hasOwnProperty.call(node, "$meta");

  // ---------- FILE WITH $meta ----------
  if (hasMeta) {
    // Mixed $meta + children is forbidden
    if (keys.length > 1) {
      errors.push(
        makeError(
          "MIXED_FILE_AND_CHILDREN",
          `Node at "${path}" has "$meta" and additional properties. A generated file node must only contain "$meta".`,
          context,
          path
        )
      );
      return;
    }

    const meta = node.$meta;

    // $meta must be an object
    if (meta === null || typeof meta !== "object" || Array.isArray(meta)) {
      errors.push(
        makeError(
          "META_NOT_OBJECT",
          `"$meta" at "${path}" must be a non-null object.`,
          context,
          path
        )
      );
      return;
    }

    validateMeta({ meta, path, context, errors });
    validateGeneratorResolution({ meta, path, context, errors });
    return;
  }

  for (const [childKey, childValue] of Object.entries(node)) {
    const childPathSegments = pathSegments.concat(childKey);
    validateNode({
      key: childKey,
      node: childValue,
      pathSegments: childPathSegments,
      context,
      errors
    });
  }
}

function validateMeta({ meta, path, context, errors }) {
  // generator (required, string)
  if (typeof meta.generator !== "string" || !meta.generator.trim()) {
    errors.push(
      makeError(
        "GENERATOR_MISSING",
        `"$meta.generator" at "${path}" must be a non-empty string.`,
        context,
        path
      )
    );
  }

  // variant (optional, string)
  if (
    Object.prototype.hasOwnProperty.call(meta, "variant") &&
    (typeof meta.variant !== "string" || !meta.variant.trim())
  ) {
    errors.push(
      makeError(
        "VARIANT_INVALID",
        `"$meta.variant" at "${path}" must be a non-empty string when provided.`,
        context,
        path
      )
    );
  }

  // options (optional, object)
  if (
    Object.prototype.hasOwnProperty.call(meta, "options") &&
    (meta.options === null || typeof meta.options !== "object" || Array.isArray(meta.options))
  ) {
    errors.push(
      makeError(
        "OPTIONS_NOT_OBJECT",
        `"$meta.options" at "${path}" must be an object when provided.`,
        context,
        path
      )
    );
  }

  // standard (optional, string)
  if (
    Object.prototype.hasOwnProperty.call(meta, "standard") &&
    (typeof meta.standard !== "string" || !meta.standard.trim())
  ) {
    errors.push(
      makeError(
        "STANDARD_INVALID",
        `"$meta.standard" at "${path}" must be a non-empty string when provided.`,
        context,
        path
      )
    );
  }

  // overwrite (optional, boolean)
  if (
    Object.prototype.hasOwnProperty.call(meta, "overwrite") &&
    typeof meta.overwrite !== "boolean"
  ) {
    errors.push(
      makeError(
        "OVERWRITE_NOT_BOOLEAN",
        `"$meta.overwrite" at "${path}" must be a boolean when provided.`,
        context,
        path
      )
    );
  }

  // encoding (optional, string)
  if (
    Object.prototype.hasOwnProperty.call(meta, "encoding") &&
    (typeof meta.encoding !== "string" || !meta.encoding.trim())
  ) {
    errors.push(
      makeError(
        "ENCODING_INVALID",
        `"$meta.encoding" at "${path}" must be a non-empty string when provided.`,
        context,
        path
      )
    );
  }

  // permissions (optional, string)
  if (
    Object.prototype.hasOwnProperty.call(meta, "permissions") &&
    (typeof meta.permissions !== "string" || !meta.permissions.trim())
  ) {
    errors.push(
      makeError(
        "PERMISSIONS_INVALID",
        `"$meta.permissions" at "${path}" must be a non-empty string when provided.`,
        context,
        path
      )
    );
  }
}


function validateGeneratorResolution({ meta, path, context, errors }) {
  const generatorName = typeof meta.generator === "string" ? meta.generator.trim() : null;
  if (!generatorName) {
    // Already reported by validateMeta; no need to duplicate.
    return;
  }

  const family = generatorsRegistry[generatorName];
  if (!family || typeof family !== "object") {
    errors.push(
      makeError(
        "GENERATOR_UNKNOWN",
        `"$meta.generator" at "${path}" references unknown generator family "${generatorName}".`,
        context,
        path
      )
    );
    return;
  }

  const variantKey =
    typeof meta.variant === "string" && meta.variant.trim()
      ? meta.variant.trim()
      : "default";

  const variantImpl = family[variantKey];
  if (typeof variantImpl !== "function") {
    errors.push(
      makeError(
        "VARIANT_UNKNOWN",
        `"$meta.variant" at "${path}" references unknown or non-function variant "${variantKey}" in generator "${generatorName}".`,
        context,
        path
      )
    );
  }
}


function makeError(code, message, context, path) {
  return {
    status: "error",
    type: "semantic",
    code,
    message,
    severity: "error",
    filePath: context.filePath || null,
    module: "validateSgmtr",
    path,
    timestamp: new Date().toISOString()
  };
}

function pathSegmentsToString(segments) {
  if (!segments || !segments.length) return "";
  return segments.join("/");
}

module.exports = validateSgmtr;