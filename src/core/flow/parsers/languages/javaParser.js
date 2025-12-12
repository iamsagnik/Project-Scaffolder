const logger = require("../../../diagnostics/logger");
const warnings = require("../../../diagnostics/warningsCollector");
const { createSuccessResponse, recordSuccessEvents } = require("../../../diagnostics/successHandler");


function getCode(src, node) {
  return src.slice(node.startIndex, node.endIndex);
}

function makeRange(node) {
  return {
    start: { row: node.startPosition.row, column: node.startPosition.column },
    end: { row: node.endPosition.row, column: node.endPosition.column }
  };
}

function isMethodDeclaration(node) {
  return node.type === "method_declaration";
}

function isConstructor(node) {
  return node.type === "constructor_declaration";
}

function isStaticBlock(node) {
  return node.type === "static_initializer";
}

function isInitializerBlock(node) {
  // Java instance initializer block:  `{ ... }`
  return node.type === "block" && node.parent?.type === "class_body";
}


  // Statement IR builder (language-agnostic)

function buildStatementIR(node, source) {
  const type = node.type;

  // BLOCKS
  if (type === "block") {
    const stmts = [];
    for (const ch of node.namedChildren) {
      stmts.push(buildStatementIR(ch, source));
    }
    return { type: "block", code: "{}", range: makeRange(node), children: stmts };
  }

  // IF
  if (type === "if_statement") {
    const cond = node.childForFieldName("condition");
    const cons = node.childForFieldName("consequence");
    const alt  = node.childForFieldName("alternative");

    return {
      type: "if",
      code: cond ? getCode(source, cond) : "if(?)",
      range: makeRange(node),
      children: [
        cons ? buildStatementIR(cons, source) : null,
        alt  ? buildStatementIR(alt, source) : null
      ].filter(Boolean)
    };
  }

  // FOR
  if (type === "for_statement" || type === "enhanced_for_statement") {
    const cond = node.childForFieldName("condition");
    const body = node.childForFieldName("body");
    return {
      type: "for",
      code: cond ? getCode(source, cond) : getCode(source, node),
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
      code: cond ? getCode(source, cond) : getCode(source, node),
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

  // EXPRESSION / STATEMENT
  if (
    type.endsWith("_statement") ||
    type.endsWith("_expression") ||
    type === "expression_statement" ||
    type === "local_variable_declaration"
  ) {
    return {
      type: "stmt",
      code: getCode(source, node),
      range: makeRange(node),
      children: []
    };
  }

  // Fallback – flatten children
  if (node.namedChildren.length > 0) {
    const children = node.namedChildren.map(c => buildStatementIR(c, source));
    return {
      type: "block",
      code: "{...}",
      range: makeRange(node),
      children
    };
  }

  // Last fallback: simple statement
  return {
    type: "stmt",
    code: getCode(source, node),
    range: makeRange(node),
    children: []
  };
}


  // MAIN FUNCTION EXTRACTION


function extractFunctions(root, source, filePath) {
  const results = [];

  function walk(node, packageStack = [], classStack = []) {
    if (!node) return;

    // PACKAGE 
    if (node.type === "package_declaration") {
      const pkg = node.childForFieldName("name");
      const pkgName = pkg ? getCode(source, pkg) : null;
      const newPkg = pkgName ? pkgName.split(".") : [];
      for (const ch of node.namedChildren) walk(ch, newPkg, classStack);
      return;
    }

    // CLASS / INTERFACE 
    if (
      node.type === "class_declaration" ||
      node.type === "interface_declaration"
    ) {
      const nameNode = node.childForFieldName("name");
      const clsName = nameNode ? getCode(source, nameNode) : "UnknownClass";
      const newClasses = [...classStack, clsName];

      for (const ch of node.namedChildren) walk(ch, packageStack, newClasses);
      return;
    }

    // METHODS 
    if (isMethodDeclaration(node)) {
      const nameNode = node.childForFieldName("name");
      const fnName = nameNode ? getCode(source, nameNode) : "method";

      const fullName = [
        filePath,
        ...packageStack,
        ...classStack,
        fnName
      ].join("::");

      const body = node.childForFieldName("body");
      const bodyIR = body ? buildStatementIR(body, source).children : [];

      results.push({
        name: fnName,
        fullName,
        range: makeRange(node),
        body: bodyIR
      });

      return;
    }

    // CONSTRUCTORS 
    if (isConstructor(node)) {
      const nameNode = node.childForFieldName("name");
      const ctorName = nameNode ? getCode(source, nameNode) : "constructor";

      const fullName = [
        filePath,
        ...packageStack,
        ...classStack,
        ctorName
      ].join("::");

      const body = node.childForFieldName("body");
      const bodyIR = body ? buildStatementIR(body, source).children : [];

      results.push({
        name: ctorName,
        fullName,
        range: makeRange(node),
        body: bodyIR
      });

      return;
    }

    // STATIC INITIALIZER BLOCK 
    if (isStaticBlock(node)) {
      const block = node.childForFieldName("body") || node;
      const name = "static_block@" + (node.startPosition.row + 1);

      const fullName = [
        filePath,
        ...packageStack,
        ...classStack,
        name
      ].join("::");

      const bodyIR = buildStatementIR(block, source).children;

      results.push({
        name,
        fullName,
        range: makeRange(node),
        body: bodyIR
      });

      return;
    }

    // INSTANCE INITIALIZER BLOCK 
    if (isInitializerBlock(node)) {
      const name = "init_block@" + (node.startPosition.row + 1);

      const fullName = [
        filePath,
        ...packageStack,
        ...classStack,
        name
      ].join("::");

      const bodyIR = buildStatementIR(node, source).children;

      results.push({
        name,
        fullName,
        range: makeRange(node),
        body: bodyIR
      });

      return;
    }

    // RECURSE 
    for (const ch of node.namedChildren) {
      walk(ch, packageStack, classStack);
    }
  }

  walk(root);
  return results;
}

function parseJava(tree, source, filePath) {
  const root = tree.rootNode;

    if (!root) {
      const w = warnings.createWarningResponse(
        "javaParser",
        "NO_ROOT",
        "Tree-sitter returned no root node",
        { filePath, severity: "warn" }
      );
      warnings.recordWarning(w);
      return { ok: false, error: w };
    }

    const functions = extractFunctions(root, source, filePath);

    const success = createSuccessResponse(
      "javaParser",
      "JAVA_PARSE_SUCCESS",
      `Extracted ${functions.length} methods`,
      { filePath }
    );
    recordSuccessEvents(success);

    logger.debug("javaParser", "Parsed Java successfully", {
      count: functions.length,
      filePath
    });

    return { ok: true, functions, topLevel: [] };
};

module.exports = parseJava;