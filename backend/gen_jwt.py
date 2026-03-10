import jwt
import base64
import time

secret_b64 = "dGhpc0lzQVNlY3JldEtleUZvckdyZWVuVHJhY2tKd3QyMDI2"
secret_bytes = base64.b64decode(secret_b64)

payload = {
    "sub": "kwqt7195741@gmail.com",
    "iat": int(time.time()),
    "exp": int(time.time()) + 86400
}

token = jwt.encode(payload, secret_bytes, algorithm="HS256")
print(token)
