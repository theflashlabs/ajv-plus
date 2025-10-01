import {describe, expect, it} from "vitest"
import _Ajv from "../ajv.ts"

describe("issue #204, options schemas and $data used together", () => {
  it("should use v5 metaschemas by default", () => {
    const ajv = new _Ajv({
      schemas: [{$id: "str", type: "string"}],
      $data: true,
    })

    const schema = {const: 42}
    const validate = ajv.compile(schema)

    expect(validate(42)).equal(true)
    expect(validate(43)).equal(false)

    expect(ajv.validate("str", "foo")).equal(true)
    expect(ajv.validate("str", 42)).equal(false)
  })
})
