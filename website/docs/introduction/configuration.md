---
sidebar_position: 2
---

# Configuration
After running `testosa --init`, you'll have a config file, _testosa.config.json_ file in your working directory. In your config file, you will see some settings declared like this:

```json
{
   "apiBaseUrl": "<YOUR_API_BASE_URL>",
   "openApiFilePath": "<PATH_TO_YOUR_OPEN_API_FILE>"
}
```

Below is a full list of settings to configure the behaviour of Testosa for your test runs.

## Options
### apiBaseUrl [string<uri\>] (required)
Base URL for the API server that you are validating your OpenAPI specification against.
- Format: URI

### excludedMethods [array<string\>]
An array of HTTP methods that should be skipped when generating tests. Testosa will not attempt to test any method + path combination that includes a method specified in this array.
- Allowed values: `DELETE`, `GET`, `OPTIONS`, `PATCH`, `POST`, `PUT`, `TRACE`

### excludedStatusCodes [array<integer\>]
An array of HTTP status codes that should be skipped when generating tests. Testosa will not attempt to test any status code + path combination that includes a status code specified in this array. This proves useful when it is difficult to reliably trigger certain status codes (eg. `5xx`);
- Allowed values: >= `200` and <= `599`

### hooksFilePath [string]
If you're leveraging test hooks, include this option to specify the relative path to the JavaScript where your hooks are defined. See the [Hooks](/docs/introduction/hooks) section for creating and using hooks.

### openApiFilePath [string] (required)
The relative file path to your OpenAPI specification file.
