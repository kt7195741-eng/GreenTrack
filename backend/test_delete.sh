#!/bin/bash
echo "Registering test user..."
curl -s -X POST http://localhost:8080/api/users/register -H "Content-Type: application/json" -d '{"username":"testuser2","email":"test2@example.com","password":"password"}' > /dev/null

echo "Logging in..."
TOKEN=$(curl -s -X POST http://localhost:8080/api/users/login -H "Content-Type: application/json" -d '{"email":"test2@example.com","password":"password"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Login failed, token not found!"
    exit 1
fi

echo "Got token."

echo "Adding a plant..."
PLANT_RESPONSE=$(curl -s -X POST http://localhost:8080/api/plants -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"TestPlant","species":"Ficus","wateringFrequency":"Weekly"}')
echo "Plant response: $PLANT_RESPONSE"

PLANT_ID=$(echo $PLANT_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$PLANT_ID" ]; then
    echo "Plant not created!"
    exit 1
fi

echo "Created plant with ID: $PLANT_ID"

echo "Deleting plant..."
DELETE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X DELETE http://localhost:8080/api/plants/$PLANT_ID -H "Authorization: Bearer $TOKEN")
echo "Delete response: $DELETE_RESPONSE"

echo "Fetching my plants..."
MY_PLANTS=$(curl -s -X GET http://localhost:8080/api/plants/my-plants -H "Authorization: Bearer $TOKEN")
echo "My plants: $MY_PLANTS"
