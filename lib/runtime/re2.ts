import * as re2 from "re2"
import {join as pathJoin} from "node:path"

type Re2 = typeof re2 & {code: string}
;(re2 as Re2).code = `require("${pathJoin(__dirname, "../../dist/runtime/re2")}").default`

export default re2 as Re2
