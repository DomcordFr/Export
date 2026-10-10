#!/usr/bin/env python3
"""
Export — JanitorAI Backup Suite & SillyTavern Card Exporter
Companion Server & Stateless CORS Gateway
Zero external dependencies (Python standard library only).
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import urllib.error
import ssl
import sys
import os
import json
import webbrowser

PORT = 8095
if len(sys.argv) > 1 and sys.argv[1].isdigit():
    PORT = int(sys.argv[1])
elif "--port" in sys.argv:
    idx = sys.argv.index("--port")
    if idx + 1 < len(sys.argv) and sys.argv[idx + 1].isdigit():
        PORT = int(sys.argv[idx + 1])
else:
    PORT = int(os.environ.get("PORT", 8095))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

JANITOR_GATEWAY = "https://janitorai.com/hampter"
SUPABASE_ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXp4dHpvbW1wbnhreW5kZGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzNzA3NDAsImV4cCI6MjA0Mzk0Njc0MH0."
    "UfRPni4ga9Lmin8j0JjV5ouuK9bXp8tsqPJ8pMTDDAI"
)
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

# Unverified SSL context for environments with custom CA chains
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE


class ExportHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, format, *args):
        # Suppress sensitive query parameters / token leakage in console logs
        msg = format % args
        if "token" in msg or "eyJ" in msg:
            sys.stdout.write(f"[{self.log_date_time_string()}] Proxy request processed (auth masked)\n")
        else:
            sys.stdout.write(f"[{self.log_date_time_string()}] {msg}\n")

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type, apikey, X-Janitor-Token, Accept, Origin, Referer")
        self.send_header("Access-Control-Max-Age", "86400")

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        # Health check
        if self.path == "/api/health":
            self.send_response(200)
            self._set_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"healthy","service":"Export Suite","version":"1.0.0"}')
            return

        # Direct Hampter proxy route or generic proxy route
        if self.path.startswith("/hampter/") or self.path.startswith("/api/proxy"):
            self._handle_proxy()
            return

        # Fallback to serving static files
        super().do_GET()

    def do_POST(self):
        if self.path.startswith("/hampter/") or self.path.startswith("/api/proxy"):
            self._handle_proxy()
            return
        self.send_error(404, "Endpoint Not Found")

    def _handle_proxy(self):
        parsed = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed.query)

        # 1. Determine target upstream URL
        if parsed.path.startswith("/hampter/"):
            rel_path = parsed.path[len("/hampter/"):]
            upstream_url = f"{JANITOR_GATEWAY}/{rel_path}"
            if parsed.query:
                upstream_url += f"?{parsed.query}"
        elif "url" in query:
            upstream_url = query["url"][0]
        else:
            self.send_error(400, "Missing proxy target URL")
            return

        # 2. Extract Authorization Bearer if supplied
        auth_header = self.headers.get("Authorization")
        if not auth_header and self.headers.get("X-Janitor-Token"):
            custom_tok = self.headers.get("X-Janitor-Token").strip()
            auth_header = f"Bearer {custom_tok}"

        # 3. Read body if POST
        body_bytes = None
        if self.command == "POST":
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 0:
                body_bytes = self.rfile.read(content_length)

        # 4. Construct upstream request
        req = urllib.request.Request(upstream_url, data=body_bytes, method=self.command)
        req.add_header("User-Agent", USER_AGENT)
        req.add_header("Accept", "application/json, text/plain, */*")
        req.add_header("apikey", SUPABASE_ANON_KEY)
        req.add_header("Referer", "https://janitorai.com/")
        req.add_header("Origin", "https://janitorai.com")

        if auth_header:
            req.add_header("Authorization", auth_header)

        if self.headers.get("Content-Type"):
            req.add_header("Content-Type", self.headers.get("Content-Type"))

        # 5. Execute upstream request & pipe response
        try:
            with urllib.request.urlopen(req, timeout=30, context=SSL_CTX) as upstream_resp:
                self.send_response(upstream_resp.status)
                self._set_cors_headers()
                for header_key, header_val in upstream_resp.getheaders():
                    if header_key.lower() in ("content-type", "content-disposition", "cache-control", "last-modified", "etag"):
                        self.send_header(header_key, header_val)
                self.end_headers()
                self.wfile.write(upstream_resp.read())
        except urllib.error.HTTPError as http_err:
            self.send_response(http_err.code)
            self._set_cors_headers()
            self.send_header("Content-Type", http_err.headers.get("Content-Type", "application/json"))
            self.end_headers()
            self.wfile.write(http_err.read())
        except Exception as err:
            self.send_response(502)
            self._set_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            err_data = json.dumps({"error": f"Proxy Gateway Failure: {str(err)}"}).encode("utf-8")
            self.wfile.write(err_data)


def main():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), ExportHandler) as httpd:
        print("=" * 64)
        print("  ⚡ EXPORT — JanitorAI Backup Suite & CSS Extractor")
        print("=" * 64)
        print(f"  • Local Web UI:    http://127.0.0.1:{PORT}")
        print(f"  • CORS Proxy:      http://127.0.0.1:{PORT}/hampter/*")
        print("  • Security:        100% Zero-Storage Stateless In-Memory Proxy")
        print("=" * 64)
        print("  Press Ctrl+C to terminate.")
        print()

        if "--no-browser" not in sys.argv and not os.environ.get("NO_BROWSER"):
            try:
                webbrowser.open(f"http://127.0.0.1:{PORT}")
            except Exception:
                pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.server_close()


if __name__ == "__main__":
    main()
