---
sidebar_position: 4
---

# Path Objects
Reference: [https://swagger.io/specification/#paths-object](https://swagger.io/specification/#paths-object)
Holds the relative paths to the individual endpoints and their operations. The path is appended to the URL from the Server Object in order to construct the full URL. The Paths MAY be empty, due to ACL constraints.

| Field Name | Support |
|------------|---------|
| /{path}    | ~       |

## [Path Item Object](https://swagger.io/specification/#path-item-object)
Describes the operations available on a single path. A Path Item MAY be empty, due to ACL constraints. The path itself is still exposed to the documentation viewer but they will not know which operations and parameters are available.

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

## [Operation Object](https://swagger.io/specification/#operation-object)
Describes a single API operation on a path.

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

## [Callback Object](https://swagger.io/specification/#callback-object)
A map of possible out-of band callbacks related to the parent operation. Each value in the map is a Path Item Object that describes a set of requests that may be initiated by the API provider and the expected responses. The key value used to identify the path item object is an expression, evaluated at runtime, that identifies a URL to use for the callback operation.

| Field Name   | Support |
|--------------|---------|
| {expression} | ✕       |

## [Parameter Object](https://swagger.io/specification/#parameter-object)
Describes a single operation parameter.

A unique parameter is defined by a combination of a name and location.

Parameter Locations
There are four possible parameter locations specified by the in field:
- path - Used together with Path Templating, where the parameter value is actually part of the operation's URL. This does not include the host or base path of the API. For example, in /items/{itemId}, the path parameter is itemId.
- query - Parameters that are appended to the URL. For example, in /items?id=###, the query parameter is id.
- header - Custom headers that are expected as part of the request. Note that RFC7230 states header names are case insensitive.
- cookie - Used to pass a specific cookie value to the API.

| Field Name      | Support |
|-----------------|---------|
| name            | ✓       |
| in              | ✓       |
| description     | ✓       |
| required        | ✓       |
| deprecated      | ✓       |
| allowEmptyValue | ✓       |

## [Request Body Object](https://swagger.io/specification/#request-body-object)
Describes a single request body.

| Field Name  | Support | Comment                                                                                                                      |
|-------------|---------|------------------------------------------------------------------------------------------------------------------------------|
| description | ✓       |                                                                                                                              |
| content     | ~       | Supported request content types:<br />- `application/json`<br />- `application/xml`<br />- `multipart/form-data`<br />- `text/plain` |
| required    | ✓       |                                                                                                                              |

## [Media Type Object](https://swagger.io/specification/#media-type-object)
Each Media Type Object provides schema and examples for the media type identified by its key.

| Field Name | Support |
|------------|---------|
| schema     | ✓       |
| example    | ✓       |
| examples   | ✓       |
| encoding   | ✕       |

## [Encoding Object](https://swagger.io/specification/#encoding-object)
A single encoding definition applied to a single schema property.

| Field Name    | Type |
|---------------|------|
| contentType   | ✕    |
| headers       | ✕    |
| style         | ✕    |
| explode       | ✕    |
| allowReserved | ✕    |

## [Responses Object](https://swagger.io/specification/#responses-object)
A container for the expected responses of an operation. The container maps a HTTP response code to the expected response.

The documentation is not necessarily expected to cover all possible HTTP response codes because they may not be known in advance. However, documentation is expected to cover a successful operation response and any known errors.

The default MAY be used as a default response object for all HTTP codes that are not covered individually by the specification.

The Responses Object MUST contain at least one response code, and it SHOULD be the response for a successful operation call.

| Field Name         | Type | Comment                                                                                                                                             |
|--------------------|------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| default            | ✕    |                                                                                                                                                     |
| {http status code} | ✓    | Any HTTP status code can be used as the property name, but only one property per code, to describe the expected response for that HTTP status code. |

## [Response Object](https://swagger.io/specification/#response-object)
Describes a single response from an API Operation, including design-time, static links to operations based on the response.

| Field Name  | Support |
|-------------|---------|
| description | ✓       |
| headers     | ✓       |
| content     | ✓       |
| links       | ✕       |

## [Tag Object](https://swagger.io/specification/#tag-object)
Adds metadata to a single tag that is used by the Operation Object. It is not mandatory to have a Tag Object per tag defined in the Operation Object instances.

| Field Name   | Support |
|--------------|---------|
| name         | ✓       |
| description  | ✓       |
| externalDocs | ✕       |
