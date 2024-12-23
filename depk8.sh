#!/bin/bash
# deploy-service.sh

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <service-name> <image>"
    exit 1
fi

export SERVICE_NAME=$1
export IMAGE=$2

envsubst < k8s/base/micro.yaml | kubectl apply -f -