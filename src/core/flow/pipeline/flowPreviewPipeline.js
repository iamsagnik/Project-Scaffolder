const logger = require("../../diagnostics/logger");
const { normalizeErrorResponse } = require("../../diagnostics/errorHandler");
const stats = require("../../diagnostics/statsCollector");
const warnings = require("../../diagnostics/warningsCollector");
const { createSuccessResponse, recordSuccessEvents } = require("../../diagnostics/successHandler");

const parserEngine = require("../parserEngine");
const parseCPP = require("../parsers/cppParser");
const parseJava = require("../parsers/javaParser");
const parseJS = require("../parsers/jsParser");
const parsePython = require("../parsers/pythonParser");

const cfgBuilder = require("../cfgBuilder");
const validateFlowGraph = require("../flowGraphValidator");

async function flowPreviewPipeline(source, filePath) {

  const ext = (filePath.split(".").pop() || "").toLowerCase();
  const ctx = { module: "flowPreviewPipeline", filePath };

  logger.info("flowPreviewPipeline", "Starting preview pipeline", { filePath });

  stats.startPhase("parsing");
  const parsed = await parserEngine.parseSourceByExt( ext, source);
  if (!parsed.ok) {
    stats.endPhase("parsing");

    const errObj = normalizeErrorResponse(parsed.error, ctx);
    warnings.recordWarning(
      warnings.createWarningResponse(
        "flowPreviewPipeline",
        "PARSE_FAILED",
        errObj.message,
        { filePath, severity: "warn" }
      )
    );

    return { ok: false, error: errObj };
  }

  const tree = parsed.tree;
  stats.endPhase("parsing");

  stats.startPhase("ir");
  let ast;

  try {
    switch (ext) {
      case "cpp":
      case "cc":
      case "hpp":
        ast = parseCPP(tree, source, filePath);
        break;
      case "java":
        ast = parseJava(tree, source, filePath);
        break;
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        ast = parseJS(tree, source, filePath);
        break;
      case "py":
        ast = parsePython(tree, source, filePath);
        break;
      default:
        stats.endPhase("ir");

        const w = warnings.createWarningResponse(
          "flowPreviewPipeline",
          "UNSUPPORTED_EXT",
          `Unsupported file extension: ${ext}`,
          { filePath, severity: "warn" }
        );
        warnings.recordWarning(w);

        return { ok: false, error: w };
    }
  } catch (err) {
    stats.endPhase("ir");
    const structured = normalizeErrorResponse(err, ctx);
    return { ok: false, error: structured };
  }
  stats.endPhase("ir");

  stats.startPhase("cfg");
  const cfgResult = cfgBuilder(ast, filePath);
  if (!cfgResult.ok) {
    stats.endPhase("cfg");
    return { ok: false, error: cfgResult.error };
  }
  const graph = cfgResult.value;
  stats.endPhase("cfg");   

  stats.startPhase("validation");

  const validation = await validateFlowGraph(graph, filePath);
  stats.endPhase("validation");

  if (!validation.ok) {
    const vWarn = warnings.createWarningResponse(
      "flowPreviewPipeline",
      "VALIDATION_FAILED",
      "Flow graph validation failed",
      { filePath, severity: "warn", meta: validation.errors }
    );
    warnings.recordWarning(vWarn);

    return {
      ok: false,
      error: vWarn,
      graph
    };
  }

  const success = createSuccessResponse(
    "flowPreviewPipeline",
    "GRAPH_BUILT",
    "Flow preview graph generated successfully",
    { filePath }
  );

  recordSuccessEvents(success);

  logger.info(
    "flowPreviewPipeline",
    "Pipeline completed successfully",
    { filePath }
  );

  return {
    ok: true,
    graph
  };
};

module.exports = flowPreviewPipeline;