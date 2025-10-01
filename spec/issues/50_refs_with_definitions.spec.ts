import {describe, expect, it} from "vitest"
import type AjvCore from "../../lib/core.ts"
import type AjvPack from "../../lib/standalone/instance.ts"
import {getStandalone} from "../ajv_standalone.ts"
import _Ajv from "../ajv.ts"

describe('issue #50: references with "definitions"', () => {
  const schema1 = {
    $id: "http://example.com/test/person.json#",
    definitions: {
      name: {type: "string"},
    },
    type: "object",
    properties: {
      name: {$ref: "#/definitions/name"},
    },
  }

  const schema2 = {
    $id: "http://example.com/test/employee.json#",
    type: "object",
    properties: {
      person: {$ref: "/test/person.json#"},
      role: {type: "string"},
    },
  }

  it("should be supported by addSchema", () => {
    const ajv = new _Ajv()
    ajv.addSchema(schema1)
    ajv.addSchema(schema2)
    spec(ajv)
  })

  it("should be supported by compile", () => {
    const ajv = new _Ajv()
    ajv.compile(schema1)
    ajv.compile(schema2)
    spec(ajv)
  })

  it("should be supported by addSchema: standalone", () => {
    const ajv = getStandalone(_Ajv)
    ajv.addSchema(schema1)
    ajv.addSchema(schema2)
    spec(ajv)
  })

  it("should be supported by compile: standalone", () => {
    const ajv = getStandalone(_Ajv)
    ajv.compile(schema1)
    ajv.compile(schema2)
    spec(ajv)
  })

  function spec(ajv: AjvCore | AjvPack): void {
    const result = ajv.validate("http://example.com/test/employee.json#", {
      person: {
        name: "Alice",
      },
      role: "Programmer",
    })

    expect(result).equal(true)
    expect(ajv.errors).equal(null)
  }
})
