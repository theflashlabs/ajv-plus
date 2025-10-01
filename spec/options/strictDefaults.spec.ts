import {describe, expect, it} from "vitest"
import _Ajv from "../ajv.ts"
import type Ajv from "../../lib/core.ts"

describe("strict option with defaults (replaced strictDefaults)", () => {
  describe("useDefaults = true", () => {
    describe("strict = false", () => {
      it("should NOT throw an error or log a warning given an ignored default", () => {
        const output: any = {}
        const ajv = new _Ajv({
          useDefaults: true,
          strict: false,
          logger: getLogger(output),
        })
        const schema = {
          default: 5,
          properties: {},
        }

        ajv.compile(schema)
        expect(output.warning).toBeUndefined()
      })

      it("should NOT throw an error or log a warning given an ignored default #2", () => {
        const output: any = {}
        const ajv = new _Ajv({
          useDefaults: true,
          strict: false,
          logger: getLogger(output),
        })
        const schema = {
          oneOf: [
            {enum: ["foo", "bar"]},
            {
              properties: {
                foo: {
                  default: true,
                },
              },
            },
          ],
        }

        ajv.compile(schema)
        expect(output.warning).toBeUndefined()
      })
    })

    describe("strict = true", () => {
      it("should throw an error given an ignored default in the schema root when strict is true or undefined", () => {
        test(new _Ajv({useDefaults: true}))
        test(new _Ajv({useDefaults: true, strict: true}))

        function test(ajv: Ajv) {
          const schema = {
            default: 5,
            type: "object",
            properties: {},
          }
          expect(() => ajv.compile(schema)).toThrowError(/default is ignored in the schema root/)
        }
      })

      it("should throw an error given an ignored default in oneOf when strict is true or undefined", () => {
        test(new _Ajv({useDefaults: true}))
        test(new _Ajv({useDefaults: true, strict: true}))

        function test(ajv: Ajv) {
          const schema = {
            oneOf: [
              {enum: ["foo", "bar"]},
              {
                type: "object",
                properties: {
                  foo: {
                    default: true,
                  },
                },
              },
            ],
          }
          expect(() => {
            ajv.compile(schema)
          }).throw(/default is ignored/)
        }
      })
    })

    describe('strict = "log"', () => {
      it('should log a warning given an ignored default in the schema root when strict is "log"', () => {
        const output: any = {}
        const ajv = new _Ajv({
          useDefaults: true,
          strict: "log",
          logger: getLogger(output),
        })
        const schema = {
          type: "object",
          default: 5,
          properties: {},
        }
        ajv.compile(schema)
        expect(output.warning).match(/default is ignored in the schema root/)
      })

      it('should log a warning given an ignored default in oneOf when strict is "log"', () => {
        const output: any = {}
        const ajv = new _Ajv({
          useDefaults: true,
          strict: "log",
          logger: getLogger(output),
        })
        const schema = {
          oneOf: [
            {enum: ["foo", "bar"]},
            {
              type: "object",
              properties: {
                foo: {
                  default: true,
                },
              },
            },
          ],
        }
        ajv.compile(schema)
        expect(output.warning).match(/default is ignored for: data.foo/)
      })
    })
  })

  describe("useDefaults = false or undefined", () => {
    it("should NOT throw an error given an ignored default in the schema root when useDefaults is false", () => {
      test(new _Ajv({useDefaults: false}))
      test(new _Ajv({useDefaults: false, strict: true}))
      test(new _Ajv())
      test(new _Ajv({strict: true}))

      function test(ajv: Ajv) {
        const schema = {
          type: "object",
          default: 5,
          properties: {},
        }
        expect(() => {
          ajv.compile(schema)
        }).not.throw()
      }
    })

    it("should NOT throw an error given an ignored default in oneOf when useDefaults is false", () => {
      test(new _Ajv({useDefaults: false}))
      test(new _Ajv({useDefaults: false, strict: true}))
      test(new _Ajv())
      test(new _Ajv({strict: true}))

      function test(ajv: Ajv) {
        const schema = {
          oneOf: [
            {enum: ["foo", "bar"]},
            {
              type: "object",
              properties: {
                foo: {
                  default: true,
                },
              },
            },
          ],
        }
        expect(() => {
          ajv.compile(schema)
        }).not.throw()
      }
    })
  })

  function getLogger(output: {warning: any}) {
    return {
      log: () => {
        throw new Error("log should not be called")
      },
      warn: function (warning: any) {
        output.warning = warning
      },
      error: () => {
        throw new Error("error should not be called")
      },
    }
  }
})
