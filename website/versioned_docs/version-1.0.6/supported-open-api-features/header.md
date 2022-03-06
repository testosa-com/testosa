---
sidebar_position: 9
---

# Header Object
Reference: [https://swagger.io/specification/#header-object](https://swagger.io/specification/#header-object)

The Header Object follows the structure of the Parameter Object with the following changes:

name MUST NOT be specified, it is given in the corresponding headers map.
in MUST NOT be specified, it is implicitly in header.
All traits that are affected by the location MUST be applicable to a location of header (for example, style).

:::caution Note
`header` object is currently only supported through the [Parameter Object](https://swagger.io/specification/#parameter-object)
:::
