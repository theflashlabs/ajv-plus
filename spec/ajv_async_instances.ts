import getAjvInstances from "./ajv_instances.ts"
import _Ajv from "./ajv.ts"
import type AjvCore from "../lib/core.ts"
import type {Options} from "../lib/ajv.ts"

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
