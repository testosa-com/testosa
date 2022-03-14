---
sidebar_position: 1
---

# Running Tests
As an alternative to running Testosa using _npm_, you may run Testosa using Docker. This comes in particularly handy if your project is written in a language other than Node.js or if you're running your automated tests in a CI environment. For this, we've created a Docker image with Testosa installed, called `testosa/tesosa`. A new image is created for each new Testosa version released.

You can find official Docker images on [Docker hub](https://hub.docker.com/r/testosa/testosa).

Running tests in Docker is pretty straight forward and only requires a few arguments included in the Docker `run` command. The key arguments serve to:
1. Map your OpenAPI file to a path inside your container (required)
2. Map your hooks file to a path inside your container (required, if using hooks)
3. Load your Testosa config

We've broken down these steps below:

### Docker run breakdown
#### Mounting your OpenAPI file into the container (required)
Testosa's Docker container needs access to your OpenAPI file in order to read and interpret it's content. Using the `--volume, -v` argument, specify the absolute path to your local OpenAPI file and map it to following _exact_ path: `/app/openapi.json`.

```shell title='Example'
docker run -it \
  // highlight-next-line
  -v /absolute/path/to/openapi/file.json:/app/openapi.json \
  -v /absolute/path/to/testosa.config.json:/app/testosa.config.json \
  -v /absolute/path/to/testosa/hooks/file.js:/app/testosa.hooks.js \
  testosa/testosa:latest
```

#### Loading your Testosa config (required)
Your Testosa settings can be loaded into your container in one of two ways:

##### Option 1: Mounting your config file (recommended)
Testosa will use all values found in your Testosa config file if one is mounted in your container at the following _exact_ path: `/app/testosa.config.json`


```shell title='Example'
docker run -it \
  -v /absolute/path/to/openapi/file.json:/app/openapi.json \
  // highlight-next-line
  -v /absolute/path/to/testosa.config.json:/app/testosa.config.json \
  -v /absolute/path/to/testosa/hooks/file.js:/app/testosa.hooks.js \
  testosa/testosa:latest
```

##### Option 2: CLI arguments
Alternately, Testosa settings may be passed into the container using command line arguments at the end of the `docker run` command.

```shell title='Example'
docker run -it \
  -v /absolute/path/to/openapi/file.json:/app/openapi.json \
  -v /absolute/path/to/testosa/hooks/file.js:/app/testosa.hooks.js \
  testosa/testosa:latest \
  // highlight-start
  --apiBaseUrl='https://api.your-server.com' \
  --excludedMethods='options' 'trace' \
  --excludedStatusCodes=422 500 \
  --hooksFilePath='/app/testosa.hooks.js'
  // highlight-end
```

#### Mounting your Testosa hooks file
Similar to your OpenAPI file, if you intend to include a [hooks](/docs/next/introduction/hooks) file for additional control in your Testosa run, you will need to supply that file to your Docker container. To do this, simply map your hooks file to _your_ preferred path inside the container's working directory (`/app`). For example: `/app/testosa.hooks.js`.

```shell
docker run -it \
  -v /absolute/path/to/openapi/file.json:/app/openapi.json \
  -v /absolute/path/to/testosa.config.json:/app/testosa.config.json \
  // highlight-next-line
  -v /absolute/path/to/testosa/hooks/file.js:/app/testosa.hooks.js \
  testosa/testosa:latest
```

:::info Important
The mapping for your hooks file inside the container can be set to any path you prefer. However, you must also update your `hooksFilePath` setting to match that container path.
:::

### Explanation of the "docker run" command line arguments
| Argument                      | Description                                                                                      |
|-------------------------------|--------------------------------------------------------------------------------------------------|
| `-it`                         | Interactive terminal                                                                             |
| `-v /.../openapi/file.json`   | Map your OpenAPI file to the _exact_ path `/app/openapi.json` inside the container               |
| `-v /.../testosa.config.json` | Map your Testosa config file to the _exact_ path `/app/testosa.config.json` inside the container |
| `-v /.../hooks/file.js`       | Map your hooks file to a location within the working directory (`/app`) inside the container     |
| `--apiBaseUrl`                | Base URL of the API server that tests will be run against                                        |
| `--excludedMethods`           | Space-delimited list of HTTP methods to skip during your Testosa test run                        |
| `--excludedStatusCodes`       | Space-delimited list of HTTP status codes to skip during your Testosa test run                   |
| `--hooksFilePath`             | Path to the hooks file mounted **inside the container**                                          |

:::note Note
If you map your _testosa.config.json_ file AND use command line arguments for Testosa settings, your command line arguments will supercede those options, if present, in your config file. 
:::

