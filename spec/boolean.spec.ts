import {beforeAll, describe, expect, it} from "vitest"
import _Ajv from "./ajv.ts"
import type Ajv from "../lib/ajv.ts"
import type {ValidateFunction} from "../lib/ajv.ts"

describe("boolean schemas", () => {
  let ajvs: Ajv[]

  beforeAll(() => {
    ajvs = [
      new _Ajv({strictTuples: false}),
      new _Ajv({allErrors: true, strictTuples: false}),
      new _Ajv({inlineRefs: false, strictTuples: false}),
      new _Ajv({strict: false}),
    ]
  })

  describe("top level schema", () => {
    describe("schema = true", () => {
      it("should validate any data as valid", () => {
        ajvs.forEach(test(true, true))
      })
    })

    describe("schema = false", () => {
      it("should validate any data as invalid", () => {
        ajvs.forEach(test(false, false))
      })
    })

    function test(boolSchema: boolean, valid: boolean) {
      return function (ajv: Ajv) {
        const validate = ajv.compile(boolSchema)
        testSchema(validate, valid)
      }
    }
  })

  describe("in properties / sub-properties", () => {
    describe("schema = true", () => {
      it("should be valid with any property value", () => {
        ajvs.forEach(test(true, true))
      })
    })

    describe("schema = false", () => {
      it("should be invalid with any property value", () => {
        ajvs.forEach(test(false, false))
      })
    })

    function test(boolSchema: boolean, valid: boolean) {
      return function (ajv: Ajv) {
        const schema = {
          type: "object",
          properties: {
            foo: boolSchema,
            bar: {
              type: "object",
              properties: {
                baz: boolSchema,
              },
            },
          },
        }

        const validate = ajv.compile(schema)
        expect(validate({foo: 1, bar: {baz: 1}})).equal(valid)
        expect(validate({foo: "1", bar: {baz: "1"}})).equal(valid)
        expect(validate({foo: {}, bar: {baz: {}}})).equal(valid)
        expect(validate({foo: [], bar: {baz: []}})).equal(valid)
        expect(validate({foo: true, bar: {baz: true}})).equal(valid)
        expect(validate({foo: false, bar: {baz: false}})).equal(valid)
        expect(validate({foo: null, bar: {baz: null}})).equal(valid)

        expect(validate({bar: {quux: 1}})).equal(true)
      }
    }
  })

  describe("in items / sub-items", () => {
    describe("schema = true", () => {
      it("should be valid with any item value", () => {
        ajvs.forEach(test(true, true))
      })
    })

    describe("schema = false", () => {
      it("should be invalid with any item value", () => {
        ajvs.forEach(test(false, false))
      })
    })

    function test(boolSchema: boolean, valid: boolean) {
      return function (ajv: Ajv) {
        let schema = {
          type: "array",
          items: boolSchema,
        }

        let validate = ajv.compile(schema)
        expect(validate([1])).equal(valid)
        expect(validate(["1"])).equal(valid)
        expect(validate([{}])).equal(valid)
        expect(validate([[]])).equal(valid)
        expect(validate([true])).equal(valid)
        expect(validate([false])).equal(valid)
        expect(validate([null])).equal(valid)

        expect(validate([])).equal(true)

        let anotherSchema = {
          type: "array",
          items: [
            true,
            {
              type: "array",
              items: [true, boolSchema],
            },
            boolSchema,
          ],
        }

        validate = ajv.compile(anotherSchema)
        expect(validate([1, [1, 1], 1])).equal(valid)
        expect(validate(["1", ["1", "1"], "1"])).equal(valid)
        expect(validate([{}, [{}, {}], {}])).equal(valid)
        expect(validate([[], [[], []], []])).equal(valid)
        expect(validate([true, [true, true], true])).equal(valid)
        expect(validate([false, [false, false], false])).equal(valid)
        expect(validate([null, [null, null], null])).equal(valid)

        expect(validate([1, [1]])).equal(true)
      }
    }
  })

  describe("in dependencies and sub-dependencies", () => {
    describe("schema = true", () => {
      it("should be valid with any property value", () => {
        ajvs.forEach(test(true, true))
      })
    })

    describe("schema = false", () => {
      it("should be invalid with any property value", () => {
        ajvs.forEach(test(false, false))
      })
    })

    function test(boolSchema: boolean, valid: boolean) {
      return function (ajv: Ajv) {
        const schema = {
          type: "object",
          dependencies: {
            foo: boolSchema,
            bar: {
              type: "object",
              dependencies: {
                baz: boolSchema,
              },
            },
          },
        }

        const validate = ajv.compile(schema)
        expect(validate({foo: 1, bar: 1, baz: 1})).equal(valid)
        expect(validate({foo: "1", bar: "1", baz: "1"})).equal(valid)
        expect(validate({foo: {}, bar: {}, baz: {}})).equal(valid)
        expect(validate({foo: [], bar: [], baz: []})).equal(valid)
        expect(validate({foo: true, bar: true, baz: true})).equal(valid)
        expect(validate({foo: false, bar: false, baz: false})).equal(valid)
        expect(validate({foo: null, bar: null, baz: null})).equal(valid)

        expect(validate({bar: 1, quux: 1})).equal(true)
      }
    }
  })

  describe("in patternProperties", () => {
    describe("schema = true", () => {
      it("should be valid with any property matching pattern", () => {
        ajvs.forEach(test(true, true))
      })
    })

    describe("schema = false", () => {
      it("should be invalid with any property matching pattern", () => {
        ajvs.forEach(test(false, false))
      })
    })

    function test(boolSchema: boolean, valid: boolean) {
      return function (ajv: Ajv) {
        const schema = {
          type: "object",
          patternProperties: {
            "^f": boolSchema,
            r$: {
              type: "object",
              patternProperties: {
                z$: boolSchema,
              },
            },
          },
        }

        const validate = ajv.compile(schema)
        expect(validate({foo: 1, bar: {baz: 1}})).equal(valid)
        expect(validate({foo: "1", bar: {baz: "1"}})).equal(valid)
        expect(validate({foo: {}, bar: {baz: {}}})).equal(valid)
        expect(validate({foo: [], bar: {baz: []}})).equal(valid)
        expect(validate({foo: true, bar: {baz: true}})).equal(valid)
        expect(validate({foo: false, bar: {baz: false}})).equal(valid)
        expect(validate({foo: null, bar: {baz: null}})).equal(valid)

        expect(validate({bar: {quux: 1}})).equal(true)
      }
    }
  })

  describe("in propertyNames", () => {
    describe("schema = true", () => {
      it("should be valid with any property", () => {
        ajvs.forEach(test(true, true))
      })
    })

    describe("schema = false", () => {
      it("should be invalid with any property", () => {
        ajvs.forEach(test(false, false))
      })
    })

    function test(boolSchema: boolean, valid: boolean) {
      return function (ajv: Ajv) {
        const schema = {
          type: "object",
          propertyNames: boolSchema,
        }

        const validate = ajv.compile(schema)
        expect(validate({foo: 1})).equal(valid)
        expect(validate({bar: 1})).equal(valid)

        expect(validate({})).equal(true)
      }
    }
  })

  describe("in contains", () => {
    describe("schema = true", () => {
      it("should be valid with any items", () => {
        ajvs.forEach(test(true, true))
      })
    })

    describe("schema = false", () => {
      it("should be invalid with any items", () => {
        ajvs.forEach(test(false, false))
      })
    })

    function test(boolSchema: boolean, valid: boolean) {
      return function (ajv: Ajv) {
        const schema = {
          type: "array",
          contains: boolSchema,
        }

        const validate = ajv.compile(schema)
        expect(validate([1])).equal(valid)
        expect(validate(["foo"])).equal(valid)
        expect(validate([{}])).equal(valid)
        expect(validate([[]])).equal(valid)
        expect(validate([true])).equal(valid)
        expect(validate([false])).equal(valid)
        expect(validate([null])).equal(valid)

        expect(validate([])).equal(false)
      }
    }
  })

  describe("in not", () => {
    describe("schema = true", () => {
      it("should be invalid with any data", () => {
        ajvs.forEach(test(true, false))
      })
    })

    describe("schema = false", () => {
      it("should be valid with any data", () => {
        ajvs.forEach(test(false, true))
      })
    })

    function test(boolSchema: boolean, valid: boolean) {
      return function (ajv: Ajv) {
        const schema = {
          not: boolSchema,
        }

        const validate = ajv.compile(schema)
        testSchema(validate, valid)
      }
    }
  })

  describe("in allOf", () => {
    describe("schema = true", () => {
      it("should be valid with any data", () => {
        ajvs.forEach(test(true, true))
      })
    })

    describe("schema = false", () => {
      it("should be invalid with any data", () => {
        ajvs.forEach(test(false, false))
      })
    })

    function test(boolSchema: boolean, valid: boolean) {
      return function (ajv: Ajv) {
        let schema = {
          allOf: [false, boolSchema],
        }

        let validate = ajv.compile(schema)
        testSchema(validate, false)

        schema = {
          allOf: [true, boolSchema],
        }

        validate = ajv.compile(schema)
        testSchema(validate, valid)
      }
    }
  })

  describe("in anyOf", () => {
    describe("schema = true", () => {
      it("should be valid with any data", () => {
        ajvs.forEach(test(true, true))
      })
    })

    describe("schema = false", () => {
      it("should be invalid with any data", () => {
        ajvs.forEach(test(false, false))
      })
    })

    function test(boolSchema: boolean, valid: boolean) {
      return function (ajv: Ajv) {
        let schema = {
          anyOf: [false, boolSchema],
        }

        let validate = ajv.compile(schema)
        testSchema(validate, valid)

        schema = {
          anyOf: [true, boolSchema],
        }

        validate = ajv.compile(schema)
        testSchema(validate, true)
      }
    }
  })

  describe("in oneOf", () => {
    describe("schema = true", () => {
      it("should be valid with any data", () => {
        ajvs.forEach(test(true, true))
      })
    })

    describe("schema = false", () => {
      it("should be invalid with any data", () => {
        ajvs.forEach(test(false, false))
      })
    })

    function test(boolSchema: boolean, valid: boolean) {
      return function (ajv: Ajv) {
        let schema = {
          oneOf: [false, boolSchema],
        }

        let validate = ajv.compile(schema)
        testSchema(validate, valid)

        schema = {
          oneOf: [true, boolSchema],
        }

        validate = ajv.compile(schema)
        testSchema(validate, !valid)
      }
    }
  })

  describe("in $ref", () => {
    describe("schema = true", () => {
      it("should be valid with any data", () => {
        ajvs.forEach(test(true, true))
      })
    })

    describe("schema = false", () => {
      it("should be invalid with any data", () => {
        ajvs.forEach(test(false, false))
      })
    })

    function test(boolSchema: boolean, valid: boolean) {
      return function (ajv: Ajv) {
        const schema = {
          $ref: "#/definitions/bool",
          definitions: {
            bool: boolSchema,
          },
        }

        const validate = ajv.compile(schema)
        testSchema(validate, valid)
      }
    }
  })

  function testSchema(validate: ValidateFunction<unknown>, valid: boolean) {
    expect(validate(1)).equal(valid)
    expect(validate("foo")).equal(valid)
    expect(validate({})).equal(valid)
    expect(validate([])).equal(valid)
    expect(validate(true)).equal(valid)
    expect(validate(false)).equal(valid)
    expect(validate(null)).equal(valid)
  }
})
