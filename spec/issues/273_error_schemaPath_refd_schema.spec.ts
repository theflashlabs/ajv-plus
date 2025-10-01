import {describe, expect, it} from "vitest"
import _Ajv from "../ajv.ts"
import type Ajv from "../../lib/ajv.ts"
import assert from "assert"

describe.skip("issue #273, schemaPath in error in referenced schema", () => {
  it("should have canonic reference with hash after file name", () => {
    test(new _Ajv())
    test(new _Ajv({inlineRefs: false}))

    function test(ajv: Ajv) {
      const schema = {
        properties: {
          a: {$ref: "int"},
        },
      }

      const referencedSchema = {
        id: "int",
        type: "integer",
      }

      ajv.addSchema(referencedSchema)
      const validate = ajv.compile(schema)

      expect(validate({a: "foo"})).equal(false)
      assert(validate.errors)
      assert(validate.errors[0])
      expect(validate.errors[0].schemaPath).equal("int#/type")
    }
  })
})
