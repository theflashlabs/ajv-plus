import {describe, it, expect} from "vitest"
import _Ajv from "../ajv.ts"
import type {Options} from "../../lib/ajv.ts"

describe("referenced schema options", () => {
  describe("ignoreKeywordsWithRef", () => {
    describe("= undefined", () => {
      it("should allow extending $ref with other keywords", () => {
        test({}, true)
      })

      it("should NOT log warning", () => {
        testWarning()
      })
    })

    describe("= true", () => {
      it("should ignore other keywords when $ref is used", () => {
        test({ignoreKeywordsWithRef: true, logger: false}, false)
      })

      it("should log warning when other keywords are used with $ref", () => {
        testWarning({ignoreKeywordsWithRef: true}, /keywords\signored/)
      })
    })

    function test(opts: Options, shouldExtendRef: boolean) {
      const ajv = new _Ajv(opts)
      const schema = {
        definitions: {
          int: {type: "integer"},
        },
        type: "number",
        $ref: "#/definitions/int",
        minimum: 10,
      }

      let validate = ajv.compile(schema)
      expect(validate(10)).equal(true)
      expect(validate(1)).equal(!shouldExtendRef)

      const schema1 = {
        definitions: {
          int: {type: "integer"},
        },
        type: "object",
        properties: {
          foo: {
            $ref: "#/definitions/int",
            type: "number",
            minimum: 10,
          },
          bar: {
            type: "number",
            allOf: [{$ref: "#/definitions/int"}, {minimum: 10}],
          },
        },
      }

      validate = ajv.compile(schema1)
      expect(validate({foo: 10, bar: 10})).equal(true)
      expect(validate({foo: 1, bar: 10})).equal(!shouldExtendRef)
      expect(validate({foo: 10, bar: 1})).equal(false)
    }

    function testWarning(opts: Options = {}, msgPattern?: RegExp) {
      let oldConsole = console.warn
      try {
        let consoleMsg
        console.warn = function (...args: any[]) {
          consoleMsg = Array.prototype.join.call(args, " ")
        }

        const ajv = new _Ajv(opts)

        const schema = {
          definitions: {
            int: {type: "integer"},
          },
          type: "number",
          $ref: "#/definitions/int",
          minimum: 10,
        }

        ajv.compile(schema)
        if (msgPattern) expect(consoleMsg).match(msgPattern)
        else expect(consoleMsg).toBeUndefined()
      } finally {
        console.warn = oldConsole
      }
    }
  })

  describe("missingRefs", () => {
    it("should throw if ref is missing without this option", () => {
      const ajv = new _Ajv()
      expect(() => {
        ajv.compile({$ref: "missing_reference"})
      }).toThrowError(/can't resolve reference missing_reference/)
    })
  })
})
