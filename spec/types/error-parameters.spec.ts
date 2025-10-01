import {describe, expect, it} from "vitest"
import type {DefinedError} from "../../lib/ajv.ts"
import _Ajv from "../ajv.ts"

describe("error object parameters type", () => {
  const ajv = new _Ajv({allErrors: true})

  it("should be determined by the keyword", () => {
    const validate = ajv.compile({type: "number", minimum: 0, multipleOf: 2})
    const valid = validate(-1)
    expect(valid).equal(false)
    const errs = validate.errors
    if (errs) {
      expect(errs.length).equal(2)
      for (const err of errs as DefinedError[]) {
        switch (err.keyword) {
          case "minimum":
            expect(err.params.limit).equal(0)
            expect(err.params.comparison).equal(">=")
            break
          case "multipleOf":
            expect(err.params.multipleOf).equal(2)
            break
          default:
            expect.fail()
        }
      }
    }
  })
})
