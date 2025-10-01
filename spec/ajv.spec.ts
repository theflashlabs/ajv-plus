import {describe, beforeEach, it, expect, expectTypeOf} from "vitest"
import type Ajv from "../lib/ajv.ts"
import type {KeywordCxt, SchemaObject} from "../lib/ajv.ts"
import _Ajv from "./ajv.ts"
import {_} from "../lib/compile/codegen/code.ts"
import assert from "assert"

describe("Ajv", () => {
  let ajv: Ajv

  beforeEach(() => {
    ajv = new _Ajv({keywords: ["foo"], allowUnionTypes: true})
  })

  it("should create instance", () => {
    expect(ajv).toBeInstanceOf(_Ajv)
  })

  describe("compile method", () => {
    it("should compile schema and return validating function", () => {
      const validate = ajv.compile({type: "integer"})
      expectTypeOf(validate).toBeFunction()
      expect(validate(1)).toBe(true)
      expect(validate(1.1)).equal(false)
      expect(validate("1")).equal(false)
    })

    it("should cache compiled functions for the same schema", () => {
      const schema = {
        $id: "//e.com/int.json",
        type: "integer",
        minimum: 1,
      }
      const v1 = ajv.compile(schema)
      const v2 = ajv.compile(schema)
      expect(v1).equal(v2)
    })

    it("should throw if different schema has the same id", () => {
      ajv.compile({$id: "//e.com/int.json", type: "integer"})
      expect(() => {
        ajv.compile({$id: "//e.com/int.json", type: "integer", minimum: 1})
      }).toThrowError(/already exists/)
    })

    it("should throw if invalid schema is compiled", () => {
      expect(() => {
        ajv.compile({type: null})
      }).toThrowError(/must be equal to one of the allowed values/)
    })

    it("should throw if compiled schema has an invalid JavaScript code", () => {
      const _ajv = new _Ajv({logger: false})
      _ajv.addKeyword({keyword: "even", code: badEvenCode})
      let schema = {even: true}
      const validate: any = _ajv.compile(schema)
      expect(validate(2)).equal(true)
      expect(validate(3)).equal(false)

      schema = {even: false}
      expect(() => {
        _ajv.compile(schema)
      }).toThrowError(/Unexpected token/)

      function badEvenCode(cxt: KeywordCxt) {
        const op = cxt.schema ? _`===` : _`!===` // invalid on purpose
        cxt.pass(_`${cxt.data} % 2 ${op} 0`)
      }
    })
  })

  describe("validate method", () => {
    it("should compile schema and validate data against it", () => {
      expect(ajv.validate({type: "integer"}, 1)).equal(true)
      expect(ajv.validate({type: "integer"}, "1")).equal(false)
      expect(ajv.validate({type: "string"}, "a")).equal(true)
      expect(ajv.validate({type: "string"}, 1)).equal(false)
    })

    it("should validate against previously compiled schema by id (also see addSchema)", () => {
      expect(ajv.validate({$id: "//e.com/int.json", type: "integer"}, 1)).equal(true)
      expect(ajv.validate("//e.com/int.json", 1)).equal(true)
      expect(ajv.validate("//e.com/int.json", "1")).equal(false)

      expectTypeOf(ajv.compile({$id: "//e.com/str.json", type: "string"})).toBeFunction()
      expect(ajv.validate("//e.com/str.json", "a")).equal(true)
      expect(ajv.validate("//e.com/str.json", 1)).equal(false)
    })

    it("should throw exception if no schema with ref", () => {
      expect(ajv.validate({$id: "integer", type: "integer"}, 1)).equal(true)
      expect(ajv.validate("integer", 1)).equal(true)
      expect(() => {
        ajv.validate("string", "foo")
      }).toThrowError(/no schema with key or ref/)
    })

    it("should validate schema fragment by ref", () => {
      ajv.addSchema({
        $id: "http://e.com/types.json",
        definitions: {
          int: {type: "integer"},
          str: {type: "string"},
        },
      })

      expect(ajv.validate("http://e.com/types.json#/definitions/int", 1)).equal(true)
      expect(ajv.validate("http://e.com/types.json#/definitions/int", "1")).equal(false)
    })

    it("should return schema fragment by id", () => {
      ajv.addSchema({
        $id: "http://e.com/types.json",
        definitions: {
          int: {$id: "#int", type: "integer"},
          str: {$id: "#str", type: "string"},
        },
      })

      expect(ajv.validate("http://e.com/types.json#int", 1)).equal(true)
      expect(ajv.validate("http://e.com/types.json#int", "1")).equal(false)
    })
  })

  describe("addSchema method", () => {
    it("should add and compile schema with key", () => {
      ajv.addSchema({type: "integer"}, "int")
      const validate = ajv.getSchema("int")
      assert(typeof validate == "function")

      expect(validate(1)).equal(true)
      expect(validate(1.1)).equal(false)
      expect(validate("1")).equal(false)
      expect(ajv.validate("int", 1)).equal(true)
      expect(ajv.validate("int", "1")).equal(false)
    })

    it("should add and compile schema without key", () => {
      ajv.addSchema({type: "integer"})
      expect(ajv.validate("", 1)).equal(true)
      expect(ajv.validate("", "1")).equal(false)
    })

    it("should add and compile schema with id", () => {
      ajv.addSchema({$id: "//e.com/int.json", type: "integer"})
      expect(ajv.validate("//e.com/int.json", 1)).equal(true)
      expect(ajv.validate("//e.com/int.json", "1")).equal(false)
    })

    it("should normalize schema keys and ids", () => {
      ajv.addSchema({$id: "//e.com/int.json#", type: "integer"}, "int#")
      expect(ajv.validate("int", 1)).equal(true)
      expect(ajv.validate("int", "1")).equal(false)
      expect(ajv.validate("//e.com/int.json", 1)).equal(true)
      expect(ajv.validate("//e.com/int.json", "1")).equal(false)
      expect(ajv.validate("int#/", 1)).equal(true)
      expect(ajv.validate("int#/", "1")).equal(false)
      expect(ajv.validate("//e.com/int.json#/", 1)).equal(true)
      expect(ajv.validate("//e.com/int.json#/", "1")).equal(false)
    })

    it("should add and compile array of schemas with ids", () => {
      ajv.addSchema([
        {$id: "//e.com/int.json", type: "integer"},
        {$id: "//e.com/str.json", type: "string"},
      ])

      const validate0 = ajv.getSchema("//e.com/int.json")
      const validate1 = ajv.getSchema("//e.com/str.json")
      assert(typeof validate0 == "function")
      assert(typeof validate1 == "function")

      expect(validate0(1)).equal(true)
      expect(validate0("1")).equal(false)
      expect(validate1("a")).equal(true)
      expect(validate1(1)).equal(false)

      expect(ajv.validate("//e.com/int.json", 1)).equal(true)
      expect(ajv.validate("//e.com/int.json", "1")).equal(false)
      expect(ajv.validate("//e.com/str.json", "a")).equal(true)
      expect(ajv.validate("//e.com/str.json", 1)).equal(false)
    })

    it("should throw on duplicate key", () => {
      ajv.addSchema({type: "integer"}, "int")
      expect(() => {
        ajv.addSchema({type: "integer", minimum: 1}, "int")
      }).toThrowError(/already exists/)
    })

    it("should throw on duplicate normalized key", () => {
      ajv.addSchema({type: "number"}, "num")
      expect(() => {
        ajv.addSchema({type: "integer"}, "num#")
      }).toThrowError(/already exists/)
      expect(() => {
        ajv.addSchema({type: "integer"}, "num#/")
      }).toThrowError(/already exists/)
    })

    it("should allow only one schema without key and id", () => {
      ajv.addSchema({type: "number"})
      expect(() => {
        ajv.addSchema({type: "integer"})
      }).toThrowError(/already exists/)
      expect(() => {
        ajv.addSchema({type: "integer"}, "")
      }).toThrowError(/already exists/)
      expect(() => {
        ajv.addSchema({type: "integer"}, "#")
      }).toThrowError(/already exists/)
    })

    it("should throw if schema is not an object", () => {
      expect(() => {
        // @ts-expect-error
        ajv.addSchema("foo")
      }).toThrowError(/schema must be object or boolean/)
    })

    it("should throw if schema id is not a string", () => {
      try {
        // @ts-expect-error
        ajv.addSchema({$id: 1, type: "integer"})
        throw new Error("should have throw exception")
      } catch (e) {
        expect((e as Error).message).equal("schema $id must be string")
      }
    })

    it("should return instance of itself", () => {
      const res = ajv.addSchema({type: "integer"}, "int")
      expect(res).equal(ajv)
    })
  })

  describe("getSchema method", () => {
    it("should return compiled schema by key", () => {
      ajv.addSchema({type: "integer"}, "int")
      const validate = ajv.getSchema("int")
      assert(typeof validate == "function")
      expect(validate(1)).equal(true)
      expect(validate("1")).equal(false)
    })

    it("should return compiled schema by id or ref", () => {
      ajv.addSchema({$id: "//e.com/int.json", type: "integer"})
      const validate = ajv.getSchema("//e.com/int.json")
      assert(typeof validate == "function")
      expect(validate(1)).equal(true)
      expect(validate("1")).equal(false)
    })

    it("should return compiled schema without key or with empty key", () => {
      ajv.addSchema({type: "integer"})
      const validate = ajv.getSchema("")
      assert(typeof validate == "function")
      expect(validate(1)).equal(true)
      expect(validate("1")).equal(false)
    })

    it("should return schema fragment by ref", () => {
      ajv.addSchema({
        $id: "http://e.com/types.json",
        definitions: {
          int: {type: "integer"},
          str: {type: "string"},
        },
      })

      const vInt = ajv.getSchema("http://e.com/types.json#/definitions/int")
      assert(typeof vInt == "function")
      expect(vInt(1)).equal(true)
      expect(vInt("1")).equal(false)
    })

    it("should return schema fragment by ref with protocol-relative URIs", () => {
      ajv.addSchema({
        $id: "//e.com/types.json",
        definitions: {
          int: {type: "integer"},
          str: {type: "string"},
        },
      })

      const vInt = ajv.getSchema("//e.com/types.json#/definitions/int")
      assert(typeof vInt == "function")
      expect(vInt(1)).equal(true)
      expect(vInt("1")).equal(false)
    })

    it("should return schema fragment by id", () => {
      ajv.addSchema({
        $id: "http://e.com/types.json",
        definitions: {
          int: {$id: "#int", type: "integer"},
          str: {$id: "#str", type: "string"},
        },
      })

      const vInt = ajv.getSchema("http://e.com/types.json#int")
      assert(typeof vInt == "function")
      expect(vInt(1)).equal(true)
      expect(vInt("1")).equal(false)
    })
  })

  describe("removeSchema method", () => {
    it("should remove schema by key", () => {
      const schema = {type: "integer"}
      ajv.addSchema(schema, "int")
      const v = ajv.getSchema("int")
      assert(typeof v == "function")
      expectTypeOf(v).toBeFunction()
      //@ts-expect-error
      expect(ajv._cache.get(schema).validate).equal(v)

      ajv.removeSchema("int")
      expect(ajv.getSchema("int")).toBeUndefined()
      //@ts-expect-error
      expect(ajv._cache.get(schema)).toBeUndefined()
    })

    it("should remove schema by id", () => {
      const schema = {$id: "//e.com/int.json", type: "integer"}
      ajv.addSchema(schema)

      const v = ajv.getSchema("//e.com/int.json")
      assert(typeof v == "function")
      expectTypeOf(v).toBeFunction()
      //@ts-expect-error
      expect(ajv._cache.get(schema).validate).equal(v)

      ajv.removeSchema("//e.com/int.json")
      expect(ajv.getSchema("//e.com/int.json")).toBeUndefined()
      //@ts-expect-error
      expect(ajv._cache.get(schema)).toBeUndefined()
    })

    it("should remove schema by schema object", () => {
      const schema = {type: "integer"}
      ajv.addSchema(schema)
      //@ts-expect-error
      expectTypeOf(ajv._cache.get(schema)).toBeObject()
      ajv.removeSchema(schema)
      //@ts-expect-error
      expect(ajv._cache.get(schema)).toBeUndefined()
    })

    it("should remove schema with id by schema object", () => {
      const schema = {$id: "//e.com/int.json", type: "integer"}
      ajv.addSchema(schema)
      //@ts-expect-error
      expectTypeOf(ajv._cache.get(schema)).toBeObject()
      ajv.removeSchema(schema)
      expect(ajv.getSchema("//e.com/int.json")).toBeUndefined()
      //@ts-expect-error
      expect(ajv._cache.get(schema)).toBeUndefined()
    })

    it("should not throw if there is no schema with passed id", () => {
      expect(ajv.getSchema("//e.com/int.json")).toBeUndefined()
      expect(() => {
        ajv.removeSchema("//e.com/int.json")
      }).to.not.throw()
    })

    it("should remove all schemas but meta-schemas if called without an arguments", () => {
      const schema1 = {$id: "//e.com/int.json", type: "integer"}
      ajv.addSchema(schema1)
      //@ts-expect-error
      expectTypeOf(ajv._cache.get(schema1)).toBeObject()

      const schema2 = {type: "integer"}
      ajv.addSchema(schema2)
      //@ts-expect-error
      expectTypeOf(ajv._cache.get(schema2)).toBeObject()

      ajv.removeSchema()
      //@ts-expect-error
      expect(ajv._cache.get(schema1)).toBeUndefined()
      //@ts-expect-error
      expect(ajv._cache.get(schema2)).toBeUndefined()
    })

    it("should remove all schemas but meta-schemas with key/id matching pattern", () => {
      const schema1 = {$id: "//e.com/int.json", type: "integer"}
      ajv.addSchema(schema1)
      //@ts-expect-error
      expectTypeOf(ajv._cache.get(schema1)).toBeObject()

      const schema2 = {$id: "str.json", type: "string"}
      ajv.addSchema(schema2, "//e.com/str.json")
      //@ts-expect-error
      expectTypeOf(ajv._cache.get(schema2)).toBeObject()

      const schema3 = {type: "integer"}
      ajv.addSchema(schema3)
      //@ts-expect-error
      expectTypeOf(ajv._cache.get(schema3)).toBeObject()

      ajv.removeSchema(/e\.com/)
      //@ts-expect-error
      expect(ajv._cache.get(schema1)).toBeUndefined()
      //@ts-expect-error
      expect(ajv._cache.get(schema2)).toBeUndefined()
      //@ts-expect-error
      expectTypeOf(ajv._cache.get(schema3)).toBeObject()
    })

    it("should return instance of itself", () => {
      const res = ajv.addSchema({type: "integer"}, "int").removeSchema("int")
      expect(res).equal(ajv)
    })
  })

  describe("addFormat method", () => {
    it("should add format as regular expression", () => {
      ajv.addFormat("identifier", /^[a-z_$][a-z0-9_$]*$/i)
      testFormat()
    })

    it("should add format as string", () => {
      ajv.addFormat("identifier", "^[A-Za-z_$][A-Za-z0-9_$]*$")
      testFormat()
    })

    it("should add format as function", () => {
      ajv.addFormat("identifier", (str) => /^[a-z_$][a-z0-9_$]*$/i.test(str))
      testFormat()
    })

    it("should add format as object", () => {
      ajv.addFormat("identifier", {
        validate: (str: string) => /^[a-z_$][a-z0-9_$]*$/i.test(str),
      })
      testFormat()
    })

    it("should return instance of itself", () => {
      const res = ajv.addFormat("identifier", /^[a-z_$][a-z0-9_$]*$/i)
      expect(res).equal(ajv)
    })

    function testFormat() {
      const validate = ajv.compile({
        type: ["number", "string"],
        format: "identifier",
      })
      expect(validate("Abc1")).equal(true)
      expect(validate("123")).equal(false)
      expect(validate(123)).equal(true)
    }

    describe("formats for number", () => {
      it("should validate only numbers", () => {
        ajv.addFormat("positive", {
          type: "number",
          validate: function (x: number) {
            return x > 0
          },
        })

        const validate = ajv.compile({
          type: ["string", "number"],
          format: "positive",
        })
        expect(validate(-2)).equal(false)
        expect(validate(0)).equal(false)
        expect(validate(2)).equal(true)
        expect(validate("abc")).equal(true)
      })

      it("should validate numbers with format via $data", () => {
        ajv = new _Ajv({$data: true, allowUnionTypes: true})
        ajv.addFormat("positive", {
          type: "number",
          validate: function (x: number) {
            return x > 0
          },
        })

        const validate = ajv.compile({
          type: "object",
          properties: {
            data: {
              type: ["number", "string"],
              format: {$data: "1/frmt"},
            },
            frmt: {type: "string"},
          },
        })
        expect(validate({data: -2, frmt: "positive"})).equal(false)
        expect(validate({data: 0, frmt: "positive"})).equal(false)
        expect(validate({data: 2, frmt: "positive"})).equal(true)
        expect(validate({data: "abc", frmt: "positive"})).equal(true)
      })
    })
  })

  describe("validateSchema method", () => {
    it("should validate schema against meta-schema", () => {
      let valid = ajv.validateSchema({
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "number",
      })

      expect(valid).toBe(true)
      expect(ajv.errors).toBeNull()

      valid = ajv.validateSchema({
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "wrong_type",
      })

      expect(valid).toBe(false)
      assert(Array.isArray(ajv.errors))
      expect(ajv.errors).toHaveLength(3)
      expect(ajv.errors[0]?.keyword).equal("enum")
      expect(ajv.errors[1]?.keyword).equal("type")
      expect(ajv.errors[2]?.keyword).equal("anyOf")
    })

    it("should throw exception if meta-schema is unknown", () => {
      expect(() => {
        ajv.validateSchema({
          $schema: "http://example.com/unknown/schema#",
          type: "number",
        })
      }).toThrowError(/no schema with key or ref/)
    })

    it("should throw exception if $schema is not a string", () => {
      expect(() => {
        ajv.validateSchema({
          //@ts-expect-error
          $schema: {},
          type: "number",
        })
      }).toThrowError(/\$schema must be a string/)
    })

    describe("sub-schema validation outside of definitions during compilation", () => {
      it("maximum", () => {
        passValidationThrowCompile({
          $ref: "#/foo",
          foo: {type: "number", maximum: "bar"},
        })
      })

      it("exclusiveMaximum", () => {
        passValidationThrowCompile({
          $ref: "#/foo",
          foo: {type: "number", exclusiveMaximum: "bar"},
        })
      })

      it("maxItems", () => {
        passValidationThrowCompile({
          $ref: "#/foo",
          foo: {type: "array", maxItems: "bar"},
        })
      })

      it("maxLength", () => {
        passValidationThrowCompile({
          $ref: "#/foo",
          foo: {type: "string", maxLength: "bar"},
        })
      })

      it("maxProperties", () => {
        passValidationThrowCompile({
          $ref: "#/foo",
          foo: {type: "object", maxProperties: "bar"},
        })
      })

      it("multipleOf", () => {
        passValidationThrowCompile({
          $ref: "#/foo",
          foo: {type: "number", multipleOf: "bar"},
        })
      })

      function passValidationThrowCompile(schema: SchemaObject) {
        expect(ajv.validateSchema(schema)).toBe(true)
        expect(() => {
          ajv.compile(schema)
        }).toThrowError(/value must be/)
      }
    })
  })
})
