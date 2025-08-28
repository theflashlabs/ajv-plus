import type {ChaiStatic} from "./chai_type"
import _chai from "chai"

const chai: ChaiStatic = typeof window == "object" ? (window as any).chai : _chai

export default chai
