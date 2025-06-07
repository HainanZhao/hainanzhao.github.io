// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const prettier = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      prettierConfig, // Disables ESLint rules that conflict with Prettier
    ],
    plugins: {
      prettier: prettier,
    },
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      // Prettier integration
      "prettier/prettier": "error",
      // Relaxed rules for better developer experience
      "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for clarity
      "@typescript-eslint/no-explicit-any": "warn", // Error for 'any' to test enforcement
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }], // Allow unused vars starting with _
      "@typescript-eslint/consistent-indexed-object-style": "warn", // Warn instead of error for index signatures
      "@typescript-eslint/prefer-for-of": "warn", // Warn instead of error for for-of preference
    },
  },
  {
    files: ["src/app/**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
      prettierConfig, // Disables ESLint rules that conflict with Prettier for HTML
    ],
    plugins: {
      prettier: prettier,
    },
    rules: {
      // Prettier integration for HTML
      "prettier/prettier": "error",
      // Relaxed accessibility rules for development (still important but not blocking)
      "@angular-eslint/template/click-events-have-key-events": "warn",
      "@angular-eslint/template/interactive-supports-focus": "warn",
    },
  }
);
