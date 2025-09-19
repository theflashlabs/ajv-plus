import getAjvAllInstances from "../ajv_all_instances.ts"
import {withStandalone} from "../ajv_standalone.ts"
import {_} from "../../dist/compile/codegen/code.js"
import jsonSchemaTest from "json-schema-test"
import options from "../ajv_options.ts"
import {afterError, afterEach} from "../after_test.ts"
import chai from "../chai.ts"
import re2 from "../../dist/runtime/re2.js"
import re2tests from "./re2.ts"

const instances = getAjvAllInstances(options, {
  $data: true,
  formats: {allowedUnknown: true},
  strictTypes: false,
  strictTuples: false,
})

instances.forEach((ajv) => {
  ajv.opts.code.source = true
  ajv.opts.code.formats = _`{allowedUnknown: true}`
  ajv.opts.code.regExp = re2
})

jsonSchemaTest(withStandalone(instances), {
  description: "Test with re2 RegExp engine with " + instances.length + " ajv instances",
  suites: {"regular expressions": re2tests},
  assert: chai.assert,
  afterError,
  afterEach,
  cwd: import.meta.dirname,
  hideFolder: "extras/",
  timeout: 90000,
})
