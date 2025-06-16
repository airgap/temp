#!/bin/bash

# Simple script to add grafanize tasks to all route projects

set -e

# Get list of all route directories
ROUTES_DIR="/raid/temp/apps/routes"
route_dirs=$(find "$ROUTES_DIR" -mindepth 1 -maxdepth 1 -type d -not -name "_shared")

for route_dir in $route_dirs; do
    route_name=$(basename "$route_dir")
    project_file="$route_dir/project.json"
    
    if [ ! -f "$project_file" ]; then
        continue
    fi
    
    # Check if grafanize task already exists
    if grep -q '"grafanize"' "$project_file"; then
        echo "✅ $route_name (already has grafanize)"
        continue
    fi
    
    echo "🔧 Adding grafanize to: $route_name"
    
    # Use jq to add the grafanize tasks
    temp_file=$(mktemp)
    jq --arg route_name "$route_name" '.targets.grafanize = {
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
    }' "$project_file" > "$temp_file" && mv "$temp_file" "$project_file"
    
    echo "  ✅ Added grafanize tasks to $route_name"
done

echo ""
echo "🎉 Grafanize task addition complete!"