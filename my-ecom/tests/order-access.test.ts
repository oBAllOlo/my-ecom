import test from "node:test";
import assert from "node:assert/strict";
import { canUserAccessOrder } from "../lib/order-access.ts";

test("order owner can access their order", () => {
  assert.equal(canUserAccessOrder("user-1", "user-1", "user"), true);
});

test("admin can access any order", () => {
  assert.equal(canUserAccessOrder("user-1", "admin-1", "admin"), true);
});

test("different non-admin user cannot access the order", () => {
  assert.equal(canUserAccessOrder("user-1", "user-2", "user"), false);
});
