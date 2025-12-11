const logger = require("../diagnostics/logger");
const warnings = require("../diagnostics/warningsCollector");
const { createSuccessResponse, recordSuccessEvents } = require("../diagnostics/successHandler");


function makeIdGenerator(fnName) {
  let counter = 1;
  return () => `${fnName}_N${counter++}`;
}

function newNode(idGen, type, code, range = null) {
  return {
    id: idGen(),
    type,
    code,
    range
  };
}

function cloneNodeFromIR(stmt, idGen) {
  return {
    id: idGen(),
    type: stmt.type,
    code: stmt.code,
    range: stmt.range || null
  };
}


  // MAIN ENTRY POINT


function cfgBuilder(ast, filePath) {

  if (!ast || typeof ast !== "object") {
    const w = warnings.createWarningResponse(
      "cfgBuilder",
      "INVALID_AST",
      "AST is missing or not an object",
      { filePath, severity: "warn" }
    );
    warnings.recordWarning(w);
    return { ok: false, error: w };
  }

  const out = { functions: [], topLevel: null };

  // Build CFG for each function
  for (const fn of ast.functions || []) {
    const fnCFG = buildCFGForFunction(fn);
    out.functions.push(fnCFG);
  }

  // Top-level code
  if (ast.topLevel) {
    const fakeFn = { name: "top", fullName: "top", body: ast.topLevel };
    out.topLevel = buildCFGForFunction(fakeFn);
  }

  const success = createSuccessResponse(
    "cfgBuilder",
    "CFG_BUILD_SUCCESS",
    `Built CFG for ${out.functions.length} functions`,
    { filePath }
  );
  recordSuccessEvents(success);

  logger.debug("cfgBuilder", "CFG construction complete", {
    filePath,
    functions: out.functions.length
  });

  return { ok: true, value: out };
}


  // FUNCTION GRAPH BUILDER
function buildCFGForFunction(fn) {
  const { fullName, body } = fn;

  const idGen = makeIdGenerator(fullName);
  const nodes = [];
  const edges = [];

  // Entry and exit nodes
  const entry = newNode(idGen, "entry", `${fullName} (entry)`);
  const exit = newNode(idGen, "exit", `${fullName} (exit)`);

  nodes.push(entry, exit);

  const last = buildBlock(body || [], entry.id, exit.id, nodes, edges, idGen);

  // If function doesn't end in a return, connect to exit
  if (last !== exit.id) {
    edges.push({ from: last, to: exit.id });
  }

  return {
    name: fn.name,
    fullName: fn.fullName,
    nodes,
    edges
  };
}


  // BLOCK BUILDER
function buildBlock(stmts, prevId, exitId, nodes, edges, idGen) {
  let last = prevId;

  for (const stmt of stmts) {
    last = processStmt(stmt, last, exitId, nodes, edges, idGen);

    // A return statement jumps to exit → stop block
    if (last === exitId) break;
  }

  return last;
}


  // STATEMENT DISPATCH
function processStmt(stmt, prevId, exitId, nodes, edges, idGen) {
  switch (stmt.type) {
    case "if":
      return handleIf(stmt, prevId, exitId, nodes, edges, idGen);

    case "for":
      return handleFor(stmt, prevId, exitId, nodes, edges, idGen);

    case "while":
      return handleWhile(stmt, prevId, exitId, nodes, edges, idGen);

    case "return": {
      const n = cloneNodeFromIR(stmt, idGen);
      nodes.push(n);
      edges.push({ from: prevId, to: n.id });
      edges.push({ from: n.id, to: exitId });
      return exitId;
    }

    default:
      return handleSimple(stmt, prevId, nodes, edges, idGen);
  }
}


  // SIMPLE STATEMENT
function handleSimple(stmt, prevId, nodes, edges, idGen) {
  const n = cloneNodeFromIR(stmt, idGen);

  // Detect call for navigation
  const callTarget = extractCallTarget(stmt.code);
  if (callTarget) n.callTarget = callTarget;

  nodes.push(n);
  edges.push({ from: prevId, to: n.id });

  return n.id;
}


  // IF STATEMENT
function handleIf(stmt, prevId, exitId, nodes, edges, idGen) {
  const condNode = newNode(idGen, "if", stmt.code, stmt.range);
  nodes.push(condNode);
  edges.push({ from: prevId, to: condNode.id });

  // children = [thenBlock, elseBlock?]
  const children = stmt.children || [];
  const thenBlock = children[0] ? children[0].children || [children[0]] : [];
  const elseBlock = children[1] ? children[1].children || [children[1]] : [];

  // THEN branch
  const thenLast = thenBlock.length
    ? buildBlock(thenBlock, condNode.id, exitId, nodes, edges, idGen)
    : condNode.id;

  // ELSE branch
  const elseLast = elseBlock.length
    ? buildBlock(elseBlock, condNode.id, exitId, nodes, edges, idGen)
    : condNode.id;

  // Merge node
  const merge = newNode(idGen, "merge", "(merge)");
  nodes.push(merge);

  if (thenLast !== exitId) edges.push({ from: thenLast, to: merge.id, label: "true" });
  if (elseLast !== exitId) edges.push({ from: elseLast, to: merge.id, label: "false" });

  return merge.id;
}


  // FOR LOOP
function handleFor(stmt, prevId, exitId, nodes, edges, idGen) {
  const init = newNode(idGen, "for_init", "(for init)");
  const cond = newNode(idGen, "for_cond", stmt.code, stmt.range);
  const incr = newNode(idGen, "for_incr", "(for incr)");
  const end  = newNode(idGen, "for_end", "(for end)");

  nodes.push(init, cond, incr, end);

  edges.push({ from: prevId, to: init.id });
  edges.push({ from: init.id, to: cond.id });

  const bodyIR = (stmt.children && stmt.children[0] && stmt.children[0].children)
    ? stmt.children[0].children
    : [];

  const bodyLast = bodyIR.length
    ? buildBlock(bodyIR, cond.id, exitId, nodes, edges, idGen)
    : cond.id;

  edges.push({ from: bodyLast, to: incr.id });
  edges.push({ from: incr.id, to: cond.id });
  edges.push({ from: cond.id, to: end.id, label: "false" });

  return end.id;
}


  // WHILE LOOP
function handleWhile(stmt, prevId, exitId, nodes, edges, idGen) {
  const cond = newNode(idGen, "while_cond", stmt.code, stmt.range);
  const end  = newNode(idGen, "while_end", "(while end)");

  nodes.push(cond, end);
  edges.push({ from: prevId, to: cond.id });

  const bodyIR = (stmt.children && stmt.children[0] && stmt.children[0].children)
    ? stmt.children[0].children
    : [];

  const bodyLast = bodyIR.length
    ? buildBlock(bodyIR, cond.id, exitId, nodes, edges, idGen)
    : cond.id;

  edges.push({ from: bodyLast, to: cond.id });
  edges.push({ from: cond.id, to: end.id, label: "false" });

  return end.id;
}


  // Call Target Extraction
function extractCallTarget(code) {
  if (!code) return null;
  const match = code.match(/([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
  if (!match) return null;
  const fnName = match[1];
  if (!fnName) return null;
  return fnName;
}


module.exports = cfgBuilder;
