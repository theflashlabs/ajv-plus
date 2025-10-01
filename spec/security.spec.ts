import _Ajv from "./ajv.ts"
import getAjvInstances from "./ajv_instances.ts"
import {withStandalone} from "./ajv_standalone.ts"
import jsonSchemaTest from "@theflashlabs/json-schema-test"
import options from "./ajv_options.ts"
import {afterError, afterEach} from "./after_test.ts"
import {assert, describe, it} from "vitest"

const instances = getAjvInstances(_Ajv, options, {
  schemas: [await import("../lib/refs/json-schema-secure.json", {with: {type: "json"}})],
  strictTypes: false,
})

instances.forEach((ajv) => (ajv.opts.code.source = true))

jsonSchemaTest(withStandalone(instances), {
  description:
    "Secure schemas tests of " + instances.length + " ajv instances with different options",
  suites: {security: (await import("../spec/_json/security.js")).default},
  assert: assert,
  afterError,
  afterEach,
  cwd: __dirname,
  hideFolder: "security/",
  describe,
  it,
})
