import type {TypeError} from "../compile/validate/dataType.ts"
import type {ApplicatorKeywordError} from "./applicator/index.ts"
import type {ValidationKeywordError} from "./validation/index.ts"
import type {FormatError} from "./format/format.ts"
import type {UnevaluatedPropertiesError} from "./unevaluated/unevaluatedProperties.ts"
import type {UnevaluatedItemsError} from "./unevaluated/unevaluatedItems.ts"
import type {DependentRequiredError} from "./validation/dependentRequired.ts"
import type {DiscriminatorError} from "./discriminator/index.ts"

export type DefinedError =
  | TypeError
  | ApplicatorKeywordError
  | ValidationKeywordError
  | FormatError
  | UnevaluatedPropertiesError
  | UnevaluatedItemsError
  | DependentRequiredError
  | DiscriminatorError
