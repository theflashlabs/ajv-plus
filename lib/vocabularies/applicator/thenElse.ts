import type {CodeKeywordDefinition} from "../../types/index.ts"
import type {KeywordCxt} from "../../compile/validate/index.ts"
import {checkStrictMode} from "../../compile/util.ts"

const def: CodeKeywordDefinition = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({keyword, parentSchema, it}: KeywordCxt) {
    if (parentSchema.if === undefined) checkStrictMode(it, `"${keyword}" without "if" is ignored`)
  },
}

export default def
