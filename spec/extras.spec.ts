import getAjvAllInstances from "./ajv_all_instances.ts"
import {withStandalone} from "./ajv_standalone.ts"
import {_} from "../dist/compile/codegen/code.js"
import jsonSchemaTest from "json-schema-test"
import options from "./ajv_options.ts"
import {afterError, afterEach} from "./after_test.ts"
import chai from "./chai.ts"
import extrasSpec from "../spec/_json/extras.cjs"

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
  suites: {extras: extrasSpec},
  assert: chai.assert,
  afterError,
  afterEach,
  cwd: import.meta.dirname,
  hideFolder: "extras/",
  timeout: 90000,
})
