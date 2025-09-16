import * as uri from "fast-uri"
import {join as pathJoin} from "node:path"

type URI = typeof uri & {code: string}
;(uri as URI).code = `require("${pathJoin(__dirname, "../../dist/runtime/uri")}").default`

export default uri as URI
