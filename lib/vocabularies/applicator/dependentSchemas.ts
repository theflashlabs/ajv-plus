import type {CodeKeywordDefinition} from "../../types/index.ts"
import {validateSchemaDeps} from "./dependencies.ts"

const def: CodeKeywordDefinition = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (cxt) => validateSchemaDeps(cxt),
}

export default def
