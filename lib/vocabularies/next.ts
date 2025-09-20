import type {Vocabulary} from "../types/index.ts"
import dependentRequired from "./validation/dependentRequired.ts"
import dependentSchemas from "./applicator/dependentSchemas.ts"
import limitContains from "./validation/limitContains.ts"

const next: Vocabulary = [dependentRequired, dependentSchemas, limitContains]

export default next
