import type {ErrorObject, Vocabulary} from "../../types/index.ts"
import limitNumber, {LimitNumberError} from "./limitNumber.ts"
import multipleOf, {MultipleOfError} from "./multipleOf.ts"
import limitLength from "./limitLength.ts"
import pattern, {PatternError} from "./pattern.ts"
import limitProperties from "./limitProperties.ts"
import required, {RequiredError} from "./required.ts"
import limitItems from "./limitItems.ts"
import uniqueItems, {UniqueItemsError} from "./uniqueItems.ts"
import constKeyword, {ConstError} from "./const.ts"
import enumKeyword, {EnumError} from "./enum.ts"

const validation: Vocabulary = [
  // number
  limitNumber,
  multipleOf,
  // string
  limitLength,
  pattern,
  // object
  limitProperties,
  required,
  // array
  limitItems,
  uniqueItems,
  // any
  {keyword: "type", schemaType: ["string", "array"]},
  {keyword: "nullable", schemaType: "boolean"},
  constKeyword,
  enumKeyword,
]

export default validation

type LimitError = ErrorObject<
  "maxItems" | "minItems" | "minProperties" | "maxProperties" | "minLength" | "maxLength",
  {limit: number},
  number | {$data: string}
>

export type ValidationKeywordError =
  | LimitError
  | LimitNumberError
  | MultipleOfError
  | PatternError
  | RequiredError
  | UniqueItemsError
  | ConstError
  | EnumError
