import type Ajv from "../dist/core.d.ts"
import ajvModule from "../dist/ajv.js"
const AjvClass: typeof Ajv = typeof window == "object" ? (window as any).ajv7 : ajvModule
export default AjvClass
