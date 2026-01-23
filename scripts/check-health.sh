#!/bin/bash

# Health Check Script
# Verifies that all services are running correctly

echo "🏥 Checking service health..."
echo ""

FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3001"

# Check frontend
echo "Checking frontend ($FRONTEND_URL)..."
if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is not responding"
fi

echo ""

# Check backend
echo "Checking backend ($BACKEND_URL)..."
if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" | grep -q "200"; then
    echo "✅ Backend is healthy"
    echo "Response: $(curl -s "$BACKEND_URL/health" | jq -r '.status')"
else
    echo "❌ Backend is not responding"
fi

echo ""
echo "Health check complete!"
