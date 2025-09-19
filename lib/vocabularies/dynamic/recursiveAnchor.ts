import type {CodeKeywordDefinition} from "../../types/index.ts"
import {dynamicAnchor} from "./dynamicAnchor.ts"
import {checkStrictMode} from "../../compile/util.ts"

const def: CodeKeywordDefinition = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(cxt) {
    if (cxt.schema) dynamicAnchor(cxt, "")
    else checkStrictMode(cxt.it, "$recursiveAnchor: false is ignored")
  },
}

export default def
