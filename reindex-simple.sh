#!/bin/bash

# Simple reindex script with explicit environment variables

export PG_CONNECTION_STRING='YOUR_PG_CONNECTION_STRING'
export ELASTIC_CONNECTION_STRING="YOUR_ELASTIC_CONNECTION_STRING"

echo "🚀 Starting reindex with explicit environment variables..."
echo "📡 PG: ${PG_CONNECTION_STRING:0:50}..."
echo "📡 ES: ${ELASTIC_CONNECTION_STRING:0:50}..."

bun run scripts/sync-scores-to-elasticsearch.ts sync