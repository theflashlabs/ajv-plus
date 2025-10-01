import Ajv from "./ajv.ts"
import Ajv2019 from "./ajv2019.ts"
import {strictEqual} from "assert"
import {describe, it} from "vitest"

describe("using Ajv with javascript", () => {
  describe("draft-07", () => it("should validate", () => test(Ajv)))
  describe("draft-2019-09", () => it("should validate", () => test(Ajv2019)))

  function test(_Ajv) {
    const ajv = new _Ajv()
    const validate = ajv.compile({type: "number"})
    strictEqual(validate(1), true)
    strictEqual(validate("1"), false)
  }
})
