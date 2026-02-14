import type Ajv from "../../core.ts"
import type {AnySchemaObject} from "../../types/index.ts"
import metaSchema from "./schema.json" with {type: "json"}
import applicator from "./meta/applicator.json" with {type: "json"}
import content from "./meta/content.json" with {type: "json"}
import core from "./meta/core.json" with {type: "json"}
import format from "./meta/format.json" with {type: "json"}
import metadata from "./meta/meta-data.json" with {type: "json"}
import validation from "./meta/validation.json" with {type: "json"}

const META_SUPPORT_DATA = ["/properties"]

export default function addMetaSchema2019(this: Ajv, $data?: boolean): Ajv {
  ;[
    metaSchema,
    applicator,
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
