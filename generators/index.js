const vscode = require("vscode");
const path = require("path");


function toPathParts(generatorStr) {
  if (!generatorStr || typeof generatorStr !== "string") return [];
  return generatorStr
    .split(".")
    .join("/")
    .split("/")
    .filter(Boolean);
}

const GENERATORS_ROOT = __dirname;

function loadGeneratorModule(generatorStr) {
  const parts = toPathParts(generatorStr);
  if (!parts.length) {
    const e = new Error(`Invalid generator name: "${generatorStr}"`);
    e.code = "GENERATOR_INVALID_NAME";
    throw e;
  }

  const tryPaths = [];

  // Try: generators/<a>/<b>/<c>.js
  const directPath = path.join(GENERATORS_ROOT, ...parts) + ".js";
  tryPaths.push(directPath);
  try {
    return { module: require(directPath), modulePath: directPath };
  } catch (_) {}

  // Try: generators/<a>/<b>/<c>/index.js
  const indexPath = path.join(GENERATORS_ROOT, ...parts, "index.js");
  tryPaths.push(indexPath);
  try {
    return { module: require(indexPath), modulePath: indexPath };
  } catch (_) {}

  const err = new Error(
    `Generator "${generatorStr}" not found. Tried:\n` +
      tryPaths.map(p => ` - ${p}`).join("\n")
  );
  err.code = "GENERATOR_NOT_FOUND";
  throw err;
}


function inspectGeneratorExport(exp) {
  if (typeof exp === "function") {
    return { kind: "function" };
  }

  if (exp && typeof exp === "object") {
    const variantKeys = Object.keys(exp).filter(
      k => typeof exp[k] === "function"
    );
    if (variantKeys.length > 0) {
      return { kind: "variantMap", variants: variantKeys };
    }
  }

  return { kind: "unknown" };
}


// Normalizes generator output.
// Only valid form:
// { type: "single", content: string, meta?: object }
function normalizeGeneratorResult(result, originMeta = {}) {
  if (!result || typeof result !== "object") {
    const e = new Error("Generator must return an object.");
    e.code = "GEN_RESULT_INVALID";
    throw e;
  }

  if (result.type !== "single") {
    const e = new Error(
      `Generator returned non-single type. Only {type: "single"} is allowed under current architecture.`
    );
    e.code = "GEN_RESULT_NOT_SINGLE";
    throw e;
  }

  if (typeof result.content !== "string") {
    const e = new Error("Generator single result must contain string 'content'.");
    e.code = "GEN_RESULT_CONTENT_INVALID";
    throw e;
  }

  return {
    type: "single",
    content: result.content,
    meta: { ...originMeta, ...(result.meta || {}) }
  };
}


async function resolveGenerator(ctx = {}) {
  const {
    generator,
    variant = "default",
    standard = null,
    options = {},
    pathSegments = [],
    workspaceContext = {}
  } = ctx;

  if (!generator || typeof generator !== "string") {
    const e = new Error("resolveGenerator: missing valid 'generator' field.");
    e.code = "GENERATOR_INVALID";
    throw e;
  }

  // Load module
  const { module: genModule } = loadGeneratorModule(generator);

  // Inspect export type
  const info = inspectGeneratorExport(genModule);

  // Build the context for generator function
  const genCtx = {
    variant,
    standard,
    options,
    pathSegments,
    workspaceContext
  };

  try {
    let rawResult;

    if (info.kind === "function") {
      rawResult = await genModule(genCtx);

    } else if (info.kind === "variantMap") {
      const key = variant.trim() || "default";
      const impl = genModule[key];

      if (typeof impl !== "function") {
        const e = new Error(
          `Variant "${key}" not found in generator "${generator}".`
        );
        e.code = "VARIANT_NOT_FOUND";
        throw e;
      }
      rawResult = await impl(genCtx);

    } else {
      const e = new Error(
        `Generator "${generator}" has invalid export format (must be function or variant map).`
      );
      e.code = "GENERATOR_SHAPE_INVALID";
      throw e;
    }

    // Enforce single-file rule
    return normalizeGeneratorResult(rawResult, {
      generator,
      variant,
      standard
    });

  } catch (err) {
    // annotate for upstream diagnostics
    err.generator = generator;
    err.variant = variant;
    throw err;
  }
}


function getGeneratorInfo(generatorStr) {
  const { module: exp } = loadGeneratorModule(generatorStr);
  const info = inspectGeneratorExport(exp);

  if (info.kind === "variantMap") {
    return {
      exists: true,
      kind: "variantMap",
      variants: info.variants
    };
  }

  if (info.kind === "function") {
    return {
      exists: true,
      kind: "function"
    };
  }

  return {
    exists: false,
    kind: "unknown"
  };
}

module.exports = {
  resolveGenerator,
  getGeneratorInfo
};