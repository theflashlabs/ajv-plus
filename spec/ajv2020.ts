import type Ajv2020 from "../lib/2020.ts"
import ajvModule from "../lib/2020.ts"

const AjvClass: typeof Ajv2020 = typeof window == "object" ? (window as any).ajv2020 : ajvModule

export default AjvClass
