#!/usr/bin/env python3
"""
Export — JanitorAI Backup Suite & SillyTavern Card Exporter
Companion Server & Stateless CORS Gateway
Zero external dependencies (Python standard library only).

Features:
- Stateless CORS Hampter Proxy (/hampter/* and /api/proxy)
- Hosted Janitor Sync Token auto-hydration
- Discreet Atelier Profile CSS & DIVs Reverse-Engineering Engine (/atelier, /arcana, /tapestry, /solarium)
  Exporting CSS, HTML markup, keyframe animations, CSS variables, assets, and LLM-ready markdown.
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import urllib.error
import ssl
import sys
import os
import re
import json
import html
import time
import webbrowser
from datetime import datetime, timezone

PORT = 12345
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

UUID_PATTERN = re.compile(
    r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
    re.IGNORECASE
)
IMAGE_URL_PATTERN = re.compile(
    r"(?:https?://[^\s\"\'\<\>\)]+\.(?:png|jpg|jpeg|gif|webp|svg|avif)|https?://ella\.janitorai\.com/[^\s\"\'\<\>\)]+)",
    re.IGNORECASE
)
AUDIO_URL_PATTERN = re.compile(
    r"(?:https?://[^\s\"\'\<\>\)]+\.(?:mp3|wav|ogg|m4a|aac)|https?://(?:open\.spotify\.com/embed|soundcloud\.com|youtube\.com/embed)[^\s\"\'\<\>\)]+)",
    re.IGNORECASE
)
SOCIAL_URL_PATTERN = re.compile(
    r"https?://(?:discord\.(?:gg|com/invite)|ko-fi\.com|carrd\.co|rentry\.(?:co|org)|twitter\.com|x\.com|patreon\.com|github\.com|instagram\.com|tiktok\.com)/[^\s\"\'\<\>]+",
    re.IGNORECASE
)

# Unverified SSL context for environments with custom CA chains
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

# Hosted Janitor Token Cache
HOSTED_TOKEN_URL = os.environ.get("HOSTED_TOKEN_URL", "https://jaitoken.lucidfr.site/api/janitor/token?key=lucid_eda_janitor_sync_2026")
HOSTED_SYNC_KEY = os.environ.get("HOSTED_SYNC_KEY", "lucid_eda_janitor_sync_2026")
_HOSTED_TOKEN_CACHE = {"token": None, "fetched_at": 0}


def get_hosted_jaitoken():
    now = time.time()
    # Cache valid token for 15 minutes (900 seconds)
    if _HOSTED_TOKEN_CACHE["token"] and (now - _HOSTED_TOKEN_CACHE["fetched_at"] < 900):
        return _HOSTED_TOKEN_CACHE["token"]

    req = urllib.request.Request(HOSTED_TOKEN_URL, headers={
        "User-Agent": USER_AGENT,
        "X-Janitor-Sync-Key": HOSTED_SYNC_KEY,
        "Accept": "application/json"
    })
    try:
        with urllib.request.urlopen(req, timeout=10, context=SSL_CTX) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            tok = data.get("access_token") or data.get("token")
            if tok and isinstance(tok, str) and tok.startswith("eyJ"):
                _HOSTED_TOKEN_CACHE["token"] = tok
                _HOSTED_TOKEN_CACHE["fetched_at"] = now
                return tok
    except Exception as e:
        sys.stderr.write(f"Notice: Failed to refresh hosted jaitoken: {e}\n")
    return _HOSTED_TOKEN_CACHE.get("token")


# ---------------------------------------------------------------------------
# ATELIER EXTRACTION & REVERSE-ENGINEERING ENGINE
# ---------------------------------------------------------------------------

def fetch_janitor_json(url: str, auth_token: str = None) -> tuple[int, dict]:
    """Helper to fetch JSON from Janitor Hampter gateway."""
    req = urllib.request.Request(url)
    req.add_header("User-Agent", USER_AGENT)
    req.add_header("Accept", "application/json, text/plain, */*")
    req.add_header("apikey", SUPABASE_ANON_KEY)
    req.add_header("Referer", "https://janitorai.com/")
    req.add_header("Origin", "https://janitorai.com")

    tok = auth_token or get_hosted_jaitoken()
    if tok:
        req.add_header("Authorization", f"Bearer {tok}")

    try:
        with urllib.request.urlopen(req, timeout=15, context=SSL_CTX) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return resp.status, data
    except urllib.error.HTTPError as he:
        return he.code, {}
    except Exception:
        return 500, {}


def resolve_creator_target(target: str, auth_token: str = None) -> tuple[dict, str]:
    """
    Resolves any input target (Profile URL, Bot URL, UUID, or @username)
    into the raw Janitor profile dictionary.
    Returns (raw_profile_dict, resolved_target_id).
    """
    clean = target.strip()

    # 1. Check for UUID
    uuid_match = UUID_PATTERN.search(clean)
    if uuid_match:
        candidate_uuid = uuid_match.group(0).lower()
        # Try direct profile fetch
        status, prof = fetch_janitor_json(f"{JANITOR_GATEWAY}/profiles/{candidate_uuid}", auth_token)
        if status == 200 and isinstance(prof, dict) and prof.get("id"):
            return prof, candidate_uuid

        # Try resolving as character bot
        status, bot = fetch_janitor_json(f"{JANITOR_GATEWAY}/characters/{candidate_uuid}", auth_token)
        if status == 200 and isinstance(bot, dict):
            cid = bot.get("creator_id") or bot.get("userId")
            if cid:
                status2, prof2 = fetch_janitor_json(f"{JANITOR_GATEWAY}/profiles/{cid}", auth_token)
                if status2 == 200 and isinstance(prof2, dict) and prof2.get("id"):
                    return prof2, str(cid)

    # 2. Treat as username handle (e.g. @lucid67, lucid-67, Lucid)
    clean_username = clean.lstrip("@").strip()
    if clean_username:
        queries = [
            clean_username.lower(),
            clean_username.lower().replace("-", ""),
            clean_username.lower().replace("_", "")
        ]
        unique_queries = [q for q in dict.fromkeys(queries) if len(q) >= 2]

        for q in unique_queries:
            for sort_mode in ("latest", "popular", "trending"):
                url = f"{JANITOR_GATEWAY}/characters?page=1&sort={sort_mode}&search={urllib.parse.quote(q)}"
                status, res = fetch_janitor_json(url, auth_token)
                if status == 200 and isinstance(res, dict):
                    bots = res.get("data", [])
                    # Exact creator match
                    for b in bots:
                        c_name = str(b.get("creator_name") or "").lower().strip()
                        if c_name == q or c_name == clean_username.lower():
                            cid = b.get("creator_id")
                            if cid:
                                s, p = fetch_janitor_json(f"{JANITOR_GATEWAY}/profiles/{cid}", auth_token)
                                if s == 200 and isinstance(p, dict) and p.get("id"):
                                    return p, str(cid)
                    # Substring match
                    for b in bots:
                        c_name = str(b.get("creator_name") or "").lower().strip()
                        if q in c_name or clean_username.lower() in c_name:
                            cid = b.get("creator_id")
                            if cid:
                                s, p = fetch_janitor_json(f"{JANITOR_GATEWAY}/profiles/{cid}", auth_token)
                                if s == 200 and isinstance(p, dict) and p.get("id"):
                                    return p, str(cid)

    return {}, ""


def extract_atelier_data(raw_profile: dict) -> dict:
    """Extracts CSS stylesheets, structural DIVs, assets, tokens, and AI prompt context."""
    cid = str(raw_profile.get("id") or "")
    username = str(raw_profile.get("user_name") or raw_profile.get("name") or "Creator")
    display_name = str(raw_profile.get("name") or username)

    raw_about = raw_profile.get("about_me") or raw_profile.get("description") or ""
    native_style = raw_profile.get("style") or {}
    if not isinstance(native_style, dict):
        native_style = {}

    # 1. CSS Extraction
    style_blocks = re.findall(r"<style[^>]*>(.*?)</style>", raw_about, re.DOTALL | re.IGNORECASE)
    css_parts = [s.strip() for s in style_blocks if s.strip()]

    native_custom_css = str(native_style.get("custom_style") or "").strip()
    if native_custom_css:
        css_parts.append(native_custom_css)

    combined_css = "\n\n".join(css_parts).strip()

    font_imports = list(dict.fromkeys(
        re.findall(r"@import\s+url\([\'\"]?(https?://fonts\.googleapis\.com[^\'\"\)]+)[\'\"]?\)", combined_css, re.IGNORECASE)
    ))
    keyframes = list(dict.fromkeys(
        re.findall(r"@keyframes\s+([a-zA-Z0-9_-]+)", combined_css, re.IGNORECASE)
    ))
    root_vars_raw = re.findall(r"(--[a-zA-Z0-9_-]+)\s*:\s*([^;\}]+);?", combined_css)
    css_variables = {k.strip(): v.strip() for k, v in root_vars_raw}

    # 2. HTML Markup Extraction (DIVs and structural tags with <style> and <script> stripped)
    html_markup = re.sub(r"<style[^>]*>.*?</style>", "", raw_about, flags=re.DOTALL | re.IGNORECASE)
    html_markup = re.sub(r"<script[^>]*>.*?</script>", "", html_markup, flags=re.DOTALL | re.IGNORECASE).strip()

    clean_text = re.sub(r"<[^>]+>", " ", html_markup)
    clean_text = html.unescape(re.sub(r"\s+", " ", clean_text)).strip()
    div_count = len(re.findall(r"<div[\s>]", html_markup, re.IGNORECASE))

    # 3. Assets & Links
    all_text_scope = f"{html_markup} {combined_css}"
    raw_images = list(dict.fromkeys(IMAGE_URL_PATTERN.findall(all_text_scope)))
    raw_audio = list(dict.fromkeys(AUDIO_URL_PATTERN.findall(all_text_scope)))
    raw_socials = list(dict.fromkeys(SOCIAL_URL_PATTERN.findall(html_markup)))

    categorized_socials = []
    for s in raw_socials:
        s_lower = s.lower()
        platform = "other"
        if "discord" in s_lower:
            platform = "discord"
        elif "ko-fi" in s_lower:
            platform = "ko-fi"
        elif "carrd.co" in s_lower:
            platform = "carrd"
        elif "rentry" in s_lower:
            platform = "rentry"
        elif "twitter.com" in s_lower or "x.com" in s_lower:
            platform = "x/twitter"
        elif "patreon" in s_lower:
            platform = "patreon"
        elif "github" in s_lower:
            platform = "github"
        categorized_socials.append({"platform": platform, "url": s})

    avatar_raw = raw_profile.get("avatar")
    if avatar_raw and isinstance(avatar_raw, str):
        if avatar_raw.startswith("http"):
            avatar_url = avatar_raw
        else:
            avatar_url = f"https://ella.janitorai.com/media-approved/{avatar_raw}"
    else:
        avatar_url = "https://janitorai.com/static/images/default-avatar.png"

    banner_img = native_style.get("background_image")
    if banner_img and not str(banner_img).startswith("http"):
        banner_url = f"https://ella.janitorai.com/media-approved/{banner_img}"
    elif banner_img:
        banner_url = str(banner_img)
    else:
        banner_url = raw_images[0] if raw_images else None

    # 4. Pure Custom Profile Code (strictly the About Me CSS & DIVs people use for custom profiles)
    custom_profile_code = raw_about.strip()
    if combined_css and "<style" not in custom_profile_code.lower():
        custom_profile_code = f"<style>\n{combined_css}\n</style>\n\n{html_markup}".strip()
    html_bundle = custom_profile_code

    # 5. LLM AI Prompt Context
    vars_block = "\n".join([f"  {k}: {v};" for k, v in css_variables.items()]) if css_variables else "  /* No root variables declared */"
    fonts_list = "\n".join([f"- {f}" for f in font_imports]) if font_imports else "- Standard system fonts"
    keyframes_list = ", ".join(keyframes) if keyframes else "None"
    socials_list = "\n".join([f"- **{s['platform']}**: {s['url']}" for s in categorized_socials]) if categorized_socials else "- None detected"

    ai_markdown = f"""# JanitorAI Profile Architecture & CSS Specification
**Creator**: {display_name} (@{username})
**Profile ID**: `{cid}`
**URL**: https://janitorai.com/profiles/{cid}
**Followers**: {int(raw_profile.get('followers_count') or 0)}

---

## 1. Design System & CSS Tokens
- **Keyframe Animations**: `{keyframes_list}`
- **Imported Fonts**:
{fonts_list}
- **Native Theme Settings**: Text `{native_style.get('text_color', 'default')}`, Background `{native_style.get('background_color', 'default')}`
- **CSS Variables / Design Tokens**:
```css
:root {{
{vars_block}
}}
```

---

## 2. Structural HTML Markup (DIVs & Layout Hierarchy)
```html
{html_markup}
```

---

## 3. Extracted Custom CSS Stylesheet
```css
{combined_css}
```

---

## 4. Bio Plain Text (Unformatted)
> {clean_text[:500]}{'...' if len(clean_text) > 500 else ''}

---

## 5. Media & External References
- **Avatar**: {avatar_url}
- **Banner**: {banner_url or 'None'}
- **External Links**:
{socials_list}

---

## 6. Guidelines for AI Assistants
- **Style Replication**: Use the exact class hierarchy from the HTML block with the styling rules from the CSS block.
- **Scoping**: Note how creator classes (e.g. `.custom-inject-root`, `.profile-page-container`) scope font colors, borders, and glassmorphism panels.
- **Animation Portability**: Any keyframes listed under section 1 are defined in section 3.
"""

    return {
        "success": True,
        "creator": {
            "id": cid,
            "username": username,
            "displayName": display_name,
            "avatar": avatar_url,
            "banner": banner_url,
            "isVerified": bool(raw_profile.get("is_verified") or raw_profile.get("creator_verified")),
            "hasPlus": bool(raw_profile.get("plusbadge") or raw_profile.get("creator_plusbadge")),
            "followersCount": int(raw_profile.get("followers_count") or 0),
            "createdAt": raw_profile.get("created_at"),
            "janitorUrl": f"https://janitorai.com/profiles/{cid}"
        },
        "css": combined_css,
        "divs": html_markup,
        "code": custom_profile_code,
        "bundle": custom_profile_code,
        "styling": {
            "css": combined_css,
            "styleTagCount": len(style_blocks),
            "keyframes": keyframes,
            "fontImports": font_imports,
            "cssVariables": css_variables,
            "nativeJanitorStyle": {
                "textColor": native_style.get("text_color"),
                "backgroundColor": native_style.get("background_color"),
                "backgroundImage": native_style.get("background_image"),
                "backgroundBlur": native_style.get("background_blur"),
                "backgroundOpacity": native_style.get("background_opacity")
            }
        },
        "markup": {
            "html": html_markup,
            "cleanText": clean_text,
            "divCount": div_count,
            "socialLinks": categorized_socials
        },
        "assets": {
            "images": raw_images,
            "audio": raw_audio,
            "totalImages": len(raw_images),
            "totalAudio": len(raw_audio)
        },
        "bundle": html_bundle,
        "raw": {
            "aboutMe": raw_about,
            "characterCount": len(raw_about)
        },
        "ai_context": ai_markdown,
        "meta": {
            "extractedAt": datetime.now(timezone.utc).isoformat()
        }
    }


def render_atelier_docs_html() -> str:
    """Renders the sleek, interactive Atelier documentation console."""
    return """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atelier — Discreet Profile Style & DIVs Extraction API</title>
  <style>
    :root {
      --bg: #090a0f;
      --card-bg: #12141c;
      --border: #232736;
      --accent: #a855f7;
      --accent-glow: rgba(168, 85, 247, 0.25);
      --pink: #ec4899;
      --text: #f3f4f6;
      --muted: #9ca3af;
      --code-bg: #050608;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      padding: 30px 20px;
    }
    .container { max-width: 980px; margin: 0 auto; }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #fff 30%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .tagline { color: var(--muted); font-size: 14px; margin-top: 4px; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background: var(--accent-glow);
      color: #d8b4fe;
      border: 1px solid rgba(168,85,247,0.3);
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 28px;
    }
    h2 { font-size: 18px; margin-bottom: 14px; color: #fff; }
    p { font-size: 14px; color: var(--muted); margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media(max-width: 720px) { .grid { grid-template-columns: 1fr; } }
    
    /* Interactive Tester */
    .tester-row { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
    input[type="text"] {
      flex: 1;
      min-width: 260px;
      background: var(--code-bg);
      border: 1px solid var(--border);
      color: #fff;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      outline: none;
    }
    input[type="text"]:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-glow); }
    select {
      background: var(--code-bg);
      border: 1px solid var(--border);
      color: #fff;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      outline: none;
      cursor: pointer;
    }
    button.btn {
      background: linear-gradient(135deg, var(--accent), var(--pink));
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    button.btn:hover { opacity: 0.9; }
    .output-box {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #d1d5db;
      max-height: 400px;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border); }
    th { color: var(--muted); font-weight: 600; text-transform: uppercase; font-size: 11px; }
    code {
      font-family: ui-monospace, SFMono-Regular, monospace;
      background: rgba(255,255,255,0.06);
      padding: 2px 6px;
      border-radius: 4px;
      color: #e9d5ff;
      font-size: 12px;
    }
    pre {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 12px;
      color: #d1d5db;
      overflow-x: auto;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>Atelier API</h1>
        <div class="tagline">Discreet JanitorAI Profile Style, Keyframe Animations & DIV Structure Extraction Engine</div>
      </div>
      <div style="display:flex;gap:8px;">
        <span class="badge">DISCREET ENDPOINT</span>
        <span class="badge" style="background:rgba(16,185,129,0.15);color:#6ee7b7;border-color:rgba(16,185,129,0.3);">ACTIVE</span>
      </div>
    </header>

    <!-- LIVE TESTER -->
    <div class="card">
      <h2>Interactive Query Console</h2>
      <p>Test the extraction engine with any Janitor profile link, raw UUID, username, or bot character URL.</p>
      <div class="tester-row">
        <input id="test-target" type="text" placeholder="Janitor URL, UUID, or @username..." value="https://janitorai.com/profiles/20394fdf-c461-468d-a720-db53940be487_profile-of-lucid-67" />
        <select id="test-format">
          <option value="json">Format: JSON (Full Data)</option>
          <option value="css">Format: CSS (Stylesheets)</option>
          <option value="html">Format: HTML (DIVs Only)</option>
          <option value="ai">Format: Markdown (AI Prompt)</option>
          <option value="bundle">Format: HTML Bundle (Preview)</option>
        </select>
        <button class="btn" onclick="runAtelierQuery()">Run Query</button>
      </div>
      <div id="test-output" class="output-box">// Response will appear here...</div>
    </div>

    <!-- SPECIFICATION -->
    <div class="card">
      <h2>Endpoints & Aliases</h2>
      <p>Accessible via multiple non-obvious route aliases designed to be discreet:</p>
      <table>
        <thead>
          <tr>
            <th>Primary Route</th>
            <th>Aliases</th>
            <th>Methods</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>/atelier</code></td>
            <td><code>/arcana</code>, <code>/tapestry</code>, <code>/solarium</code></td>
            <td><code>GET</code>, <code>POST</code></td>
            <td>Extracts CSS, HTML DIVs, keyframes, tokens, and assets for any target profile.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PARAMETERS -->
    <div class="card">
      <h2>Request Parameters</h2>
      <table>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>target</code></td>
            <td>string</td>
            <td>Yes</td>
            <td>Profile URL, UUID, <code>@username</code>, or Bot URL/UUID fallback.</td>
          </tr>
          <tr>
            <td><code>format</code></td>
            <td>string</td>
            <td>No</td>
            <td><code>json</code> (default), <code>css</code>, <code>html</code>, <code>bundle</code>, or <code>ai</code> / <code>markdown</code>.</td>
          </tr>
          <tr>
            <td><code>docs</code></td>
            <td>boolean</td>
            <td>No</td>
            <td>Set <code>true</code> (or omit <code>target</code>) to return API documentation.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- CODE SNIPPETS -->
    <div class="card">
      <h2>Client & AI Integration Examples</h2>
      
      <p><strong>1. cURL:</strong></p>
      <pre><code>curl -s "http://127.0.0.1:12345/atelier?target=@lucid67"</code></pre>

      <p style="margin-top:16px;"><strong>2. cURL (Raw CSS Only):</strong></p>
      <pre><code>curl -s "http://127.0.0.1:12345/atelier?target=@lucid67&format=css" > lucid_profile.css</code></pre>

      <p style="margin-top:16px;"><strong>3. Python:</strong></p>
      <pre><code>import requests

res = requests.get("http://127.0.0.1:12345/atelier", params={
    "target": "@lucid67",
    "format": "json"
}).json()

css = res["styling"]["css"]
html_markup = res["markup"]["html"]
keyframes = res["styling"]["keyframes"]
print(f"Extracted {len(css)} chars of CSS and {len(html_markup)} chars of HTML!")</code></pre>

      <p style="margin-top:16px;"><strong>4. AI Function / Tool Definition (OpenAI & Anthropic Schema):</strong></p>
      <pre><code>{
  "name": "extract_janitor_profile_style",
  "description": "Extracts custom CSS stylesheets, HTML DIV markup, and keyframes of any JanitorAI creator profile.",
  "parameters": {
    "type": "object",
    "properties": {
      "target": {
        "type": "string",
        "description": "JanitorAI profile URL, creator UUID, or username handle."
      },
      "format": {
        "type": "string",
        "enum": ["json", "css", "html", "bundle", "ai"],
        "description": "Output format."
      }
    },
    "required": ["target"]
  }
}</code></pre>
    </div>
  </div>

  <script>
    async function runAtelierQuery() {
      const target = document.getElementById('test-target').value.trim();
      const format = document.getElementById('test-format').value;
      const out = document.getElementById('test-output');
      if (!target) return alert('Please enter a target URL, UUID, or username.');

      out.textContent = 'Extracting profile style & structure...';
      try {
        const res = await fetch(`/atelier?target=${encodeURIComponent(target)}&format=${format}`);
        if (format === 'json') {
          const data = await res.json();
          out.textContent = JSON.stringify(data, null, 2);
        } else {
          const txt = await res.text();
          out.textContent = txt;
        }
      } catch (err) {
        out.textContent = 'Request failed: ' + err.message;
      }
    }
  </script>
</body>
</html>"""


# ---------------------------------------------------------------------------
# HTTP REQUEST HANDLER
# ---------------------------------------------------------------------------

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

    def do_HEAD(self):
        clean_path = urllib.parse.urlparse(self.path).path.lstrip("/")
        base_name = os.path.basename(clean_path).lower()
        if (
            base_name.endswith((".py", ".sh", ".service", ".bat", ".jsonc", ".env", ".key", ".txt", ".md"))
            or base_name.startswith(".")
            or "/." in self.path
        ):
            self.send_error(404, "Not Found")
            return
        super().do_HEAD()

    def do_GET(self):
        # 1. Health check
        if self.path == "/api/health":
            self.send_response(200)
            self._set_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"healthy","service":"Export Suite","version":"1.1.0"}')
            return

        # 2. Discreet Atelier Profile Style Extraction Engine
        if (
            self.path == "/atelier" or self.path.startswith("/atelier?") or self.path.startswith("/atelier/") or
            self.path == "/arcana" or self.path.startswith("/arcana?") or self.path.startswith("/arcana/") or
            self.path == "/tapestry" or self.path.startswith("/tapestry?") or self.path.startswith("/tapestry/") or
            self.path == "/solarium" or self.path.startswith("/solarium?") or self.path.startswith("/solarium/")
        ):
            self._handle_atelier()
            return

        # 3. Direct Hampter proxy route or generic proxy route
        if self.path.startswith("/hampter/") or self.path.startswith("/api/proxy"):
            self._handle_proxy()
            return

        # 4. Block access to server code, hidden files, or sensitive extensions
        clean_path = urllib.parse.urlparse(self.path).path.lstrip("/")
        base_name = os.path.basename(clean_path).lower()
        if (
            base_name.endswith((".py", ".sh", ".service", ".bat", ".jsonc", ".env", ".key", ".txt", ".md"))
            or base_name.startswith(".")
            or "/." in self.path
        ):
            self.send_error(404, "Not Found")
            return

        # Fallback to serving static files
        super().do_GET()

    def do_POST(self):
        # 1. Discreet Atelier Profile Style Extraction Engine (POST support)
        if (
            self.path == "/atelier" or self.path.startswith("/atelier?") or self.path.startswith("/atelier/") or
            self.path == "/arcana" or self.path.startswith("/arcana?") or self.path.startswith("/arcana/") or
            self.path == "/tapestry" or self.path.startswith("/tapestry?") or self.path.startswith("/tapestry/") or
            self.path == "/solarium" or self.path.startswith("/solarium?") or self.path.startswith("/solarium/")
        ):
            self._handle_atelier()
            return

        # 2. Hampter Proxy
        if self.path.startswith("/hampter/") or self.path.startswith("/api/proxy"):
            self._handle_proxy()
            return

        self.send_error(404, "Endpoint Not Found")

    def _handle_atelier(self):
        """Processes requests for the discreet Atelier Profile Style & DIV Extraction API."""
        parsed = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(parsed.query)

        target = None
        fmt = "json"
        is_docs_request = False

        # Extract target from query string
        for k in ("target", "url", "id", "user", "username", "profile", "q"):
            if k in qs and qs[k]:
                target = qs[k][0].strip()
                break

        # Extract target from path (e.g. /atelier/<target>)
        if not target:
            path_parts = [p for p in parsed.path.strip("/").split("/") if p]
            if len(path_parts) > 1:
                target = urllib.parse.unquote("/".join(path_parts[1:])).strip()

        # Extract format
        if "format" in qs and qs["format"]:
            fmt = qs["format"][0].strip().lower()

        # Extract docs flag
        if "docs" in qs and qs["docs"][0].lower() in ("1", "true", "yes"):
            is_docs_request = True

        # Parse POST body if target still missing
        if self.command == "POST":
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 0:
                raw_post = self.rfile.read(content_length).decode("utf-8", errors="ignore")
                try:
                    json_data = json.loads(raw_post)
                    if isinstance(json_data, dict):
                        target = target or json_data.get("target") or json_data.get("url") or json_data.get("id") or json_data.get("username")
                        fmt = json_data.get("format", fmt).strip().lower()
                        if json_data.get("docs"):
                            is_docs_request = True
                except Exception:
                    # Form data fallback
                    post_qs = urllib.parse.parse_qs(raw_post)
                    for k in ("target", "url", "id", "user", "username", "profile", "q"):
                        if k in post_qs and post_qs[k]:
                            target = target or post_qs[k][0].strip()
                            break
                    if "format" in post_qs:
                        fmt = post_qs["format"][0].strip().lower()

        # Check if caller wants documentation (empty target or ?docs=true)
        if is_docs_request or not target:
            accept_header = self.headers.get("Accept", "").lower()
            if "text/html" in accept_header and fmt != "json":
                html_docs = render_atelier_docs_html().encode("utf-8")
                self.send_response(200)
                self._set_cors_headers()
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(html_docs)))
                self.end_headers()
                self.wfile.write(html_docs)
                return
            else:
                docs_dict = {
                    "name": "Atelier — JanitorAI Profile Style & Layout Extraction Engine",
                    "status": "operational",
                    "discreetRoutes": ["/atelier", "/arcana", "/tapestry", "/solarium"],
                    "methods": ["GET", "POST"],
                    "parameters": {
                        "target": "Janitor profile URL, UUID, @username, or character bot URL/UUID fallback.",
                        "format": "json (default), css, html, bundle, or ai / markdown"
                    },
                    "examples": {
                        "curl_json": f"curl -s 'http://{self.headers.get('Host', '127.0.0.1:12345')}/atelier?target=@lucid67'",
                        "curl_css": f"curl -s 'http://{self.headers.get('Host', '127.0.0.1:12345')}/atelier?target=@lucid67&format=css'",
                        "curl_bundle": f"curl -s 'http://{self.headers.get('Host', '127.0.0.1:12345')}/atelier?target=@lucid67&format=bundle'"
                    }
                }
                out_bytes = json.dumps(docs_dict, indent=2).encode("utf-8")
                self.send_response(200)
                self._set_cors_headers()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(out_bytes)))
                self.end_headers()
                self.wfile.write(out_bytes)
                return

        # Extract caller auth token if passed
        caller_token = None
        auth_header = self.headers.get("Authorization")
        if auth_header and auth_header.lower().startswith("bearer "):
            caller_token = auth_header[7:].strip()
        elif self.headers.get("X-Janitor-Token"):
            caller_token = self.headers.get("X-Janitor-Token").strip()

        # Resolve target
        raw_profile, resolved_id = resolve_creator_target(target, caller_token)
        if not raw_profile or not raw_profile.get("id"):
            err_payload = json.dumps({
                "error": "Creator profile could not be found or resolved.",
                "target": target,
                "hint": "Provide a valid Janitor profile URL (e.g. https://janitorai.com/profiles/<uuid>...), a raw creator UUID, or creator username."
            }, indent=2).encode("utf-8")
            self.send_response(404)
            self._set_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(err_payload)))
            self.end_headers()
            self.wfile.write(err_payload)
            return

        # Run extraction
        result = extract_atelier_data(raw_profile)

        # Dispatch output format
        if fmt == "css":
            css_data = result["styling"]["css"].encode("utf-8")
            self.send_response(200)
            self._set_cors_headers()
            self.send_header("Content-Type", "text/css; charset=utf-8")
            self.send_header("Content-Length", str(len(css_data)))
            self.end_headers()
            self.wfile.write(css_data)
        elif fmt in ("html", "div", "divs", "markup"):
            html_data = result["divs"].encode("utf-8")
            self.send_response(200)
            self._set_cors_headers()
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(html_data)))
            self.end_headers()
            self.wfile.write(html_data)
        elif fmt in ("bundle", "code", "raw"):
            bundle_data = result["code"].encode("utf-8")
            self.send_response(200)
            self._set_cors_headers()
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(bundle_data)))
            self.end_headers()
            self.wfile.write(bundle_data)
        elif fmt in ("ai", "markdown", "md"):
            md_data = result["ai_context"].encode("utf-8")
            self.send_response(200)
            self._set_cors_headers()
            self.send_header("Content-Type", "text/markdown; charset=utf-8")
            self.send_header("Content-Length", str(len(md_data)))
            self.end_headers()
            self.wfile.write(md_data)
        else:
            json_data = json.dumps(result, indent=2).encode("utf-8")
            self.send_response(200)
            self._set_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(json_data)))
            self.end_headers()
            self.wfile.write(json_data)

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

        # 2. Extract Authorization Bearer if supplied, or fallback to hosted token
        auth_header = self.headers.get("Authorization")
        if not auth_header and self.headers.get("X-Janitor-Token"):
            custom_tok = self.headers.get("X-Janitor-Token").strip()
            auth_header = f"Bearer {custom_tok}"

        if not auth_header:
            hosted_tok = get_hosted_jaitoken()
            if hosted_tok:
                auth_header = f"Bearer {hosted_tok}"

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
                raw_body = upstream_resp.read()
                is_html = raw_body.lstrip().startswith(b"<!doctype") or raw_body.lstrip().startswith(b"<html") or b"janitor is managing traffic" in raw_body
                if is_html:
                    self.send_response(503 if b"janitor is managing traffic" in raw_body else 404)
                    self._set_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    err_msg = "JanitorAI is currently managing high traffic (Cloudflare Waiting Room active). Please wait a moment and try again." if b"janitor is managing traffic" in raw_body else "Janitor upstream returned an HTML page instead of JSON."
                    self.wfile.write(json.dumps({"error": err_msg, "statusCode": 503 if b"janitor is managing traffic" in raw_body else 404}).encode("utf-8"))
                    return

                self.send_response(upstream_resp.status)
                self._set_cors_headers()
                for header_key, header_val in upstream_resp.getheaders():
                    if header_key.lower() in ("content-type", "content-disposition", "cache-control", "last-modified", "etag"):
                        self.send_header(header_key, header_val)
                self.end_headers()
                self.wfile.write(raw_body)
        except urllib.error.HTTPError as http_err:
            raw_err = http_err.read()
            is_err_html = raw_err.lstrip().startswith(b"<!doctype") or raw_err.lstrip().startswith(b"<html")
            self.send_response(http_err.code)
            self._set_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            if is_err_html:
                err_msg = "JanitorAI is currently managing high traffic (Cloudflare Waiting Room active). Please retry shortly." if b"janitor is managing traffic" in raw_err else f"Upstream returned HTTP {http_err.code}"
                self.wfile.write(json.dumps({"error": err_msg, "statusCode": http_err.code}).encode("utf-8"))
            else:
                self.wfile.write(raw_err)
        except Exception as err:
            self.send_response(502)
            self._set_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            err_data = json.dumps({"error": f"Proxy Gateway Failure: {str(err)}", "statusCode": 502}).encode("utf-8")
            self.wfile.write(err_data)


def main():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), ExportHandler) as httpd:
        print("=" * 64)
        print("  ⚡ EXPORT — JanitorAI Backup Suite & CSS Extractor")
        print("=" * 64)
        print(f"  • Local Web UI:    http://127.0.0.1:{PORT}")
        print(f"  • CORS Proxy:      http://127.0.0.1:{PORT}/hampter/*")
        print(f"  • Discreet Atelier: http://127.0.0.1:{PORT}/atelier")
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
