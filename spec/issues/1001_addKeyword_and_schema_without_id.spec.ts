import _Ajv from "../ajv.ts"
import chai from "../chai.ts"
chai.should()

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
    ajv.getSchema("#/definitions/foo").should.be.a("function")
  })
})
