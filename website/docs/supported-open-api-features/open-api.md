---
sidebar_position: 1
---

# OpenAPI Object
Reference: [https://swagger.io/specification/#openapi-object](https://swagger.io/specification/#openapi-object)

This is the root document object of the OpenAPI document.

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
