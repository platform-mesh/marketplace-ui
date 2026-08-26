#!/bin/bash

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <bearer-token>"
  echo "Example: $0 eyJhbGciOiJSUzI1..."
  exit 1
fi

TOKEN="$1"
SCRIPT_DIR="$(dirname "$0")"

# The dev portal serves an mkcert certificate, Node does not trust the system store:
if [ -z "$NODE_EXTRA_CA_CERTS" ] && command -v mkcert >/dev/null 2>&1; then
  ca_root="$(mkcert -CAROOT)"
  if [ -f "$ca_root/rootCA.pem" ]; then
    export NODE_EXTRA_CA_CERTS="$ca_root/rootCA.pem"
  fi
fi

node "$SCRIPT_DIR/fetch-schemas.js" "$TOKEN"
