import type {ChaiStatic} from "./chai_type.ts"

const chai: ChaiStatic = typeof window == "object" ? (window as any).chai : await import("chai")

export default chai
