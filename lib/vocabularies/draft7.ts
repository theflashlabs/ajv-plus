import type {Vocabulary} from "../types/index.ts"
import coreVocabulary from "./core/index.ts"
import validationVocabulary from "./validation/index.ts"
import getApplicatorVocabulary from "./applicator/index.ts"
import formatVocabulary from "./format/index.ts"
import {metadataVocabulary, contentVocabulary} from "./metadata.ts"

const draft7Vocabularies: Vocabulary[] = [
  coreVocabulary,
  validationVocabulary,
  getApplicatorVocabulary(),
  formatVocabulary,
  metadataVocabulary,
  contentVocabulary,
]

export default draft7Vocabularies
