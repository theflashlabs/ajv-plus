import type AjvCore from "../dist/core.d.ts"
import type {Options} from "../dist/ajv.d.ts"
import _Ajv from "./ajv.ts"
import _Ajv2019 from "./ajv2019.ts"
import getAjvInstances from "./ajv_instances.ts"

export default function getAjvAllInstances(options: Options, extraOpts: Options = {}): AjvCore[] {
  return [...getAjvs(_Ajv), ...getAjvs(_Ajv2019)]

  function getAjvs(Ajv: typeof AjvCore): AjvCore[] {
    return getAjvInstances(Ajv, options, extraOpts)
  }
}
