import {describe, expect, it} from "vitest"
import _Ajv from "../ajv.ts"
import type Ajv from "../../lib/core.ts"

describe("strict option with keywords (replaced structNumbers)", () => {
  describe("strict default", testStrict(new _Ajv()))
  describe("strict = true", testStrict(new _Ajv({strict: true})))
  describe('strict = "log"', testStrict(new _Ajv({strict: "log"})))
  describe("strict = false", testNotStrict(new _Ajv({strict: false})))
})

function testStrict(ajv: Ajv) {
  return () => {
    it("should fail validation for NaN/Infinity as type number", () => {
      const validate = ajv.compile({type: "number"})
      expect(validate("1.1")).equal(false)
      expect(validate(1.1)).equal(true)
      expect(validate(1)).equal(true)
      expect(validate(NaN)).equal(false)
      expect(validate(Infinity)).equal(false)
    })

    it("should fail validation for NaN as type integer", () => {
      const validate = ajv.compile({type: "integer"})
      expect(validate("1.1")).equal(false)
      expect(validate(1.1)).equal(false)
      expect(validate(1)).equal(true)
      expect(validate(NaN)).equal(false)
      expect(validate(Infinity)).equal(false)
    })
  }
}

function testNotStrict(_ajv: Ajv) {
  return () => {
    it("should NOT fail validation for NaN/Infinity as type number", () => {
      const validate = _ajv.compile({type: "number"})
      expect(validate("1.1")).equal(false)
      expect(validate(1.1)).equal(true)
      expect(validate(1)).equal(true)
      expect(validate(NaN)).equal(true)
      expect(validate(Infinity)).equal(true)
    })

    it("should NOT fail validation for NaN/Infinity as type integer", () => {
      const validate = _ajv.compile({type: "integer"})
      expect(validate("1.1")).equal(false)
      expect(validate(1.1)).equal(false)
      expect(validate(1)).equal(true)
      expect(validate(NaN)).equal(false)
      expect(validate(Infinity)).equal(true)
    })
  }
}
