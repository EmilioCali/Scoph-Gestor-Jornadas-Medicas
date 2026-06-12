export default {
  root: true,
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react-native/all"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es2024: true,
    "react-native/react-native": true
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  plugins: ["react", "react-native"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react-native/no-inline-styles": "off"
  }
};
