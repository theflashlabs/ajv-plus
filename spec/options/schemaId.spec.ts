import {describe, it, expect} from "vitest"
import type Ajv from "../../lib/ajv.ts"
import _Ajv from "../ajv.ts"
import assert from "assert"

describe("removed schemaId option", () => {
  it("should use $id and throw exception when id is used", () => {
    test(new _Ajv({logger: false}))

    function test(ajv: Ajv) {
      ajv.addSchema({$id: "mySchema1", type: "string"})
      const validate = ajv.getSchema("mySchema1")
      assert(validate)
      expect(validate("foo")).equal(true)
      expect(validate(1)).equal(false)

      expect(() => ajv.compile({id: "mySchema2", type: "string"})).toThrowError(
        /NOT SUPPORTED: keyword "id"/
      )
    }
  })

  it("should use $id and throw exception for id when strict: false", () => {
    test(new _Ajv({logger: false, strict: false}))

    function test(ajv: Ajv) {
      ajv.addSchema({$id: "mySchema1", type: "string"})
      const validate = ajv.getSchema("mySchema1")
      assert(typeof validate == "function")
      expect(validate("foo")).equal(true)
      expect(validate(1)).equal(false)

      expect(() => ajv.compile({id: "mySchema2", type: "string"})).toThrowError(
        /NOT SUPPORTED: keyword "id"/
      )
      expect(ajv.getSchema("mySchema2")).toBeUndefined()
    }
  })
})
