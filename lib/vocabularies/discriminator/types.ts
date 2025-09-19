import type {ErrorObject} from "../../types/index.ts"

export enum DiscrError {
  Tag = "tag",
  Mapping = "mapping",
}

export type DiscrErrorObj<E extends DiscrError> = ErrorObject<
  "discriminator",
  {error: E; tag: string; tagValue: unknown},
  string
>
