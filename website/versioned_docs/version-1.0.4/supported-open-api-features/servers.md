---
sidebar_position: 3
---

# Server Objects

## [Security Scheme Object](https://swagger.io/specification/#security-scheme-object)
An object representing a Server.

## [Server Variable Object](https://swagger.io/specification/#server-variable-object)
An object representing a Server Variable for server URL template substitution.

:::caution Note
 - The server URL for testing is derived from the Testosa config and not from the `server` object in the OpenAPI specification
 - your `{}.server` and `{}.server.serverVariable` objects, if present, will still be validated to meet the OpenAPI standard
:::
