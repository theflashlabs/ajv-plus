import {defineConfig} from "vitest/config"

export default defineConfig({
  test: {
    include: ["spec/issues/1001_addKeyword_and_schema_without_id.spec.ts"],
    reporters: ["dot"],
    coverage: {
      provider: "v8",
      reporter: ["lcov", "text-summary"],
    },
  },
})
