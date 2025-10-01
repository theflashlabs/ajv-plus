import jsConfig from "@ajv-validator/config/.eslintrc_js.js"
import tsConfig from "./tsconfig.json" with {type: "json"}

export const env = {
  es6: true,
  node: true,
}
export const overrides = [
  jsConfig,
  {
    ...tsConfig,
    files: ["*.ts"],
    rules: {
      ...tsConfig.rules,
      complexity: ["error", 17],
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-implied-eval": "off",
      "@typescript-eslint/no-invalid-this": "off",
      "@typescript-eslint/no-parameter-properties": "off",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
]
