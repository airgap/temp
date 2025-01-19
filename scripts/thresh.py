#!/usr/bin/env python3

# SERVO-SKULL ENGAGED: Python script for generating level thresholds with full 64-bit safety.
# We multiply by 1.4 each iteration (using Decimal to avoid floating errors), then floor the result.
# We stop when minPoints > 2^63 - 1.

from decimal import Decimal, getcontext

getcontext().prec = 100  # Plenty of precision for our exponent growth

alpha = Decimal(10)
beta = Decimal("1.4")
MAX_INT64 = 2**63 - 1

def generate_thresholds():
    thresholds = [(1, 0)]
    level = 2  # Start at level 2 since level 1 is implicit
    points = Decimal(10)  # Start with initial points value
    last = 0
    while True:
        # if we exceed max signed 64-bit, we're done
        if points > MAX_INT64:
            break
        thresholds.append((level, int(last + points)))  # cast to int for convenience
        last = points
        points = (points * beta).to_integral_value(rounding="ROUND_FLOOR")  # Calculate next threshold
        level += 1
    return thresholds

if __name__ == "__main__":
    thresholds = generate_thresholds()
    print("export const levelThresholds = [")
    for level, min_points in thresholds:
        print(f"  {{ level: {level}, minPoints: {min_points}n }},")
    print("];\n")
