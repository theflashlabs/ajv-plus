import {afterEach, beforeEach, describe, expect, it} from "vitest"
import _Ajv from "../ajv.ts"
import type Ajv from "../../lib/core.ts"
import assert from "assert"

describe("reporting options", () => {
  describe("verbose", () => {
    it("should add schema, parentSchema and data to errors with verbose option == true", () => {
      testVerbose(new _Ajv({verbose: true}))
      testVerbose(new _Ajv({verbose: true, allErrors: true}))

      function testVerbose(ajv: Ajv) {
        const schema = {
          type: "object",
          properties: {
            foo: {type: "number", minimum: 5},
          },
        }
        const validate = ajv.compile(schema)

        const data = {foo: 3}
        expect(validate(data)).equal(false)
        expect(validate.errors).have.length(1)
        assert(validate.errors)
        const err = validate.errors[0]

        expect(err?.schema).equal(5)
        expect(err?.parentSchema).eql({type: "number", minimum: 5})
        expect(err?.parentSchema).equal(schema.properties.foo) // by reference
        expect(err?.data).equal(3)
      }
    })
  })

  describe("allErrors", () => {
    it('should be disabled inside "not" keyword', () => {
      test(new _Ajv(), false)
      test(new _Ajv({allErrors: true}), true)

      function test(ajv: Ajv, allErrors: boolean) {
        let format1called = false,
          format2called = false

        ajv.addFormat("format1", () => {
          format1called = true
          return false
        })

        ajv.addFormat("format2", () => {
          format2called = true
          return false
        })

        const schema1 = {
          type: "string",
          allOf: [{format: "format1"}, {format: "format2"}],
        }

        expect(ajv.validate(schema1, "abc")).equal(false)
        expect(ajv.errors).have.length(allErrors ? 2 : 1)
        expect(format1called).equal(true)
        expect(format2called).equal(allErrors)

        const schema2 = {
          not: schema1,
        }

        format1called = format2called = false
        expect(ajv.validate(schema2, "abc")).equal(true)
        expect(ajv.errors).equal(null)
        expect(format1called).equal(true)
        expect(format2called).equal(false)
      }
    })
  })

  describe("logger", () => {
    /**
     * The logger option tests are based on the meta scenario which writes into the logger.warn
     */

    const origConsoleWarn = console.warn
    let consoleCalled: boolean

    beforeEach(() => {
      consoleCalled = false
      console.warn = () => (consoleCalled = true)
    })

    afterEach(() => {
      console.warn = origConsoleWarn
    })

    it("no user-defined logger is given - global console should be used", () => {
      const ajv = new _Ajv({meta: false})

      ajv.compile({
        type: "number",
        minimum: 1,
      })

      expect(consoleCalled).equal(true)
    })

    it("user-defined logger is an object - logs should only report to it", () => {
      let loggerCalled = false

      const logger = {
        warn: log,
        log: log,
        error: log,
      }

      const ajv = new _Ajv({
        meta: false,
        logger: logger,
      })

      ajv.compile({
        type: "number",
        minimum: 1,
      })

      expect(loggerCalled).equal(true)
      expect(consoleCalled).equal(false)

      function log() {
        loggerCalled = true
      }
    })

    it("logger option is false - no logs should be reported", () => {
      const ajv = new _Ajv({
        meta: false,
        logger: false,
      })

      ajv.compile({
        type: "number",
        minimum: 1,
      })

      expect(consoleCalled).equal(false)
    })

    it("logger option is an object without required methods - an error should be thrown", () => {
      const opts: any = {
        meta: false,
        logger: {},
      }
      expect(() => new _Ajv(opts)).toThrowError(/logger must implement log, warn and error methods/)
    })
  })
})
