// https://github.com/ajv-validator/ajv/issues/889
import equal from "fast-deep-equal"

type Equal = typeof equal & {code: string}
;(equal as Equal).code = 'require("@theflashlabs/ajv-plus/dist/runtime/equal").default'

export default equal as Equal
