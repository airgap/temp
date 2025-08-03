#!/bin/bash

# Simple reindex script that sources environment and runs the sync

# Source environment variables from zshrc
source ~/.zshrc

# Run the sync script with proper environment
PG_CONNECTION_STRING="$PG_CONNECTION_STRING" \
ELASTIC_CONNECTION_STRING="$ELASTIC_CONNECTION_STRING" \
bun run scripts/sync-scores-to-elasticsearch.ts sync