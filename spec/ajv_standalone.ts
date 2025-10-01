import type AjvCore from "../lib/core.ts"
import type {Options} from "../lib/ajv.ts"
import AjvPack from "../lib/standalone/instance.ts"

export function withStandalone(instances: AjvCore[]): (AjvCore | AjvPack)[] {
  return [...(instances as (AjvCore | AjvPack)[]), ...instances.map(makeStandalone)]
}

function makeStandalone(ajv: AjvCore): AjvPack {
  ajv.opts.code.source = true
  return new AjvPack(ajv)
}

export function getStandalone(_Ajv: typeof AjvCore, opts: Options = {}): AjvPack {
  opts.code ||= {}
  opts.code.source = true
  return new AjvPack(new _Ajv(opts))
}
