import getAjvAllInstances from "../ajv_all_instances.ts"
import {withStandalone} from "../ajv_standalone.ts"
import {_} from "../../lib/compile/codegen/code.ts"
import jsonSchemaTest from "@theflashlabs/json-schema-test"
import options from "../ajv_options.ts"
import {afterError, afterEach} from "../after_test.ts"
import re2 from "../../lib/runtime/re2.ts"
import re2tests from "./re2.ts"
import {assert, describe, it} from "vitest"

const instances = getAjvAllInstances(options, {
  $data: true,
  formats: {allowedUnknown: true},
  strictTypes: false,
  strictTuples: false,
})

instances.forEach((ajv) => {
  ajv.opts.code.source = true
  ajv.opts.code.formats = _`{allowedUnknown: true}`
  //@ts-expect-error
  ajv.opts.code.regExp = re2
})

jsonSchemaTest(withStandalone(instances), {
  description: "Test with re2 RegExp engine with " + instances.length + " ajv instances",
  suites: {"regular expressions": re2tests},
  assert: assert,
  afterError,
  afterEach,
  cwd: __dirname,
  hideFolder: "extras/",
  timeout: 90000,
  describe,
  it,
})
