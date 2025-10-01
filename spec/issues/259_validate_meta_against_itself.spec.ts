import {describe, it} from "vitest"
import _Ajv from "../ajv.ts"

describe("issue #259, support validating [meta-]schemas against themselves", () => {
  it('should add schema before validation if "id" is the same as "$schema"', () => {
    const ajv = new _Ajv({strict: false})
    const hyperSchema = require("../../spec/remotes/hyper-schema.json")
    ajv.addMetaSchema(hyperSchema)
  })
})
