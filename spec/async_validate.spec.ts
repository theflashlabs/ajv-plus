import {describe, beforeEach, it, expect} from "vitest"
import getAjvAsyncInstances from "./ajv_async_instances.ts"
import _Ajv from "./ajv.ts"
import type AjvCore from "../lib/core.ts"
import type Ajv from "../lib/ajv.ts"
import assert from "assert"

describe("async schemas, formats and keywords", () => {
  let ajv: Ajv, instances: AjvCore[]

  beforeEach(() => {
    instances = getAjvAsyncInstances()
    assert(instances[0])
    ajv = instances[0]
  })

  describe("async schemas without async elements", () => {
    it("should return result as promise", () => {
      const schema = {
        $async: true,
        type: "string",
        maxLength: 3,
      }

      return repeat(() => {
        return Promise.all(instances.map(test))
      })

      function test(_ajv: Ajv) {
        const validate = _ajv.compile(schema)

        return Promise.all([
          shouldBeValid(validate("abc"), "abc"),
          shouldBeInvalid(validate("abcd")),
          shouldBeInvalid(validate(1)),
        ])
      }
    })

    it("should fail compilation if async schema is inside sync schema", () => {
      const schema: any = {
        type: "object",
        properties: {
          foo: {
            $async: true,
            type: "string",
            maxLength: 3,
          },
        },
      }

      expect(() => {
        ajv.compile(schema)
      }).toThrowError("async schema in sync schema")

      ajv.compile({...schema, $async: true})
    })
  })

  describe("async formats", () => {
    beforeEach(addFormatEnglishWord)

    it("should fail compilation if async format is inside sync schema", () => {
      instances.forEach((_ajv) => {
        let schema: any = {
          type: "string",
          format: "english_word",
        }

        expect(() => {
          _ajv.compile(schema)
        }).toThrowError("async format in sync schema")
        schema = {...schema, $async: true}
        _ajv.compile(schema)
      })
    })
  })

  describe("async user-defined keywords", () => {
    beforeEach(() => {
      instances.forEach((_ajv) => {
        _ajv.addKeyword({
          keyword: "idExists",
          async: true,
          type: "number",
          validate: checkIdExists,
          errors: false,
        })

        _ajv.addKeyword({
          keyword: "idExistsWithError",
          async: true,
          type: "number",
          validate: checkIdExistsWithError,
          errors: true,
        })
      })
    })

    it("should fail compilation if async keyword is inside sync schema", () => {
      instances.forEach((_ajv) => {
        let schema: any = {
          type: "object",
          properties: {
            userId: {
              type: "integer",
              idExists: {table: "users"},
            },
          },
        }

        expect(() => {
          _ajv.compile(schema)
        }).toThrowError("async keyword in sync schema")

        schema = {...schema, $async: true}
        _ajv.compile(schema)
      })
    })

    it("should return user-defined error", () => {
      return Promise.all(
        instances.map((_ajv) => {
          const schema = {
            $async: true,
            type: "object",
            properties: {
              userId: {
                type: "integer",
                idExistsWithError: {table: "users"},
              },
              postId: {
                type: "integer",
                idExistsWithError: {table: "posts"},
              },
            },
          }

          const validate = _ajv.compile(schema)

          return Promise.all([
            shouldBeInvalid(validate({userId: 5, postId: 10}), ["id not found in table posts"]),
            shouldBeInvalid(validate({userId: 9, postId: 25}), ["id not found in table users"]),
          ])
        })
      )
    })

    function checkIdExists(schema: {table: any}, data: any) {
      switch (schema.table) {
        case "users":
          return check([1, 5, 8])
        case "posts":
          return check([21, 25, 28])
        default:
          throw new Error("no such table")
      }

      function check(IDs: number[]) {
        return Promise.resolve(IDs.indexOf(data) >= 0)
      }
    }

    function checkIdExistsWithError(schema: {table: any}, data: any) {
      const {table} = schema
      switch (table) {
        case "users":
          return check(table, [1, 5, 8])
        case "posts":
          return check(table, [21, 25, 28])
        default:
          throw new Error("no such table")
      }

      function check(_table: string, IDs: number[]) {
        if (IDs.indexOf(data) >= 0) return Promise.resolve(true)
        const error = {
          keyword: "idExistsWithError",
          message: "id not found in table " + _table,
        }
        return Promise.reject(new _Ajv.ValidationError([error]))
      }
    }
  })

  describe("async referenced schemas", () => {
    beforeEach(() => {
      instances = getAjvAsyncInstances({inlineRefs: false, ignoreKeywordsWithRef: true})
      addFormatEnglishWord()
    })

    it("should validate referenced async schema", () => {
      const schema = {
        $async: true,
        definitions: {
          english_word: {
            $async: true,
            type: "string",
            format: "english_word",
          },
        },
        type: "object",
        properties: {
          word: {$ref: "#/definitions/english_word"},
        },
      }

      return repeat(() => {
        return Promise.all(
          instances.map((_ajv) => {
            const validate = _ajv.compile(schema)
            const validData = {word: "tomorrow"}

            return Promise.all([
              shouldBeValid(validate(validData), validData),
              shouldBeInvalid(validate({word: "manana"})),
              shouldBeInvalid(validate({word: 1})),
              shouldThrow(validate({word: "today"}), "unknown word"),
            ])
          })
        )
      })
    })

    it("should validate recursive async schema", () => {
      const schema = {
        $async: true,
        definitions: {
          english_word: {
            $async: true,
            type: "string",
            format: "english_word",
          },
        },
        type: "object",
        properties: {
          foo: {
            anyOf: [{$ref: "#/definitions/english_word"}, {$ref: "#"}],
          },
        },
      }

      return recursiveTest(schema)
    })

    it("should validate recursive ref to async sub-schema, issue #612", () => {
      const schema = {
        $async: true,
        type: "object",
        properties: {
          foo: {
            $async: true,
            anyOf: [
              {
                type: "string",
                format: "english_word",
              },
              {
                type: "object",
                properties: {
                  foo: {$ref: "#/properties/foo"},
                },
              },
            ],
          },
        },
      }

      return recursiveTest(schema)
    })

    it("should validate ref from referenced async schema to root schema", () => {
      const schema = {
        $async: true,
        definitions: {
          wordOrRoot: {
            $async: true,
            anyOf: [
              {
                type: "string",
                format: "english_word",
              },
              {$ref: "#"},
            ],
          },
        },
        type: "object",
        properties: {
          foo: {$ref: "#/definitions/wordOrRoot"},
        },
      }

      return recursiveTest(schema)
    })

    it("should validate refs between two async schemas", () => {
      const schemaObj = {
        $id: "http://e.com/obj.json#",
        $async: true,
        type: "object",
        properties: {
          foo: {$ref: "http://e.com/word.json#"},
        },
      }

      const schemaWord = {
        $id: "http://e.com/word.json#",
        $async: true,
        anyOf: [
          {
            type: "string",
            format: "english_word",
          },
          {$ref: "http://e.com/obj.json#"},
        ],
      }

      return recursiveTest(schemaObj, schemaWord)
    })

    it("should fail compilation if sync schema references async schema", () => {
      let schema: any = {
        $id: "http://e.com/obj.json#",
        type: "object",
        properties: {
          foo: {$ref: "http://e.com/word.json#"},
        },
      }

      const schemaWord = {
        $id: "http://e.com/word.json#",
        $async: true,
        anyOf: [
          {
            type: "string",
            format: "english_word",
          },
          {$ref: "http://e.com/obj.json#"},
        ],
      }

      ajv.addSchema(schemaWord)
      ajv.addFormat("english_word", {
        async: true,
        validate: checkWordOnServer,
      })

      expect(() => {
        ajv.compile(schema)
      }).toThrowError("async schema referenced by sync schema")

      schema = {...schema, $id: "http://e.com/obj2.json#", $async: true}

      ajv.compile(schema)
    })

    function recursiveTest(schema: any, refSchema?: any) {
      return repeat(() => {
        return Promise.all(
          instances.map((_ajv) => {
            if (refSchema) _ajv.addSchema(refSchema)
            const validate = _ajv.compile(schema)
            let data

            return Promise.all([
              shouldBeValid(validate((data = {foo: "tomorrow"})), data),
              shouldBeInvalid(validate({foo: "manana"})),
              shouldBeInvalid(validate({foo: 1})),
              shouldThrow(validate({foo: "today"}), "unknown word"),
              shouldBeValid(validate((data = {foo: {foo: "tomorrow"}})), data),
              shouldBeInvalid(validate({foo: {foo: "manana"}})),
              shouldBeInvalid(validate({foo: {foo: 1}})),
              shouldThrow(validate({foo: {foo: "today"}}), "unknown word"),
              shouldBeValid(validate((data = {foo: {foo: {foo: "tomorrow"}}})), data),
              shouldBeInvalid(validate({foo: {foo: {foo: "manana"}}})),
              shouldBeInvalid(validate({foo: {foo: {foo: 1}}})),
              shouldThrow(validate({foo: {foo: {foo: "today"}}}), "unknown word"),
            ])
          })
        )
      })
    }
  })

  function addFormatEnglishWord() {
    instances.forEach((_ajv) => {
      _ajv.addFormat("english_word", {
        async: true,
        validate: checkWordOnServer,
      })
    })
  }
})

function checkWordOnServer(str: string) {
  return str === "tomorrow"
    ? Promise.resolve(true)
    : str === "manana"
      ? Promise.resolve(false)
      : Promise.reject(new Error("unknown word"))
}

async function shouldBeValid(p: boolean | Promise<any>, data: any) {
  const valid = await p
  return expect(valid).equal(data)
}

const SHOULD_BE_INVALID = "test: should be invalid"
async function shouldBeInvalid(p: boolean | Promise<any>, expectedMessages?: string[]) {
  const err = await checkNotValid(p)
  expect(err).be.instanceof(_Ajv.ValidationError)
  expect(err.errors).be.an("array")
  expect(err.validation).equal(true)
  if (expectedMessages) {
    const messages = err.errors.map((e: {message: any}) => e.message)
    expect(messages).eql(expectedMessages)
  }
}

async function shouldThrow(p: boolean | Promise<any>, exception: string) {
  const err = await checkNotValid(p)
  return expect(err.message).equal(exception)
}

async function checkNotValid(p: boolean | Promise<any>) {
  try {
    await p
    throw new Error(SHOULD_BE_INVALID)
  } catch (err: any) {
    expect(err).be.instanceof(Error)
    if (err.message === SHOULD_BE_INVALID) throw err
    return err
  }
}

function repeat(func: any) {
  return func()
  // var promises = [];
  // for (var i=0; i<1000; i++) promises.push(func());
  // return Promise.all(promises);
}
