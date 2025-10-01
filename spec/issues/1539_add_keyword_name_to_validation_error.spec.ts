import {describe, expect, it} from "vitest"
import _Ajv from "../ajv2019.ts"

describe("keyword usage validation error", () => {
  it("should include the keyword name and schema path in the message", () => {
    const ajv = new _Ajv({
      keywords: [
        {
          keyword: "customKeyword",
          metaSchema: {
            type: "string",
          },
          macro() {
            return {}
          },
        },
      ],
    })

    const schema = {
      type: "object",
      properties: {
        foo: {
          type: "object",
          customKeyword: {
            bar: true,
          },
        },
      },
    }

    expect(() => ajv.compile(schema)).throw(
      'keyword "customKeyword" value is invalid at path "#/properties/foo": data must be string'
    )
  })
})
