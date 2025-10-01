"use strict"

import {existsSync, mkdirSync, writeFileSync} from "fs"
import {join} from "path"
import browserify from "browserify"
import {minify} from "terser"

const [sourceFile, outFile, globalName] = process.argv.slice(2)

const json = await import(join(import.meta.dirname, "..", "package.json"), {with: {type: "json"}})
const bundleDir = join(import.meta.dirname, "..", "bundle")
if (!existsSync(bundleDir)) mkdirSync(bundleDir)

browserify({standalone: globalName})
  .require(join(import.meta.dirname, "../dist", sourceFile), {expose: sourceFile})
  .bundle(saveAndMinify)

async function saveAndMinify(err, buf) {
  if (err) {
    console.error("browserify error:", err)
    process.exit(1)
  }

  const bundlePath = join(bundleDir, outFile)
  const opts = {
    ecma: 2018,
    warnings: true,
    compress: {
      pure_getters: true,
      keep_infinity: true,
      unsafe_methods: true,
    },
    format: {
      preamble: `/* ${json.name} ${json.version} (${globalName}): ${json.description} */`,
    },
    sourceMap: {
      filename: outFile + ".min.js",
      url: outFile + ".min.js.map",
    },
  }

  const result = await minify(buf.toString(), opts)

  writeFileSync(bundlePath + ".bundle.js", buf)
  writeFileSync(bundlePath + ".min.js", result.code)
  writeFileSync(bundlePath + ".min.js.map", result.map)
  if (result.warnings) result.warnings.forEach((msg) => console.warn("terser.minify warning:", msg))
}
