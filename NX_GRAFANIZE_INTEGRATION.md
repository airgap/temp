# NX Grafanize Integration

## Overview

### Basic Dashboard Creation

```bash
nx grafanize @lyku/route-name
```

### Dashboard Creation with Metrics Check

```bash
nx grafanize:wait @lyku/route-name
```

### Bulk Dashboard Creation

```bash
nx run-many --target=grafanize --projects="@lyku/*"
```

## Examples

```bash
# Create dashboard for specific route
nx grafanize @lyku/list-hot-posts

# Create dashboard after waiting for metrics
nx grafanize:wait @lyku/get-posts

# Create dashboards for all routes
nx run-many --target=grafanize --projects="@lyku/*"

# Create dashboards for specific routes
nx grafanize @lyku/list-hot-posts @lyku/get-posts @lyku/delete-post
```

## Integration Points

### 1. Added to Shared Config

```json
// apps/routes/_shared/project.json
{
	"targets": {
		"grafanize": {
			"executor": "nx:run-commands",
			"options": {
				"command": "./scripts/graph-route ${projectName}",
				"cwd": "{workspaceRoot}"
			}
		},
		"grafanize:wait": {
			"executor": "nx:run-commands",
			"options": {
				"command": "./scripts/graph-route ${projectName} --wait-for-metrics",
				"cwd": "{workspaceRoot}"
			}
		}
	}
}
```

### 2. Added to Individual Projects

Each route project now has grafanize tasks in their `project.json`:

```json
// Example: apps/routes/list-hot-posts/project.json
{
  "targets": {
    "build": { ... },
    "dockerize": { ... },
    "kubernetize": { ... },
    "grafanize": {
      "executor": "nx:run-commands",
      "options": {
        "command": "./scripts/graph-route list-hot-posts",
        "cwd": "{workspaceRoot}"
      }
    },
    "grafanize:wait": {
      "executor": "nx:run-commands",
      "options": {
        "command": "./scripts/graph-route list-hot-posts --wait-for-metrics",
        "cwd": "{workspaceRoot}"
      }
    }
  }
}
```

## Workflow Integration

### Standard Development Workflow

```bash
# 1. Build the route
nx build @lyku/my-route

# 2. Deploy the route
nx kubernetize @lyku/my-route

# 3. Create monitoring dashboard
nx grafanize @lyku/my-route
```

### New Route Workflow

```bash
# 1. Build and deploy new route
nx build @lyku/new-route
nx kubernetize @lyku/new-route

# 2. Create dashboard with metrics check
nx grafanize:wait @lyku/new-route
```

### Bulk Operations

```bash
# Deploy all routes
nx run-many --target=kubernetize --projects="@lyku/*"

# Create dashboards for all routes
nx run-many --target=grafanize --projects="@lyku/*"
```

## Files Modified

### Created

- ✅ `scripts/add-grafanize-to-routes.sh` - Script to add tasks to all projects

### Modified

- ✅ `apps/routes/_shared/project.json` - Added shared grafanize tasks
- ✅ `apps/routes/*/project.json` - Added grafanize tasks to each route (via script)

## Benefits

✅ **Consistent Interface**: Use standard NX commands for dashboard creation  
✅ **IDE Integration**: NX tasks appear in VS Code and other IDE task runners  
✅ **Bulk Operations**: Easy to create dashboards for multiple routes  
✅ **Cache Support**: NX caching benefits for dashboard operations  
✅ **Dependency Management**: Can add dependencies between tasks if needed  
✅ **Parallel Execution**: Use NX's parallel task execution capabilities

## Advanced Usage

### With Dependencies

You can add dependencies to automatically grafanize after deployment:

```json
{
	"grafanize": {
		"executor": "nx:run-commands",
		"dependsOn": ["kubernetize"],
		"options": {
			"command": "./scripts/graph-route ${projectName}",
			"cwd": "{workspaceRoot}"
		}
	}
}
```

### With Affected Projects

```bash
# Only grafanize affected routes
nx affected --target=grafanize
```

### With Caching

```json
{
	"grafanize": {
		"executor": "nx:run-commands",
		"cache": true,
		"options": {
			"command": "./scripts/graph-route ${projectName}",
			"cwd": "{workspaceRoot}"
		}
	}
}
```

## Testing Results

✅ **Basic Command**: `nx grafanize @lyku/list-hot-posts` - Works perfectly  
✅ **Wait Variant**: `nx grafanize:wait @lyku/route-name` - Functional  
✅ **Bulk Operations**: `nx run-many --target=grafanize` - Ready to use  
✅ **NX Integration**: Appears in project task lists and IDE integrations

## Next Steps

1. **Use in daily workflow**: Replace direct script calls with NX commands
2. **Add to CI/CD**: Integrate grafanize tasks into deployment pipelines
3. **Team training**: Update team documentation with new NX commands
4. **IDE setup**: Configure IDE task runners to show grafanize options

The NX integration is complete and ready for production use! 🎉
