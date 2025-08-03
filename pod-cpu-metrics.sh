#!/bin/bash

# Get all pods with their CPU metrics
echo "Getting pod CPU metrics..."
echo "========================="
printf "%-60s %-15s %-15s %-15s\n" "POD NAME" "CPU USAGE" "CPU REQUEST" "CPU LIMIT"
printf "%-60s %-15s %-15s %-15s\n" "--------" "---------" "-----------" "---------"

# Get all pods across all namespaces
kubectl get pods --all-namespaces -o json | jq -r '.items[] | 
  .metadata.namespace as $ns | 
  .metadata.name as $name | 
  .spec.containers[] as $container |
  "\($ns)/\($name)"' | sort -u | while read pod_full; do
  
  namespace=$(echo $pod_full | cut -d'/' -f1)
  pod=$(echo $pod_full | cut -d'/' -f2)
  
  # Get current CPU usage from metrics API
  cpu_usage=$(kubectl top pod $pod -n $namespace 2>/dev/null | tail -n 1 | awk '{print $2}' || echo "N/A")
  
  # Get CPU request and limit from pod spec
  cpu_info=$(kubectl get pod $pod -n $namespace -o json | jq -r '
    [.spec.containers[].resources | 
     (.requests.cpu // "0"), 
     (.limits.cpu // "none")] | 
    @tsv' 2>/dev/null || echo "0	none")
  
  cpu_request=$(echo "$cpu_info" | cut -f1)
  cpu_limit=$(echo "$cpu_info" | cut -f2)
  
  # Only print if we have valid data
  if [ ! -z "$cpu_usage" ] && [ "$cpu_usage" != "N/A" ]; then
    printf "%-60s %-15s %-15s %-15s\n" "$pod_full" "$cpu_usage" "$cpu_request" "$cpu_limit"
  fi
done

echo ""
echo "Note: CPU usage requires metrics-server to be installed in the cluster"