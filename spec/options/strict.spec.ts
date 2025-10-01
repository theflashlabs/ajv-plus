import {describe, expect, it} from "vitest"
import type {Ajv, JSONSchemaType, Schema} from "../../lib/ajv.ts"
import _Ajv from "../ajv.ts"

describe("strict mode", () => {
  describe(
    '"additionalItems" without "items"',
    testStrictMode({type: "array", additionalItems: false}, /additionalItems/)
  )

  describe('"if" without "then" and "else"', testStrictMode({if: true}, /if.*then.*else/))

  describe('"then" without "if"', testStrictMode({then: true}, /then.*if/))

  describe('"else" without "if"', testStrictMode({else: true}, /else.*if/))

  describe(
    '"properties" matching "patternProperties"',
    testStrictMode(
      {
        type: "object",
        properties: {foo: false},
        patternProperties: {foo: false},
      },
      /property.*pattern/
    )
  )

  describe('option allowMatchingProperties to allow "properties" matching "patternProperties"', () => {
    it("should NOT throw an error or log a warning", () => {
      const output: any = {}
      const ajv = new _Ajv({
        allowMatchingProperties: true,
        logger: getLogger(output),
      })
      const schema = {
        type: "object",
        properties: {foo: false},
        patternProperties: {foo: false},
      }
      ajv.compile(schema)
      expect(output.warning).toBeUndefined()
    })
  })

  describe("strictTypes option", () => {
    const ajv = new _Ajv({strictTypes: true})
    const ajvUT = new _Ajv({strictTypes: true, allowUnionTypes: true})

    describe("multiple/union types", () => {
      it("should prohibit multiple types", () => {
        expect(() => {
          ajv.compile({type: ["number", "string"]})
        }).toThrowError(/use allowUnionTypes to allow union type/)
      })

      it("should allow multiple types with option allowUnionTypes", () => {
        expect(() => {
          ajvUT.compile({type: ["number", "string"]})
        }).not.throw()
      })

      it("should allow nullable", () => {
        expect(() => {
          ajv.compile({type: ["number", "null"]})
          ajv.compile({type: ["number"], nullable: true})
        }).not.throw()
      })
    })

    describe("contradictory types", () => {
      it("should prohibit contradictory types", () => {
        expect(() => {
          ajv.compile({
            type: "object",
            anyOf: [{type: "object"}, {type: "array"}],
          })
        }).toThrowError(/type "array" not allowed by context "object"/)
      })

      it("should allow narrowing types", () => {
        expect(() => {
          ajvUT.compile({
            type: ["object", "array"],
            anyOf: [{type: "object"}, {type: "array"}],
          })
        }).not.throw()
      })

      it('should allow "integer" in "number" context', () => {
        expect(() => {
          ajv.compile({
            type: "number",
            anyOf: [{type: "integer"}],
          })
        }).not.throw()
      })

      it('should prohibit "number" in "integer" context', () => {
        expect(() => {
          ajv.compile({
            type: "integer",
            anyOf: [{type: "number"}],
          })
        }).toThrowError(/type "number" not allowed by context "integer"/)
      })
    })

    describe("applicable types", () => {
      it("should prohibit keywords without applicable types", () => {
        expect(() => {
          ajv.compile({
            properties: {
              foo: {type: "number", minimum: 0},
            },
          })
        }).toThrowError(/missing type "object" for keyword "properties"/)

        expect(() => {
          ajv.compile({
            type: "object",
            properties: {
              foo: {minimum: 0},
            },
          })
        }).toThrowError(/missing type "number" for keyword "minimum"/)
      })

      it("should allow keywords with applicable types", () => {
        expect(() => {
          ajv.compile({
            type: "object",
            properties: {
              foo: {type: "number", minimum: 0},
            },
          })
        }).not.throw()
      })

      it("should allow keywords with applicable type in parent schema", () => {
        expect(() => {
          ajv.compile({
            type: "object",
            anyOf: [
              {
                properties: {
                  foo: {type: "number"},
                },
              },
              {
                properties: {
                  bar: {type: "string"},
                },
              },
            ],
          })
        }).not.throw()
      })
    })

    describe("propertyNames", () => {
      it('should set default data type "string"', () => {
        ajv.compile({
          type: "object",
          propertyNames: {maxLength: 5},
        })

        ajv.compile({
          type: "object",
          propertyNames: {type: "string", maxLength: 5},
        })

        expect(() => {
          ajv.compile({
            type: "object",
            propertyNames: {type: "number"},
          })
        }).toThrowError(/type "number" not allowed by context/)
      })
    })
  })

  describe("option strictTuples", () => {
    const ajv = new _Ajv({strictTuples: true})
    type MyTuple = [string, number]

    it("should prohibit unconstrained tuples", () => {
      const schema1: JSONSchemaType<MyTuple> = {
        type: "array",
        items: [{type: "string"}, {type: "number"}],
        minItems: 2,
        additionalItems: false,
      }
      expect(() => {
        ajv.compile(schema1)
      }).not.throw()

      const schema2: JSONSchemaType<MyTuple> = {
        type: "array",
        items: [{type: "string"}, {type: "number"}],
        minItems: 2,
        maxItems: 2,
      }
      expect(() => {
        ajv.compile(schema2)
      }).not.throw()

      //@ts-expect-error
      const badSchema1: JSONSchemaType<MyTuple> = {
        type: "object",
        properties: {
          test: {
            type: "array",
            items: [{type: "string"}, {type: "number"}],
            additionalItems: false,
          },
        },
      }
      expect(() => {
        ajv.compile(badSchema1)
      }).toThrowError(
        / minItems or maxItems\/additionalItems are not specified or different at path "#\/properties\/test"/
      )

      //@ts-expect-error
      const badSchema2: JSONSchemaType<MyTuple> = {
        type: "object",
        properties: {
          test: {
            type: "array",
            items: [{type: "string"}, {type: "number"}],
            minItems: 2,
          },
        },
      }
      expect(() => {
        ajv.compile(badSchema2)
      }).toThrowError(
        / minItems or maxItems\/additionalItems are not specified or different at path "#\/properties\/test"/
      )

      //@ts-expect-error
      const badSchema3: JSONSchemaType<MyTuple> = {
        type: "object",
        properties: {
          test: {
            type: "array",
            items: [{type: "string"}, {type: "number"}],
            minItems: 2,
            maxItems: 3,
          },
        },
      }
      expect(() => {
        ajv.compile(badSchema3)
      }).toThrowError(
        / minItems or maxItems\/additionalItems are not specified or different at path "#\/properties\/test"/
      )
    })
  })

  describe("strictRequired option", () => {
    const ajv = new _Ajv({strictRequired: true})

    describe("base case", () => {
      const schema = {
        type: "object",
        properties: {
          notTest: {
            type: "string",
          },
        },
        required: ["test"],
      }

      it("should prohibit with strictRequired: true", () => {
        expect(() => ajv.compile(schema)).toThrowError(
          'strict mode: required property "test" is not defined at "#" (strictRequired)'
        )
      })

      it("should NOT prohibit when strictRequired is not set", () => {
        expect(() => new _Ajv().compile(schema)).not.throw()
      })
    })

    it("should prohibit in second level of a schema", () => {
      expect(() => {
        ajv.compile({
          type: "object",
          properties: {
            test: {
              type: "object",
              properties: {},
              required: ["keyname"],
            },
          },
        })
      }).toThrowError(
        'strict mode: required property "keyname" is not defined at "#/properties/test" (strictRequired)'
      )
    })

    it.skip("should not throw with a same level if then", () => {
      expect(() => {
        ajv.compile({
          type: "object",
          properties: {foo: {}},
          if: {required: ["foo"]},
          then: {properties: {bar: {type: "boolean"}}},
        })
      }).not.throw()
    })

    it("should throw if a required property exists in a parent object but not in the subschema that the require keyword references", () => {
      expect(() => {
        ajv.compile({
          type: "object",
          properties: {
            foo: {
              type: "object",
              required: "foo",
              properties: {
                test: {
                  type: "integer",
                },
              },
            },
          },
        })
      }).throw()
    })

    it("should throw if property exists in parent but not in actual object required references", () => {
      expect(() => {
        ajv.compile({
          type: "object",
          properties: {
            foo: {
              type: "object",
              required: "foo",
              properties: {
                test: {
                  type: "number",
                },
              },
            },
          },
        })
      }).throw()
    })

    it.skip("should not throw because all referenced properties are defined", () => {
      expect(() => {
        ajv.compile({
          type: "object",
          properties: {foo: {}, bar: {}},
          allOf: [
            {
              allOf: [
                {
                  if: {required: ["foo"]},
                  then: {required: ["bar"]},
                },
              ],
            },
          ],
        })
      }).not.throw()
    })

    it("should throw because baz does not exist as a property", () => {
      expect(() => {
        ajv.compile({
          type: "object",
          properties: {foo: {}, bar: {}},
          allOf: [
            {
              allOf: [
                {
                  if: {required: ["bar"]},
                  then: {required: ["baz"]},
                },
              ],
            },
          ],
        })
      }).throw()
    })
  })
})

function testStrictMode(schema: Schema, logPattern: string | RegExp) {
  return () => {
    describe("strict = false", () => {
      it("should NOT throw an error or log a warning", () => {
        const output: any = {}
        const ajv = new _Ajv({
          strict: false,
          logger: getLogger(output),
        })
        ajv.compile(schema)
        expect(output.warning).toBeUndefined()
      })
    })

    describe("strict = true or undefined", () => {
      it("should throw an error", () => {
        test(new _Ajv({strict: true}))
        test(new _Ajv())

        function test(ajv: Ajv) {
          expect(() => {
            ajv.compile(schema)
          }, logPattern as string).throw()
        }
      })
    })

    describe('strict = "log"', () => {
      it("should log a warning", () => {
        const output: any = {}
        const ajv = new _Ajv({
          strict: "log",
          logger: getLogger(output),
        })
        ajv.compile(schema)
        expect(output.warning).match(logPattern as RegExp)
      })
    })
  }
}

function getLogger(output: {warning: any}) {
  return {
    log() {
      throw new Error("log should not be called")
    },
    warn(msg: any) {
      output.warning = msg
    },
    error() {
      throw new Error("error should not be called")
    },
  }
}
