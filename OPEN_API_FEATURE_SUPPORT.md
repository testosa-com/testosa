# OpenAPI Feature Support

## Table of Contents
### OpenAPI
- [OpenAPI Object](#openapi-objecthttpsswaggeriospecificationopenapi-object)

### Info
- [Info Object](#info-objecthttpsswaggeriospecificationinfo-object)
- [Contact Object](#contact-objecthttpsswaggeriospecificationcontact-object)
- [License Object](#license-objecthttpsswaggeriospecificationlicense-object)

### Servers
- [Server Object](#server-objecthttpsswaggeriospecificationserver-object--server-variable-objecthttpsswaggeriospecificationserver-variable-object)
- [Server Variable Object](#server-objecthttpsswaggeriospecificationserver-object--server-variable-objecthttpsswaggeriospecificationserver-variable-object)

### Paths
- [Paths Object](#path-item-objecthttpsswaggeriospecificationpath-item-object)
  - [Path Item Object](#path-item-objecthttpsswaggeriospecificationpath-item-object)
    - [Operation Object](#operation-objecthttpsswaggeriospecificationoperation-object)
    - [Callback Object](#callback-objecthttpsswaggeriospecificationcallback-object)
  - [Parameter Object](#parameter-objecthttpsswaggeriospecificationparameter-object)
  - [Request Body Object](#request-body-objecthttpsswaggeriospecificationrequest-body-object)
    - [Media Type Object](#media-type-objecthttpsswaggeriospecificationmedia-type-object)
    - [Encoding Object](#encoding-objecthttpsswaggeriospecificationencoding-object)
  - [Responses Object](#responses-objecthttpsswaggeriospecificationresponses-object)
    - [Response Object](#response-objecthttpsswaggeriospecificationresponse-object)
  - [Tag Object](#tag-objecthttpsswaggeriospecificationtag-object)

### Security
- [Security Scheme Object](#security-scheme-objecthttpsswaggeriospecificationsecurity-scheme-object)
- [OAuth Flows Object](#oauth-flows-objecthttpsswaggeriospecificationoauth-flows-object)
- [OAuth Flow Object](#oauth-flow-objecthttpsswaggeriospecificationoauth-flow-object)
- [Security Requirement Object](#security-requirement-objecthttpsswaggeriospecificationsecurity-requirement-object)

### External Docs
- [External Documentation Object](#external-documentation-objecthttpsswaggeriospecificationexternal-documentation-object)

### Other
- [Components Object](#components-objecthttpsswaggeriospecificationcomponents-object)
- [Example Object](#example-objecthttpsswaggeriospecificationexample-object)
- [Link Object](#link-objecthttpsswaggeriospecificationlink-object)
- [Header Object](#header-objecthttpsswaggeriospecificationheader-object)
- [Reference Object](#reference-objecthttpsswaggeriospecificationreference-object)
- [Schema Object](#schema-objecthttpsswaggeriospecificationschema-object)
- [Discriminator Object](#discriminator-objecthttpsswaggeriospecificationdiscriminator-object)
- [XML Object](#xml-objecthttpsswaggeriospecificationxml-object)

___________________

## OpenAPI
### [OpenAPI Object](https://swagger.io/specification/#openapi-object)
| Field Name   | Support | Comment                                               |
|--------------|---------|-------------------------------------------------------|
| openapi      | ✓       |                                                       |
| info         | ✓       |                                                       |
| servers      | ~       | Server URL for testing is derived from Testosa config |
| paths        | ~       |                                                       |
| components   | ✓       |                                                       |
| security     | ✕       |                                                       |
| tags         | ✓       |                                                       |
| externalDocs | ✕       |                                                       |

## Info
### [Info Object](https://swagger.io/specification/#info-object)
| Field Name     | Support |
|----------------|---------|
| title          | ✓       |
| description    | ✓       |
| termsOfService | ✓       |
| contact        | ✓       |
| license        | ✓       |
| version        | ✓       |

### [Contact Object](https://swagger.io/specification/#contact-object)
| Field Name | Support |
|------------|---------|
| name       | ✓       |
| url        | ✓       |
| email      | ✓       |

### [License Object](https://swagger.io/specification/#license-object)
| Field Name | Support |
|------------|---------|
| name       | ✓       |
| url        | ✓       |

## Servers
### [Server Object](https://swagger.io/specification/#server-object) + [Server Variable Object](https://swagger.io/specification/#server-variable-object)
Note:
- the server URL for testing is derived from the Testosa config and not from the `server` object in the OpenAPI specification
- your `{}.server` and `{}.server.serverVariable` objects, if present, will still be validated to meet the OpenAPI standard

## Paths
### [Paths Object](https://swagger.io/specification/#paths-object)
| Field Name | Support |
|------------|---------|
| /{path}    | ~       |

### [Path Item Object](https://swagger.io/specification/#path-item-object)
| Field Name  | Support |
|-------------|---------|
| $ref        | ✓       |
| summary     | ✓       |
| description | ✓       |
| get         | ✓       |
| put         | ✓       |
| post        | ✓       |
| delete      | ✓       |
| options     | ✓       |
| head        | ✓       |
| patch       | ✓       |
| trace       | ✓       |
| servers     | ✕       |
| parameters  | ✓       |

### [Operation Object](https://swagger.io/specification/#operation-object)
| Field Name   | Support |
|--------------|---------|
| tags         | ✓       |
| summary      | ✓       |
| description  | ✓       |
| externalDocs | ✓       |
| operationId  | ✓       |
| parameters   | ✓       |
| requestBody  | ✓       |
| responses    | ✓       |
| callbacks    | ✕       |
| deprecated   | ✓       |
| security     | ✕       |
| servers      | ✕       |

### [Callback Object](https://swagger.io/specification/#callback-object)
| Field Name   | Support |
|--------------|---------|
| {expression} | ✕       |

### [Parameter Object](https://swagger.io/specification/#parameter-object)
| Field Name      | Support |
|-----------------|---------|
| name            | ✓       |
| in              | ✓       |
| description     | ✓       |
| required        | ✓       |
| deprecated      | ✓       |
| allowEmptyValue | ✓       |

### [Request Body Object](https://swagger.io/specification/#request-body-object)
| Field Name  | Support | Comment                                                                                                                      |
|-------------|---------|------------------------------------------------------------------------------------------------------------------------------|
| description | ✓       |                                                                                                                              |
| content     | ~       | Supported request content types:<br>- `application/json`<br>- `application/xml`<br>- `multipart/form-data`<br>- `text/plain` |
| required    | ✓       |                                                                                                                              |

### [Media Type Object](https://swagger.io/specification/#media-type-object)
| Field Name | Support |
|------------|---------|
| schema     | ✓       |
| example    | ✓       |
| examples   | ✓       |
| encoding   | ✕       |

### [Encoding Object](https://swagger.io/specification/#encoding-object)
| Field Name    | Type |
|---------------|------|
| contentType   | ✕    |
| headers       | ✕    |
| style         | ✕    |
| explode       | ✕    |
| allowReserved | ✕    |

### [Responses Object](https://swagger.io/specification/#responses-object)
| Field Name         | Type | Comment                                                                                                                                             |
|--------------------|------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| default            | ✕    |                                                                                                                                                     |
| {http status code} | ✓    | Any HTTP status code can be used as the property name, but only one property per code, to describe the expected response for that HTTP status code. |

### [Response Object](https://swagger.io/specification/#response-object)
| Field Name  | Support |
|-------------|---------|
| description | ✓       |
| headers     | ✓       |
| content     | ✓       |
| links       | ✕       |

### [Tag Object](https://swagger.io/specification/#tag-object)
| Field Name   | Support |
|--------------|---------|
| name         | ✓       |
| description  | ✓       |
| externalDocs | ✕       |

## Security
### [Security Scheme Object](https://swagger.io/specification/#security-scheme-object)
Note: Security scheme validation is not yet supported

### [OAuth Flows Object](https://swagger.io/specification/#oauth-flows-object)
Note: OAuth flows validation is not yet supported

### [OAuth Flow Object](https://swagger.io/specification/#oauth-flow-object)
Note: OAuth flow validation is not yet supported

### [Security Requirement Object](https://swagger.io/specification/#security-requirement-object)
Note: Security requirement object validation is not yet supported

## External Docs
### [External Documentation Object](https://swagger.io/specification/#external-documentation-object)
Note: External documentation object validation is not yet supported

## Other
### [Components Object](https://swagger.io/specification/#components-object)
| Field Name      | Support |
|-----------------|---------|
| schemas         | ✓       |
| responses       | ✓       |
| parameters      | ✓       |
| examples        | ✓       |
| requestBodies   | ✓       |
| headers         | ✕       |
| securitySchemes | ✓       |
| links           | ✕       |
| callbacks       | ✕       |

### [Example Object](https://swagger.io/specification/#example-object)
| Field Name    | Support |
|---------------|---------|
| summary       | ✓       |
| description   | ✓       |
| value         | ✓       |
| externalValue | ✕       |

### [Link Object](https://swagger.io/specification/#link-object)
| Field Name   | Support |
|--------------|---------|
| operationRef | ✕       |
| operationId  | ✕       |
| parameters   | ✕       |
| requestBody  | ✕       |
| description  | ✕       |
| server       | ✕       |

### [Header Object](https://swagger.io/specification/#header-object)
Note:
- `header` object is currently only supported through the [Parameter Object](https://swagger.io/specification/#parameter-object)

### [Reference Object](https://swagger.io/specification/#reference-object)
| Field Name | Support |
|------------|---------|
| $ref       | ✓       |

### [Schema Object](https://swagger.io/specification/#schema-object)
| Field Name  | Support |
|-------------|---------|
| description | ✓       |
| type        | ✓       |
| x-examples  | ✓       |
| properties  | ✓       |
| required    | ✓       |

### Schema Properties Object
The following properties are taken directly from the JSON Schema definition and follow the same specifications:

Note:
- Partially supported properties (`~`) here are supported for validating specified request/response examples as well as actual responses. These properties do not yet have support for generated test values through Testosa.
- All other values have full support for test generated values and request/response validation.

| Field Name       | Support |
|------------------|---------|
| title            | ✓       |
| multipleOf       | ~       |
| maximum          | ✓       |
| exclusiveMaximum | ✓       |
| minimum          | ✓       |
| exclusiveMinimum | ✓       |
| maxLength        | ~       |
| minLength        | ~       |
| pattern          | ~       |
| maxItems         | ~       |
| minItems         | ~       |
| uniqueItems      | ~       |
| maxProperties    | ~       |
| minProperties    | ~       |
| required         | ✓       |
| enum             | ✓       |

### [Discriminator Object](https://swagger.io/specification/#discriminator-object)
| Field Name   | Support |
|--------------|---------|
| propertyName | ✕       |
| mapping      | ✕       |

### [XML Object](https://swagger.io/specification/#xml-object)
| Field Name | Type |
|------------|------|
| name       | ✕    |
| namespace  | ✕    |
| prefix     | ✕    |
| attribute  | ✕    |
| wrapped    | ✕    |
