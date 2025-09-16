import Ajv from "../../dist/ajv"
import {fullFormats, fastFormats} from "../../dist/formats/formats"
import formatLimit from "../../dist/formats/limit"
import ajvFormats from "../../dist/formats/"
import chai from "../chai"
const should = chai.should()

describe('keywords "formatMinimum" and "formatMaximum"', () => {
  const ajvs = getAjvs(true)
  const ajvsFF = getAjvs(false)

  ajvs.forEach((ajv, i) => {
    it(`should not validate formatMaximum/Minimum if option format == false #${i}`, () => {
      const ajvFF = ajvsFF[i]

      const schema = {
        type: "string",
        format: "date",
        formatMaximum: "2015-08-01",
      }

      const date = "2015-09-01"
      ajv.validate(schema, date).should.equal(false)
      ajvFF.validate(schema, date).should.equal(true)
    })
  })

  ajvs.forEach((ajv, i) => {
    it(`should throw when "format" is absent #${i}`, () => {
      should.throw(() => ajv.compile({type: "string", formatMaximum: "2015-08-01"}))
    })
  })

  ajvs.forEach((ajv, i) => {
    it(`formatExclusiveMaximum should throw if not boolean #${i}`, () => {
      should.throw(() =>
        ajv.compile({
          type: "string",
          formatMaximum: "2015-08-01",
          formatExclusiveMaximum: 1,
        })
      )
    })
  })

  ajvs.forEach((ajv, i) => {
    it(`formatExclusiveMaximum should throw when "formatMaximum" is absent #${i}`, () => {
      should.throw(() => ajv.compile({type: "string", formatExclusiveMaximum: true}))
    })
  })

  function getAjvs(validateFormats: boolean): Ajv[] {
    return [
      formatLimit(new Ajv({allErrors: true, validateFormats, formats: fullFormats})),
      formatLimit(new Ajv({allErrors: true, validateFormats, formats: fastFormats})),
      ajvFormats(new Ajv({allErrors: true, validateFormats})),
      ajvFormats(new Ajv({validateFormats}), {keywords: true}),
    ]
  }
})
