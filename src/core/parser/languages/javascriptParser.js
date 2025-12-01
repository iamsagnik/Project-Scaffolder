const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

function parseContent(content) {
  const imports = [];
  const exports = [];

  const ast = parse(content, {
    sourceType: "module",
    plugins: ["typescript", "jsx"]
  });

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;

      if (path.node.specifiers.length === 0) {
        imports.push({
          type: "side-effect",
          local: null,
          imported: null,
          from: source,
          isType: false
        });
        return;
      }

      for (const s of path.node.specifiers) {
        if (s.type === "ImportDefaultSpecifier") {
          imports.push({
            type: "default",
            local: s.local.name,
            imported: "default",
            from: source,
            isType: path.node.importKind === "type"
          });
        }

        if (s.type === "ImportSpecifier") {
          imports.push({
            type: "named",
            local: s.local.name,
            imported: s.imported.name,
            from: source,
            isType: s.importKind === "type"
          });
        }

        if (s.type === "ImportNamespaceSpecifier") {
          imports.push({
            type: "namespace",
            local: s.local.name,
            imported: "*",
            from: source,
            isType: path.node.importKind === "type"
          });
        }
      }
    },

    CallExpression(path) {
      if (
        path.node.callee.type === "Import" &&
        path.node.arguments[0]?.type === "StringLiteral"
      ) {
        imports.push({
          type: "dynamic",
          local: null,
          imported: null,
          from: path.node.arguments[0].value,
          isType: false
        });
      }
    },

    ExportNamedDeclaration(path) {
      if (path.node.declaration) {
        const d = path.node.declaration;
        const name = d.id?.name || d.declarations?.[0]?.id?.name;
        if (name) {
          exports.push({
            type: "named",
            local: name,
            exported: name,
            from: null
          });
        }
      }

      if (path.node.source) {
        for (const s of path.node.specifiers) {
          exports.push({
            type: "re-export",
            local: s.local.name,
            exported: s.exported.name,
            from: path.node.source.value
          });
        }
      } else {
        for (const s of path.node.specifiers) {
          exports.push({
            type: "named",
            local: s.local.name,
            exported: s.exported.name,
            from: null
          });
        }
      }
    },

    ExportDefaultDeclaration() {
      exports.push({
        type: "default",
        local: null,
        exported: "default",
        from: null
      });
    },

    ExportAllDeclaration(path) {
      exports.push({
        type: "wildcard",
        local: null,
        exported: "*",
        from: path.node.source.value
      });
    }
  });

  return { imports, exports };
}

module.exports = parseContent ;
