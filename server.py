#!/usr/bin/env python3
"""
Cockapoo Responder Local Server
Serves the application locally and opens it directly in your browser.
"""
import http.server
import socketserver
import webbrowser
import os
import sys

DEFAULT_PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Suppress routine GET logging for cleaner terminal
        pass

def find_available_port(start_port):
    import socket
    port = start_port
    while port < start_port + 50:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
        port += 1
    return start_port

def main():
    port = find_available_port(DEFAULT_PORT)
    url = f"http://localhost:{port}"

    print("=" * 60)
    print("🐶 Cockapoo Responder App Server Running!")
    print(f"📡 Local URL: {url}")
    print("💡 Tap the sounds to make your Cockapoo tilt his head and respond!")
    print("🛑 Press Ctrl+C to stop the server.")
    print("=" * 60)

    # Open browser
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Could not open browser automatically: {e}")

    try:
        with socketserver.TCPServer(("", port), Handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🐶 Shutting down Cockapoo Responder server. Woof!")
        sys.exit(0)

if __name__ == '__main__':
    main()
