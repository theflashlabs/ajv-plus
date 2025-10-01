import {describe, expect, it} from "vitest"
import _Ajv from "../ajv.ts"

describe("issue #1001: addKeyword breaks schema without ID", () => {
  it("should allow using schemas without ID with addKeyword", () => {
    const schema = {
      definitions: {
        foo: {},
      },
    }

    const ajv: any = new _Ajv()
    ajv.addSchema(schema)
    ajv.addKeyword("myKeyword")
    expect(ajv.getSchema("#/definitions/foo")).to.be.a("function")
  })
})
