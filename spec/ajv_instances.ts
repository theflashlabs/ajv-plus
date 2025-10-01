import type AjvCore from "../lib/core.ts"
import type {Options} from "../lib/ajv.ts"

export default function getAjvInstances(
  _Ajv: typeof AjvCore,
  options: Options,
  extraOpts: Options = {}
): AjvCore[] {
  return _getAjvInstances(options, {...extraOpts, logger: false})

  function _getAjvInstances(opts: Options, useOpts: Options): AjvCore[] {
    const optNames = Object.keys(opts)
    if (optNames[0]) {
      opts = Object.assign({}, opts)
      const useOpts1 = Object.assign({}, useOpts)
      const optName = optNames[0]
      //@ts-expect-error
      useOpts1[optName as keyof typeof useOpts1] = opts[optName as keyof typeof opts]
      delete opts[optName as keyof typeof opts]
      return [..._getAjvInstances(opts, useOpts), ..._getAjvInstances(opts, useOpts1)]
    }
    return [new _Ajv(useOpts)]
  }
}
