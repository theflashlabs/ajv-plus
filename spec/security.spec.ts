import _Ajv from "./ajv.ts"
import getAjvInstances from "./ajv_instances.ts"
import {withStandalone} from "./ajv_standalone.ts"
import jsonSchemaTest from "json-schema-test"
import options from "./ajv_options.ts"
import {afterError, afterEach} from "./after_test.ts"
import chai from "./chai.ts"
import {createRequire} from "module"

const require = createRequire(import.meta.url)

const instances = getAjvInstances(_Ajv, options, {
  schemas: [require("../dist/refs/json-schema-secure.json")],
  strictTypes: false,
})

instances.forEach((ajv) => (ajv.opts.code.source = true))

jsonSchemaTest(withStandalone(instances), {
  description:
    "Secure schemas tests of " + instances.length + " ajv instances with different options",
  suites: {security: require("../spec/_json/security")},
  assert: chai.assert,
  afterError,
  afterEach,
  cwd: import.meta.dirname,
  hideFolder: "security/",
})
