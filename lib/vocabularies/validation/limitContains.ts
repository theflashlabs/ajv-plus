import type {CodeKeywordDefinition} from "../../types/index.ts"
import type {KeywordCxt} from "../../compile/validate/index.ts"
import {checkStrictMode} from "../../compile/util.ts"

const def: CodeKeywordDefinition = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({keyword, parentSchema, it}: KeywordCxt) {
    if (parentSchema.contains === undefined) {
      checkStrictMode(it, `"${keyword}" without "contains" is ignored`)
    }
  },
}

export default def
