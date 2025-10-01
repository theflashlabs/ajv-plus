import {expect, expectTypeOf, describe, beforeEach, it} from "vitest"
import _Ajv from "./ajv.ts"
import type Ajv from "../lib/ajv.ts"
import type {
  SchemaObject,
  AnyValidateFunction,
  ValidateFunction,
  AnySchemaObject,
} from "../lib/types/index.ts"

describe("compileAsync method", () => {
  let ajv: Ajv, loadCallCount: number

  const SCHEMAS = {
    "http://example.com/object.json": {
      $id: "http://example.com/object.json",
      type: "object",
      properties: {
        a: {type: "string"},
        b: {$ref: "int2plus.json"},
      },
    },
    "http://example.com/int2plus.json": {
      $id: "http://example.com/int2plus.json",
      type: "integer",
      minimum: 2,
    },
    "http://example.com/tree.json": {
      $id: "http://example.com/tree.json",
      type: "array",
      items: {$ref: "leaf.json"},
    },
    "http://example.com/leaf.json": {
      $id: "http://example.com/leaf.json",
      type: "object",
      properties: {
        name: {type: "string"},
        subtree: {$ref: "tree.json"},
      },
    },
    "http://example.com/recursive.json": {
      $id: "http://example.com/recursive.json",
      type: "object",
      properties: {
        b: {$ref: "parent.json"},
      },
      required: ["b"],
    },
    "http://example.com/invalid.json": {
      $id: "http://example.com/recursive.json",
      type: "object",
      properties: {
        invalid: {type: "number"},
      },
      required: "invalid",
    },
    "http://example.com/foobar.json": {
      $id: "http://example.com/foobar.json",
      $schema: "http://example.com/foobar_meta.json",
      type: "string",
      myFooBar: "foo",
    },
    "http://example.com/foobar_meta.json": {
      $id: "http://example.com/foobar_meta.json",
      type: "object",
      properties: {
        myFooBar: {
          enum: ["foo", "bar"],
        },
      },
    },
    "http://example.com/foo.json": {
      $id: "http://example.com/foo.json",
      type: "object",
      properties: {
        bar: {$ref: "bar.json"},
        other: {$ref: "other.json"},
      },
    },
    "http://example.com/bar.json": {
      $id: "http://example.com/bar.json",
      type: "object",
      properties: {
        foo: {$ref: "foo.json"},
      },
    },
    "http://example.com/other.json": {
      $id: "http://example.com/other.json",
    },
  }

  beforeEach(() => {
    loadCallCount = 0
    ajv = new _Ajv({loadSchema})
  })

  it("should compile schemas loading missing schemas with options.loadSchema function", () => {
    const schema = {
      $id: "http://example.com/parent.json",
      type: "object",
      properties: {
        a: {$ref: "object.json"},
      },
    }
    return ajv.compileAsync(schema).then((validate) => {
      expect(loadCallCount).toBe(2)
      expectTypeOf(validate).toBeFunction()
      expect(validate({a: {b: 2}})).equal(true)
      expect(validate({a: {b: 1}})).equal(false)
    })
  })

  it("should compile schemas loading missing schemas and return promise with function", () => {
    const schema = {
      $id: "http://example.com/parent.json",
      type: "object",
      properties: {
        a: {$ref: "object.json"},
      },
    }
    return ajv.compileAsync(schema).then((validate) => {
      expect(loadCallCount).toBe(2)
      expectTypeOf(validate).toBeFunction()
      expect(validate({a: {b: 2}})).equal(true)
      expect(validate({a: {b: 1}})).equal(false)
    })
  })

  it("should correctly load schemas when missing reference has JSON path", () => {
    const schema = {
      $id: "http://example.com/parent.json",
      type: "object",
      properties: {
        a: {$ref: "object.json#/properties/b"},
      },
    }
    return ajv.compileAsync(schema).then((validate) => {
      expect(loadCallCount).toBe(2)
      expectTypeOf(validate).toBeFunction()
      expect(validate({a: 2})).equal(true)
      expect(validate({a: 1})).equal(false)
    })
  })

  it("should correctly compile with remote schemas that have mutual references", () => {
    const schema = {
      $id: "http://example.com/root.json",
      type: "object",
      properties: {
        tree: {$ref: "tree.json"},
      },
    }
    return ajv.compileAsync(schema).then((validate) => {
      expectTypeOf(validate).toBeFunction()
      const validData = {
        tree: [{name: "a", subtree: [{name: "a.a"}]}, {name: "b"}],
      }
      const invalidData = {tree: [{name: "a", subtree: [{name: 1}]}]}
      expect(validate(validData)).equal(true)
      expect(validate(invalidData)).equal(false)
    })
  })

  it("should correctly compile with remote schemas that reference the compiled schema", () => {
    const schema = {
      $id: "http://example.com/parent.json",
      type: "object",
      properties: {
        a: {$ref: "recursive.json"},
      },
    }
    return ajv.compileAsync(schema).then((validate) => {
      expect(loadCallCount).toBe(1)
      expectTypeOf(validate).toBeFunction()
      const validData = {a: {b: {a: {b: {}}}}}
      const invalidData = {a: {b: {a: {}}}}
      expect(validate(validData)).equal(true)
      expect(validate(invalidData)).equal(false)
    })
  })

  it('should resolve reference containing "properties" segment with the same property (issue #220)', () => {
    const schema = {
      $id: "http://example.com/parent.json",
      type: "object",
      properties: {
        a: {
          $ref: "object.json#/properties/a",
        },
      },
    }
    return ajv.compileAsync(schema).then((validate) => {
      expect(loadCallCount).toBe(2)
      expectTypeOf(validate).toBeFunction()
      expect(validate({a: "foo"})).equal(true)
      expect(validate({a: 42})).equal(false)
    })
  })

  describe("loading metaschemas (#334)", () => {
    it("should load metaschema if not available", () => {
      return test(SCHEMAS["http://example.com/foobar.json"], 1)
    })

    it("should load metaschema of referenced schema if not available", () => {
      return test({$ref: "http://example.com/foobar.json"}, 2)
    })

    function test(schema: SchemaObject, expectedLoadCallCount: number) {
      ajv.addKeyword({
        keyword: "myFooBar",
        type: "string",
        validate: function (sch: any, data: any) {
          return sch === data
        },
      })

      return ajv.compileAsync(schema).then((validate) => {
        expect(loadCallCount).toBe(expectedLoadCallCount)
        expectTypeOf(validate).toBeFunction()
        expect(validate("foo")).equal(true)
        expect(validate("bar")).equal(false)
      })
    }
  })

  it("should return compiled schema on the next tick if there are no references (#51)", () => {
    const schema = {
      $id: "http://example.com/int2plus.json",
      type: "integer",
      minimum: 2,
    }
    let beforeCallback1: any = false
    const p1 = ajv.compileAsync(schema).then((validate) => {
      expect(beforeCallback1).equal(true)
      spec(validate)
      let beforeCallback2: any = false
      const p2 = ajv.compileAsync(schema).then((_validate) => {
        expect(beforeCallback2).equal(true)
        spec(_validate)
      })
      beforeCallback2 = true
      return p2
    })
    beforeCallback1 = true
    return p1

    function spec(validate: ValidateFunction) {
      expect(loadCallCount).toBe(0)
      expectTypeOf(validate).toBeFunction()
      const validData = 2
      const invalidData = 1
      expect(validate(validData)).equal(true)
      expect(validate(invalidData)).equal(false)
    }
  })

  it("should queue calls so only one compileAsync executes at a time (#52)", () => {
    const schema = {
      $id: "http://example.com/parent.json",
      type: "object",
      properties: {
        a: {$ref: "object.json"},
      },
    }

    return Promise.all([
      ajv.compileAsync(schema).then(spec),
      ajv.compileAsync(schema).then(spec),
      ajv.compileAsync(schema).then(spec),
    ])

    function spec(validate: ValidateFunction) {
      expect(loadCallCount).toBe(2)
      expectTypeOf(validate).toBeFunction()
      expect(validate({a: {b: 2}})).equal(true)
      expect(validate({a: {b: 1}})).equal(false)
    }
  })

  it("should throw exception if loadSchema is not passed", () => {
    const schema = {
      $id: "http://example.com/int2plus.json",
      type: "integer",
      minimum: 2,
    }
    ajv = new _Ajv()
    expect(() => {
      ajv.compileAsync(schema)
    }).toThrowError("options.loadSchema should be a function")
  })

  describe("should return error via promise", () => {
    it("if passed schema is invalid", () => {
      const invalidSchema = {
        $id: "http://example.com/int2plus.json",
        type: "integer",
        minimum: "invalid",
      }
      return shouldReject(ajv.compileAsync(invalidSchema), /schema is invalid/)
    })

    it("if loaded schema is invalid", () => {
      const schema = {
        $id: "http://example.com/parent.json",
        type: "object",
        properties: {
          a: {$ref: "invalid.json"},
        },
      }
      return shouldReject(ajv.compileAsync(schema), /schema is invalid/)
    })

    it("if required schema is loaded but the reference cannot be resolved", () => {
      const schema = {
        $id: "http://example.com/parent.json",
        type: "object",
        properties: {
          a: {$ref: "object.json#/definitions/not_found"},
        },
      }
      return shouldReject(ajv.compileAsync(schema), /is loaded but/)
    })

    it("if loadSchema returned error", () => {
      const schema = {
        $id: "http://example.com/parent.json",
        type: "object",
        properties: {
          a: {$ref: "object.json"},
        },
      }
      ajv = new _Ajv({loadSchema: badLoadSchema})
      return shouldReject(ajv.compileAsync(schema), /cant load/)

      function badLoadSchema() {
        return Promise.reject(new Error("cant load"))
      }
    })

    it("if schema compilation throws some other exception", () => {
      // @ts-expect-error
      ajv.addKeyword({keyword: "badkeyword", compile: badCompile})
      const schema = {badkeyword: true}
      return shouldReject(ajv.compileAsync(schema), /cant compile keyword schema/)

      function badCompile(/* schema */) {
        throw new Error("cant compile keyword schema")
      }
    })

    function shouldReject(p: Promise<AnyValidateFunction>, rx: RegExp) {
      return p.then(
        (validate) => {
          expect(validate).toBeNull()
          throw new Error("Promise has resolved; it should have rejected")
        },
        (err) => {
          expect(err).not.toBeNull()
          expect(err.message).match(rx)
        }
      )
    }
  })

  describe("schema with multiple remote properties, the first is recursive schema (#801)", () => {
    it("should validate data", () => {
      const schema = {
        $id: "http://example.com/list.json",
        type: "object",
        properties: {
          foo: {$ref: "foo.json"},
        },
      }

      return ajv.compileAsync(schema).then((validate) => {
        expect(validate({foo: {}})).equal(true)
      })
    })
  })

  function loadSchema(uri: string): Promise<SchemaObject> {
    loadCallCount++
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (SCHEMAS[uri as keyof typeof SCHEMAS]) resolve(SCHEMAS[uri as keyof typeof SCHEMAS])
        else reject(new Error("404"))
      }, 10)
    })
  }
})
