#!/bin/bash

# Get all pods with their RAM metrics
echo "Getting pod RAM metrics..."
echo "========================="
printf "%-60s %-15s %-15s %-15s\n" "POD NAME" "RAM USAGE" "RAM REQUEST" "RAM LIMIT"
printf "%-60s %-15s %-15s %-15s\n" "--------" "---------" "-----------" "---------"

# Get all pods across all namespaces
kubectl get pods --all-namespaces -o json | jq -r '.items[] | 
  .metadata.namespace as $ns | 
  .metadata.name as $name | 
  .spec.containers[] as $container |
  "\($ns)/\($name)"' | sort -u | while read pod_full; do
  
  namespace=$(echo $pod_full | cut -d'/' -f1)
  pod=$(echo $pod_full | cut -d'/' -f2)
  
  # Get current RAM usage from metrics API
  ram_usage=$(kubectl top pod $pod -n $namespace 2>/dev/null | tail -n 1 | awk '{print $3}' || echo "N/A")
  
  # Get RAM request and limit from pod spec
  ram_info=$(kubectl get pod $pod -n $namespace -o json | jq -r '
    [.spec.containers[].resources | 
     (.requests.memory // "0"), 
     (.limits.memory // "none")] | 
    @tsv' 2>/dev/null || echo "0	none")
  
  ram_request=$(echo "$ram_info" | cut -f1)
  ram_limit=$(echo "$ram_info" | cut -f2)
  
  # Only print if we have valid data
  if [ ! -z "$ram_usage" ] && [ "$ram_usage" != "N/A" ]; then
    printf "%-60s %-15s %-15s %-15s\n" "$pod_full" "$ram_usage" "$ram_request" "$ram_limit"
  fi
done

echo ""
echo "Note: RAM usage requires metrics-server to be installed in the cluster"