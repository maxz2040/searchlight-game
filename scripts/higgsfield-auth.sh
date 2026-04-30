#!/usr/bin/env bash
# Higgsfield MCP — refresh the OAuth bearer token via device flow.
# Token TTL is 24 hours; rerun this script whenever you see HTTP 401 from
# the MCP server. Stores the token in two places (mode 600):
#   ~/.config/searchlight/env  — global, auto-sourced from .bashrc
#   <repo>/.env                — project mirror for npm scripts (gitignored)
#
# Requires: curl, python3, jq optional.
set -euo pipefail

CONFIG_DIR="$HOME/.config/searchlight"
mkdir -p "$CONFIG_DIR"
ENV_FILE="$CONFIG_DIR/env"
touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

REPO_ENV="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel 2>/dev/null)/.env"

echo "Initiating device authorization…"
RESP=$(curl -fsS -X POST https://fnf-device-auth.higgsfield.ai/authorize \
  -H "Content-Type: application/json" -d '{}')
DEVICE_CODE=$(echo "$RESP" | python3 -c "import json,sys; print(json.load(sys.stdin)['device_code'])")
VERIFICATION_URI=$(echo "$RESP" | python3 -c "import json,sys; print(json.load(sys.stdin)['verification_uri'])")
INTERVAL=$(echo "$RESP" | python3 -c "import json,sys; print(json.load(sys.stdin)['interval'])")
EXPIRES_IN=$(echo "$RESP" | python3 -c "import json,sys; print(json.load(sys.stdin)['expires_in'])")

echo
echo "Authorize here: $VERIFICATION_URI"
echo "  (code expires in $EXPIRES_IN seconds; polling every ${INTERVAL}s)"
echo

DEADLINE=$(( $(date +%s) + EXPIRES_IN ))
while [ "$(date +%s)" -lt "$DEADLINE" ]; do
  HTTP=$(curl -sS -o /tmp/hf-token.json -w "%{http_code}" \
    -X POST https://fnf-device-auth.higgsfield.ai/token \
    -H "Content-Type: application/json" -d "{\"device_code\":\"$DEVICE_CODE\"}")
  if [ "$HTTP" = "200" ]; then
    TOKEN=$(python3 -c "import json; print(json.load(open('/tmp/hf-token.json'))['access_token'])")
    rm -f /tmp/hf-token.json
    # Update both env files atomically.
    grep -v "^export HIGGSFIELD_TOKEN=" "$ENV_FILE" > "$ENV_FILE.new" 2>/dev/null || true
    echo "export HIGGSFIELD_TOKEN=$TOKEN" >> "$ENV_FILE.new"
    mv "$ENV_FILE.new" "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    if [ -f "$REPO_ENV" ]; then
      grep -v "^HIGGSFIELD_TOKEN=" "$REPO_ENV" > "$REPO_ENV.new" 2>/dev/null || true
      echo "HIGGSFIELD_TOKEN=$TOKEN" >> "$REPO_ENV.new"
      mv "$REPO_ENV.new" "$REPO_ENV"
      chmod 600 "$REPO_ENV"
    fi
    echo "✅ Token refreshed (24-hour TTL)."
    echo "   Updated: $ENV_FILE"
    [ -f "$REPO_ENV" ] && echo "   Updated: $REPO_ENV"
    # Re-register with Claude Code so the in-memory bearer is current.
    if command -v claude >/dev/null 2>&1; then
      claude mcp remove --scope user higgsfield 2>/dev/null || true
      claude mcp add --scope user higgsfield --transport http https://mcp.higgsfield.ai/mcp \
        --header "Authorization: Bearer $TOKEN" >/dev/null
      echo "   Updated: Claude Code MCP config (~/.claude.json)"
    fi
    exit 0
  fi
  sleep "$INTERVAL"
done

echo "❌ device code expired without authorization"
exit 1
