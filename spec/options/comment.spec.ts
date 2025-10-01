import {describe, expect, it} from "vitest"
import _Ajv from "../ajv.ts"

describe("$comment option", () => {
  describe("= true", () => {
    let logCalls: any[][]

    function log(...args: any[]) {
      logCalls.push(args)
    }

    const logger = {log, warn: log, error: log}

    it("should log the text from $comment keyword", () => {
      const schema = {
        $comment: "object root",
        type: "object",
        properties: {
          foo: {$comment: "property foo"},
          bar: {$comment: "property bar", type: "integer"},
        },
      }

      const ajv = new _Ajv({$comment: true, logger})
      const fullAjv = new _Ajv({allErrors: true, $comment: true, logger})

      ;[ajv, fullAjv].forEach((_ajv) => {
        const validate = _ajv.compile(schema)

        test({}, true, [["object root"]])
        test({foo: 1}, true, [["object root"], ["property foo"]])
        test({foo: 1, bar: 2}, true, [["object root"], ["property foo"], ["property bar"]])
        test({foo: 1, bar: "baz"}, false, [["object root"], ["property foo"], ["property bar"]])

        function test(
          data: {foo?: number; bar?: string | number},
          valid: boolean,
          expectedLogCalls: string[][]
        ) {
          logCalls = []
          expect(validate(data)).equal(valid)
          expect(logCalls).eql(expectedLogCalls)
        }
      })
    })
  })

  describe("function hook", () => {
    let hookCalls: any[]

    function hook(...args: any[]) {
      hookCalls.push(Array.prototype.slice.call(args))
    }

    it("should pass the text from $comment keyword to the hook", () => {
      const schema = {
        $comment: "object root",
        type: "object",
        properties: {
          foo: {$comment: "property foo"},
          bar: {$comment: "property bar", type: "integer"},
        },
      }

      const ajv = new _Ajv({$comment: hook})
      const fullAjv = new _Ajv({allErrors: true, $comment: hook})

      ;[ajv, fullAjv].forEach((_ajv) => {
        const validate = _ajv.compile(schema)

        test({}, true, [["object root", "#/$comment", schema]])
        test({foo: 1}, true, [
          ["object root", "#/$comment", schema],
          ["property foo", "#/properties/foo/$comment", schema],
        ])
        test({foo: 1, bar: 2}, true, [
          ["object root", "#/$comment", schema],
          ["property foo", "#/properties/foo/$comment", schema],
          ["property bar", "#/properties/bar/$comment", schema],
        ])
        test({foo: 1, bar: "baz"}, false, [
          ["object root", "#/$comment", schema],
          ["property foo", "#/properties/foo/$comment", schema],
          ["property bar", "#/properties/bar/$comment", schema],
        ])

        function test(data: any, valid: boolean, expectedHookCalls: any[]) {
          hookCalls = []
          expect(validate(data)).equal(valid)
          expect(hookCalls).eql(expectedHookCalls)
        }
      })
    })
  })
})
