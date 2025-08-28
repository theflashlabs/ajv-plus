import type Ajv from "../dist/core"
import _Ajv from ".."
const AjvClass: typeof Ajv = typeof window == "object" ? (window as any).ajv7 : _Ajv
export default AjvClass
module.exports = AjvClass
module.exports.default = AjvClass
