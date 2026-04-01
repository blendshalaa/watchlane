#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: ./generate-key.sh https://your-server.onrender.com"
  exit 1
fi

URL=$1
# Default admin credentials
EMAIL="admin@watchlane.test"
PASS="watchlaneAdmin"

echo "==== WATCHLANE API KEY GENERATOR ===="

echo "> 1. Registering Admin User (if not exists)..."
curl -s -X POST "$URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\", \"password\":\"$PASS\"}" > /dev/null

echo "> 2. Logging In to retrieve JWT Token..."
LOGIN_RES=$(curl -s -X POST "$URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\", \"password\":\"$PASS\"}")

TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Error: Failed to obtain connection token from the server."
  echo "Verify that the URL is correct and your Render server is fully running."
  exit 1
fi

echo "> 3. Minting a new API Key..."
API_RES=$(curl -s -X POST "$URL/api/auth/api-key" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

API_KEY=$(echo "$API_RES" | grep -o '"key":"[^"]*' | cut -d'"' -f4)

echo ""
echo "=========================================="
echo "🎉 SUCCESS! Your brand new API Key is:"
echo "   $API_KEY"
echo "=========================================="
echo "Paste this key into your deployed dashboard to log in!"
