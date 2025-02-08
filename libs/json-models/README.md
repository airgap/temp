 ##### Note: this README is mostly LLM generated from the source code as this project is not even closed to finished yet and I'm not manually maintaining a README until everything's somewhat stable.

# @lyku/json-models

A TypeScript library for converting TSON-PG models to TSON models and TypeScript types.
This ensures that any changes to the database models (TSON-PG) are always reflected in the API models (TSON) and TypeScript types (TS).
TSON models are similar to JSON schemas but have support for both bigint and date types.
TSON-PG models describe Postgres data types and tables. 

## Features

- Converts PostgreSQL records and columns to TSON schemas
- Generates TypeScript type definitions from TSON schemas
- Supports all standard PostgreSQL data types
- Integrates with Kysely for type-safe database queries
- Built with SWC for fast compilation

## Installation

```bash
# Using npm
npm install @lyku/tson-models

# Using yarn
yarn add @lyku/tson-models

# Using pnpm
pnpm add @lyku/tson-models

# Using bun
bun add @lyku/tson-models
```

## Usage

The library exports TSON schemas and corresponding TypeScript types for your database models.

```typescript
import { yourModel, type YourModel } from '@lyku/tson-models';

// Use the TSON schema
console.log(yourModel);

// Use the TypeScript type
const data: YourModel = {
  // Your typed data here
};
```

## Development

This library is built using [Nx](https://nx.dev) and uses Bun as the runtime.

### Building

To build the library:

```bash
nx build tson-models
```

The build process:
1. Converts models to TSON schemas
2. Generates TypeScript types
3. Creates both `.js` and `.d.ts` files
4. Formats output using Prettier

### Running Tests

To run the test suite:

```bash
nx test tson-models
```

Tests are executed using [Vitest](https://vitest.dev/).

## Configuration

The library uses SWC for compilation with the following key configurations:
- Target: ES2017
- Module type: CommonJS
- TypeScript decorators enabled
- Source maps enabled

## License

Private - All rights reserved

## Dependencies

- `@swc/helpers`: ~0.5.11
- `bson-models`: workspace dependency
