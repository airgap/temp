#!/bin/bash

# Script to add grafanize tasks to all route project.json files

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROUTES_DIR="$SCRIPT_DIR/../apps/routes"

echo "🔧 Adding grafanize tasks to all route projects..."

UPDATED_COUNT=0
FAILED_COUNT=0

# Find all route project.json files (excluding _shared)
find "$ROUTES_DIR" -name "project.json" -not -path "*/_shared/*" | while read -r project_file; do
    # Extract route name from path
    route_name=$(basename "$(dirname "$project_file")")
    
    echo "📦 Processing: $route_name"
    
    # Check if grafanize task already exists
    if grep -q '"grafanize"' "$project_file"; then
        echo "  ✅ Already has grafanize task, skipping"
        continue
    fi
    
    # Create a temporary file to build the new JSON
    temp_file=$(mktemp)
    
    # Use jq to add the grafanize tasks
    if jq --arg route_name "$route_name" '.targets.grafanize = {
        "executor": "nx:run-commands",
        "options": {
            "command": ("./scripts/graph-route " + $route_name),
            "cwd": "{workspaceRoot}"
        }
    } | .targets["grafanize:wait"] = {
        "executor": "nx:run-commands", 
        "options": {
            "command": ("./scripts/graph-route " + $route_name + " --wait-for-metrics"),
            "cwd": "{workspaceRoot}"
        }
    }' "$project_file" > "$temp_file"; then
        # Replace the original file
        mv "$temp_file" "$project_file"
        echo "  ✅ Added grafanize tasks"
        ((UPDATED_COUNT++))
    else
        echo "  ❌ Failed to update"
        rm -f "$temp_file"
        ((FAILED_COUNT++))
    fi
done

echo ""
echo "🎉 Grafanize task addition complete!"
echo "✅ Updated: $UPDATED_COUNT projects"
echo "❌ Failed: $FAILED_COUNT projects"
echo ""
echo "You can now run:"
echo "  nx grafanize @lyku/route-name        # Create dashboard immediately"
echo "  nx grafanize:wait @lyku/route-name   # Wait for metrics first"