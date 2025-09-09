import * as uri from "fast-uri"

type URI = typeof uri & {code: string}
;(uri as URI).code = 'require("@theflashlabs/ajv-plus/dist/runtime/uri").default'

export default uri as URI
