#!/usr/bin/env python3
"""Doggie Soundboard local server."""
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

class AppTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

    def handle_error(self, request, client_address):
        error = sys.exc_info()[1]
        if isinstance(error, (BrokenPipeError, ConnectionResetError, ConnectionAbortedError)):
            return
        super().handle_error(request, client_address)

def find_available_port(start_port):
    import socket
    port = start_port
    while port < start_port + 50:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) != 0:
                return port
        port += 1
    return start_port

def main():
    port = find_available_port(DEFAULT_PORT)
    url = f"http://localhost:{port}"

    print("=" * 60)
    print("🐶 Doggie Soundboard server running!")
    print(f"📡 Local URL: {url}")
    print("💡 Choose a dog and tap a sound to hear it!")
    print("🛑 Press Ctrl+C to stop the server.")
    print("=" * 60)

    # Open browser
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Could not open browser automatically: {e}")

    try:
        # Bind strictly to loopback interface (127.0.0.1) for local security
        with AppTCPServer(("127.0.0.1", port), Handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🐶 Shutting down Doggie Soundboard. Woof!")
        sys.exit(0)

if __name__ == '__main__':
    main()
