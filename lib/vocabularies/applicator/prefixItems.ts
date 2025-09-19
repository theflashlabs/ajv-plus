import type {CodeKeywordDefinition} from "../../types/index.ts"
import {validateTuple} from "./items.ts"

const def: CodeKeywordDefinition = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (cxt) => validateTuple(cxt, "items"),
}

export default def
