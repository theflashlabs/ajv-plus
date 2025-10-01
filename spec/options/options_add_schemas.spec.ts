import {beforeEach, describe, expect, it} from "vitest"
import _Ajv from "../ajv.ts"
import type Ajv from "../../lib/ajv.ts"

describe("options to add schemas", () => {
  describe("schemas", () => {
    it("should add schemas from object", () => {
      const ajv = new _Ajv({
        schemas: {
          int: {type: "integer"},
          str: {type: "string"},
        },
      })

      expect(ajv.validate("int", 123)).equal(true)
      expect(ajv.validate("int", "foo")).equal(false)
      expect(ajv.validate("str", "foo")).equal(true)
      expect(ajv.validate("str", 123)).equal(false)
    })

    it("should add schemas from array", () => {
      const ajv = new _Ajv({
        schemas: [
          {$id: "int", type: "integer"},
          {$id: "str", type: "string"},
          {
            $id: "obj",
            type: "object",
            properties: {
              int: {$ref: "int"},
              str: {$ref: "str"},
            },
          },
        ],
      })

      expect(ajv.validate("obj", {int: 123, str: "foo"})).equal(true)
      expect(ajv.validate("obj", {int: "foo", str: "bar"})).equal(false)
      expect(ajv.validate("obj", {int: 123, str: 456})).equal(false)
    })
  })

  describe("addUsedSchema", () => {
    ;[true, undefined].forEach((optionValue) => {
      describe("= " + optionValue, () => {
        let ajv: Ajv

        beforeEach(() => {
          ajv = new _Ajv({addUsedSchema: optionValue as boolean})
        })

        describe("compile and validate", () => {
          it("should add schema", () => {
            let schema = {$id: "str", type: "string"}
            const validate = ajv.compile(schema)
            expect(validate("abc")).equal(true)
            expect(validate(1)).equal(false)
            expect(ajv.getSchema("str")).equal(validate)

            schema = {$id: "int", type: "integer"}
            expect(ajv.validate(schema, 1)).equal(true)
            expect(ajv.validate(schema, "abc")).equal(false)
            expect(ajv.getSchema("int")).be.a("function")
          })

          it("should throw with duplicate ID", () => {
            ajv.compile({$id: "str", type: "string"})
            expect(() => {
              ajv.compile({$id: "str", type: "string", minLength: 2})
            }).toThrowError(/already exists/)

            const schema = {$id: "int", type: "integer"}
            const schema2 = {$id: "int", type: "integer", minimum: 0}
            expect(ajv.validate(schema, 1)).equal(true)
            expect(() => {
              ajv.validate(schema2, 1)
            }).toThrowError(/already exists/)
          })
        })
      })
    })

    describe("= false", () => {
      let ajv: Ajv

      beforeEach(() => {
        ajv = new _Ajv({addUsedSchema: false})
      })

      describe("compile and validate", () => {
        it("should NOT add schema", () => {
          let schema = {$id: "str", type: "string"}
          const validate = ajv.compile(schema)
          expect(validate("abc")).equal(true)
          expect(validate(1)).equal(false)
          expect(ajv.getSchema("str")).toBeUndefined()

          schema = {$id: "int", type: "integer"}
          expect(ajv.validate(schema, 1)).equal(true)
          expect(ajv.validate(schema, "abc")).equal(false)
          expect(ajv.getSchema("int")).toBeUndefined()
        })

        it("should NOT throw with duplicate ID", () => {
          ajv.compile({$id: "str", type: "string"})
          expect(() => {
            ajv.compile({$id: "str", type: "string", minLength: 2})
          }).not.throw()

          const schema = {$id: "int", type: "integer"}
          const schema2 = {$id: "int", type: "integer", minimum: 0}
          expect(ajv.validate(schema, 1)).equal(true)
          expect(() => {
            expect(ajv.validate(schema2, 1)).equal(true)
          }).not.throw()
        })
      })
    })
  })
})
