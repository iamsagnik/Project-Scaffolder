const logger = require("../../diagnostics/logger");
const warnings = require("../../diagnostics/warningsCollector");
const { createSuccessResponse, recordSuccessEvents } = require("../../diagnostics/successHandler");


function validateBlock(block, label) {
  const errors = [];

  if (!block || !Array.isArray(block.nodes) || !Array.isArray(block.edges)) {
    errors.push(`${label}: Missing nodes or edges array`);
    return errors;
  }

  const nodeIds = new Set(block.nodes.map(n => n.id));

  // Edge endpoint validation
  for (const e of block.edges) {
    if (!nodeIds.has(e.from)) {
      errors.push(`${label}: Edge has invalid 'from': ${e.from}`);
    }
    if (!nodeIds.has(e.to)) {
      errors.push(`${label}: Edge has invalid 'to': ${e.to}`);
    }
  }

  // Orphan node detection (node with no edges in or out)
  const connected = new Set();
  for (const e of block.edges) {
    connected.add(e.from);
    connected.add(e.to);
  }

  for (const n of block.nodes) {
    if (!connected.has(n.id) && block.nodes.length > 1) {
      errors.push(`${label}: Orphan node detected: ${n.id}`);
    }
  }

  // Empty block is not an error — UI will handle it

  return errors;
}

async function validateGraph(graph, filePath) {
  const errors = [];

  if (!graph || typeof graph !== "object") {
    const msg = "Graph is null or not an object";
    warnings.recordWarning(
      warnings.createWarningResponse(
        "flowGraphValidator",
        "INVALID_GRAPH",
        msg,
        { filePath, severity: "warn" }
      )
    );
    return { ok: false, errors: [msg] };
  }

  // Validate functions
  if (Array.isArray(graph.functions)) {
    for (const fn of graph.functions) {
      const label = `Function '${fn.name}'`;
      const blockErrors = validateBlock(fn, label);
      errors.push(...blockErrors);
    }
  } else {
    errors.push("Graph: Missing functions array");
  }

  // Validate top-level
  if (graph.topLevel) {
    const blockErrors = validateBlock(graph.topLevel, "TopLevel");
    errors.push(...blockErrors);
  } else {
    errors.push("Graph: Missing topLevel block");
  }

  if (errors.length > 0) {
    warnings.recordWarning(
      warnings.createWarningResponse(
        "flowGraphValidator",
        "VALIDATION_FAILED",
        "Flow graph validation failed",
        { filePath, severity: "warn", meta: errors }
      )
    );

    logger.warn("flowGraphValidator", "Validation errors detected", {
      filePath,
      count: errors.length
    });

    return { ok: false, errors };
  }

  recordSuccessEvents(
    createSuccessResponse(
      "flowGraphValidator",
      "VALIDATION_OK",
      "Flow graph validated successfully",
      { filePath }
    )
  );

  logger.debug("flowGraphValidator", "Graph validated successfully", { filePath });

  return { ok: true };
}

module.exports = validateGraph;
