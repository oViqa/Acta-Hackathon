#!/bin/bash

echo "⚠️  WARNING: This will DELETE ALL users, events, and attendance data!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo "Clearing database..."

curl -X POST http://localhost:3002/api/admin/clear-database \
  -H "Content-Type: application/json" \
  -d '{"adminPassword":"puddingadmin123"}' \
  | jq '.'

echo ""
echo "✅ Database cleared! Please refresh your browser."

