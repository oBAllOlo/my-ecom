import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { toOmiseAmount, verifyOmiseSignature } from "../lib/payment.ts";

test("toOmiseAmount converts baht to satang", () => {
  assert.equal(toOmiseAmount(123.45), 12345);
});

test("verifyOmiseSignature accepts a valid signature", () => {
  const payload = JSON.stringify({ id: "evt_123" });
  const secret = "omise-secret";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  assert.equal(verifyOmiseSignature(payload, signature, secret), true);
});

test("verifyOmiseSignature rejects an invalid signature", () => {
  assert.equal(
    verifyOmiseSignature('{"id":"evt_123"}', "invalid", "omise-secret"),
    false
  );
});
