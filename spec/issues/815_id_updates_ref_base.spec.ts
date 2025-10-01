import {describe, it, expect, beforeAll} from "vitest"
import type {ValidateFunction} from "../../lib/ajv.ts"
import _Ajv from "../ajv.ts"

describe("issue #815, id and $id fields should reset base", () => {
  let validate: ValidateFunction

  const schema = {
    type: "object",
    properties: {
      newRoot: {
        $id: "http://example.com/newRoot",
        type: "object",
        properties: {
          recurse: {
            $ref: "#",
          },
          name: {
            type: "string",
          },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
    required: ["newRoot"],
    additionalProperties: false,
  }

  beforeAll(() => {
    validate = new _Ajv().compile(schema)
  })

  it("should set # to reference the closest ancestor with $id", () => {
    expect(
      validate({
        newRoot: {
          name: "test",
        },
      })
    ).equal(true)

    expect(
      validate({
        newRoot: {
          name: "test",
          recurse: {
            name: "test2",
          },
        },
      })
    ).equal(true)
  })

  it("should NOT set # to reference the absolute document root", () => {
    expect(
      validate({
        newRoot: {
          name: "test",
          recurse: {
            newRoot: {
              name: "test2",
            },
          },
        },
      })
    ).equal(false)
  })
})
