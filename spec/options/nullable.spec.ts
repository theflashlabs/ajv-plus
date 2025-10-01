import {describe, beforeEach, it, expect} from "vitest"
import _Ajv from "../ajv.ts"
import type Ajv from "../../lib/ajv.ts"
import type {Schema} from "../../lib/ajv.ts"

describe("nullable keyword", () => {
  let ajv: Ajv

  beforeEach(() => {
    ajv = new _Ajv()
  })

  it('should support keyword "nullable"', () => {
    testNullable({
      type: "number",
      nullable: true,
    })

    testNullable({
      type: ["number"],
      nullable: true,
    })

    testNullable({
      type: ["number", "null"],
    })

    testNullable({
      type: ["number", "null"],
      nullable: true,
    })

    testNotNullable({type: "number"})

    testNotNullable({type: ["number"]})
  })

  it('should respect "nullable" == false', () => {
    testNotNullable({
      type: "number",
      nullable: false,
    })

    testNotNullable({
      type: ["number"],
      nullable: false,
    })
  })

  it("should throw if type includes null with nullable: false", () => {
    expect(() => {
      ajv.compile({
        type: ["number", "null"],
        nullable: false,
      })
    }).toThrowError("type: null contradicts nullable: false")
  })

  it("should throw if nullable is used without type", () => {
    expect(() => {
      ajv.compile({
        nullable: true,
      })
    }).toThrowError('"nullable" cannot be used without "type"')
  })

  function testNullable(schema: Schema) {
    const validate = ajv.compile(schema)
    expect(validate(1)).equal(true)
    expect(validate(null)).equal(true)
    expect(validate("1")).equal(false)
  }

  function testNotNullable(schema: Schema) {
    const validate = ajv.compile(schema)
    expect(validate(1)).equal(true)
    expect(validate(null)).equal(false)
    expect(validate("1")).equal(false)
  }
})
