import type {Vocabulary} from "../../types/index.ts"
import idKeyword from "./id.ts"
import refKeyword from "./ref.ts"

const core: Vocabulary = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  {keyword: "$comment"},
  "definitions",
  idKeyword,
  refKeyword,
]

export default core
