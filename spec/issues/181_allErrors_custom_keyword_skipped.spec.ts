import {describe, expect, it} from "vitest"
import _Ajv from "../ajv.ts"
import type {KeywordDefinition, SchemaValidateFunction} from "../../lib/types/index.ts"

describe("issue #181, user-defined keyword is not validated in allErrors mode if there were previous error", () => {
  it("should validate user-defined keyword that doesn't create errors", () => {
    testKeywordErrors({
      keyword: "alwaysFails",
      type: "object",
      errors: true,
      validate: function v(/* value */) {
        return false
      },
    })
  })

  it("should validate keyword that creates errors", () => {
    const validate: SchemaValidateFunction = (/* value */) => {
      validate.errors = validate.errors || []
      validate.errors.push({
        keyword: "alwaysFails",
        message: "alwaysFails error",
        params: {
          keyword: "alwaysFails",
        },
      })
      return false
    }

    testKeywordErrors({
      keyword: "alwaysFails",
      type: "object",
      errors: true,
      validate,
    })
  })

  function testKeywordErrors(def: KeywordDefinition): void {
    const ajv = new _Ajv({allErrors: true})

    ajv.addKeyword(def)

    const schema = {
      type: "object",
      required: ["foo"],
      alwaysFails: true,
    }

    const validate: any = ajv.compile(schema)

    expect(validate({foo: 1})).equal(false)
    expect(validate.errors).have.length(1)
    expect(validate.errors[0].keyword).equal("alwaysFails")

    expect(validate({})).equal(false)
    expect(validate.errors).have.length(2)
    expect(validate.errors[0].keyword).equal("required")
    expect(validate.errors[1].keyword).equal("alwaysFails")
  }
})
