import test from "node:test";
import assert from "node:assert/strict";
import { createSessionToken, verifySessionToken } from "../lib/auth-session.ts";

const secret = "test-session-secret";

test("createSessionToken and verifySessionToken round-trip a valid payload", () => {
  const expiresAt = Math.floor(Date.now() / 1000) + 60;
  const token = createSessionToken(
    { userId: "user-123", role: "user" },
    secret,
    expiresAt
  );

  assert.deepEqual(verifySessionToken(token, secret), {
    userId: "user-123",
    role: "user",
    exp: expiresAt,
  });
});

test("verifySessionToken rejects a tampered token", () => {
  const token = createSessionToken(
    { userId: "user-123", role: "admin" },
    secret,
    Math.floor(Date.now() / 1000) + 60
  );

  const [payload] = token.split(".");
  const tampered = `${payload}.invalid-signature`;

  assert.equal(verifySessionToken(tampered, secret), null);
});

test("verifySessionToken rejects an expired token", () => {
  const token = createSessionToken(
    { userId: "user-123", role: "user" },
    secret,
    Math.floor(Date.now() / 1000) - 60
  );

  assert.equal(verifySessionToken(token, secret), null);
});
