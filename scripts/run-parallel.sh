#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <count> <command...>"
  exit 1
fi

count="$1"
shift

for _ in $(seq 1 "$count"); do
  "$@" &
done

wait
