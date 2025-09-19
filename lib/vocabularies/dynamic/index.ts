import type {Vocabulary} from "../../types/index.ts"
import dynamicAnchor from "./dynamicAnchor.ts"
import dynamicRef from "./dynamicRef.ts"
import recursiveAnchor from "./recursiveAnchor.ts"
import recursiveRef from "./recursiveRef.ts"

const dynamic: Vocabulary = [dynamicAnchor, dynamicRef, recursiveAnchor, recursiveRef]

export default dynamic
