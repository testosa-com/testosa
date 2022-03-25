---
sidebar_position: 12
---

# Schema Properties Object
The following properties are taken directly from the JSON Schema definition and follow the same specifications:

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

:::caution Note
- Partially supported properties (`~`) here are supported for validating specified request/response examples as well as actual responses. These properties do not yet have support for generated test values through Testosa.
- All other values have full support for test generated values and request/response validation.
:::
