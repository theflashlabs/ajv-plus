# Ajv-Plus JSON schema validator

This is a maintained and JSON specification-compliant fork of the original `ajv` package.
The fastest JSON validator for Node.js and browser.

Supports JSON Schema draft-04/06/07/2019-09/2020-12 ([draft-04 support](https://ajv.js.org/json-schema.html#draft-04) requires ajv-draft-04 package).

[![build](https://github.com/bavulapati/ajv-plus/actions/workflows/build.yml/badge.svg)](https://github.com/bavulapati/ajv-plus/actions?query=workflow%3Abuild)
[![npm](https://img.shields.io/npm/v/ajv.svg)](https://www.npmjs.com/package/ajv-plus)
[![npm downloads](https://img.shields.io/npm/dm/ajv.svg)](https://www.npmjs.com/package/ajv-plus)
[![Coverage Status](https://coveralls.io/repos/github/bavulapati/ajv-plus/badge.svg?branch=main)](https://coveralls.io/github/bavulapati/ajv-plus?branch=main)

## Why fork?

- AJV is very inactive. Ajv-Plus wants to be actively maintained. Support the upcoming JSON Schema specification version too.
- Ajv supports JSON Type Definitions, which is not evolving. Ajv-Plus wants to be 100% compliant with the standard JSON Specification.

## Thanks to Author and contributors of AJV

Thanks to the original author Evgeny Poberezkin and all the contributors of [AJV](https://github.com/ajv-validator/ajv).

## Contributing

Please review [Contributing guidelines](./CONTRIBUTING.md).

## Install

To install latest version :

```
npm install ajv-plus
```

## <a name="usage"></a>Getting started

In JavaScript:

```javascript
// or ESM/TypeScript import
import Ajv from "ajv-plus"
// Node.js require:
const Ajv = require("ajv-plus")

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

Learn how to use Ajv and see more examples in the [Guide: getting started](https://ajv.js.org/guide/getting-started.html)

## Changes history

See [https://github.com/bavulapati/ajv-plus/releases](https://github.com/bavulapati/ajv-plus/releases)

## Code of conduct

Please review and follow the [Code of conduct](./CODE_OF_CONDUCT.md).

## License

[MIT](./LICENSE)
