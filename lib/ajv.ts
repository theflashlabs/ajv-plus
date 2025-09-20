import type {AnySchemaObject} from "./types/index.ts"
import AjvCore from "./core.ts"
import draft7Vocabularies from "./vocabularies/draft7.ts"
import discriminator from "./vocabularies/discriminator/index.ts"
import draft7MetaSchema from "./refs/json-schema-draft-07.json" with {type: "json"}
const META_SUPPORT_DATA = ["/properties"]

const META_SCHEMA_ID = "http://json-schema.org/draft-07/schema"

export class Ajv extends AjvCore {
  _addVocabularies(): void {
    super._addVocabularies()
    draft7Vocabularies.forEach((v) => this.addVocabulary(v))
    if (this.opts.discriminator) this.addKeyword(discriminator)
  }

  _addDefaultMetaSchema(): void {
    super._addDefaultMetaSchema()
    if (!this.opts.meta) return
    const metaSchema = this.opts.$data
      ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA)
      : draft7MetaSchema
    this.addMetaSchema(metaSchema, META_SCHEMA_ID, false)
    this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID
  }

  defaultMeta(): string | AnySchemaObject | undefined {
    return (this.opts.defaultMeta =
      super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : undefined))
  }
}

export default Ajv

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
  SchemaValidateFunction,
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
