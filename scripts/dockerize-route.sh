#!/bin/bash

# Check if route name is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <route-name>"
    echo "Example: $0 get-current-user"
    exit 1
fi

ROUTE_NAME=$1
PUSH_FLAG=""
REGISTRY="nicolemuzzin"  # Changed to your Docker Hub username
REPO="lyku"             # Added repository name

# Parse arguments
for arg in "$@"; do
    if [ "$arg" == "--push" ]; then
        PUSH_FLAG="--push"
    elif [ "$arg" != "$1" ]; then  # If not the route name and not --push, treat as registry
        REGISTRY=$arg
    fi
done

# Check if route exists
if [ ! -d "apps/routes/$ROUTE_NAME" ]; then
    echo "Route '$ROUTE_NAME' not found in apps/routes/"
    exit 1
fi

# Build the image
docker build \
    --build-arg ROUTE_NAME=$ROUTE_NAME \
    -f docker/templates/route.Dockerfile \
    --provenance=mode=max \
    -t $REGISTRY/$REPO:$ROUTE_NAME \
    .

# Push the image
if [ -n "$PUSH_FLAG" ]; then 
    # If running with sudo, use the original user's Docker config
    if [ -n "$SUDO_USER" ]; then
        DOCKER_CONFIG="/home/$SUDO_USER/.docker"
        if [ -f "$DOCKER_CONFIG/config.json" ]; then
            echo "Using Docker credentials from $SUDO_USER"
            docker --config "$DOCKER_CONFIG" push $REGISTRY/$REPO:$ROUTE_NAME
        else
            echo "Error: Docker credentials not found. Please run 'docker login' as your regular user first."
            exit 1
        fi
    else
        docker push $REGISTRY/$REPO:$ROUTE_NAME
    fi
fi 