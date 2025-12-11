async function realistic(ctx = {}) {
  const content = `export class EventBus {
  constructor() {
    this.handlers = {};
  }

  subscribe(event, handler) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
  }

  publish(event, payload) {
    const listeners = this.handlers[event] || [];
    for (const fn of listeners) fn(payload);
  }
}

export const eventBus = new EventBus();
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `export const eventBus = { publish() {}, subscribe() {} };`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `export class EventBus {
  constructor(logger) {
    this.logger = logger;
    this.handlers = {};
  }

  subscribe(event, handler) {
    this.logger?.info(\`Subscribed to \${event}\`);
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
  }

  publish(event, payload) {
    this.logger?.info(\`Event published: \${event}\`);
    const listeners = this.handlers[event] || [];
    for (const fn of listeners) fn(payload);
  }
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return realistic(ctx);
}

module.exports = { realistic, minimal, enterprise, default: defaultVariant };
