# Export — JanitorAI Backup Suite & CSS Studio

A privacy-first, zero-knowledge backup and export engine for [JanitorAI](https://janitorai.com). Compile public, unlisted, and private characters into drop-in **SillyTavern Character Card V2 PNGs**, export lorebooks to World Info JSON, back up custom personas, and extract creator profile CSS styling with a live sandbox preview.

![Export Banner](assets/banner.png)

---

## ⚡ Highlights

- **🔒 Zero-Knowledge Privacy**: Tokens and definitions are handled strictly in volatile browser memory. Zero database writes, zero disk storage, zero tracking.
- **🗃️ SillyTavern V2 Compliant**: Embeds raw character definitions, alternate greetings, and tags directly into the PNG image metadata (`tEXt` / `chara` chunk) in pure JavaScript.
- **🛡️ Public & Private Scope**: Filter between public bots, unlisted drafts, and secret characters with full prompt unmasking.
- **📖 Lorebooks & Scripts**: Converts JanitorAI scripts into standardized SillyTavern World Info JSON formats.
- **👤 Custom Personas**: Backs up user personas and associated avatars.
- **🎨 Profile CSS Studio**: Paste any creator link (or `@username`) to extract, clean, and export their custom "About Me" CSS stylesheet, download the `.css` file, or preview the styling live in an isolated sandbox.
- **🚀 Memory-Safe Concurrency**: Chunked batch queue with automatic Cloudflare 429 jitter to safely export 200+ bots without browser tab crashes.

---

## 🚀 Quickstart

### Option 1: Standalone Web App (No Installation)
Visit the live hosted instance at:
👉 **[https://export.domcord.org](https://export.domcord.org)**

Or simply double-click `index.html` in your favorite browser.

---

### Option 2: Local Companion Server (Zero-CORS Runner)

The companion server runs locally using Python's standard library (no `pip install` required):

#### Windows
Double-click `run.bat` or open Command Prompt:
```cmd
python server.py
```

#### Linux & macOS
Run the launcher script:
```bash
chmod +x run.sh
./run.sh
```

Your browser will automatically open to `http://127.0.0.1:8095`.

---

## 📦 What the Exported Archive Contains

When you export your library, Export generates a clean, organized `.zip` file ready for SillyTavern, RisuAI, Agnaistic, or offline cold storage:

```
JanitorAI_Backup_[Date].zip
├── 📁 characters/
│   ├── 📁 sillytavern_png/             <-- Character Card V2 PNGs with embedded chara chunk
│   │   ├── Alistair_v2.png
│   │   └── ...
│   └── 📁 raw_json/                    <-- Unmasked raw definitions & greetings
│       ├── Alistair_a1b2c3d4.json
│       └── ...
├── 📁 lorebooks/                       <-- World Info JSONs & raw Janitor scripts
│   ├── SillyTavern_Cyberpunk_Lore.json
│   └── Janitor_Cyberpunk_Lore.json
├── 📁 personas/                        <-- User personas and avatar images
│   ├── Main_Persona.json
│   └── Main_Persona_avatar.png
└── 📄 manifest.json                    <-- Full backup metadata and item catalog
```

---

## 🎨 Profile CSS Studio

Want to inspect or export a creator's custom profile theme?
1. Click the **Profile CSS Studio** tab.
2. Paste any JanitorAI profile URL (e.g. `https://janitorai.com/profiles/19e6816f-7d70-40ea-a3e1-20ececd48ed6`) or `@handle`.
3. Click **Extract Custom CSS & Bio**.
4. Instantly view rule metrics, copy clean formatted CSS, download the `.css` file, or toggle the **Live Sandbox Preview** to see the custom profile rendered live!

---

## 🔒 Security & Token Safety

1. **In-Memory Volatility**: Your Supabase JWT session token is stored only in browser `sessionStorage` or JavaScript runtime memory. Closing the browser tab destroys the token reference.
2. **Stateless Relay**: When using the local companion server or cloud gateway, requests are proxied in-stream with headers forwarded. The proxy stores 0 bytes of logs or data.
3. **No External Tracking**: No Google Analytics, no third-party trackers, and no telemetry scripts.

---

## 📄 License

MIT License. Built for the JanitorAI and SillyTavern AI community.
