#!/bin/bash
echo "=== SHADOW CHAMELEON BACKEND API TEST ==="
echo "Note: Neo4j is unhealthy but not required for core functionality"
echo ""

BASE_URL="http://localhost:8000/api/v1"

# Test 1: System Health
echo "1. Testing System Health..."
curl -s http://localhost:8000/health | python -m json.tool

# Test 2: Submit Multiple Scan Types
echo -e "\n2. Submitting Test Scans..."

echo "2.1 Quick Scan..."
QUICK_RESPONSE=$(curl -s -X POST $BASE_URL/recon/scan-request \
  -H "Content-Type: application/json" \
  -d '{
    "target": "scanme.nmap.org",
    "note": "API test - quick scan",
    "scan_type": "quick"
  }')
echo $QUICK_RESPONSE | python -m json.tool
QUICK_ID=$(echo $QUICK_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['target_id'])")

echo "2.2 Comprehensive Scan..."
COMP_RESPONSE=$(curl -s -X POST $BASE_URL/recon/scan-request \
  -H "Content-Type: application/json" \
  -d '{
    "target": "github.com", 
    "note": "API test - comprehensive scan",
    "scan_type": "comprehensive"
  }')
echo $COMP_RESPONSE | python -m json.tool
COMP_ID=$(echo $COMP_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['target_id'])")

echo "2.3 Stealth Scan..."
curl -s -X POST $BASE_URL/recon/scan-request \
  -H "Content-Type: application/json" \
  -d '{
    "target": "example.com",
    "note": "API test - stealth scan", 
    "scan_type": "stealth"
  }' | python -m json.tool

# Wait for scans to process
echo -e "\n3. Waiting for scans to complete (10 seconds)..."
sleep 10

# Test 3: Verify Scans Completed
echo -e "\n4. Verifying Scan Results..."
echo "4.1 All Targets:"
curl -s "$BASE_URL/recon/targets?page=1&page_size=5" | python -m json.tool

echo "4.2 Quick Scan Result:"
curl -s "$BASE_URL/recon/target/$QUICK_ID" | python -m json.tool

echo "4.3 Comprehensive Scan Result:"
curl -s "$BASE_URL/recon/target/$COMP_ID" | python -m json.tool

# Test 4: Database Verification
echo -e "\n5. Database Verification..."
docker-compose exec postgres psql -U sc -d shadow -c "
SELECT 
    id, 
    target, 
    status,
    scan_type,
    created_at,
    scan_completed_at
FROM targets 
ORDER BY id DESC 
LIMIT 5;"

echo -e "\n=== BACKEND API TEST COMPLETE ==="
