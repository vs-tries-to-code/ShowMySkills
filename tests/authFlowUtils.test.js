import test from "node:test";
import assert from "node:assert/strict";
import { getEmailVerificationPath } from "../web/src/features/auth/authFlowUtils.mjs";

test("registration routes to email verification with an encoded normalized input", () => {
  assert.equal(
    getEmailVerificationPath("  demo+otp@example.test "),
    "/verify-email?email=demo%2Botp%40example.test"
  );
});
