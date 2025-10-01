import {assert, describe, it} from "vitest"
import getAjvAllInstances from "./ajv_all_instances.ts"
import {withStandalone} from "./ajv_standalone.ts"
import {_} from "../lib/compile/codegen/code.ts"
import jsonSchemaTest from "@theflashlabs/json-schema-test"
import options from "./ajv_options.ts"
import {afterError, afterEach} from "./after_test.ts"

const instances = getAjvAllInstances(options, {
  $data: true,
  formats: {allowedUnknown: true},
  strictTypes: false,
  strictTuples: false,
})

instances.forEach((ajv) => {
  ajv.opts.code.source = true
  ajv.opts.code.formats = _`{allowedUnknown: true}`
})

jsonSchemaTest(withStandalone(instances), {
  description:
    "Extra keywords schemas tests of " + instances.length + " ajv instances with different options",
  suites: {extras: require("../spec/_json/extras")},
  assert: assert,
  afterError,
  afterEach,
  cwd: __dirname,
  hideFolder: "extras/",
  timeout: 90000,
  describe,
  it,
})
