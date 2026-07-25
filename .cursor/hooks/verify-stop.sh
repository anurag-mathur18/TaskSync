#!/usr/bin/env bash
set -euo pipefail

# Consume hook stdin (stop payload); failures should prompt a follow-up fix turn.
cat >/dev/null

failures=()

if ! npm run typecheck >&2; then
  failures+=("typecheck")
fi

if ! npm run test >&2; then
  failures+=("test")
fi

if [[ ${#failures[@]} -eq 0 ]]; then
  echo '{}'
  exit 0
fi

joined=$(IFS=', '; echo "${failures[*]}")
jq -n \
  --arg msg "Verification failed (${joined}). Fix the reported TypeScript/ESLint/test errors, then stop again." \
  '{followup_message: $msg}'
exit 0
