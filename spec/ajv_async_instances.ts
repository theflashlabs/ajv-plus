import getAjvInstances from "./ajv_instances.ts"
import _Ajv from "./ajv.ts"
import type AjvCore from "../dist/core.d.ts"
import type {Options} from "../dist/ajv.d.ts"

export default function getAjvSyncInstances(extraOpts?: Options): AjvCore[] {
  return getAjvInstances(
    _Ajv,
    {
      strict: false,
      allErrors: true,
      code: {lines: true, optimize: false},
    },
    extraOpts
  )
}
