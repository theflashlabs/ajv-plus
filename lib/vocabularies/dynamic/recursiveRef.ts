import type {CodeKeywordDefinition} from "../../types/index.ts"
import {dynamicRef} from "./dynamicRef.ts"

const def: CodeKeywordDefinition = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (cxt) => dynamicRef(cxt, cxt.schema),
}

export default def
