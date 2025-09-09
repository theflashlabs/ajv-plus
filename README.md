<img align="right" alt="Ajv-Plus logo" width="160" src="./docs/.vuepress/public/img/ajv-plus.png">

&nbsp;

# Ajv-Plus JSON schema validator

This is a maintained and JSON specification-compliant fork of the original `ajv` package.
The fastest JSON validator for Node.js and browser.

Supports JSON Schema 06/07/2019-09/2020-12.

[![build](https://github.com/theflashlabs/ajv-plus/actions/workflows/build.yml/badge.svg)](https://github.com/theflashlabs/ajv-plus/actions?query=workflow%3Abuild)
[![npm](https://img.shields.io/npm/v/@theflashlabs/ajv-plus.svg)](https://www.npmjs.com/package/@theflashlabs/ajv-plus)
[![npm downloads](https://img.shields.io/npm/dm/@theflashlabs/ajv-plus.svg)](https://www.npmjs.com/package/@theflashlabs/ajv-plus)
[![Coverage Status](https://coveralls.io/repos/github/theflashlabs/ajv-plus/badge.svg?branch=main)](https://coveralls.io/github/theflashlabs/ajv-plus?branch=main)

## Why fork?

- Ajv-Plus wants to be actively maintained. Support the upcoming JSON Schema specification version too.
- Ajv-Plus wants to be 100% compliant with the standard JSON Specification.
- Benchmarks are available at https://theflashlabs.github.io/ajv-plus/dev/bench/

## Thanks to Author and contributors of AJV

Thanks to the original author Evgeny Poberezkin and all the contributors of [AJV](https://github.com/ajv-validator/ajv).

## Contributing

Please review [Contributing guidelines](./CONTRIBUTING.md).

## <a name="sponsors"></a>Please [sponsor Ajv-Plus development](https://github.com/sponsors/bavulapati)

Your support is very important - the funds will be used to develop and maintain Ajv-Plus.

Please sponsor Ajv-Plus via:

- [GitHub sponsors page](https://github.com/sponsors/bavulapati)

Thank you.

## Install

To install latest version :

```
npm install @theflashlabs/ajv-plus
```

## <a name="usage"></a>Getting started

In JavaScript:

```javascript
// or ESM/TypeScript import
import Ajv from "@theflashlabs/ajv-plus"
// Node.js require:
const Ajv = require("@theflashlabs/ajv-plus")

const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}

const schema = {
  type: "object",
  properties: {
    foo: {type: "integer"},
    bar: {type: "string"},
  },
  required: ["foo"],
  additionalProperties: false,
}

const data = {
  foo: 1,
  bar: "abc",
}

const validate = ajv.compile(schema)
const valid = validate(data)
if (!valid) console.log(validate.errors)
```

## Changes history

See [https://github.com/theflashlabs/ajv-plus/releases](https://github.com/bavulapati/ajv-plus/releases)

## Code of conduct

Please review and follow the [Code of conduct](./CODE_OF_CONDUCT.md).

## License

[MIT](./LICENSE)
