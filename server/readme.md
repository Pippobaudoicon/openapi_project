# OpenAPI Vicsam Server

This is the server component of the OpenAPI Vicsam project. It is built using Node.js and Express.js to provide API endpoints and serve the client application.

## Getting Started

### Prerequisites

- Node.js (v14 or higher) (currently using v23)
- npm (v6 or higher) (currently using v10)

### Installation

1. Clone the repository:

```sh
git clone https://bitbucket.org/interjob/openapi_vicsam.git
cd openapi_vicsam/server
```

2. Install dependencies in both server and client:

```sh
npm install
```

3. Do the same with client

```sh
cd openapi_vicsam/server
```

```sh
npm install
```

### Running the Server

#### Development Mode

To run the server in development mode with hot-reloading be sure to be on server folder:

```sh
cd openapi_vicsam/server
```

```sh
npm run dev
```

To run the server in production mode:

```sh
npm run build


#### Production Mode

To run the server in production mode:

```sh
npm build
```

### Environment Variables

The server uses environment variables to manage configuration. You can set these variables in the `.env` file located in the root directory of the server. Here are some common environment variables:

- `PORT`: The port number on which the server will run (default is 3000).
- `NODE_ENV`: The environment in which the server is running (`development`, `production`, etc.).

### API Documentation

The API documentation is generated using OpenAPI. You can access the documentation by navigating to `/api-docs` endpoint once the server is running.

### Contributing

We welcome contributions! Please read our [contributing guidelines](CONTRIBUTING.md) for more information.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
