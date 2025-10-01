import {describe, expect, it} from "vitest"
import _Ajv from "../ajv.ts"

describe("unicodeRegExp option", () => {
  const unicodeChar = "\uD83D\uDC4D"
  const unicodeSchema = {
    type: "string",
    pattern: `^[${unicodeChar}]$`,
  }

  const schemaWithEscape = {
    type: "string",
    pattern: "^[\\:]$",
  }

  const patternPropertiesSchema = {
    type: "object",
    patternProperties: {
      "^\\:.*$": {type: "number"},
    },
    additionalProperties: false,
  }

  describe("= true (default)", () => {
    const ajv = new _Ajv()
    it("should fail schema compilation if used invalid (unnecessary) escape sequence for pattern", () => {
      expect(() => {
        ajv.compile(schemaWithEscape)
      }).throw(/Invalid escape/)
    })

    it("should fail schema compilation if used invalid (unnecessary) escape sequence for patternProperties", () => {
      expect(() => {
        ajv.compile(patternPropertiesSchema)
      }).throw(/Invalid escape/)
    })

    it("should validate unicode character", () => {
      const validate = ajv.compile(unicodeSchema)
      expect(validate(unicodeChar)).equal(true)
    })
  })

  describe("= false", () => {
    const ajv = new _Ajv({unicodeRegExp: false})
    it("should pass schema compilation if used unnecessary escape sequence for pattern", () => {
      expect(() => {
        const validate = ajv.compile(schemaWithEscape)
        expect(validate(":")).equal(true)
      }).not.throw()
    })

    it("should pass schema compilation if used unnecessary escape sequence for patternProperties", () => {
      expect(() => {
        const validate = ajv.compile(patternPropertiesSchema)
        expect(validate({":test": 1})).equal(true)
        expect(validate({test: 1})).equal(false)
      }).not.throw()
    })

    it("should not validate unicode character", () => {
      const validate = ajv.compile(unicodeSchema)
      expect(validate(unicodeChar)).equal(false)
    })
  })
})
