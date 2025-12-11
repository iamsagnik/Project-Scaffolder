async function expressMongo(ctx = {}) {
  const name = ctx.options?.projectName || "backend";

  const pkg = {
    name,
    version: "1.0.0",
    private: true,
    main: "src/index.js",
    scripts: {
      dev: "nodemon src/index.js",
      start: "node src/index.js",
      test: "jest",
    },
    dependencies: {
      express: "^4.18.2",
      mongoose: "^7.0.0",
      dotenv: "^16.0.0",
      bcrypt: "^5.1.0",
      jsonwebtoken: "^9.0.0",
      winston: "^3.9.0",
      cors: "^2.8.5",
    },
    devDependencies: {
      jest: "^29",
      nodemon: "^2",
      supertest: "^6",
    },
  };

  return { type: "single", content: JSON.stringify(pkg, null, 2) + "\n" };
}

async function minimal(ctx = {}) {
  const name = ctx.options?.projectName || "backend";

  const pkg = {
    name,
    version: "0.1.0",
    private: true,
    main: "src/index.js",
    dependencies: { express: "^4.18.2" },
  };

  return { type: "single", content: JSON.stringify(pkg, null, 2) + "\n" };
}

async function defaultVariant(ctx) {
  return expressMongo(ctx);
}

module.exports = {
  "express-mongo": expressMongo,
  minimal,
  default: defaultVariant,
};