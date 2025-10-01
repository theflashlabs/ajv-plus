import {beforeEach, describe, expect, it} from "vitest"
import _Ajv from "../ajv.ts"
import type Ajv from "../../lib/ajv.ts"

describe("meta and validateSchema options", () => {
  it("should add draft-7 meta schema by default", () => {
    testOptionMeta(new _Ajv())
    testOptionMeta(new _Ajv({meta: true}))

    function testOptionMeta(ajv: Ajv) {
      expect(ajv.getSchema("http://json-schema.org/draft-07/schema")).be.a("function")
      expect(ajv.validateSchema({$id: "ok", type: "integer"})).equal(true)
      expect(ajv.validateSchema({$id: "wrong", type: 123})).equal(false)
      expect(() => {
        ajv.addSchema({$id: "ok", type: "integer"})
      }).not.throw()
      expect(() => {
        ajv.addSchema({$id: "wrong", type: 123})
      }).toThrowError(/schema is invalid/)
    }
  })

  it("should throw if meta: false and validateSchema: true", () => {
    const ajv = new _Ajv({meta: false, logger: false})
    expect(ajv.getSchema("http://json-schema.org/draft-07/schema")).toBeUndefined()
    expect(() => {
      ajv.addSchema({type: "wrong_type"}, "integer")
    }).not.throw()
  })

  it("should skip schema validation with validateSchema: false", () => {
    let ajv = new _Ajv()
    expect(() => {
      ajv.addSchema({type: 123}, "integer")
    }).toThrowError(/schema is invalid/)

    ajv = new _Ajv({validateSchema: false})
    expect(() => {
      ajv.addSchema({type: 123}, "integer")
    }).not.throw()

    ajv = new _Ajv({validateSchema: false, meta: false})
    expect(() => {
      ajv.addSchema({type: 123}, "integer")
    }).not.throw()
  })

  describe('validateSchema: "log"', () => {
    let loggedError: boolean, loggedWarning: boolean
    const logger = {
      log() {},
      warn: () => (loggedWarning = true),
      error: () => (loggedError = true),
    }

    beforeEach(() => {
      loggedError = false
      loggedWarning = false
    })

    it("should not throw on invalid schema", () => {
      const ajv = new _Ajv({validateSchema: "log", logger})
      expect(() => {
        ajv.addSchema({type: 123}, "integer")
      }).not.throw()
      expect(loggedError).equal(true)
      expect(loggedWarning).equal(false)
    })

    it("should not throw on invalid schema with meta: false", () => {
      const ajv = new _Ajv({validateSchema: "log", meta: false, logger})
      expect(() => {
        ajv.addSchema({type: 123}, "integer")
      }).not.throw()
      expect(loggedError).equal(false)
      expect(loggedWarning).equal(true)
    })
  })

  it("should validate v6 schema", () => {
    const ajv = new _Ajv()
    expect(ajv.validateSchema({contains: {minimum: 2}})).equal(true)
    expect(ajv.validateSchema({contains: 2})).equal(false)
  })

  it("should use option meta as default meta schema", () => {
    const meta = {
      $schema: "http://json-schema.org/draft-07/schema",
      properties: {
        myKeyword: {type: "boolean"},
      },
    }
    let ajv = new _Ajv({meta: meta})
    expect(ajv.validateSchema({myKeyword: true})).equal(true)
    expect(ajv.validateSchema({myKeyword: 2})).equal(false)
    expect(
      ajv.validateSchema({
        $schema: "http://json-schema.org/draft-07/schema",
        myKeyword: 2,
      })
    ).equal(true)

    ajv = new _Ajv()
    expect(ajv.validateSchema({myKeyword: true})).equal(true)
    expect(ajv.validateSchema({myKeyword: 2})).equal(true)
  })
})
