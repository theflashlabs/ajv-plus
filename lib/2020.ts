import type {AnySchemaObject} from "./types/index.ts"
import AjvCore, {Options} from "./core.ts"

import draft2020Vocabularies from "./vocabularies/draft2020.ts"
import discriminator from "./vocabularies/discriminator/index.ts"
import addMetaSchema2020 from "./refs/json-schema-2020-12/index.ts"

const META_SCHEMA_ID = "https://json-schema.org/draft/2020-12/schema"

export class Ajv2020 extends AjvCore {
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
    draft2020Vocabularies.forEach((v) => this.addVocabulary(v))
    if (this.opts.discriminator) this.addKeyword(discriminator)
  }

  _addDefaultMetaSchema(): void {
    super._addDefaultMetaSchema()
    const {$data, meta} = this.opts
    if (!meta) return
    addMetaSchema2020.call(this, $data)
    this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID
  }

  defaultMeta(): string | AnySchemaObject | undefined {
    return (this.opts.defaultMeta =
      super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : undefined))
  }
}

export default Ajv2020

export {
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

export {Plugin, Options, CodeOptions, InstanceOptions, Logger, ErrorsTextOptions} from "./core.ts"
export {SchemaCxt, SchemaObjCxt} from "./compile/index.ts"
export {KeywordCxt} from "./compile/validate/index.ts"
export {DefinedError} from "./vocabularies/errors.ts"
export {JSONType} from "./compile/rules.ts"
export {JSONSchemaType} from "./types/json-schema.ts"
export {
  _,
  str,
  stringify,
  nil,
  Name,
  Code,
  CodeGen,
  CodeGenOptions,
} from "./compile/codegen/index.ts"
export {default as ValidationError} from "./runtime/validation_error.ts"
export {default as MissingRefError} from "./compile/ref_error.ts"
