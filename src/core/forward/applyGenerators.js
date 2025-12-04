const logger = require("../diagnostics/logger");
const generatorsRegistry = require("../../../snippets");

function applyGenerators(rawTree) {
  logger.debug("applyGenerators", "Generator resolution started", {});

  function walk(node, pathSegments) {
    if (node === null) {
      return {
        __type: "file",
        content: "",
        meta: {}
      };
    }

    const hasMeta = Object.prototype.hasOwnProperty.call(node, "$meta");

    if (hasMeta) {
      const meta = node.$meta;
      const generatorName = meta.generator.trim();
      const variant =
        typeof meta.variant === "string" && meta.variant.trim()
          ? meta.variant.trim()
          : "default";

      const family = generatorsRegistry[generatorName];
      const generatorFn = family[variant];

      let content = "";
      try {
        content = generatorFn(meta.options || {});
      } catch (err) {
        logger.error("applyGenerators", "Generator execution failed", {
          generator: generatorName,
          variant,
          path: pathSegments.join("/"),
          stack: err?.stack
        });

        content = "";
      }

      return {
        __type: "file",
        content,
        meta: {
          generator: generatorName,
          variant,
          options: meta.options || {},
          overwrite: meta.overwrite === true,
          encoding: meta.encoding || "utf8",
          permissions: meta.permissions || null,
          standard: meta.standard || null
        }
      };
    }

    const out = {};
    for (const [key, child] of Object.entries(node)) {
      out[key] = walk(child, pathSegments.concat(key));
    }

    return out;
  }

  const generatedTree = walk(rawTree, []);

  logger.debug("applyGenerators", "Generator resolution completed", {});
  return generatedTree;
}


module.exports = applyGenerators;