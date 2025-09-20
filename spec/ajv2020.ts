import type Ajv2020 from "../dist/2020.d.ts"
import ajvModule from "../dist/2020.js"

const AjvClass: typeof Ajv2020 = typeof window == "object" ? (window as any).ajv2020 : ajvModule

export default AjvClass
