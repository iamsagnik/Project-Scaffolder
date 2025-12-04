const Ajv = require("ajv");
const forwardSchema = require("../../../schema/sgmtr-schema-frwd.json");
const reverseSchema = require("../../../schema/sgmtr-schema-rev.json");

const ajv = new Ajv({ allErrors: true });

const validateForward = ajv.compile(forwardSchema);
const validateReverse = ajv.compile(reverseSchema);

function resolveSgmtrMode(rawTree) {
  if (!rawTree || typeof rawTree !== "object") return "unknown";

  let hasForward = false;
  let hasReverse = false;

  function walk(node) {
    if (node === null) {
      hasForward = true;
      return;
    }

    if (typeof node !== "object") return;

    if (
      node.$meta &&
      typeof node.$meta === "object" &&
      typeof node.$meta.generator === "string"
    ) {
      hasForward = true;
      return;
    }

    if (
      node.$meta &&
      typeof node.$meta === "object" &&
      typeof node.$meta.lang === "string" &&
      typeof node.$meta.size === "number"
    ) {
      hasReverse = true;
      return;
    }
    for (const key of Object.keys(node)) {
      walk(node[key]);
    }
  }

  walk(rawTree);

  if (hasForward && !hasReverse) return "forward";
  if (hasReverse && !hasForward) return "reverse";
  if (hasForward && hasReverse) return "conflict";

  return "unknown";
}



async function validateForPreview(rawTree) {
  const mode = resolveSgmtrMode(rawTree);

  if (mode === "forward") {
    const ok = validateForward(rawTree);
    return {
      ok,
      mode,
      errors: ok ? null : validateForward.errors
    };
  }

  if (mode === "reverse") {
    const ok = validateReverse(rawTree);
    return {
      ok,
      mode,
      errors: ok ? null : validateReverse.errors
    };
  }

  return {
    ok: false,
    mode: "unknown",
    errors: [
      { message: "Unable to determine whether this is Forward or Reverse SGMTR." }
    ]
  };
}

module.exports = validateForPreview;
