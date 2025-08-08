<img align="right" alt="Ajv-Plus logo" width="160" src="./docs/.vuepress/public/img/ajv-plus.png">

&nbsp;

# Ajv-Plus JSON schema validator

This is a maintained and JSON specification-compliant fork of the original `ajv` package.
The fastest JSON validator for Node.js and browser.

Supports JSON Schema draft-04/06/07/2019-09/2020-12 ([draft-04 support](https://ajv.js.org/json-schema.html#draft-04) requires ajv-draft-04 package).

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

## Features

- Ajv implements JSON Schema [draft-06/07/2019-09/2020-12](http://json-schema.org/) standards (draft-04 is supported in v6):
  - all validation keywords (see [JSON Schema validation keywords](https://ajv.js.org/json-schema.html))
  - [OpenAPI](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.3.md) extensions:
    - NEW: keyword [discriminator](https://ajv.js.org/json-schema.html#discriminator).
    - keyword [nullable](https://ajv.js.org/json-schema.html#nullable).
  - full support of remote references (remote schemas have to be added with `addSchema` or compiled to be available)
  - support of recursive references between schemas
  - correct string lengths for strings with unicode pairs
  - JSON Schema [formats](https://ajv.js.org/guide/formats.html) (with [ajv-formats](https://github.com/ajv-validator/ajv-formats) plugin).
  - [validates schemas against meta-schema](https://ajv.js.org/api.html#api-validateschema)
- supports [browsers](https://ajv.js.org/guide/environments.html#browsers) and Node.js 10.x - current
- [asynchronous loading](https://ajv.js.org/guide/managing-schemas.html#asynchronous-schema-loading) of referenced schemas during compilation
- "All errors" validation mode with [option allErrors](https://ajv.js.org/options.html#allerrors)
- [error messages with parameters](https://ajv.js.org/api.html#validation-errors) describing error reasons to allow error message generation
- i18n error messages support with [ajv-i18n](https://github.com/ajv-validator/ajv-i18n) package
- [removing-additional-properties](https://ajv.js.org/guide/modifying-data.html#removing-additional-properties)
- [assigning defaults](https://ajv.js.org/guide/modifying-data.html#assigning-defaults) to missing properties and items
- [coercing data](https://ajv.js.org/guide/modifying-data.html#coercing-data-types) to the types specified in `type` keywords
- [user-defined keywords](https://ajv.js.org/guide/user-keywords.html)
- additional extension keywords with [ajv-keywords](https://github.com/ajv-validator/ajv-keywords) package
- [\$data reference](https://ajv.js.org/guide/combining-schemas.html#data-reference) to use values from the validated data as values for the schema keywords
- [asynchronous validation](https://ajv.js.org/guide/async-validation.html) of user-defined formats and keywords

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
