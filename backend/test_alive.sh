#!/bin/bash
echo "=== SHADOW CHAMELEON API COMPLETE TEST ==="
BASE_URL="http://localhost:8000/api/v1"

# Test 1: System Health
echo -e "\n1. Testing System Health..."
curl -s $BASE_URL/../health | python -c "
import sys, json
data = json.load(sys.stdin)
print('   Status:', data.get('status'))
print('   PostgreSQL:', data.get('services', {}).get('postgresql'))
print('   Neo4j:', data.get('services', {}).get('neo4j'))
"

# Test 2: Submit Multiple Scan Types
echo -e "\n2. Submitting Test Scans..."

echo "2.1 Quick Scan..."
QUICK_RESPONSE=$(curl -s -X POST $BASE_URL/recon/scan-request \
  -H "Content-Type: application/json" \
  -d '{"target": "api-test-quick.example.com", "scan_type": "quick", "note": "API test - quick scan"}')
echo "   Response:" && echo "$QUICK_RESPONSE" | python -m json.tool

echo "2.2 Comprehensive Scan..."
COMP_RESPONSE=$(curl -s -X POST $BASE_URL/recon/scan-request \
  -H "Content-Type: application/json" \
  -d '{"target": "api-test-comp.example.com", "scan_type": "comprehensive", "note": "API test - comprehensive scan"}')
echo "   Response:" && echo "$COMP_RESPONSE" | python -m json.tool

echo "2.3 Stealth Scan..."
STEALTH_RESPONSE=$(curl -s -X POST $BASE_URL/recon/scan-request \
  -H "Content-Type: application/json" \
  -d '{"target": "api-test-stealth.example.com", "scan_type": "stealth", "note": "API test - stealth scan"}')
echo "   Response:" && echo "$STEALTH_RESPONSE" | python -m json.tool

# Wait for scans to process
echo -e "\n3. Waiting for scans to complete..."
sleep 12

# Test 3: Verify All Targets
echo -e "\n4. Current Targets Status:"
curl -s "$BASE_URL/recon/targets?page=1&page_size=20" | python -c "
import sys, json
data = json.load(sys.stdin)
targets = data.get('targets', [])
total = data.get('total', 0)
completed = len([t for t in targets if t['status'] == 'completed'])
scanning = len([t for t in targets if t['status'] == 'scanning'])
pending = len([t for t in targets if t['status'] == 'pending'])

print(f'   Total Targets: {total}')
print(f'   Completed: {completed}')
print(f'   Scanning: {scanning}') 
print(f'   Pending: {pending}')
print(f'   Recent targets:')
for t in targets[:5]:
    print(f'     - {t[\"id\"]}: {t[\"target\"]} ({t[\"status\"]})')
"

# Test 4: Error Handling
echo -e "\n5. Testing Error Handling..."
echo "5.1 Empty target:"
curl -s -X POST $BASE_URL/recon/scan-request \
  -H "Content-Type: application/json" \
  -d '{"target": ""}' | python -c "import sys, json; print('   Response:', json.dumps(json.load(sys.stdin), indent=2))"

echo "5.2 Invalid scan type:"
curl -s -X POST $BASE_URL/recon/scan-request \
  -H "Content-Type: application/json" \
  -d '{"target": "test.com", "scan_type": "invalid_type"}' | python -c "import sys, json; print('   Response:', json.dumps(json.load(sys.stdin), indent=2))"

echo "5.3 Non-existent target:"
curl -s $BASE_URL/recon/target/9999 | python -c "import sys, json; print('   Response:', json.dumps(json.load(sys.stdin), indent=2))"

echo -e "\n=== API TEST COMPLETE ==="
