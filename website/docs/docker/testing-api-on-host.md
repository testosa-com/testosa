---
sidebar_position: 2
---

# Testing API on host
One common scenario you may face is running Testosa within Docker against an API running on the _host_ machine of the Docker container. Docker containers do not, by default, have access to the host machine's `localhost` hostname. So, when setting your Testosa config's API base url, use `host.docker.internal` instead of `localhost` for the hostname.

:::info Important
If you're leveraging hooks, any HTTP requests made to `localhost` within your hooks logic must also point to `host.docker.internal`.
:::

### Example (using CLI arguments)
```shell title='Docker run command'
docker run -it \
  -v /absolute/path/to/openapi/file.json:/app/openapi.json \
  -v /absolute/path/to/testosa/hooks/file.js:/app/testosa.hooks.js \
  testosa/testosa:latest \
  // highlight-next-line
  --apiBaseUrl='http://host.docker.internal:8080' \
  --apiServerStartupTimeout=5000 \
  --excludedMethods='options' 'trace' \
  --excludedStatusCodes=422 500 \
  --hooksFilePath='/app/testosa.hooks.js'
```

### Example (using Testosa config file)
```json title='File: testosa.config.json'
{
  // highlight-next-line
  "apiBaseUrl": "http://host.docker.internal:8080",
  "openApiFilePath": "./open-api.json",
  ...
}
```

```shell title='Docker run command'
docker run -it \
  -v /absolute/path/to/openapi/file.json:/app/openapi.json \
  -v /absolute/path/to/testosa/hooks/file.js:/app/testosa.hooks.js \
  // highlight-next-line
  -v /absolute/path/to/testosa.config.json:/app/testosa.config.json \
  testosa/testosa:latest
```
