import os
import sys
from pyngrok import ngrok, conf

def update_flutter_api_url(ngrok_url: str):
    service_file = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "..", "lib", "core", "services", "api_service.dart"
    )
    if os.path.exists(service_file):
        try:
            with open(service_file, "r", encoding="utf-8") as f:
                content = f.read()

            import re
            new_content = re.sub(
                r"static String productionCloudUrl = '.*?';",
                f"static String productionCloudUrl = '{ngrok_url}/api';",
                content
            )
            new_content = re.sub(
                r"static bool useCloudBackend = false;",
                "static bool useCloudBackend = true;",
                new_content
            )

            with open(service_file, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Updated lib/core/services/api_service.dart with: {ngrok_url}/api")
        except Exception as e:
            print(f"Notice: Could not auto-update api_service.dart ({e})")

def start_tunnel():
    print("=" * 60)
    print("GeoHub ngrok Tunnel Launcher")
    print("=" * 60)

    # Allow passing authtoken as command line argument
    token = None
    if len(sys.argv) > 1:
        token = sys.argv[1]
    elif os.getenv("NGROK_AUTHTOKEN"):
        token = os.getenv("NGROK_AUTHTOKEN")

    if token:
        ngrok.set_auth_token(token)
        print("ngrok authtoken configured successfully.")

    try:
        tunnel = ngrok.connect(8000, "http")
        public_url = tunnel.public_url.replace("http://", "https://")

        print("\n" + "=" * 60)
        print(f"SUCCESS! GeoHub is now LIVE on the Internet via ngrok:")
        print(f"Public Web App: {public_url}")
        print(f"API Endpoint:   {public_url}/api")
        print(f"Swagger Docs:   {public_url}/docs")
        print("=" * 60 + "\n")

        # Automatically update Flutter app's baseUrl
        update_flutter_api_url(public_url)

        print("Press Ctrl+C to close the ngrok tunnel...")
        ngrok_process = ngrok.get_ngrok_process()
        ngrok_process.proc.wait()

    except Exception as e:
        print(f"\nngrok notice: {e}")
        print("\nTo fix: Get your free authtoken from https://dashboard.ngrok.com/get-started/your-authtoken")
        print("Then run: python start_ngrok.py <YOUR_AUTHTOKEN>\n")

if __name__ == "__main__":
    start_tunnel()
