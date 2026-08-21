const PASSWORD_CHECKS = [
  {
    key: "length",
    label: "Mínimo 8 caracteres",
    test: (password) => password.length >= 8,
  },
  {
    key: "uppercase",
    label: "Minimo una mayúscula",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    key: "lowercase",
    label: "Minimo una minúscula",
    test: (password) => /[a-z]/.test(password),
  },
  {
    key: "number",
    label: "Minimo un número",
    test: (password) => /\d/.test(password),
  },
  {
    key: "special",
    label: "Minimo un carácter especial",
    test: (password) => /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password),
  },
];

export function getPasswordStrength(password) {
  const normalizedPassword = typeof password === "string" ? password : "";
  const checks = PASSWORD_CHECKS.map((check) => ({
    ...check,
    passed: check.test(normalizedPassword),
  }));
  const score = checks.filter((check) => check.passed).length;
  const isValid = score === checks.length;

  if (isValid) {
    return {
      score,
      label: normalizedPassword.length >= 12 ? "Muy segura" : "Segura",
      level: "secure",
      checks,
      isValid,
    };
  }

  if (score >= 3 && normalizedPassword.length >= 8) {
    return { score, label: "Media", level: "medium", checks, isValid };
  }

  return { score, label: "Débil", level: "weak", checks, isValid };
}

export function getPasswordValidationMessage(password) {
  const strength = getPasswordStrength(password);
  const firstMissingCheck = strength.checks.find((check) => !check.passed);
  return firstMissingCheck
    ? `La contraseña debe incluir: ${firstMissingCheck.label.toLowerCase()}.`
    : "";
}
