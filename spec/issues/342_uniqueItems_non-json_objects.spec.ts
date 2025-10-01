import {beforeAll, describe, expect, it} from "vitest"
import _Ajv from "../ajv.ts"
import type {ValidateFunction} from "../../lib/core.ts"

describe("issue #342, support uniqueItems with some non-JSON objects", () => {
  let validate: ValidateFunction

  beforeAll(() => {
    const ajv = new _Ajv()
    validate = ajv.compile({type: "array", uniqueItems: true})
  })

  it("should allow different RegExps", () => {
    expect(validate([/foo/, /bar/])).equal(true)
    expect(validate([/foo/gi, /foo/gi])).equal(false)
    expect(validate([/foo/, {}])).equal(true)
  })

  it("should allow different Dates", () => {
    expect(validate([new Date("2016-11-11"), new Date("2016-11-12")])).equal(true)
    expect(validate([new Date("2016-11-11"), new Date("2016-11-11")])).equal(false)
    expect(validate([new Date("2016-11-11"), {}])).equal(true)
  })

  it("should allow undefined properties", () => {
    expect(validate([{}, {foo: undefined}])).equal(true)
    expect(validate([{foo: undefined}, {}])).equal(true)
    expect(validate([{foo: undefined}, {bar: undefined}])).equal(true)
    expect(validate([{foo: undefined}, {foo: undefined}])).equal(false)
  })
})
