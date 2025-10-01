import {describe, it, expect} from "vitest"
import type AjvCore from "../../lib/core.ts"
import type AjvPack from "../../lib/standalone/instance.ts"
import _Ajv from "../ajv.ts"
import {getStandalone} from "../ajv_standalone.ts"

describe("issue #8: schema with shared references", () => {
  const propertySchema = {
    type: "string",
    maxLength: 4,
  }

  const schema = {
    $id: "obj.json#",
    type: "object",
    properties: {
      foo: propertySchema,
      bar: propertySchema,
    },
  }

  it("should be supported by addSchema", () => {
    spec(new _Ajv().addSchema(schema))
  })

  it("should be supported by compile", () => {
    const ajv = new _Ajv()
    ajv.compile(schema)
    spec(ajv)
  })

  it("should be supported by addSchema: standalone", () => {
    spec(getStandalone(_Ajv).addSchema(schema))
  })

  it("should be supported by compile: standalone", () => {
    const ajv = getStandalone(_Ajv)
    ajv.compile(schema)
    spec(ajv)
  })

  function spec(ajv: AjvCore | AjvPack): void {
    let result = ajv.validate("obj.json#", {foo: "abc", bar: "def"})
    expect(result).equal(true)

    result = ajv.validate("obj.json#", {foo: "abcde", bar: "fghg"})
    expect(result).equal(false)
    expect(ajv.errors).have.length(1)
  }
})
