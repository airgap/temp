#!/bin/bash

# Script to verify all route projects have grafanize tasks

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROUTES_DIR="$SCRIPT_DIR/../apps/routes"

echo "🔍 Verifying grafanize tasks in all route projects..."
echo ""

TOTAL_COUNT=0
MISSING_COUNT=0
MISSING_PROJECTS=()

# Find all route project.json files (excluding _shared)
find "$ROUTES_DIR" -name "project.json" -not -path "*/_shared/*" | while read -r project_file; do
    # Extract route name from path
    route_name=$(basename "$(dirname "$project_file")")
    ((TOTAL_COUNT++))
    
    # Check if grafanize task exists
    if grep -q '"grafanize"' "$project_file"; then
        echo "✅ $route_name"
    else
        echo "❌ $route_name (missing grafanize task)"
        ((MISSING_COUNT++))
        MISSING_PROJECTS+=("$route_name")
    fi
done

echo ""
echo "📊 Summary:"
echo "Total projects: $TOTAL_COUNT"
echo "Missing grafanize: $MISSING_COUNT"

if [ $MISSING_COUNT -gt 0 ]; then
    echo ""
    echo "❌ Projects missing grafanize tasks:"
    printf '  %s\n' "${MISSING_PROJECTS[@]}"
    echo ""
    echo "Run the add-grafanize-to-routes.sh script to fix:"
    echo "  ./scripts/add-grafanize-to-routes.sh"
else
    echo "🎉 All projects have grafanize tasks!"
fi