const PASSWORD_RULES = [
  {
    test: (password) => password.length >= 8,
    message: "La contraseña debe tener al menos 8 caracteres",
  },
  {
    test: (password) => /[A-Z]/.test(password),
    message: "La contraseña debe incluir al menos una letra mayúscula",
  },
  {
    test: (password) => /[a-z]/.test(password),
    message: "La contraseña debe incluir al menos una letra minúscula",
  },
  {
    test: (password) => /\d/.test(password),
    message: "La contraseña debe incluir al menos un número",
  },
  {
    test: (password) => /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password),
    message: "La contraseña debe incluir al menos un carácter especial",
  },
];

export function validatePassword(password) {
  const normalizedPassword = typeof password === "string" ? password : "";
  const errors = PASSWORD_RULES
    .filter((rule) => !rule.test(normalizedPassword))
    .map((rule) => rule.message);

  return { valid: errors.length === 0, errors };
}
