import type Ajv2019 from "../lib/2019.ts"
import ajvModule from "../lib/2019.ts"

const AjvClass: typeof Ajv2019 = typeof window == "object" ? (window as any).ajv2019 : ajvModule

export default AjvClass
