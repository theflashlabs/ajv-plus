import type {AnySchemaObject} from "./types/index.ts"
import AjvCore, {type Options} from "./core.ts"

import draft7Vocabularies from "./vocabularies/draft7.ts"
import dynamicVocabulary from "./vocabularies/draft7.ts"
import nextVocabulary from "./vocabularies/next.ts"
import unevaluatedVocabulary from "./vocabularies/unevaluated/index.ts"
import discriminator from "./vocabularies/discriminator/index.ts"
import addMetaSchema2019 from "./refs/json-schema-2019-09/index.ts"

const META_SCHEMA_ID = "https://json-schema.org/draft/2019-09/schema"

export class Ajv2019 extends AjvCore {
  constructor(opts: Options = {}) {
    super({
      ...opts,
      dynamicRef: true,
      next: true,
      unevaluated: true,
    })
  }

  _addVocabularies(): void {
    super._addVocabularies()
    //@ts-expect-error
    this.addVocabulary(dynamicVocabulary)
    draft7Vocabularies.forEach((v) => this.addVocabulary(v))
    this.addVocabulary(nextVocabulary)
    this.addVocabulary(unevaluatedVocabulary)
    if (this.opts.discriminator) this.addKeyword(discriminator)
  }

  _addDefaultMetaSchema(): void {
    super._addDefaultMetaSchema()
    const {$data, meta} = this.opts
    if (!meta) return
    addMetaSchema2019.call(this, $data)
    this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID
  }

  defaultMeta(): string | AnySchemaObject | undefined {
    return (this.opts.defaultMeta =
      super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : undefined))
  }
}

export default Ajv2019

export type {
  Format,
  FormatDefinition,
  AsyncFormatDefinition,
  KeywordDefinition,
  KeywordErrorDefinition,
  CodeKeywordDefinition,
  MacroKeywordDefinition,
  FuncKeywordDefinition,
  Vocabulary,
  Schema,
  SchemaObject,
  AnySchemaObject,
  AsyncSchema,
  AnySchema,
  ValidateFunction,
  AsyncValidateFunction,
  ErrorObject,
  ErrorNoParams,
} from "./types/index.ts"

export type {
  Plugin,
  Options,
  CodeOptions,
  InstanceOptions,
  Logger,
  ErrorsTextOptions,
} from "./core.ts"
export type {SchemaCxt, SchemaObjCxt} from "./compile/index.ts"
export {KeywordCxt} from "./compile/validate/index.ts"
export type {DefinedError} from "./vocabularies/errors.ts"
export type {JSONType} from "./compile/rules.ts"
export type {JSONSchemaType} from "./types/json-schema.ts"
export {
  _,
  str,
  stringify,
  nil,
  Name,
  type Code,
  CodeGen,
  type CodeGenOptions,
} from "./compile/codegen/index.ts"
export {default as ValidationError} from "./runtime/validation_error.ts"
export {default as MissingRefError} from "./compile/ref_error.ts"
