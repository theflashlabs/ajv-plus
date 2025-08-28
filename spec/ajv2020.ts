import type Ajv2020 from "../dist/2020"
import _Ajv from "../dist/2020"
const AjvClass: typeof Ajv2020 = typeof window == "object" ? (window as any).ajv2020 : _Ajv

export default AjvClass
