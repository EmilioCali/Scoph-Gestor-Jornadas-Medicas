import test from "node:test";
import assert from "node:assert/strict";
import { validatePassword } from "../src/utils/passwordValidator.js";
import { generateTempPassword } from "../src/lib/tokens.js";

test("rejects a password without an uppercase letter", () => {
  const result = validatePassword("segura1!");

  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ["La contraseña debe incluir al menos una letra mayúscula"]);
});

test("rejects a password without a special character", () => {
  const result = validatePassword("Segura123");

  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ["La contraseña debe incluir al menos un carácter especial"]);
});

test("rejects a password shorter than eight characters", () => {
  const result = validatePassword("Aa1!");

  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("La contraseña debe tener al menos 8 caracteres"));
});

test("accepts a password that meets all requirements", () => {
  const result = validatePassword("ClaveSegura1!");

  assert.deepEqual(result, { valid: true, errors: [] });
});

test("generates temporary passwords that meet the password policy", () => {
  const result = validatePassword(generateTempPassword());

  assert.equal(result.valid, true);
});
