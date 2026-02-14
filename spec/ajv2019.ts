import type Ajv2019 from "../dist/2019.d.ts"
import ajvModdule from "../dist/2019.js"
const AjvClass: typeof Ajv2019 = typeof window == "object" ? (window as any).ajv2019 : ajvModdule

export default AjvClass
