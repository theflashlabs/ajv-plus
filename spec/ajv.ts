import type Ajv from "../lib/core.ts"
import ajvModule from "../lib/ajv.ts"
const AjvClass: typeof Ajv = typeof window == "object" ? (window as any).ajv7 : ajvModule

export default AjvClass
