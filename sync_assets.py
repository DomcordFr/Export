#!/usr/bin/env python3
"""
sync_assets.py — Synchronize export_styles.css and app.js into index.html
"""
import os
import re
import subprocess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSS_PATH = os.path.join(BASE_DIR, "export_styles.css")
JS_PATH = os.path.join(BASE_DIR, "app.js")
INDEX_PATH = os.path.join(BASE_DIR, "index.html")

print("1. Checking app.js syntax...")
res = subprocess.run(["node", "--check", JS_PATH], capture_output=True, text=True)
if res.returncode != 0:
    print("Error in app.js:", res.stderr)
    exit(1)
print("app.js syntax is valid!")

print("2. Reading source files...")
with open(CSS_PATH, "r", encoding="utf-8") as f:
    css_content = f.read().strip()

with open(JS_PATH, "r", encoding="utf-8") as f:
    js_content = f.read().strip()

with open(INDEX_PATH, "r", encoding="utf-8") as f:
    html = f.read()

print("3. Inlining CSS...")
# Replace <style>...</style> block
style_start = html.find("<style>")
style_end = html.find("</style>")
if style_start != -1 and style_end != -1 and style_end > style_start:
    html = html[:style_start] + "<style>\n" + css_content + "\n" + html[style_end:]
    print("CSS updated in index.html!")
else:
    print("Warning: <style> block not found!")

print("4. Inlining JS...")
# Replace last <script>...</script> block before </body>
script_start = html.rfind("<script>")
script_end = html.rfind("</script>")
if script_start != -1 and script_end != -1 and script_end > script_start:
    html = html[:script_start] + "<script>\n" + js_content + "\n" + html[script_end:]
    print("JS updated in index.html!")
else:
    print("Warning: bottom <script> block not found!")

with open(INDEX_PATH, "w", encoding="utf-8") as f:
    f.write(html)

print("5. Verifying index.html inlined script...")
script_start = html.rfind("<script>") + len("<script>")
script_end = html.rfind("</script>")
inlined_js = html[script_start:script_end]

tmp_check = "/tmp/check_index_script.js"
with open(tmp_check, "w", encoding="utf-8") as f:
    f.write(inlined_js)

res = subprocess.run(["node", "--check", tmp_check], capture_output=True, text=True)
if res.returncode != 0:
    print("Error in index.html inlined script:", res.stderr)
    exit(1)
print("✅ index.html inlined script verified! All in sync!")
