import type {ChaiStatic} from "./chai_type.ts"

const chai: ChaiStatic = typeof window == "object" ? (window as any).chai : require("" + "chai")

export default chai
