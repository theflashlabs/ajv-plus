import type {CodeKeywordDefinition, ErrorObject} from "../../types/index.ts"
import {
  validatePropertyDeps,
  error,
  DependenciesErrorParams,
  PropertyDependencies,
} from "../applicator/dependencies.ts"

export type DependentRequiredError = ErrorObject<
  "dependentRequired",
  DependenciesErrorParams,
  PropertyDependencies
>

const def: CodeKeywordDefinition = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error,
  code: (cxt) => validatePropertyDeps(cxt),
}

export default def
