import _Ajv from "../ajv.ts"
import chai from "../chai.ts"
import {createRequire} from "module"
chai.should()

const require = createRequire(import.meta.url)

describe("issue #259, support validating [meta-]schemas against themselves", () => {
  it('should add schema before validation if "id" is the same as "$schema"', () => {
    const ajv = new _Ajv({strict: false})
    const hyperSchema = require("../../spec/remotes/hyper-schema.json")
    ajv.addMetaSchema(hyperSchema)
  })
})
