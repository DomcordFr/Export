#!/usr/bin/env bash
# Export Suite - Quickstart Launcher for Linux & macOS
cd "$(dirname "$0")" || exit 1

echo "========================================================"
echo " Starting Export — JanitorAI Backup Suite & CSS Studio"
echo "========================================================"

if command -v python3 &>/dev/null; then
    python3 server.py
elif command -v python &>/dev/null; then
    python server.py
else
    echo "Error: Python 3 is required to run the local companion server."
    echo "You can still open index.html directly in your browser."
    exit 1
fi
