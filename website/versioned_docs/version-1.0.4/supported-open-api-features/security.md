---
sidebar_position: 5
---

# Security Objects
## [Security Scheme Object](https://swagger.io/specification/#security-scheme-object)
Defines a security scheme that can be used by the operations. Supported schemes are HTTP authentication, an API key (either as a header, a cookie parameter or as a query parameter), OAuth2's common flows (implicit, password, client credentials and authorization code) as defined in RFC6749, and OpenID Connect Discovery.

:::caution Note
Security scheme validation is not yet supported
:::

## [OAuth Flows Object](https://swagger.io/specification/#oauth-flows-object)
Allows configuration of the supported OAuth Flows.

:::caution Note
OAuth flows validation is not yet supported
:::

## [OAuth Flow Object](https://swagger.io/specification/#oauth-flow-object)
Configuration details for a supported OAuth Flow

:::caution Note
OAuth flow validation is not yet supported
:::

## [Security Requirement Object](https://swagger.io/specification/#security-requirement-object)
Lists the required security schemes to execute this operation. The name used for each property MUST correspond to a security scheme declared in the Security Schemes under the Components Object.

Security Requirement Objects that contain multiple schemes require that all schemes MUST be satisfied for a request to be authorized. This enables support for scenarios where multiple query parameters or HTTP headers are required to convey security information.

When a list of Security Requirement Objects is defined on the OpenAPI Object or Operation Object, only one of the Security Requirement Objects in the list needs to be satisfied to authorize the request.

:::caution Note
Security requirement object validation is not yet supported
:::
