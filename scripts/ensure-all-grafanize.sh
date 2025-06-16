#!/bin/bash

# Comprehensive script to ensure ALL route projects have grafanize tasks

set -e

echo "🔧 Ensuring all route projects have grafanize tasks..."
echo ""

# Process each route project individually
for route_dir in /raid/temp/apps/routes/*/; do
    # Skip _shared directory
    if [[ "$route_dir" == */apps/routes/_shared/* ]]; then
        continue
    fi
    
    route_name=$(basename "$route_dir")
    project_file="$route_dir/project.json"
    
    if [ ! -f "$project_file" ]; then
        echo "⚠️  $route_name (no project.json)"
        continue
    fi
    
    # Check if grafanize task already exists
    if grep -q '"grafanize"' "$project_file"; then
        echo "✅ $route_name"
        continue
    fi
    
    echo "🔧 Adding grafanize to: $route_name"
    
    # Create backup
    cp "$project_file" "$project_file.backup"
    
    # Use jq to add the grafanize tasks
    temp_file=$(mktemp)
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
        mv "$temp_file" "$project_file"
        echo "  ✅ Added grafanize tasks to $route_name"
        rm -f "$project_file.backup"
    else
        echo "  ❌ Failed to update $route_name"
        mv "$project_file.backup" "$project_file"
        rm -f "$temp_file"
    fi
done

echo ""
echo "🎉 All route projects should now have grafanize tasks!"
echo ""
echo "Test with: doppler run -- nx grafanize @lyku/route-name"