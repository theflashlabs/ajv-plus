import type Ajv from "../../core.ts"
import type {AnySchemaObject} from "../../types/index.ts"
import * as metaSchema from "./schema.json" with {type: "json"}
import * as applicator from "./meta/applicator.json" with {type: "json"}
import * as unevaluated from "./meta/unevaluated.json" with {type: "json"}
import * as content from "./meta/content.json" with {type: "json"}
import * as core from "./meta/core.json" with {type: "json"}
import * as format from "./meta/format-annotation.json" with {type: "json"}
import * as metadata from "./meta/meta-data.json" with {type: "json"}
import * as validation from "./meta/validation.json" with {type: "json"}

const META_SUPPORT_DATA = ["/properties"]

export default function addMetaSchema2020(this: Ajv, $data?: boolean): Ajv {
  ;[
    metaSchema,
    applicator,
    unevaluated,
    content,
    core,
    with$data(this, format),
    metadata,
    with$data(this, validation),
  ].forEach((sch) => this.addMetaSchema(sch, undefined, false))
  return this

  function with$data(ajv: Ajv, sch: AnySchemaObject): AnySchemaObject {
    return $data ? ajv.$dataMetaSchema(sch, META_SUPPORT_DATA) : sch
  }
}
