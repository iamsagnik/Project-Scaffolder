async function realistic(ctx = {}) {
  const content = `/**
 * Gateway Health Test
 * Integration-style test hitting the /health endpoint.
 */

import request from "supertest";
import { createServer } from "../../src/app";

describe("Gateway Health Check", () => {
  const app = createServer();

  it("should return ok status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status");
  });
});
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `test("health", () => expect(true).toBe(true));`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `/**
 * Enterprise Health Test Suite
 * Includes validation of headers, uptime, latency and expected structure.
 */

import request from "supertest";
import { createServer } from "../../src/app";
import { logger } from "../../shared/logger/logger";

describe("Gateway Health Check - Enterprise", () => {
  const app = createServer();

  beforeAll(() => {
    logger.info("Running enterprise health test");
  });

  it("should return ok status", async () => {
    const start = Date.now();
    const res = await request(app).get("/health");
    const duration = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "ok"
    });

    // latency budget (example threshold)
    expect(duration).toBeLessThan(500);
  });
});
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  default: defaultVariant
};
