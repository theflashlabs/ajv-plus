import type Ajv2019 from "../dist/2019"
import _Ajv from "../dist/2019.js"
const AjvClass: typeof Ajv2019 = typeof window == "object" ? (window as any).ajv2019 : _Ajv

export default AjvClass
