import {describe, it, expect} from "vitest"
import _Ajv from "../ajv.ts"

describe("removeAdditional option", () => {
  it("should remove all additional properties", () => {
    const ajv = new _Ajv({removeAdditional: "all"})

    ajv.addSchema({
      $id: "//test/fooBar",
      type: "object",
      properties: {foo: {type: "string"}, bar: {type: "string"}},
    })

    const object = {
      foo: "foo",
      bar: "bar",
      baz: "baz-to-be-removed",
    }

    expect(ajv.validate("//test/fooBar", object)).equal(true)
    expect(object).have.property("foo")
    expect(object).have.property("bar")
    expect(object).not.have.property("baz")
  })

  it("should remove properties that would error when `additionalProperties = false`", () => {
    const ajv = new _Ajv({removeAdditional: true})

    ajv.addSchema({
      $id: "//test/fooBar",
      type: "object",
      properties: {foo: {type: "string"}, bar: {type: "string"}},
      additionalProperties: false,
    })

    const object = {
      foo: "foo",
      bar: "bar",
      baz: "baz-to-be-removed",
    }

    expect(ajv.validate("//test/fooBar", object)).equal(true)
    expect(object).have.property("foo")
    expect(object).have.property("bar")
    expect(object).not.have.property("baz")
  })

  it("should remove properties that would error when `additionalProperties = false` (many properties, boolean schema)", () => {
    const ajv = new _Ajv({removeAdditional: true})

    const schema = {
      type: "object",
      properties: {
        obj: {
          type: "object",
          additionalProperties: false,
          properties: {
            a: {type: "string"},
            b: false,
            c: {type: "string"},
            d: {type: "string"},
            e: {type: "string"},
            f: {type: "string"},
            g: {type: "string"},
            h: {type: "string"},
            i: {type: "string"},
          },
        },
      },
    }

    const data = {
      obj: {
        a: "valid",
        b: "should not be removed",
        additional: "will be removed",
      },
    }

    expect(ajv.validate(schema, data)).equal(false)
    expect(data).eql({
      obj: {
        a: "valid",
        b: "should not be removed",
      },
    })
  })

  it("should remove properties that would error when `additionalProperties` is a schema", () => {
    const ajv = new _Ajv({removeAdditional: "failing"})

    ajv.addSchema({
      $id: "//test/fooBar",
      type: "object",
      properties: {foo: {type: "string"}, bar: {type: "string"}},
      additionalProperties: {type: "string"},
    })

    const object = {
      foo: "foo",
      bar: "bar",
      baz: "baz-to-be-kept",
      fizz: 1000,
    }

    expect(ajv.validate("//test/fooBar", object)).equal(true)
    expect(object).have.property("foo")
    expect(object).have.property("bar")
    expect(object).have.property("baz")
    expect(object).not.have.property("fizz")

    ajv.addSchema({
      $id: "//test/fooBar2",
      type: "object",
      properties: {foo: {type: "string"}, bar: {type: "string"}},
      additionalProperties: {type: "string", pattern: "^to-be-", maxLength: 10},
    })

    const object1 = {
      foo: "foo",
      bar: "bar",
      baz: "to-be-kept",
      quux: "to-be-removed",
      fizz: 1000,
    }

    expect(ajv.validate("//test/fooBar2", object1)).equal(true)
    expect(object1).have.property("foo")
    expect(object1).have.property("bar")
    expect(object1).have.property("baz")
    expect(object1).not.have.property("fizz")
  })
})
