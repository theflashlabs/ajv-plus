import type AjvCore from "../../dist/core.d.ts"
import type AjvPack from "../../dist/standalone/instance.d.ts"
import _Ajv from "../ajv.ts"
import {getStandalone} from "../ajv_standalone.ts"
import chai from "../chai.ts"
chai.should()

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
    result.should.equal(true)

    result = ajv.validate("obj.json#", {foo: "abcde", bar: "fghg"})
    result.should.equal(false)
    ajv.errors?.should.have.length(1)
  }
})
