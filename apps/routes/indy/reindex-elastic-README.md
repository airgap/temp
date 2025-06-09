# Elasticsearch Reindex Script

This script reindexes posts from PostgreSQL into Elasticsearch.

## Usage

### Basic usage (reindex all posts):

```bash
bun run scripts/reindex-elastic.ts
```

### Reindex posts within a date range:

```bash
START_DATE="2023-01-01" END_DATE="2023-12-31" bun run scripts/reindex-elastic.ts
```

### Reindex posts from a specific date onwards:

```bash
START_DATE="2024-01-01" bun run scripts/reindex-elastic.ts
```

## Features

- **Batch Processing**: Processes posts in batches of 1000 for efficient memory usage
- **Date Range Filtering**: Can reindex posts within a specific date range
- **Error Resilience**: Continues processing even if individual posts fail to index
- **Index Creation**: Automatically creates monthly indices if they don't exist
- **Progress Tracking**: Shows progress with processed count and last ID
- **Skips Deleted Posts**: Only indexes posts where `deleted` is null

## How it works

1. Queries posts from PostgreSQL in batches ordered by ID
2. Creates monthly indices in format `posts-YYYY-MM` based on publish date
3. Converts BigInt fields to strings for Elasticsearch compatibility
4. Indexes posts in parallel within each batch
5. Refreshes all indices at the end for better search performance

## Environment Requirements

The script uses the following environment variables (inherited from the application):

- `PG_CONNECTION_STRING`: PostgreSQL connection string
- `ELASTIC_API_ENDPOINT`: Elasticsearch endpoint URL
- `ELASTIC_API_KEY`: Elasticsearch API key

## Index Mapping

The script creates indices with the following mapping:

- `id`: keyword
- `body`: text
- `bodyType`: keyword
- `author`, `group`, `hashtags`: keyword
- `likes`, `loves`, `replies`, `echoes`: long
- `publish`, `created`, `updated`, `deleted`, `banned`: date
- `title`: text
- `thread`, `replyTo`, `echoing`, `attachments`: keyword
