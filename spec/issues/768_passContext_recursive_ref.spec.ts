import {describe, beforeEach, it, expect} from "vitest"
import _Ajv from "../ajv.ts"
import type Ajv from "../../lib/ajv.ts"

describe("issue #768, fix passContext in recursive $ref", () => {
  let ajv: Ajv, contexts: any[]

  beforeEach(() => {
    contexts = []
  })

  describe("passContext = true", () => {
    it("should pass this value as context to user-defined keyword validation function", () => {
      const validate = getValidate(true)
      const self = {}
      validate.call(self, {bar: "a", baz: {bar: "b"}})
      expect(contexts).have.length(2)
      contexts.forEach((ctx) => expect(ctx).equal(self))
    })
  })

  describe("passContext = false", () => {
    it("should pass ajv instance as context to user-defined keyword validation function", () => {
      const validate = getValidate(false)
      validate({bar: "a", baz: {bar: "b"}})
      expect(contexts).have.length(2)
      contexts.forEach((ctx) => expect(ctx).equal(ajv))
    })
  })

  describe("ref is fragment and passContext = true", () => {
    it("should pass this value as context to user-defined keyword validation function", () => {
      const validate = getValidateFragments(true)
      const self = {}
      validate.call(self, {baz: {corge: "a", quux: {baz: {corge: "b"}}}})
      expect(contexts).have.length(2)
      contexts.forEach((ctx) => expect(ctx).equal(self))
    })
  })

  describe("ref is fragment and passContext = false", () => {
    it("should pass ajv instance as context to user-defined keyword validation function", () => {
      const validate = getValidateFragments(false)
      validate({baz: {corge: "a", quux: {baz: {corge: "b"}}}})
      expect(contexts).have.length(2)
      contexts.forEach((ctx) => expect(ctx).equal(ajv))
    })
  })

  function getValidate(passContext: boolean) {
    ajv = new _Ajv({passContext})
    ajv.addKeyword({keyword: "testValidate", validate: storeContext})

    const schema = {
      $id: "foo",
      type: "object",
      required: ["bar"],
      properties: {
        bar: {testValidate: true},
        baz: {
          $ref: "foo",
        },
      },
    }

    return ajv.compile(schema)
  }

  function getValidateFragments(passContext: boolean) {
    ajv = new _Ajv({passContext})
    ajv.addKeyword({keyword: "testValidate", validate: storeContext})

    ajv.addSchema({
      $id: "foo",
      definitions: {
        bar: {
          type: "object",
          properties: {
            baz: {
              $ref: "boo",
            },
          },
        },
      },
    })

    ajv.addSchema({
      $id: "boo",
      type: "object",
      required: ["corge"],
      properties: {
        quux: {$ref: "foo#/definitions/bar"},
        corge: {testValidate: true},
      },
    })

    return ajv.compile({$ref: "foo#/definitions/bar"})
  }

  function storeContext(this: any) {
    contexts.push(this)
    return true
  }
})
