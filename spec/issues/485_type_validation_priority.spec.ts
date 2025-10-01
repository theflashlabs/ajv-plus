import {describe, expect, it} from "vitest"
import _Ajv from "../ajv.ts"

describe("issue #485, order of type validation", () => {
  it("should validate types before keywords", () => {
    const ajv = new _Ajv({allErrors: true, strictTypes: false})
    const validate: any = ajv.compile({
      type: ["integer", "string"],
      required: ["foo"],
      minimum: 2,
    })

    expect(validate(2)).equal(true)
    expect(validate("foo")).equal(true)

    expect(validate(1.5)).equal(false)
    checkErrors(["type", "minimum"])

    expect(validate({})).equal(false)
    checkErrors(["type", "required"])

    function checkErrors(expectedErrs: string[]) {
      expect(validate.errors).have.length(expectedErrs.length)
      expectedErrs.forEach((keyword, i) => expect(validate.errors[i].keyword).equal(keyword))
    }
  })
})
