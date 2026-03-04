import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_api():
    print("Testing GET /api/specialties...")
    try:
        response = requests.get(f"{BASE_URL}/specialties")
        if response.status_code == 200:
            specialties = response.json()
            print(f"Success! Found {len(specialties)} specialties.")
            for s in specialties[:2]:
                print(f" - {s['name']}: {s['description'][:50]}...")
        else:
            print(f"Failed with status {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

    print("\nTesting GET /api/lawyers...")
    try:
        response = requests.get(f"{BASE_URL}/lawyers")
        if response.status_code == 200:
            lawyers = response.json()
            print(f"Success! Found {len(lawyers)} verified lawyers.")
            for l in lawyers:
                print(f" - {l['user']['full_name']} ({l['specialty']['name']})")
        else:
            print(f"Failed with status {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Note: Requires the FastAPI server to be running!
    # This is a basic check.
    test_api()
