import type AjvCore from "../dist/core.d.ts"
import _Ajv from "./ajv.ts"
import getAjvInstances from "./ajv_instances.ts"
import {withStandalone} from "./ajv_standalone.ts"
import jsonSchemaTest from "json-schema-test"
import options from "./ajv_options.ts"
import {afterError, afterEach} from "./after_test.ts"
import ajvFormats from "@theflashlabs/ajv-formats"
import {createRequire} from "module"
import chai from "./chai.ts"

const require = createRequire(import.meta.url)
const instances = getAjvInstances(_Ajv, options, {strict: false, formats: {allowedUnknown: true}})

const remoteRefs = {
  "http://localhost:1234/integer.json": require("../spec/JSON-Schema-Test-Suite/remotes/integer.json"),
  "http://localhost:1234/folder/folderInteger.json": require("../spec/JSON-Schema-Test-Suite/remotes/baseUriChange/folderInteger.json"),
  "http://localhost:1234/name.json": require("../spec/remotes/name.json"),
}

const remoteRefsWithIds = [
  require("../spec/remotes/bar.json"),
  require("../spec/remotes/foo.json"),
  require("../spec/remotes/buu.json"),
  require("../spec/remotes/tree.json"),
  require("../spec/remotes/node.json"),
  require("../spec/remotes/second.json"),
  require("../spec/remotes/first.json"),
  require("../spec/remotes/scope_change.json"),
]

instances.forEach(addRemoteRefsAndFormats)

jsonSchemaTest(withStandalone(instances), {
  description: `Schema tests of ${instances.length} ajv instances with different options`,
  suites: {"Schema tests": require("../spec/_json/tests.cjs")},
  only: [],
  assert: chai.assert,
  afterError,
  afterEach,
  cwd: import.meta.dirname,
  timeout: 10000,
})

function addRemoteRefsAndFormats(ajv: AjvCore) {
  ajv.opts.code.source = true
  for (const id in remoteRefs) ajv.addSchema(remoteRefs[id], id)
  ajv.addSchema(remoteRefsWithIds)
  //@ts-ignore
  ajvFormats(ajv)
}
