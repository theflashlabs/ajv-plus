import type {CodeKeywordDefinition} from "../../types/index.ts"

const def: CodeKeywordDefinition = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID')
  },
}

export default def
