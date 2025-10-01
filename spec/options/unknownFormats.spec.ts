import {describe, expect, it} from "vitest"
import _Ajv from "../ajv.ts"
import type Ajv from "../../lib/core.ts"

const DATE_FORMAT = /^\d\d\d\d-[0-1]\d-[0-3]\d$/

describe("specifying allowed unknown formats with `formats` option", () => {
  describe("= true (default)", () => {
    it("should fail schema compilation if unknown format is used", () => {
      test(new _Ajv())

      function test(ajv: Ajv) {
        expect(() => {
          ajv.compile({type: "string", format: "unknown"})
        }).throw(/unknown format/)
      }
    })

    it("should fail validation if unknown format is used via $data", () => {
      test(new _Ajv({$data: true}))

      function test(ajv: Ajv) {
        ajv.addFormat("date", DATE_FORMAT)
        const validate = ajv.compile({
          type: "object",
          properties: {
            foo: {type: "string", format: {$data: "1/bar"}},
            bar: {type: "string"},
          },
        })

        expect(validate({foo: 1, bar: "unknown"})).equal(false)
        expect(validate({foo: "2016-10-16", bar: "date"})).equal(true)
        expect(validate({foo: "20161016", bar: "date"})).equal(false)
        expect(validate({foo: "20161016"})).equal(true)

        expect(validate({foo: "2016-10-16", bar: "unknown"})).equal(false)
      }
    })
  })

  describe('= "ignore (default before 5.0.0)"', () => {
    it("should pass schema compilation and be valid if unknown format is used", () => {
      test(new _Ajv({strict: false, logger: false}))

      function test(ajv: Ajv) {
        const validate = ajv.compile({format: "unknown"})
        expect(validate("anything")).equal(true)
      }
    })

    it("should be valid if unknown format is used via $data", () => {
      test(new _Ajv({$data: true, strict: false}))

      function test(ajv: Ajv) {
        ajv.addFormat("date", DATE_FORMAT)
        const validate = ajv.compile({
          properties: {
            foo: {format: {$data: "1/bar"}},
            bar: {type: "string"},
          },
        })

        expect(validate({foo: 1, bar: "unknown"})).equal(true)
        expect(validate({foo: "2016-10-16", bar: "date"})).equal(true)
        expect(validate({foo: "20161016", bar: "date"})).equal(false)
        expect(validate({foo: "20161016"})).equal(true)
        expect(validate({foo: "2016-10-16", bar: "unknown"})).equal(true)
      }
    })
  })

  describe("= [String]", () => {
    it("should pass schema compilation and be valid if allowed unknown format is used", () => {
      test(new _Ajv({formats: {allowed: true}}))

      function test(ajv: Ajv) {
        const validate = ajv.compile({type: "string", format: "allowed"})
        expect(validate("anything")).equal(true)

        expect(() => {
          ajv.compile({type: "string", format: "unknown"})
        }).throw(/unknown format/)
      }
    })

    it("should be valid if allowed unknown format is used via $data", () => {
      test(new _Ajv({$data: true, formats: {allowed: true}, allowUnionTypes: true}))

      function test(ajv: Ajv) {
        ajv.addFormat("date", DATE_FORMAT)
        const validate = ajv.compile({
          type: "object",
          properties: {
            foo: {type: ["string", "number"], format: {$data: "1/bar"}},
            bar: {type: "string"},
          },
        })

        expect(validate({foo: 1, bar: "allowed"})).equal(true)
        expect(validate({foo: 1, bar: "unknown"})).equal(false)
        expect(validate({foo: "2016-10-16", bar: "date"})).equal(true)
        expect(validate({foo: "20161016", bar: "date"})).equal(false)
        expect(validate({foo: "20161016"})).equal(true)

        expect(validate({foo: "2016-10-16", bar: "allowed"})).equal(true)
        expect(validate({foo: "2016-10-16", bar: "unknown"})).equal(false)
      }
    })
  })
})
