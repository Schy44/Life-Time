import json
import http.client

# --- USER CONFIGURATION ---
# Please fill these in before running the script
PROFILE_ID = "13"  # The ID of the profile you are trying to edit (from the URL)
AUTH_TOKEN = "YOUR_AUTH_TOKEN_HERE" # Your authentication token
# How to find your token:
# 1. Open your web application in the browser.
# 2. Open the Developer Tools (usually by pressing F12).
# 3. Go to the "Application" tab (in Chrome) or "Storage" tab (in Firefox).
# 4. On the left side, find "Local Storage" and click on your site's URL.
# 5. Find the key named "authToken" and copy the value.

# The field and value to update
FIELD_TO_UPDATE = "about"
NEW_VALUE = "This is a test update from a diagnostic script."
# --------------------------

# --- SCRIPT ---
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
host = "localhost"
port = 8000
url = f"/api/profiles/{PROFILE_ID}/"

# Manually construct the multipart/form-data body
body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="{FIELD_TO_UPDATE}"\r\n\r\n'
    f"{NEW_VALUE}\r\n"
    f"--{boundary}--\r\n"
).encode('utf-8')

headers = {
    'Authorization': f'Token {AUTH_TOKEN}',
    'Content-Type': f'multipart/form-data; boundary={boundary}',
    'Content-Length': str(len(body))
}

try:
    conn = http.client.HTTPConnection(host, port)
    conn.request("PATCH", url, body, headers)
    response = conn.getresponse()

    print("--- STATUS ---")
    print(response.status, response.reason)
    print("\n--- HEADERS ---")
    for header, value in response.getheaders():
        print(f"{header}: {value}")
    print("\n--- BODY ---")
    response_body = response.read().decode('utf-8')
    try:
        # Try to pretty-print if it's JSON
        print(json.dumps(json.loads(response_body), indent=2))
    except json.JSONDecodeError:
        print(response_body)

    conn.close()

except ConnectionRefusedError:
    print(f"Connection refused. Is your Django backend server running on http://{host}:{port}?")
except Exception as e:
    print(f"An error occurred: {e}")
