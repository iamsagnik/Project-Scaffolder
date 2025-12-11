const logger = require("../../diagnostics/logger");
const warnings = require("../../diagnostics/warningsCollector");
const { createSuccessResponse, recordSuccessEvents } = require("../../diagnostics/successHandler");


function getCode(src, node) {
  return src.slice(node.startIndex, node.endIndex);
}

function makeRange(node) {
  return {
    start: { row: node.startPosition.row, column: node.startPosition.column },
    end: { row: node.endPosition.row, column: node.endPosition.column }
  };
}

function isFunctionNode(n) {
  return (
    n.type === "function_definition" ||
    n.type === "declaration" && n.children?.some(c => c.type === "function_declarator")
  );
}

function isLambda(n) {
  return n.type === "lambda_expression";
}


  // Extract functions from Tree-sitter AST


function extractFunctionName(node, source) {
  // find identifier inside function_declarator
  const id = node.descendantsOfType("identifier")[0];
  if (id) return getCode(source, id);
  return "<anonymous>";
}

function extractClassName(node, source) {
  // class_specifier → type_identifier
  const id = node.descendantsOfType("type_identifier")[0];
  if (id) return getCode(source, id);
  return null;
}

function extractNamespaceName(node, source) {
  const id = node.descendantsOfType("identifier")[0];
  if (id) return getCode(source, id);
  return null;
}


  // IR Statement Extraction (language-agnostic)


function buildStatementIR(node, source) {
  const type = node.type;

  // Container blocks
  if (type === "compound_statement") {
    const stmts = [];
    for (const ch of node.namedChildren) {
      stmts.push(buildStatementIR(ch, source));
    }
    return { type: "block", code: "{}", range: makeRange(node), children: stmts };
  }

  // IF
  if (type === "if_statement") {
    const condition = node.childForFieldName("condition");
    const consequence = node.childForFieldName("consequence");
    const alternative = node.childForFieldName("alternative");

    return {
      type: "if",
      code: condition ? getCode(source, condition) : "if (?)",
      range: makeRange(node),
      children: [
        consequence ? buildStatementIR(consequence, source) : null,
        alternative ? buildStatementIR(alternative, source) : null
      ].filter(Boolean)
    };
  }

  // FOR
  if (type === "for_statement") {
    const body = node.childForFieldName("body");
    const init = node.childForFieldName("initializer");
    const cond = node.childForFieldName("condition");
    const update = node.childForFieldName("update");

    return {
      type: "for",
      code: getCode(source, cond || node),
      range: makeRange(node),
      children: body ? [buildStatementIR(body, source)] : []
    };
  }

  // WHILE
  if (type === "while_statement") {
    const cond = node.childForFieldName("condition");
    const body = node.childForFieldName("body");

    return {
      type: "while",
      code: getCode(source, cond || node),
      range: makeRange(node),
      children: body ? [buildStatementIR(body, source)] : []
    };
  }

  // RETURN
  if (type === "return_statement") {
    return {
      type: "return",
      code: getCode(source, node),
      range: makeRange(node),
      children: []
    };
  }

  // LAMBDA (treat like a function)
  if (isLambda(node)) {
    return {
      type: "lambda",
      code: getCode(source, node),
      range: makeRange(node),
      children: []
    };
  }

  // Any expression or statement → linear IR node
  if (
    type.endsWith("statement") ||
    type.endsWith("expression") ||
    type === "declaration" ||
    type === "init_statement" ||
    type === "expression_statement"
  ) {
    return {
      type: "stmt",
      code: getCode(source, node),
      range: makeRange(node),
      children: [] // no nested CFG implied
    };
  }

  // Fallback (ignore pure syntactic nodes)
  if (node.namedChildren.length === 0) {
    return {
      type: "stmt",
      code: getCode(source, node),
      range: makeRange(node),
      children: []
    };
  }

  // Not a statement, but contains statements — flatten
  const childrenIR = node.namedChildren.map(ch => buildStatementIR(ch, source));
  return {
    type: "block",
    code: "{...}",
    range: makeRange(node),
    children: childrenIR
  };
}


  // MAIN FUNCTION EXTRACTION

function extractFunctions(root, source, filePath) {
  const results = [];

  function walk(node, classStack = [], namespaceStack = []) {
    if (!node) return;

    // Namespace
    if (node.type === "namespace_definition") {
      const name = extractNamespaceName(node, source);
      const newNS = name ? [...namespaceStack, name] : namespaceStack;
      for (const ch of node.namedChildren) {
        walk(ch, classStack, newNS);
      }
      return;
    }

    // Class
    if (node.type === "class_specifier" || node.type === "struct_specifier") {
      const name = extractClassName(node, source);
      const newClassStack = name ? [...classStack, name] : classStack;
      for (const ch of node.namedChildren) {
        walk(ch, newClassStack, namespaceStack);
      }
      return;
    }

    // Free functions or methods
    if (isFunctionNode(node)) {
      const fnName = extractFunctionName(node, source);
      const fullName =
        filePath +
        "::" +
        (namespaceStack.length ? namespaceStack.join("::") + "::" : "") +
        (classStack.length ? classStack.join("::") + "::" : "") +
        fnName;

      const body = node.descendantsOfType("compound_statement")[0];
      const bodyIR = body ? buildStatementIR(body, source).children : [];

      results.push({
        name: fnName,
        fullName,
        range: makeRange(node),
        body: bodyIR
      });

      return;
    }

    // Lambdas (treated like lightweight functions)
    if (isLambda(node)) {
      const lambdaCode = getCode(source, node);
      const line = node.startPosition.row + 1;
      const lambdaName = `lambda@${line}`;
      const fullName =
        filePath + "::" + (classStack.join("::") || "") + (classStack.length ? "::" : "") + lambdaName;

      results.push({
        name: lambdaName,
        fullName,
        range: makeRange(node),
        body: [] // lambdas usually small; treat body as expression only
      });

      return;
    }

    // Recurse
    for (const ch of node.namedChildren) walk(ch, classStack, namespaceStack);
  }

  walk(root);
  return results;
}

function parseCPP(tree, source, filePath) {
  
  const root = tree.rootNode;

  if (!root) {
    const w = warnings.createWarningResponse(
      "cppParser",
      "NO_ROOT",
      "Tree-sitter returned no root node",
      { filePath, severity: "warn" }
    );
    warnings.recordWarning(w);
    return { ok: false, error: w };
  }

  const functions = extractFunctions(tree.rootNode, source, filePath);

  const success = createSuccessResponse(
      "cppParser",
      "CPP_PARSE_SUCCESS",
      `Extracted ${functions.length} functions`,
      { filePath }
    );
    recordSuccessEvents(success);

  logger.debug("cppParser", "Parsed C++ successfully", {
    count: functions.length,
    filePath
  });

  return { ok: true, functions, topLevel: [] };
};

module.exports = parseCPP;