import Benchmark from "benchmark"
import fs from "node:fs/promises"
import path from "node:path"
import validateSchema from "./validate_json_schema.mjs"

const suite = new Benchmark.Suite("JSONSchema validation")

async function benchmarkAvailableSchemas(directory = "schemas") {
  const schemasDirectory = path.resolve(import.meta.dirname, directory)
  try {
    const files = await fs.readdir(schemasDirectory)
    for (const file of files) {
      const schemaPath = path.resolve(schemasDirectory, file, "schema.json")
      const instancePath = path.resolve(schemasDirectory, file, "instances.jsonl")
      try {
        suite.add(file, {
          defer: true,
          fn: async (deferred) => {
            await validateSchema(schemaPath, instancePath)
            deferred.resolve()
          },
        })
      } catch (error) {
        // console.error(error)
      }
    }
    suite
      .on("cycle", (event) => {
        console.log(String(event.target))
      })
      .run()
  } catch (err) {
    // console.error(err)
  }
}

await benchmarkAvailableSchemas()
