// https://github.com/ajv-validator/ajv/issues/889
import * as equal from "fast-deep-equal"
import {join as pathJoin} from "node:path"

type Equal = typeof equal & {code: string}
;(equal as Equal).code = `require("${pathJoin(__dirname, "../../dist/runtime/equal")}").default`

export default equal as Equal
