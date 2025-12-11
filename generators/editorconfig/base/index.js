async function base(ctx = {}) {
  const content = `
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
`;
  return { type: "single", content };
}

async function compact(ctx = {}) {
  const content = `[*]\nindent_style = space\nindent_size = 4`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return base(ctx);
}

module.exports = {
  base,
  compact,
  default: defaultVariant
};
