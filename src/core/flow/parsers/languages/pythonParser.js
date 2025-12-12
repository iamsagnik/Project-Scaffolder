const logger = require("../../../diagnostics/logger");
const warnings = require("../../../diagnostics/warningsCollector");
const { createSuccessResponse, recordSuccessEvents } = require("../../../diagnostics/successHandler");

function slice(src, node) {
  try { return src.slice(node.startIndex, node.endIndex); } catch { return ""; }
}

function makeRange(node) {
  return {
    start: { row: node.startPosition.row, column: node.startPosition.column },
    end:   { row: node.endPosition.row, column: node.endPosition.column }
  };
}

function firstDesc(node, type) {
  if (!node) return null;
  const stack = [node];
  while (stack.length) {
    const cur = stack.shift();
    if (cur.type === type) return cur;
    for (let i = 0; i < cur.namedChildCount; i++) stack.push(cur.namedChild(i));
  }
  return null;
}

function findName(node, src) {
  const id = firstDesc(node, "identifier");
  return id ? slice(src, id) : null;
}

/* ------------------------ Statement IR builder ------------------------ */

function buildIR(node, src) {
  if (!node) return null;
  const t = node.type;

  /* ------------------------- Blocks ------------------------- */
  if (t === "block" || t === "module") {
    const children = [];
    for (let i = 0; i < node.namedChildCount; i++) {
      const ir = buildIR(node.namedChild(i), src);
      if (ir) children.push(ir);
    }
    return { type: "block", code: "{...}", range: makeRange(node), children };
  }

  /* ------------------------- If ------------------------- */
  if (t === "if_statement") {
    const cond = node.childForFieldName("condition");
    const cons = node.childForFieldName("consequence");
    const alt  = node.childForFieldName("alternative");

    const children = [];
    if (cons) children.push(buildIR(cons, src));
    if (alt)  children.push(buildIR(alt, src));

    return {
      type: "if",
      code: cond ? slice(src, cond) : "if ?",
      range: makeRange(node),
      children
    };
  }

  /* ------------------------- For / While ------------------------- */
  if (t === "for_statement") {
    const body = node.childForFieldName("body");
    return {
      type: "for",
      code: slice(src, node.childForFieldName("left") || node),
      range: makeRange(node),
      children: body ? [buildIR(body, src)] : []
    };
  }

  if (t === "while_statement") {
    const cond = node.childForFieldName("condition");
    const body = node.childForFieldName("body");
    return {
      type: "while",
      code: cond ? slice(src, cond) : slice(src, node),
      range: makeRange(node),
      children: body ? [buildIR(body, src)] : []
    };
  }

  /* ------------------------- Return ------------------------- */
  if (t === "return_statement") {
    return {
      type: "return",
      code: slice(src, node),
      range: makeRange(node),
      children: []
    };
  }

  /* ------------------------- Try/Except (flatten for now) ------------------------- */
  if (t === "try_statement") {
    const children = [];
    const body = node.childForFieldName("body");
    if (body) children.push(buildIR(body, src));

    const handlers = node.namedChildren.filter(n => n.type === "except_clause" || n.type === "except_statement");
    for (const h of handlers) {
      const hb = h.namedChildren.find(c => c.type === "block");
      if (hb) children.push(buildIR(hb, src));
    }

    const final = node.childForFieldName("finalbody");
    if (final) children.push(buildIR(final, src));

    return {
      type: "block",
      code: "try {...}",
      range: makeRange(node),
      children
    };
  }

  /* ------------------- Expression / assignment ------------------- */
  if (
    t.endsWith("_statement") ||
    t.endsWith("_expression") ||
    t === "expression_statement" ||
    t === "assignment"
  ) {
    return {
      type: "stmt",
      code: slice(src, node),
      range: makeRange(node),
      children: []
    };
  }

  /* ------------------------- Lambda ------------------------- */
  if (t === "lambda") {
    return {
      type: "lambda",
      code: slice(src, node),
      range: makeRange(node),
      children: [] // treat lambda body as simple expression
    };
  }

  /* ------------------------- Fallback ------------------------- */
  if (node.namedChildCount > 0) {
    const children = [];
    for (let i = 0; i < node.namedChildCount; i++) {
      const ir = buildIR(node.namedChild(i), src);
      if (ir) children.push(ir);
    }
    return { type: "block", code: "{...}", range: makeRange(node), children };
  }

  return {
    type: "stmt",
    code: slice(src, node),
    range: makeRange(node),
    children: []
  };
}

/* ------------------------ Function Extraction ------------------------ */

function extractFunctions(root, src, filePath) {
  const fns = [];

  // recursive descent for nested functions + class hierarchy
  function walk(node, classStack = [], fnStack = []) {
    if (!node) return;

    /* ------------------------- CLASS ------------------------- */
    if (node.type === "class_definition") {
      const nameNode = node.childForFieldName("name") || firstDesc(node, "identifier");
      const className = nameNode ? slice(src, nameNode) : `Class@${node.startPosition.row + 1}`;
      const newClassStack = [...classStack, className];

      for (let i = 0; i < node.namedChildCount; i++) {
        walk(node.namedChild(i), newClassStack, fnStack);
      }
      return;
    }

    /* ------------------------- DEF / ASYNC DEF ------------------------- */
    if (node.type === "function_definition" || node.type === "async_function_definition") {
      const nameNode = node.childForFieldName("name");
      const fnName = nameNode ? slice(src, nameNode) : `func@${node.startPosition.row + 1}`;
      const fullName = [
        filePath,
        ...classStack,
        ...fnStack,
        fnName
      ].join("::");

      const bodyNode = node.childForFieldName("body");
      let bodyIR = [];
      if (bodyNode) {
        const ir = buildIR(bodyNode, src);
        bodyIR = ir.children || [];
      }

      fns.push({
        name: fnName,
        fullName,
        range: makeRange(node),
        body: bodyIR
      });

      // nested functions inside this one
      const newFnStack = [...fnStack, fnName];
      for (let i = 0; i < node.namedChildCount; i++) {
        walk(node.namedChild(i), classStack, newFnStack);
      }
      return;
    }

    // Lambdas 
    if (node.type === "lambda") {
      const name = `lambda@${node.startPosition.row + 1}`;
      const fullName = [filePath, ...classStack, ...fnStack, name].join("::");

      fns.push({
        name,
        fullName,
        range: makeRange(node),
        body: [] // lambdas are expressions
      });

      return;
    }

    //Recurse 
    for (let i = 0; i < node.namedChildCount; i++) {
      walk(node.namedChild(i), classStack, fnStack);
    }
  }

  walk(root);
  return fns;
}


function parsePython(tree, source, filePath) {
  const root = tree.rootNode;

    if (!root) {
      const w = warnings.createWarningResponse(
        "pythonParser",
        "NO_ROOT",
        "Tree-sitter returned no root node",
        { filePath, severity: "warn" }
      );
      warnings.recordWarning(w);
      return { ok: false, error: w };
    }

    const functions = extractFunctions(root, source, filePath);

    const success = createSuccessResponse(
      "pythonParser",
      "PYTHON_PARSE_SUCCESS",
      `Extracted ${functions.length} methods`,
      { filePath }
    );
    recordSuccessEvents(success);

    logger.debug("pythonParser", "Parsed PYTHON successfully", {
      count: functions.length,
      filePath
    });

    return { ok: true, functions, topLevel: [] };
};

module.exports = parsePython;