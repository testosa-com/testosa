---
sidebar_position: 6
---

# Components Object
Reference: [https://swagger.io/specification/#components-object](https://swagger.io/specification/#components-object)

Holds a set of reusable objects for different aspects of the OAS. All objects defined within the components object will have no effect on the API unless they are explicitly referenced from properties outside the components object.

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
