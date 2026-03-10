#!/bin/bash
TOKEN=$(python3 gen_jwt.py)
echo "Got token: $TOKEN..."

echo "Fetching my plants..."
curl -s -X GET http://localhost:8080/api/plants/my-plants -H "Authorization: Bearer $TOKEN" > my_plants.json
cat my_plants.json

# If there's a plant, let's delete the first one
PLANT_ID=$(grep -o '"id":[0-9]*' my_plants.json | head -1 | cut -d':' -f2)

if [ -z "$PLANT_ID" ]; then
    echo "No plants found. Adding one..."
    PLANT_RESPONSE=$(curl -s -X POST http://localhost:8080/api/plants -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"DeleteMe","species":"Test","wateringFrequency":"Weekly"}')
    echo "Plant response: $PLANT_RESPONSE"
    PLANT_ID=$(echo $PLANT_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
fi

echo "Deleting plant with ID: $PLANT_ID"
DELETE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X DELETE http://localhost:8080/api/plants/$PLANT_ID -H "Authorization: Bearer $TOKEN")
echo "Delete response: $DELETE_RESPONSE"

echo "Fetching my plants again..."
curl -s -X GET http://localhost:8080/api/plants/my-plants -H "Authorization: Bearer $TOKEN"
