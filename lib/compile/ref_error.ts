import {resolveUrl, normalizeId, getFullPath} from "./resolve.ts"
import type {UriResolver} from "../types/index.ts"

export default class MissingRefError extends Error {
  readonly missingRef: string
  readonly missingSchema: string

  constructor(resolver: UriResolver, baseId: string, ref: string, msg?: string) {
    super(msg || `can't resolve reference ${ref} from id ${baseId}`)
    this.missingRef = resolveUrl(resolver, baseId, ref)
    this.missingSchema = normalizeId(getFullPath(resolver, this.missingRef))
  }
}
