---
sidebar_position: 8
---

# Link Object
Reference: [https://swagger.io/specification/#link-object](https://swagger.io/specification/#link-object)

The Link object represents a possible design-time link for a response. The presence of a link does not guarantee the caller's ability to successfully invoke it, rather it provides a known relationship and traversal mechanism between responses and other operations.

Unlike dynamic links (i.e. links provided in the response payload), the OAS linking mechanism does not require link information in the runtime response.

For computing links, and providing instructions to execute them, a runtime expression is used for accessing values in an operation and using them as parameters while invoking the linked operation.

| Field Name   | Support |
|--------------|---------|
| operationRef | ✕       |
| operationId  | ✕       |
| parameters   | ✕       |
| requestBody  | ✕       |
| description  | ✕       |
| server       | ✕       |
