import type AjvJTD from "../dist/jtd"
import _Ajv from "../dist/jtd.js"
const AjvClass: typeof AjvJTD = typeof window == "object" ? (window as any).ajvJTD : _Ajv

export default AjvClass
