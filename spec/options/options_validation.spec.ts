import {describe, it, expect} from "vitest"
import _Ajv from "../ajv.ts"
import type Ajv from "../../lib/core.ts"

const DATE_FORMAT = /^\d\d\d\d-[0-1]\d-[0-3]\d$/

describe("validation options", () => {
  describe("format", () => {
    it("should not validate formats if option format == false", () => {
      const ajv = new _Ajv({formats: {date: DATE_FORMAT}}),
        ajvFF = new _Ajv({formats: {date: DATE_FORMAT}, validateFormats: false})

      const schema = {type: "string", format: "date"}
      const invalideDateTime = "06/19/1963" // expects hyphens

      expect(ajv.validate(schema, invalideDateTime)).equal(false)
      expect(ajvFF.validate(schema, invalideDateTime)).equal(true)
    })
  })

  describe("formats", () => {
    it("should add formats from options", () => {
      const ajv = new _Ajv({
        allowUnionTypes: true,
        formats: {
          identifier: /^[a-z_$][a-z0-9_$]*$/i,
        },
      })

      const validate = ajv.compile({
        type: ["string", "number"],
        format: "identifier",
      })

      expect(validate("Abc1")).equal(true)
      expect(validate("foo bar")).equal(false)
      expect(validate("123")).equal(false)
      expect(validate(123)).equal(true)
    })
  })

  describe("keywords", () => {
    it("should add keywords from options", () => {
      const ajv = new _Ajv({
        allowUnionTypes: true,
        keywords: [
          {
            keyword: "identifier",
            type: "string",
            validate: function (_schema: any, data: string) {
              return /^[a-z_$][a-z0-9_$]*$/i.test(data)
            },
          },
        ],
      })

      testKeyword(ajv)
    })

    it("should support old keywords option as map", () => {
      const ajv = new _Ajv({
        allowUnionTypes: true,
        keywords: {
          //@ts-expect-error
          identifier: {
            type: "string",
            schema: false,
            validate: function (data: string) {
              return /^[a-z_$][a-z0-9_$]*$/i.test(data)
            },
          },
        },
        logger: false,
      })

      testKeyword(ajv)
    })

    function testKeyword(ajv: Ajv) {
      const validate = ajv.compile({
        type: ["string", "number"],
        identifier: true,
      })

      expect(validate("Abc1")).equal(true)
      expect(validate("foo bar")).equal(false)
      expect(validate("123")).equal(false)
      expect(validate(123)).equal(true)
    }
  })

  describe("unicode", () => {
    it("should use String.prototype.length with deprecated unicode option == false", () => {
      const ajvUnicode = new _Ajv()
      testUnicode(new _Ajv({unicode: false, logger: false}))
      testUnicode(new _Ajv({unicode: false, allErrors: true, logger: false}))

      function testUnicode(ajv: Ajv) {
        let validateWithUnicode = ajvUnicode.compile({type: "string", minLength: 2})
        let validate = ajv.compile({type: "string", minLength: 2})

        expect(validateWithUnicode("😀")).equal(false)
        expect(validate("😀")).equal(true)

        validateWithUnicode = ajvUnicode.compile({type: "string", maxLength: 1})
        validate = ajv.compile({type: "string", maxLength: 1})

        expect(validateWithUnicode("😀")).equal(true)
        expect(validate("😀")).equal(false)
      }
    })
  })

  describe("multipleOfPrecision", () => {
    it("should allow for some deviation from 0 when validating multipleOf with value < 1", () => {
      test(new _Ajv({multipleOfPrecision: 7}))
      test(new _Ajv({multipleOfPrecision: 7, allErrors: true}))

      function test(ajv: Ajv) {
        let schema = {type: "number", multipleOf: 0.01}
        let validate = ajv.compile(schema)

        expect(validate(4.18)).equal(true)
        expect(validate(4.181)).equal(false)

        schema = {type: "number", multipleOf: 0.0000001}
        validate = ajv.compile(schema)

        expect(validate(53.198098)).equal(true)
        expect(validate(53.1980981)).equal(true)
        expect(validate(53.19809811)).equal(false)
      }
    })
  })
})
