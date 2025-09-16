import Ajv from "../../../dist/ajv"
import addFormats from "../../../dist/formats/"

describe("PR #617, full date format validation should understand leap years", () => {
  let ajv: Ajv

  before(() => {
    ajv = new Ajv({strictTypes: false})
    addFormats(ajv)
  })

  it("should handle non leap year affected dates with date-time", () => {
    const schema = {format: "date-time"}
    const validDateTime = "2016-01-31T00:00:00Z"

    ajv.validate(schema, validDateTime).should.equal(true)
  })

  it("should handle non leap year affected dates with date", () => {
    const schema = {format: "date"}
    const validDate = "2016-11-30"

    ajv.validate(schema, validDate).should.equal(true)
  })

  it("should handle year leaps as date-time", () => {
    const schema = {format: "date-time"}
    const validDateTime = "2016-02-29T00:00:00Z"
    const invalidDateTime = "2017-02-29T00:00:00Z"

    ajv.validate(schema, validDateTime).should.equal(true)
    ajv.validate(schema, invalidDateTime).should.equal(false)
  })

  it("should handle year leaps as date", () => {
    const schema = {format: "date"}
    const validDate = "2016-02-29"
    const invalidDate = "2017-02-29"

    ajv.validate(schema, validDate).should.equal(true)
    ajv.validate(schema, invalidDate).should.equal(false)
  })
})
