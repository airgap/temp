#!/bin/bash

# Simple reindex script with explicit environment variables

# Connection strings should be set as environment variables
# export PG_CONNECTION_STRING='your-postgres-connection-string'
# export ELASTIC_CONNECTION_STRING='your-elasticsearch-connection-string'

# Check if environment variables are set
if [ -z "$PG_CONNECTION_STRING" ]; then
    echo "❌ Error: PG_CONNECTION_STRING environment variable is not set"
    exit 1
fi

if [ -z "$ELASTIC_CONNECTION_STRING" ]; then
    echo "❌ Error: ELASTIC_CONNECTION_STRING environment variable is not set"
    exit 1
fi

echo "🚀 Starting reindex with explicit environment variables..."
echo "📡 PG: ${PG_CONNECTION_STRING:0:50}..."
echo "📡 ES: ${ELASTIC_CONNECTION_STRING:0:50}..."

bun run scripts/sync-scores-to-elasticsearch.ts sync