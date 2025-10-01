import {describe, it, beforeEach, expect} from "vitest"
import type Ajv from "../lib/ajv.ts"
import _Ajv from "./ajv.ts"
import type {SchemaObject} from "../lib/ajv.ts"

const coercionRules = {
  string: {
    number: [
      {from: 1, to: "1"},
      {from: 1.5, to: "1.5"},
      {from: 2e100, to: "2e+100"},
    ],
    boolean: [
      {from: false, to: "false"},
      {from: true, to: "true"},
    ],
    null: [{from: null, to: ""}],
    object: [{from: {}, to: undefined}],
    array: [
      {from: [], to: undefined},
      {from: [1], to: undefined},
    ],
  },
  number: {
    string: [
      {from: "1", to: 1},
      {from: "1.5", to: 1.5},
      {from: "2e10", to: 2e10},
      {from: "1a", to: undefined},
      {from: "abc", to: undefined},
      {from: "", to: undefined},
    ],
    boolean: [
      {from: false, to: 0},
      {from: true, to: 1},
    ],
    null: [{from: null, to: 0}],
    object: [{from: {}, to: undefined}],
    array: [
      {from: [], to: undefined},
      {from: [true], to: undefined},
    ],
  },
  integer: {
    string: [
      {from: "1", to: 1},
      {from: "1.5", to: undefined},
      {from: "2e10", to: 2e10},
      {from: "1a", to: undefined},
      {from: "abc", to: undefined},
      {from: "", to: undefined},
    ],
    boolean: [
      {from: false, to: 0},
      {from: true, to: 1},
    ],
    null: [{from: null, to: 0}],
    object: [{from: {}, to: undefined}],
    array: [
      {from: [], to: undefined},
      {from: ["1"], to: undefined},
    ],
  },
  boolean: {
    string: [
      {from: "false", to: false},
      {from: "true", to: true},
      {from: "", to: undefined},
      {from: "abc", to: undefined},
    ],
    number: [
      {from: 0, to: false},
      {from: 1, to: true},
      {from: 2, to: undefined},
      {from: 2.5, to: undefined},
    ],
    null: [{from: null, to: false}],
    object: [{from: {}, to: undefined}],
    array: [
      {from: [], to: undefined},
      {from: [0], to: undefined},
    ],
  },
  null: {
    string: [
      {from: "", to: null},
      {from: "abc", to: undefined},
      {from: "null", to: undefined},
    ],
    number: [
      {from: 0, to: null},
      {from: 1, to: undefined},
    ],
    boolean: [
      {from: false, to: null},
      {from: true, to: undefined},
    ],
    object: [{from: {}, to: undefined}],
    array: [
      {from: [], to: undefined},
      {from: [null], to: undefined},
    ],
  },
  array: {
    all: [
      {type: "string", from: "abc", to: undefined},
      {type: "number", from: 1, to: undefined},
      {type: "boolean", from: true, to: undefined},
      {type: "null", from: null, to: undefined},
      {type: "object", from: {}, to: undefined},
    ],
  },
  object: {
    all: [
      {type: "string", from: "abc", to: undefined},
      {type: "number", from: 1, to: undefined},
      {type: "boolean", from: true, to: undefined},
      {type: "null", from: null, to: undefined},
      {type: "array", from: [], to: undefined},
    ],
  },
}

const coercionArrayRules = JSON.parse(JSON.stringify(coercionRules))
coercionArrayRules.string.array = [
  {from: ["abc"], to: "abc"},
  {from: [123], to: "123"},
  {from: [true], to: "true"},
  {from: [null], to: ""},
  {from: [{}], to: undefined},
  {from: ["abc", "def"], to: undefined},
  {from: [], to: undefined},
]
coercionArrayRules.number.array = [
  {from: [1.5], to: 1.5},
  {from: ["1.5"], to: 1.5},
  {from: [true], to: 1},
  {from: [null], to: 0},
  {from: ["abc"], to: undefined},
  {from: [{}], to: undefined},
]
coercionArrayRules.integer.array = [
  {from: [1], to: 1},
  {from: ["1"], to: 1},
  {from: [true], to: 1},
  {from: [null], to: 0},
  {from: [1.5], to: undefined},
  {from: ["abc"], to: undefined},
  {from: [{}], to: undefined},
]
coercionArrayRules.boolean.array = [
  {from: [true], to: true},
  {from: ["true"], to: true},
  {from: [1], to: true},
  {from: [null], to: false},
  {from: ["abc"], to: undefined},
  {from: [2], to: undefined},
  {from: [{}], to: undefined},
]
coercionArrayRules.null.array = [
  {from: [null], to: null},
  {from: [""], to: null},
  {from: [0], to: null},
  {from: [false], to: null},
  {from: ["abc"], to: undefined},
  {from: [1], to: undefined},
  {from: [true], to: undefined},
  {from: [{}], to: undefined},
]
coercionArrayRules.object.array = [{from: [{}], to: undefined}]

coercionArrayRules.array = {
  string: [{from: "abc", to: ["abc"]}],
  number: [{from: 1, to: [1]}],
  boolean: [{from: true, to: [true]}],
  null: [{from: null, to: [null]}],
  object: [{from: {}, to: undefined}],
}

describe("Type coercion", () => {
  let ajv: Ajv, fullAjv: Ajv, instances: Ajv[]

  beforeEach(() => {
    ajv = new _Ajv({coerceTypes: true, verbose: true, allowUnionTypes: true})
    fullAjv = new _Ajv({coerceTypes: true, verbose: true, allErrors: true, allowUnionTypes: true})
    instances = [ajv, fullAjv]
  })

  it("should coerce scalar values", () => {
    testRules(
      coercionRules,
      (
        test: {from: unknown},
        schema: string | boolean | SchemaObject,
        canCoerce: any /*, toType, fromType*/
      ) => {
        instances.forEach((_ajv) => {
          const valid = _ajv.validate(schema, test.from)
          //if (valid !== canCoerce) console.log('true', toType, fromType, test, ajv.errors);
          expect(valid).equal(canCoerce)
        })
      }
    )
  })

  it("should coerce scalar values (coerceTypes = array)", () => {
    ajv = new _Ajv({coerceTypes: "array", verbose: true})
    fullAjv = new _Ajv({coerceTypes: "array", verbose: true, allErrors: true})
    instances = [ajv, fullAjv]

    testRules(
      coercionArrayRules,
      (
        test: {from: unknown},
        schema: string | boolean | SchemaObject,
        canCoerce: boolean,
        toType: any,
        fromType: any
      ) => {
        instances.forEach((_ajv) => {
          const valid = _ajv.validate(schema, test.from)
          if (valid !== canCoerce) console.log(toType, ".", fromType, test, schema, ajv.errors)
          expect(valid).equal(canCoerce)
        })
      }
    )
  })

  it("should coerce values in objects/arrays and update properties/items", () => {
    testRules(
      coercionRules,
      (test: {from: any; to: any}, schema: any, canCoerce: any /*, toType, fromType*/) => {
        const schemaObject = {
          type: "object",
          properties: {
            foo: schema,
          },
        }

        const schemaArray = {
          type: "array",
          items: schema,
        }

        const schemaArrObj = {
          type: "array",
          items: schemaObject,
        }

        instances.forEach((_ajv) => {
          testCoercion(_ajv, schemaArray, [test.from], [test.to])
          testCoercion(_ajv, schemaObject, {foo: test.from}, {foo: test.to})
          testCoercion(_ajv, schemaArrObj, [{foo: test.from}], [{foo: test.to}])
        })

        function testCoercion(
          _ajv: Ajv,
          _schema: {type: string; items?: any; properties?: {foo: any}},
          fromData: any[] | any,
          toData: any[] | any
        ) {
          const valid = _ajv.validate(_schema, fromData)
          //if (valid !== canCoerce) console.log(schema, fromData, toData);
          expect(valid).equal(canCoerce)
          if (valid) expect(fromData).eql(toData)
        }
      }
    )
  })

  it("should coerce to multiple types in order with number type", () => {
    const schema = {
      type: "object",
      properties: {
        foo: {
          type: ["number", "boolean", "null"],
        },
      },
    }

    instances.forEach((_ajv) => {
      let data

      expect(_ajv.validate(schema, (data = {foo: "1"}))).equal(true)
      expect(data).eql({foo: 1})

      expect(_ajv.validate(schema, (data = {foo: "1.5"}))).equal(true)
      expect(data).eql({foo: 1.5})

      expect(_ajv.validate(schema, (data = {foo: "false"}))).equal(true)
      expect(data).eql({foo: false})

      expect(_ajv.validate(schema, (data = {foo: 1}))).equal(true)
      expect(data).eql({foo: 1}) // no coercion

      expect(_ajv.validate(schema, (data = {foo: true}))).equal(true)
      expect(data).eql({foo: true}) // no coercion

      expect(_ajv.validate(schema, (data = {foo: null}))).equal(true)
      expect(data).eql({foo: null}) // no coercion

      expect(_ajv.validate(schema, (data = {foo: "abc"}))).equal(false)
      expect(data).eql({foo: "abc"}) // can't coerce

      expect(_ajv.validate(schema, (data = {foo: {}}))).equal(false)
      expect(data).eql({foo: {}}) // can't coerce

      expect(_ajv.validate(schema, (data = {foo: []}))).equal(false)
      expect(data).eql({foo: []}) // can't coerce
    })
  })

  it("should coerce to multiple types in order with integer type", () => {
    const schema = {
      type: "object",
      properties: {
        foo: {
          type: ["integer", "boolean", "null"],
        },
      },
    }

    instances.forEach((_ajv) => {
      let data

      expect(_ajv.validate(schema, (data = {foo: "1"}))).equal(true)
      expect(data).eql({foo: 1})

      expect(_ajv.validate(schema, (data = {foo: "false"}))).equal(true)
      expect(data).eql({foo: false})

      expect(_ajv.validate(schema, (data = {foo: 1}))).equal(true)
      expect(data).eql({foo: 1}) // no coercion

      expect(_ajv.validate(schema, (data = {foo: true}))).equal(true)
      expect(data).eql({foo: true}) // no coercion

      expect(_ajv.validate(schema, (data = {foo: null}))).equal(true)
      expect(data).eql({foo: null}) // no coercion

      expect(_ajv.validate(schema, (data = {foo: "abc"}))).equal(false)
      expect(data).eql({foo: "abc"}) // can't coerce

      expect(_ajv.validate(schema, (data = {foo: {}}))).equal(false)
      expect(data).eql({foo: {}}) // can't coerce

      expect(_ajv.validate(schema, (data = {foo: []}))).equal(false)
      expect(data).eql({foo: []}) // can't coerce
    })
  })

  it("should fail to coerce non-number if multiple properties/items are coerced (issue #152)", () => {
    const schema = {
      type: "object",
      properties: {
        foo: {type: "number"},
        bar: {type: "number"},
      },
    }

    const schema2 = {
      type: "array",
      items: {type: "number"},
    }

    instances.forEach((_ajv) => {
      const data: any = {foo: "123", bar: "bar"}
      expect(_ajv.validate(schema, data)).equal(false)
      expect(data).eql({foo: 123, bar: "bar"})

      const data2: any = ["123", "bar"]
      expect(_ajv.validate(schema2, data2)).equal(false)
      expect(data2).eql([123, "bar"])
    })
  })

  it("should update data if the schema is in ref that is not inlined", () => {
    instances.push(new _Ajv({coerceTypes: true, inlineRefs: false, allowUnionTypes: true}))

    const schema = {
      type: "object",
      definitions: {
        foo: {type: "number"},
      },
      properties: {
        foo: {$ref: "#/definitions/foo"},
      },
    }

    const schema2 = {
      type: "object",
      definitions: {
        foo: {
          // allOf is needed to make sure that "foo" is compiled to a separate function
          // and not simply passed through (as it would be if it were only $ref)
          allOf: [{$ref: "#/definitions/bar"}],
        },
        bar: {type: "number"},
      },
      properties: {
        foo: {$ref: "#/definitions/foo"},
      },
    }

    const schemaRecursive = {
      type: ["object", "number"],
      properties: {
        foo: {$ref: "#"},
      },
    }

    const schemaRecursive2 = {
      $id: "http://e.com/schema.json#",
      definitions: {
        foo: {
          $id: "http://e.com/foo.json#",
          type: ["object", "number"],
          properties: {
            foo: {$ref: "#"},
          },
        },
      },
      type: "object",
      properties: {
        foo: {$ref: "http://e.com/foo.json#"},
      },
    }

    instances.forEach((_ajv) => {
      testCoercion(schema, {foo: "1"}, {foo: 1})
      testCoercion(schema2, {foo: "1"}, {foo: 1})
      testCoercion(schemaRecursive, {foo: {foo: "1"}}, {foo: {foo: 1}})
      testCoercion(schemaRecursive2, {foo: {foo: {foo: "1"}}}, {foo: {foo: {foo: 1}}})

      function testCoercion(
        _schema: string | boolean | SchemaObject,
        fromData: unknown,
        toData: {foo: number | {foo: number} | {foo: {foo: number}}}
      ) {
        const valid = _ajv.validate(_schema, fromData)
        // if (!valid) console.log(schema, fromData, toData);
        expect(valid).equal(true)
        expect(fromData).eql(toData)
      }
    })
  })

  it("should generate one error for type with coerceTypes option (issue #469)", () => {
    const schema = {
      type: "number",
      minimum: 10,
    }

    instances.forEach((_ajv) => {
      const validate = _ajv.compile(schema)
      expect(validate(9)).equal(false)
      expect(validate.errors?.length).equal(1)

      expect(validate(11)).equal(true)

      expect(validate("foo")).equal(false)
      expect(validate.errors?.length).equal(1)
    })
  })

  it('should check "uniqueItems" after coercion', () => {
    const schema = {
      type: "array",
      items: {type: "number"},
      uniqueItems: true,
    }

    instances.forEach((_ajv) => {
      const validate = _ajv.compile(schema)
      expect(validate([1, "2", 3])).equal(true)

      expect(validate([1, "2", 2])).equal(false)
      expect(validate.errors?.length).equal(1)
      expect(validate.errors?.[0]?.keyword).equal("uniqueItems")
    })
  })

  it('should check "contains" after coercion', () => {
    const schema = {
      type: "array",
      items: {type: "number"},
      contains: {const: 2},
    }

    instances.forEach((_ajv) => {
      const validate = _ajv.compile(schema)
      expect(validate([1, "2", 3])).equal(true)

      expect(validate([1, "3", 4])).equal(false)
      expect(validate.errors?.pop()?.keyword).equal("contains")
    })
  })

  function testRules(rules: any, cb: Function) {
    for (const toType in rules) {
      for (const fromType in rules[toType]) {
        const tests = rules[toType][fromType]
        tests.forEach((test: {to: any[] | undefined}) => {
          const canCoerce = test.to !== undefined
          const schema = canCoerce
            ? Array.isArray(test.to)
              ? {type: toType, items: {type: fromType, enum: [test.to[0]]}}
              : {type: toType, enum: [test.to]}
            : {type: toType}
          cb(test, schema, canCoerce, toType, fromType)
        })
      }
    }
  }
})
