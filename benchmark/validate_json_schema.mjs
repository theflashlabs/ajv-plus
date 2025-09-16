import fs from "fs"
import readline from "readline"
import addFormats from "../dist/formats/index.js"

const DRAFTS = {
  "https://json-schema.org/draft/2020-12/schema": (await import("../dist/2020.js")).Ajv2020,
  "https://json-schema.org/draft/2019-09/schema": (await import("../dist/2019.js")).Ajv2019,
  "http://json-schema.org/draft-07/schema": (await import("../dist/ajv.js")).Ajv,
}

function readJSONFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8")
    return JSON.parse(fileContent)
  } catch (error) {}
}

async function* readJSONLines(filePath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
  })
  for await (const line of rl) {
    yield JSON.parse(line)
  }
}

function validateAll(instances, validator) {
  let failed = false
  for (const instance of instances) {
    if (!validator(instance)) {
      failed = true
    }
  }

  return failed
}

export default async function validateSchema(schemaPath, instancePath) {
  const schema = readJSONFile(schemaPath)

  const ajv = new DRAFTS[schema["$schema"].replace(/#$/, "")]({strict: false, allErrors: true})
  addFormats(ajv)

  const validate = ajv.compile(schema)

  const instances = []
  for await (const instance of readJSONLines(instancePath)) {
    instances.push(instance)
  }

  validateAll(instances, validate)
}
