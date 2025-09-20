import type {Vocabulary} from "../types/index.ts"
import coreVocabulary from "./core/index.ts"
import validationVocabulary from "./validation/index.ts"
import getApplicatorVocabulary from "./applicator/index.ts"
import dynamicVocabulary from "./dynamic/index.ts"
import nextVocabulary from "./next.ts"
import unevaluatedVocabulary from "./unevaluated/index.ts"
import formatVocabulary from "./format/index.ts"
import {metadataVocabulary, contentVocabulary} from "./metadata.ts"

const draft2020Vocabularies: Vocabulary[] = [
  dynamicVocabulary,
  coreVocabulary,
  validationVocabulary,
  getApplicatorVocabulary(true),
  formatVocabulary,
  metadataVocabulary,
  contentVocabulary,
  nextVocabulary,
  unevaluatedVocabulary,
]

export default draft2020Vocabularies
