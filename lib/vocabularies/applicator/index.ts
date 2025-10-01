import type {ErrorNoParams, Vocabulary} from "../../types/index.ts"
import additionalItems, {type AdditionalItemsError} from "./additionalItems.ts"
import prefixItems from "./prefixItems.ts"
import items from "./items.ts"
import items2020, {type ItemsError} from "./items2020.ts"
import contains, {type ContainsError} from "./contains.ts"
import dependencies, {type DependenciesError} from "./dependencies.ts"
import propertyNames, {type PropertyNamesError} from "./propertyNames.ts"
import additionalProperties, {type AdditionalPropertiesError} from "./additionalProperties.ts"
import properties from "./properties.ts"
import patternProperties from "./patternProperties.ts"
import notKeyword, {type NotKeywordError} from "./not.ts"
import anyOf, {type AnyOfError} from "./anyOf.ts"
import oneOf, {type OneOfError} from "./oneOf.ts"
import allOf from "./allOf.ts"
import ifKeyword, {type IfKeywordError} from "./if.ts"
import thenElse from "./thenElse.ts"

export default function getApplicator(draft2020 = false): Vocabulary {
  const applicator = [
    // any
    notKeyword,
    anyOf,
    oneOf,
    allOf,
    ifKeyword,
    thenElse,
    // object
    propertyNames,
    additionalProperties,
    dependencies,
    properties,
    patternProperties,
  ]
  // array
  if (draft2020) applicator.push(prefixItems, items2020)
  else applicator.push(additionalItems, items)
  applicator.push(contains)
  return applicator
}

export type ApplicatorKeywordError =
  | ErrorNoParams<"false schema">
  | AdditionalItemsError
  | ItemsError
  | ContainsError
  | AdditionalPropertiesError
  | DependenciesError
  | IfKeywordError
  | AnyOfError
  | OneOfError
  | NotKeywordError
  | PropertyNamesError
