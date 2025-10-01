import {describe, expect, it} from "vitest"
import type AjvCore from "../../lib/core.ts"
import type AjvPack from "../../lib/standalone/instance.ts"
import {getStandalone} from "../ajv_standalone.ts"
import _Ajv from "../ajv.ts"

describe("issue #210, mutual recursive $refs that are schema fragments", () => {
  describe("one ref is fragment", () => {
    it("should compile and validate schema", spec(new _Ajv()))
    it("should compile and validate schema: standalone", spec(getStandalone(_Ajv)))

    function spec(ajv: AjvCore | AjvPack): () => void {
      return () => {
        ajv.addSchema({
          $id: "foo",
          definitions: {
            bar: {
              type: "object",
              properties: {
                baz: {
                  anyOf: [{enum: [42]}, {$ref: "boo"}],
                },
              },
            },
          },
        })

        ajv.addSchema({
          $id: "boo",
          type: "object",
          required: ["quux"],
          properties: {
            quux: {$ref: "foo#/definitions/bar"},
          },
        })

        const validate = ajv.compile({$ref: "foo#/definitions/bar"})
        expect(validate({baz: {quux: {baz: 42}}})).equal(true)
        expect(validate({baz: {quux: {baz: "foo"}}})).equal(false)
      }
    }
  })

  describe("both refs are fragments", () => {
    it("should compile and validate schema", spec(new _Ajv()))
    it("should compile and validate schema: standalone", spec(getStandalone(_Ajv)))

    function spec(ajv: AjvCore | AjvPack): () => void {
      return () => {
        ajv.addSchema({
          $id: "foo",
          definitions: {
            bar: {
              type: "object",
              properties: {
                baz: {
                  anyOf: [{enum: [42]}, {$ref: "boo#/definitions/buu"}],
                },
              },
            },
          },
        })

        ajv.addSchema({
          $id: "boo",
          definitions: {
            buu: {
              type: "object",
              required: ["quux"],
              properties: {
                quux: {$ref: "foo#/definitions/bar"},
              },
            },
          },
        })

        const validate = ajv.compile({$ref: "foo#/definitions/bar"})

        expect(validate({baz: {quux: {baz: 42}}})).equal(true)
        expect(validate({baz: {quux: {baz: "foo"}}})).equal(false)
      }
    }
  })
})
