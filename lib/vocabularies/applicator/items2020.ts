import type {
  CodeKeywordDefinition,
  KeywordErrorDefinition,
  ErrorObject,
  AnySchema,
} from "../../types/index.ts"
import type {KeywordCxt} from "../../compile/validate/index.ts"
import {_, str} from "../../compile/codegen/index.ts"
import {alwaysValidSchema} from "../../compile/util.ts"
import {validateArray} from "../code.ts"
import {validateAdditionalItems} from "./additionalItems.ts"

export type ItemsError = ErrorObject<"items", {limit: number}, AnySchema>

const error: KeywordErrorDefinition = {
  message: ({params: {len}}) => str`must NOT have more than ${len} items`,
  params: ({params: {len}}) => _`{limit: ${len}}`,
}

const def: CodeKeywordDefinition = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error,
  code(cxt: KeywordCxt) {
    const {schema, parentSchema, it} = cxt
    const {prefixItems} = parentSchema
    it.items = true
    if (alwaysValidSchema(it, schema)) return
    if (prefixItems) validateAdditionalItems(cxt, prefixItems)
    else cxt.ok(validateArray(cxt))
  },
}

export default def
