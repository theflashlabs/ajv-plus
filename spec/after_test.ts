import {expect, expectTypeOf} from "vitest"
import type {TestResult} from "@theflashlabs/json-schema-test"
import type Ajv from "../lib/ajv.ts"
import type {ErrorObject} from "../lib/ajv.ts"

export function afterError(res: TestResult): void {
  console.log("ajv options:", (res.validator as Ajv).opts)
}

export function afterEach(res: TestResult): void {
  // console.log(res.errors);
  expectTypeOf(res.valid).toBeBoolean()
  if (res.valid === true) {
    expect(res.errors).toBeNull()
  } else {
    const errs = res.errors as ErrorObject[]
    expectTypeOf(errs).toBeArray()
    for (const err of errs) {
      expectTypeOf(err).toBeObject()
    }
  }
}
