import Ajv, {FormatDefinition} from "../../dist/ajv"
import addFormats from "../../dist/formats"
import type {FormatName} from "../../dist/formats"
import chai from "../chai"
const should = chai.should()

describe("addFormats options", () => {
  let ajv: Ajv

  beforeEach(() => {
    ajv = new Ajv({strictTypes: false})
  })

  it("should add passed list of formats", () => {
    addFormats(ajv, ["date", "time"])
    const validateDate = ajv.compile({format: "date"})
    validateDate("2020-09-17").should.equal(true)
    validateDate("2020-09-35").should.equal(false)

    const validateTime = ajv.compile({format: "time"})
    validateTime("17:27:38Z").should.equal(true)
    validateDate("25:27:38Z").should.equal(false)

    should.throw(() => ajv.compile({format: "date-time"}))
    addFormats(ajv, ["date-time"])
    should.not.throw(() => ajv.compile({format: "date-time"}))
  })

  it("should support validation mode", () => {
    addFormats(ajv, {mode: "fast", formats: ["date", "time"]})
    const validateDate = ajv.compile({format: "date"})
    validateDate("2020-09-17").should.equal(true)
    validateDate("2020-09-35").should.equal(true)
    validateDate("2020-09").should.equal(false)

    const validateTime = ajv.compile({format: "time"})
    validateTime("17:27:38Z").should.equal(true)
    validateTime("25:27:38Z").should.equal(true)
    validateTime("17:27").should.equal(false)
  })
})

describe("method get", () => {
  it("should return format definition", () => {
    const timeFormat = addFormats.get("time")
    ;(timeFormat as FormatDefinition<string>).validate.should.be.instanceof(Object)

    const fastTimeFormat = addFormats.get("time", "fast")
    ;(fastTimeFormat as FormatDefinition<string>).validate.should.be.instanceof(RegExp)

    should.throw(() => addFormats.get("unknown" as FormatName))
  })
})
