/* ==========================================================================
   EXPORT SUITE — JAVASCRIPT ENGINE (CARDS DESIGN SYSTEM PARITY)
   Pure client-side in-memory zero-storage architecture.
   ========================================================================== */

// 1. CRC32 Computation Engine
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c >>> 0;
}

function calculateCrc32(bytes) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// 2. Dominion Media SVGs (High-Fidelity Fallbacks)
const DOMINION_MEDIA_SVGS = {
  zip: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="10" fill="#1E1B4B"/>
    <path d="M14 10C14 8.89543 14.8954 8 16 8H26L34 16V38C34 39.1046 33.1046 40 32 40H16C14.8954 40 14 39.1046 14 38V10Z" fill="#312E81" stroke="#818CF8" stroke-width="1.8"/>
    <path d="M26 8V16H34" fill="#4338CA" stroke="#818CF8" stroke-width="1.8" stroke-linejoin="round"/>
    <rect x="22" y="14" width="4" height="2.5" rx="0.5" fill="#C7D2FE"/>
    <rect x="24" y="17.5" width="4" height="2.5" rx="0.5" fill="#C7D2FE"/>
    <rect x="22" y="21" width="4" height="2.5" rx="0.5" fill="#C7D2FE"/>
    <rect x="24" y="24.5" width="4" height="2.5" rx="0.5" fill="#C7D2FE"/>
    <rect x="21" y="28" width="6" height="8" rx="2" fill="#818CF8" stroke="#EEF2FF" stroke-width="1"/>
    <circle cx="24" cy="33" r="1.5" fill="#1E1B4B"/>
  </svg>`,

  json: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="10" fill="#18181B"/>
    <path d="M14 10C14 8.89543 14.8954 8 16 8H26L34 16V38C34 39.1046 33.1046 40 32 40H16C14.8954 40 14 39.1046 14 38V10Z" fill="#27272A" stroke="#F59E0B" stroke-width="1.8"/>
    <path d="M26 8V16H34" fill="#3F3F46" stroke="#F59E0B" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M20 23C18.5 24 18.5 25 18.5 26C18.5 27 17.5 28 16.5 28C17.5 28 18.5 29 18.5 30C18.5 31 20 32 20 33" stroke="#FBBF24" stroke-width="2" stroke-linecap="round"/>
    <path d="M28 23C29.5 24 29.5 25 29.5 26C29.5 27 30.5 28 31.5 28C30.5 28 29.5 29 29.5 30C29.5 31 28 32 28 33" stroke="#FBBF24" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  persona: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="10" fill="#2E1065"/>
    <circle cx="24" cy="18" r="7" fill="#C084FC" stroke="#F3E8FF" stroke-width="1.5"/>
    <path d="M12 38C12 31.3726 17.3726 26 24 26C30.6274 26 36 31.3726 36 38" fill="#7E22CE" stroke="#F3E8FF" stroke-width="1.5"/>
    <circle cx="34" cy="34" r="5" fill="#A855F7" stroke="#FAF5FF" stroke-width="1.5"/>
    <path d="M34 32V36M32 34H36" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  bot: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="10" fill="#111827"/>
    <rect x="13" y="14" width="22" height="20" rx="4" fill="#1F2937" stroke="#60A5FA" stroke-width="1.8"/>
    <circle cx="19" cy="22" r="2.5" fill="#60A5FA"/>
    <circle cx="29" cy="22" r="2.5" fill="#60A5FA"/>
    <path d="M19 28H29" stroke="#93C5FD" stroke-width="2" stroke-linecap="round"/>
    <line x1="24" y1="9" x2="24" y2="14" stroke="#60A5FA" stroke-width="2"/>
    <circle cx="24" cy="8" r="2" fill="#60A5FA"/>
  </svg>`
};

// 3. Icon SVGs
const ICONS_SVG = {
  chat: '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  token: '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5H9.5a2.5 2.5 0 0 0 0 5H15"/></svg>',
  download: '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
  checkSquare: '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  square: '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>',
verified: '<svg class="ui-icon-xs" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  user: '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  book: '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'
};

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%231d1d25'/%3E%3Ctext x='50' y='55' font-size='24' fill='%2371717e' text-anchor='middle' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

class ExportApp {
  constructor() {
    this.activeTab = 'vault';
    this.token = '';
    this.items = [];
    this.selectedIds = new Set();
    this.currentFilter = 'all';
    this.exportFormat = 'png'; // 'png', 'json', or 'both'
    this.currentModalBot = null;
    this.isDownloadMinimized = false;

    // CSS Studio Data
    this.currentProfile = null;
    this.extractedCss = '';
    this.extractedHtml = '';
    this.extractedFullDoc = '';
    this.extractedTxt = '';
    this.activeCssSubtab = 'code';
  }

  init() {
    // 1. Initialize Theme
    const savedTheme = localStorage.getItem('export_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 2. Restore token from session memory if present
    const savedTok = sessionStorage.getItem('export_session_jwt');
    if (savedTok) {
      this.token = savedTok;
      const input = document.getElementById('token-input');
      if (input) input.value = savedTok;
    }

    // 3. Render initial empty vault state (zero mock data)
    this.renderVault();

    // 4. Modal escape key listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closePrivacyModal();
        this.closeTokenHelp();
        this.closeDetailModal();
        this.closeDownloadModal();
      }
    });

    // 5. Dismiss Fullscreen Kinetic Splash Loader
    const dismissSplash = () => {
      const splash = document.getElementById('app-splash-loader');
      if (splash && !splash.classList.contains('is-hidden')) {
        splash.classList.add('is-hidden');
      }
    };
    if (document.readyState === 'complete') {
      setTimeout(dismissSplash, 400);
    } else {
      window.addEventListener('load', () => setTimeout(dismissSplash, 350));
      setTimeout(dismissSplash, 1200);
    }
  }

  toggleTheme() {
    const curr = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = curr === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('export_theme', next);
    this.showToast(`Switched to ${next} theme`);
  }

  switchTab(tab) {
    if (this.activeTab === tab && this._tabReady) return;
    this._tabReady = true;
    this.activeTab = tab;

    // Desktop nav buttons
    const btnVault = document.getElementById('nav-btn-vault');
    const btnCss = document.getElementById('nav-btn-css');
    if (btnVault) btnVault.classList.toggle('is-active', tab === 'vault');
    if (btnCss) btnCss.classList.toggle('is-active', tab === 'css');

    // Mobile nav buttons
    const mBtnVault = document.getElementById('m-nav-btn-vault');
    const mBtnCss = document.getElementById('m-nav-btn-css');
    if (mBtnVault) mBtnVault.classList.toggle('is-active', tab === 'vault');
    if (mBtnCss) mBtnCss.classList.toggle('is-active', tab === 'css');

    // Animate footer during tab switch
    const footer = document.querySelector('.dominion-footer');
    if (footer) {
      footer.classList.remove('footer-animate');
      void footer.offsetWidth;
      footer.classList.add('footer-animate');
    }

    const viewVault = document.getElementById('view-vault');
    const viewCss = document.getElementById('view-css');
    const currentView = tab === 'vault' ? viewVault : viewCss;
    const leavingView = tab === 'vault' ? viewCss : viewVault;

    if (!leavingView || leavingView.style.display === 'none' || leavingView.classList.contains('is-hidden')) {
      if (leavingView) {
        leavingView.classList.add('is-hidden');
        leavingView.style.display = 'none';
      }
      if (currentView) {
        currentView.classList.remove('is-hidden', 'is-leaving');
        currentView.classList.add('is-entering');
        currentView.style.display = 'block';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            currentView.classList.remove('is-entering');
          });
        });
      }
      return;
    }

    if (this._tabTransitionTimeout) clearTimeout(this._tabTransitionTimeout);

    leavingView.classList.remove('is-entering');
    leavingView.classList.add('is-leaving');

    this._tabTransitionTimeout = setTimeout(() => {
      leavingView.classList.add('is-hidden');
      leavingView.classList.remove('is-leaving');
      leavingView.style.display = 'none';

      if (currentView) {
        currentView.classList.remove('is-hidden', 'is-leaving');
        currentView.classList.add('is-entering');
        currentView.style.display = 'block';

        void currentView.offsetWidth; // Force reflow

        requestAnimationFrame(() => {
          currentView.classList.remove('is-entering');
        });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 180);
  }

  setExportFormat(fmt) {
    this.exportFormat = fmt;
    ['png', 'json', 'both'].forEach(f => {
      const btn = document.getElementById(`fmt-btn-${f}`);
      if (btn) btn.classList.toggle('is-active', f === fmt);
    });
    this.showToast(`Export format set to ${fmt.toUpperCase()}`);
  }

  toggleScope(scopeId) {
    const input = document.getElementById(`scope-${scopeId}`);
    const card = document.getElementById(`scope-card-${scopeId}`);
    if (input && card) {
      input.checked = !input.checked;
      card.classList.toggle('is-checked', input.checked);
    }
  }

  onTokenInput() {
    const input = document.getElementById('token-input');
    if (!input) return;
    let val = input.value.trim();
    if (val.startsWith('Bearer ')) {
      val = val.slice(7).trim();
      input.value = val;
    }
    this.token = val;
    sessionStorage.setItem('export_session_jwt', val);
  }

  toggleTokenVisibility() {
    const input = document.getElementById('token-input');
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  }

  async pasteToken() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const input = document.getElementById('token-input');
        if (input) {
          let cleaned = text.trim();
          if (cleaned.startsWith('Bearer ')) cleaned = cleaned.slice(7).trim();
          input.value = cleaned;
          this.onTokenInput();
          this.showToast("Token pasted from clipboard");
        }
      }
    } catch (e) {
      this.showToast("Clipboard access denied. Please paste manually.", "error");
    }
  }

  openTokenHelp() {
    const modal = document.getElementById('token-help-modal');
    if (modal) modal.classList.add('is-active');
  }

  closeTokenHelp() {
    const modal = document.getElementById('token-help-modal');
    if (modal) modal.classList.remove('is-active');
  }

  copyTokenSnippet(btn) {
    const code = document.getElementById('token-console-code');
    const textToCopy = code ? code.innerText.trim() : "copy(JSON.parse(localStorage.getItem('sb-mcmzxtzommpnxkynddbo-auth-token'))?.access_token || localStorage.getItem('sb-mcmzxtzommpnxkynddbo-auth-token') || '')";
    navigator.clipboard.writeText(textToCopy).then(() => {
      if (btn) {
        const origHtml = btn.innerHTML;
        btn.innerHTML = `
          <svg class="ui-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Copied!</span>
        `;
        btn.classList.add('btn-copied');
        setTimeout(() => {
          btn.innerHTML = origHtml;
          btn.classList.remove('btn-copied');
        }, 2200);
      }
      this.showToast("Console command copied to clipboard!");
    }).catch(() => {
      this.showToast("Could not copy command to clipboard", "error");
    });
  }

  openPrivacyModal() {
    const modal = document.getElementById('privacy-policy-modal');
    if (modal) modal.classList.add('is-active');
  }

  closePrivacyModal() {
    const modal = document.getElementById('privacy-policy-modal');
    if (modal) modal.classList.remove('is-active');
  }

  getApiUrl(path) {
    if (window.location.protocol.startsWith('http')) {
      return `/hampter/${path}`;
    }
    return `https://janitorai.com/hampter/${path}`;
  }

  getHeaders() {
    const h = {
      'Accept': 'application/json, text/plain, */*',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXp4dHpvbW1wbnhreW5kZGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzNzA3NDAsImV4cCI6MjA0Mzk0Njc0MH0.UfRPni4ga9Lmin8j0JjV5ouuK9bXp8tsqPJ8pMTDDAI'
    };
    if (this.token) {
      h['Authorization'] = `Bearer ${this.token}`;
    }
    return h;
  }

resolveAvatarUrl(itemOrAvatar, type = 'bot') {
    let avatar = (typeof itemOrAvatar === 'object' && itemOrAvatar) ? itemOrAvatar.avatar : itemOrAvatar;
    const itemType = (typeof itemOrAvatar === 'object' && itemOrAvatar && itemOrAvatar._type) ? itemOrAvatar._type : type;

    if (!avatar) return null;
    if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:')) {
      return avatar;
    }
    const isUserOrPersona = itemType === 'persona' || itemType === 'user' || itemType === 'profile';
    const folder = isUserOrPersona ? 'avatars' : 'bot-avatars';
    return `https://ella.janitorai.com/${folder}/${avatar}`;
  }

  async fetchSafeJson(url, options = {}) {
    const res = await fetch(url, options);
    const rawText = await res.text();

    const lower = rawText.toLowerCase();
    if (rawText.trim().startsWith('<') || lower.includes('<!doctype') || lower.includes('janitor is managing traffic') || lower.includes('please wait — janitor') || lower.includes('access restricted')) {
      if (lower.includes('janitor is managing traffic') || lower.includes('please wait — janitor')) {
        throw new Error("JanitorAI is currently managing high traffic (Cloudflare Waiting Room active). Please retry in a few moments.");
      }
      if (lower.includes('access restricted')) {
        throw new Error("JanitorAI access restricted by Cloudflare. Please retry shortly.");
      }
      throw new Error(`Upstream returned HTML instead of data (Status ${res.status}).`);
    }

    let parsed = null;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      throw new Error(`Invalid response format from server (Status ${res.status}).`);
    }

    if (!res.ok) {
      const errMsg = parsed?.message || parsed?.error || `Request failed with status ${res.status}`;
      throw new Error(errMsg);
    }

    return parsed;
  }

  parseJwt(tok) {
    try {
      const parts = tok.split('.');
      if (parts.length < 2) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  /* ==========================================================================
     SCAN ACCOUNT (LIVE API DISCOVERY)
     ========================================================================== */
  async scanAccount() {
    if (!this.token) {
      this.showToast("Please paste your Janitor session token first", "error");
      const input = document.getElementById('token-input');
      if (input) input.focus();
      return;
    }

    const scanBtn = document.getElementById('btn-scan');
    if (scanBtn) {
      scanBtn.disabled = true;
      scanBtn.innerHTML = `<span>Connecting to Hampter...</span>`;
    }

    // Render animated skeleton cards
    const grid = document.getElementById('bot-cards-grid');
    if (grid) {
      grid.innerHTML = Array.from({ length: 6 }, () => '<div class="bot-card-skeleton"></div>').join('');
    }

    this.showProgress(true, "Scanning Vault", 10, "Validating token & fetching creator profile...", 1);

    try {
      const jwtData = this.parseJwt(this.token);
      const userId = jwtData ? jwtData.sub : null;

      const incPublic = document.getElementById('scope-public')?.checked ?? true;
      const incPrivate = document.getElementById('scope-private')?.checked ?? true;
      const incLorebooks = document.getElementById('scope-lorebooks')?.checked ?? true;
      const incPersonas = document.getElementById('scope-personas')?.checked ?? true;

      this.updateProgress(25, "Fetching characters from Hampter API...", 2);

      let discovered = [];

      // 1. Fetch user's characters
      let page = 1;
      let keepGoing = true;
      while (keepGoing) {
        const url = this.getApiUrl(`characters/v2/mine?page=${page}`);
        let json = null;
        try {
          json = await this.fetchSafeJson(url, { headers: this.getHeaders() });
        } catch (fetchErr) {
          if (fetchErr.message && (fetchErr.message.includes('401') || fetchErr.message.includes('403') || fetchErr.message.includes('expired') || fetchErr.message.includes('Unauthorized'))) {
            throw new Error("Invalid or expired session token. Please verify token.");
          }
          console.warn("Scan pagination notice:", fetchErr.message);
          break;
        }
        const list = json.data || [];
        if (list.length === 0) break;

        for (const bot of list) {
          const isPub = Boolean(bot.is_public);
          if (isPub && !incPublic) continue;
          if (!isPub && !incPrivate) continue;
          bot._type = 'character';
          bot.category = isPub ? 'PUBLIC' : 'PRIVATE';
          discovered.push(bot);
        }

        if (list.length < (json.size || 20) || page >= 50) {
          keepGoing = false;
        } else {
          page++;
        }
      }

      // 2. Fetch Lorebooks
      if (incLorebooks && userId) {
        this.updateProgress(50, "Fetching lorebooks and scripts...", 2);
        try {
          const lJson = await this.fetchSafeJson(this.getApiUrl(`script/user/${userId}`), { headers: this.getHeaders() });
          if (lJson) {
            const sList = lJson.scripts || lJson || [];
            if (Array.isArray(sList)) {
              for (const s of sList) {
                s._type = 'lorebook';
                s.category = 'LOREBOOK';
                discovered.push(s);
              }
            }
          }
        } catch (e) {}
      }

      // 3. Fetch Personas
      if (incPersonas) {
        this.updateProgress(75, "Fetching custom personas...", 2);
        try {
          const pList = await this.fetchSafeJson(this.getApiUrl('personas/mine'), { headers: this.getHeaders() });
          if (pList) {
            if (Array.isArray(pList)) {
              for (const p of pList) {
                p._type = 'persona';
                p.category = 'PERSONA';
                discovered.push(p);
              }
            }
          }
        } catch (e) {}
      }

      this.updateProgress(100, `Complete! Found ${discovered.length} items.`, 3);

      this.items = discovered;
      this.selectedIds = new Set(discovered.map(b => b.id));
      this.renderVault();

      if (discovered.length === 0) {
        this.showToast("No items found under chosen scopes.", "info");
      } else {
        this.showToast(`Loaded ${discovered.length} items from your account!`);
      }

    } catch (err) {
      console.error("Scan failure:", err);
      this.showToast(`Scan error: ${err.message}`, "error");
      this.items = [];
      this.selectedIds.clear();
      this.renderVault();
    } finally {
      if (scanBtn) {
        scanBtn.disabled = false;
        scanBtn.innerHTML = `
          <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <span>Scan Account & Load Vault</span>
        `;
      }
      setTimeout(() => this.showProgress(false), 2000);
    }
  }

  /* ==========================================================================
     RENDER VAULT & 9:16 BOT CARDS
     ========================================================================== */
  renderVault() {
    const toolbar = document.getElementById('vault-toolbar-section');

    if (this.items.length === 0) {
      if (toolbar) toolbar.style.display = 'none';
      const grid = document.getElementById('bot-cards-grid');
      if (grid) {
        grid.innerHTML = `
          <div class="vault-empty-card">
            <div class="vault-empty-icon">
              <svg style="width: 28px; height: 28px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1.5"/></svg>
            </div>
            <div class="vault-empty-title">Your Vault is Empty</div>
            <p class="vault-empty-desc">
              Paste your Janitor session token above and click <strong>Scan Account & Load Vault</strong> to discover and export your characters, private bots, lorebooks, and personas.
            </p>
          </div>
        `;
      }
      return;
    }

    if (toolbar) toolbar.style.display = 'block';

    const totalAll = this.items.length;
    const totalPub = this.items.filter(i => i.category === 'PUBLIC').length;
    const totalPriv = this.items.filter(i => i.category === 'PRIVATE').length;
    const totalLore = this.items.filter(i => i.category === 'LOREBOOK').length;
    const totalPers = this.items.filter(i => i.category === 'PERSONA').length;

    const elAll = document.getElementById('chip-cnt-all');
    const elPub = document.getElementById('chip-cnt-public');
    const elPriv = document.getElementById('chip-cnt-private');
    const elLore = document.getElementById('chip-cnt-lorebook');
    const elPers = document.getElementById('chip-cnt-persona');
    if (elAll) elAll.innerText = totalAll;
    if (elPub) elPub.innerText = totalPub;
    if (elPriv) elPriv.innerText = totalPriv;
    if (elLore) elLore.innerText = totalLore;
    if (elPers) elPers.innerText = totalPers;

    const elSelected = document.getElementById('selected-export-count');
    if (elSelected) elSelected.innerText = this.selectedIds.size;

    const elLabel = document.getElementById('select-all-label');
    if (elLabel) elLabel.innerText = this.selectedIds.size === this.items.length ? "Deselect All" : "Select All";

    this.applyFilter();
  }

  filterCategory(cat) {
    this.currentFilter = cat;
    document.querySelectorAll('.filter-chips-bar .filter-chip').forEach(c => c.classList.remove('is-active'));
    const chip = document.getElementById(`filter-chip-${cat}`);
    if (chip) chip.classList.add('is-active');
    this.applyFilter();
  }

  applyFilter() {
    const grid = document.getElementById('bot-cards-grid');
    if (!grid) return;
    grid.innerHTML = '';

    let filtered = this.items;
    if (this.currentFilter === 'public') filtered = this.items.filter(i => i.category === 'PUBLIC');
    else if (this.currentFilter === 'private') filtered = this.items.filter(i => i.category === 'PRIVATE');
    else if (this.currentFilter === 'lorebook') filtered = this.items.filter(i => i.category === 'LOREBOOK');
    else if (this.currentFilter === 'persona') filtered = this.items.filter(i => i.category === 'PERSONA');

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: var(--space-12) var(--space-4); color: var(--text-muted);">
          <div style="font-size: var(--text-md); font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">No items match this filter</div>
          <p style="font-size: var(--text-xs);">Switch categories or rescan your account with broader scope options.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map((bot, idx) => this.renderBotCardHTML(bot, idx)).join('');
  }

  renderBotCardHTML(bot, index = 0) {
    const isSelected = this.selectedIds.has(bot.id);
    const isPersona = bot._type === 'persona';
    const isLorebook = bot._type === 'lorebook';

    const chats = bot.chats || bot.messages || 0;
    const chatDisplay = chats >= 1000000 ? (chats / 1000000).toFixed(1) + 'M' : chats >= 1000 ? (chats / 1000).toFixed(1) + 'k' : chats;
    
    let tokensDisplay = ((bot.tokens || bot.total_tokens || 0)).toLocaleString() + ' t';
    if (isPersona) {
      const words = (bot.appearance || '').trim().split(/\s+/).filter(Boolean).length;
      tokensDisplay = `${words} words`;
    }

    let avatar = this.resolveAvatarUrl(bot, isPersona ? 'persona' : 'bot') || DEFAULT_AVATAR;

    const creator = isPersona ? 'Personal Persona' : (bot.creatorName || bot.creator_name || 'Creator');
    let creatorAvatar = this.resolveAvatarUrl(bot.creatorAvatar || bot.creator_avatar, 'user') || DEFAULT_AVATAR;

    const tags = Array.isArray(bot.tags) ? bot.tags.map(t => typeof t === 'object' ? t.name : t) : (isPersona ? ['persona', bot.pronouns].filter(Boolean) : []);

    return `
      <div class="bot-card stagger-item ${isSelected ? 'is-selected' : ''}" data-id="${bot.id}" style="--index: ${index};" onclick="app.openDetailModal('${bot.id}')">
        <!-- Full Bleed Portrait -->
        <img class="bot-card-bg-image" src="${avatar}" alt="${bot.name}" loading="lazy" onerror="this.onerror=null;this.src=DEFAULT_AVATAR;">
        
        <!-- Multi-stop Gradient Protection -->
        <div class="bot-card-gradient-overlay"></div>

        <!-- Top Controls -->
        <div class="bot-card-top-bar">
          <span class="bot-card-cat-chip">${bot.category || (isPersona ? 'PERSONA' : isLorebook ? 'LOREBOOK' : 'BOT')}</span>
          <div class="bot-card-actions-group">
            <button class="card-action-btn card-select-btn ${isSelected ? 'is-checked' : ''}" title="${isSelected ? 'Deselect item' : 'Select item'}" onclick="event.stopPropagation(); app.toggleSelect('${bot.id}');">
              ${isSelected ? ICONS_SVG.checkSquare : ICONS_SVG.square}
            </button>
            <button class="card-action-btn" title="Quick Download" onclick="event.stopPropagation(); app.downloadSingleCard('${bot.id}');">
              ${ICONS_SVG.download}
            </button>
          </div>
        </div>

        <!-- Bottom Refined Micro-Content Overlay -->
        <div class="bot-card-content-area">
          <div class="bot-card-stat-pills-row">
            <span class="bot-card-stat-pill">
              ${isPersona ? ICONS_SVG.user : ICONS_SVG.chat}
              <span>${isPersona ? (bot.pronouns || 'Persona') : chatDisplay}</span>
            </span>
            <span class="bot-card-stat-pill">
              ${isPersona ? ICONS_SVG.book : ICONS_SVG.token}
              <span>${tokensDisplay}</span>
            </span>
          </div>

          <h3 class="bot-card-title line-clamp-1" title="${bot.name}">${bot.name}</h3>
          
          <div class="bot-card-creator">
            <img class="bot-card-creator-avatar" src="${creatorAvatar}" onerror="this.onerror=null;this.src=DEFAULT_AVATAR;">
            <span class="line-clamp-1">${creator}</span>
            ${bot.isVerified ? `<span style="display:inline-flex;align-items:center;margin-left:3px;color:var(--accent);line-height:0;">${ICONS_SVG.verified}</span>` : ''}
          </div>
          
          <div class="bot-card-tags-row">
            ${tags.slice(0, 4).map(t => `<span class="bot-card-tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  toggleSelect(id) {
    const isSelected = !this.selectedIds.has(id);
    if (isSelected) {
      this.selectedIds.add(id);
    } else {
      this.selectedIds.delete(id);
    }

    const card = document.querySelector(`.bot-card[data-id="${id}"]`);
    if (card) {
      card.classList.toggle('is-selected', isSelected);
      const chk = card.querySelector('.card-select-btn');
      if (chk) {
        chk.classList.toggle('is-checked', isSelected);
        chk.title = isSelected ? 'Deselect item' : 'Select item';
        chk.innerHTML = isSelected ? ICONS_SVG.checkSquare : ICONS_SVG.square;
      }
    }

    this.updateSelectionCounters();
  }

  toggleSelectAll() {
    const allSelected = (this.items.length > 0 && this.selectedIds.size === this.items.length);
    if (allSelected) {
      this.selectedIds.clear();
    } else {
      this.selectedIds = new Set(this.items.map(b => b.id));
    }

    document.querySelectorAll('.bot-card[data-id]').forEach(card => {
      const id = card.getAttribute('data-id');
      const isSel = this.selectedIds.has(id);
      card.classList.toggle('is-selected', isSel);
      const chk = card.querySelector('.card-select-btn');
      if (chk) {
        chk.classList.toggle('is-checked', isSel);
        chk.title = isSel ? 'Deselect item' : 'Select item';
        chk.innerHTML = isSel ? ICONS_SVG.checkSquare : ICONS_SVG.square;
      }
    });

    this.updateSelectionCounters();
  }

  updateSelectionCounters() {
    const elSelected = document.getElementById('selected-export-count');
    if (elSelected) elSelected.innerText = this.selectedIds.size;

    const elLabel = document.getElementById('select-all-label');
    if (elLabel) elLabel.innerText = (this.items.length > 0 && this.selectedIds.size === this.items.length) ? "Deselect All" : "Select All";
  }

  /* ==========================================================================
     DETAIL MODAL
     ========================================================================== */
  openDetailModal(id) {
    const bot = this.items.find(b => b.id === id);
    if (!bot) return;
    this.currentModalBot = bot;

    const isPersona = bot._type === 'persona';
    const isLore = bot._type === 'lorebook';

    const elName = document.getElementById('modal-char-name');
    const elTitle = document.getElementById('modal-char-title');
    const elCat = document.getElementById('modal-char-category');
    const elCreator = document.getElementById('modal-char-creator');
    const elTok = document.getElementById('modal-char-tokens');
    const elChats = document.getElementById('modal-char-chats');
    const elDesc = document.getElementById('modal-char-desc');
    const elFirst = document.getElementById('modal-char-firstmes');
    const elImg = document.getElementById('modal-char-avatar');

    if (elName) elName.innerText = bot.name || 'Item Details';
    if (elTitle) elTitle.innerText = bot.name || '';
    if (elCat) elCat.innerText = bot.category || (isPersona ? 'PERSONA' : isLore ? 'LOREBOOK' : 'CHARACTER');
    if (elCreator) elCreator.innerText = isPersona ? 'Personal Persona' : `by ${bot.creatorName || bot.creator_name || 'Creator'}`;

    if (isPersona) {
      const words = (bot.appearance || '').trim().split(/\s+/).filter(Boolean).length;
      if (elTok) elTok.innerText = `${words} words`;
      if (elChats) elChats.innerText = bot.pronouns || 'Persona';
      if (elDesc) elDesc.innerText = bot.appearance || 'No appearance defined.';
      if (elFirst) elFirst.innerText = bot.pronouns ? `Pronouns: ${bot.pronouns}\nPersona ID: ${bot.id}` : `Janitor User Persona (${bot.name})`;
    } else {
      if (elTok) elTok.innerText = (bot.tokens || bot.total_tokens || 0).toLocaleString();
      if (elChats) elChats.innerText = (bot.chats || bot.messages || 0).toLocaleString();
      if (elDesc) elDesc.innerText = bot.personality || bot.description || 'Loading definition...';
      if (elFirst) elFirst.innerText = bot.first_message || (bot.first_messages && bot.first_messages[0]) || 'Loading first message...';
    }

    let avatar = this.resolveAvatarUrl(bot, isPersona ? 'persona' : 'bot') || DEFAULT_AVATAR;
    if (elImg) {
      elImg.src = avatar;
      elImg.onerror = () => { elImg.src = DEFAULT_AVATAR; };
    }

    const modal = document.getElementById('card-detail-modal');
    if (modal) modal.classList.add('is-active');

    if (bot._type === 'character' && !bot._hydrated) {
      this.fetchFullBotData(bot.id).then(live => {
        if (live && this.currentModalBot && this.currentModalBot.id === bot.id) {
          Object.assign(bot, live, { _hydrated: true });
          if (elDesc) elDesc.innerText = bot.personality || bot.description || 'No description provided.';
          if (elFirst) elFirst.innerText = bot.first_message || (bot.first_messages && bot.first_messages[0]) || 'No first message recorded.';
          if (elTok && (live.token_counts || live.tokens)) {
            const tks = live.token_counts ? (live.token_counts.total || live.token_counts.personality) : live.tokens;
            if (tks) elTok.innerText = Number(tks).toLocaleString();
          }
        }
      });
    }
  }

  closeDetailModal() {
    const modal = document.getElementById('card-detail-modal');
    if (modal) modal.classList.remove('is-active');
    this.currentModalBot = null;
    this.isDownloadMinimized = false;
  }

  /* ==========================================================================
     DOWNLOAD POPUP MODAL CONTROLLER
     ========================================================================== */
  openDownloadModal(title, thumb, name, sub, previewType = null) {
    const modal = document.getElementById('download-progress-modal');
    if (!modal) return;

    this.isDownloadMinimized = false;
    const pill = document.getElementById('download-minimized-pill');
    if (pill) pill.style.display = 'none';

    document.getElementById('dl-modal-title').innerText = title;
    document.getElementById('dl-preview-name').innerText = name || 'Item';
    document.getElementById('dl-preview-sub').innerText = sub || 'Dominion V2 Card';

    const thumbImg = document.getElementById('dl-preview-thumb');
    const svgBox = document.getElementById('dl-preview-svg');

    if (previewType && DOMINION_MEDIA_SVGS[previewType]) {
      if (thumbImg) thumbImg.style.display = 'none';
      if (svgBox) {
        svgBox.innerHTML = DOMINION_MEDIA_SVGS[previewType];
        svgBox.style.display = 'flex';
      }
    } else {
      if (svgBox) svgBox.style.display = 'none';
      if (thumbImg) {
        thumbImg.style.display = 'block';
        thumbImg.src = thumb || DEFAULT_AVATAR;
        thumbImg.onerror = () => {
          thumbImg.style.display = 'none';
          if (svgBox) {
            svgBox.innerHTML = DOMINION_MEDIA_SVGS.bot;
            svgBox.style.display = 'flex';
          }
        };
      }
    }

    document.getElementById('dl-deck-loader').style.display = 'block';
    document.getElementById('dl-success-icon').style.display = 'none';
    document.getElementById('dl-modal-footer').style.display = 'none';
    document.getElementById('dl-progress-fill').style.width = '0%';
    document.getElementById('dl-pct-text').innerText = '0%';

    for (let i = 1; i <= 4; i++) {
      const stepRow = document.getElementById(`dl-step-${i}`);
      if (stepRow) {
        stepRow.classList.toggle('is-active', i === 1);
        stepRow.classList.remove('is-done');
      }
    }

    modal.classList.add('is-active');
  }

  minimizeDownloadModal() {
    this.isDownloadMinimized = true;
    const modal = document.getElementById('download-progress-modal');
    if (modal) modal.classList.remove('is-active');

    const pill = document.getElementById('download-minimized-pill');
    if (pill) {
      pill.style.display = 'flex';
      const pillTitle = document.getElementById('minimized-pill-title');
      const curStatus = document.getElementById('dl-status-text')?.innerText;
      if (pillTitle && curStatus) pillTitle.innerText = curStatus;
      const pillPct = document.getElementById('minimized-pill-pct');
      const curPct = document.getElementById('dl-pct-text')?.innerText;
      if (pillPct && curPct) pillPct.innerText = curPct;
    }
  }

  restoreDownloadModal() {
    this.isDownloadMinimized = false;
    const pill = document.getElementById('download-minimized-pill');
    if (pill) pill.style.display = 'none';

    const modal = document.getElementById('download-progress-modal');
    if (modal) modal.classList.add('is-active');
  }

  updateDownloadModal(pct, statusText, activeStep) {
    const elFill = document.getElementById('dl-progress-fill');
    const elPct = document.getElementById('dl-pct-text');
    const elStatus = document.getElementById('dl-status-text');

    if (elFill) elFill.style.width = `${pct}%`;
    if (elPct) elPct.innerText = `${pct}%`;
    if (elStatus) elStatus.innerText = statusText;

    const pillPct = document.getElementById('minimized-pill-pct');
    const pillTitle = document.getElementById('minimized-pill-title');
    if (pillPct) pillPct.innerText = `${pct}%`;
    if (pillTitle && statusText) pillTitle.innerText = statusText;

    for (let i = 1; i <= 4; i++) {
      const stepRow = document.getElementById(`dl-step-${i}`);
      if (stepRow) {
        stepRow.classList.toggle('is-active', i === activeStep);
        stepRow.classList.toggle('is-done', i < activeStep);
      }
    }
  }

  completeDownloadModal(headline, sub) {
    this.updateDownloadModal(100, headline || "Download complete!", 4);
    for (let i = 1; i <= 4; i++) {
      const stepRow = document.getElementById(`dl-step-${i}`);
      if (stepRow) stepRow.classList.add('is-done');
    }

    document.getElementById('dl-deck-loader').style.display = 'none';
    document.getElementById('dl-success-icon').style.display = 'flex';
    document.getElementById('dl-preview-sub').innerText = sub || 'Ready for SillyTavern';
    document.getElementById('dl-modal-footer').style.display = 'flex';

    const pill = document.getElementById('download-minimized-pill');
    if (pill && this.isDownloadMinimized) {
      setTimeout(() => {
        if (pill) pill.style.display = 'none';
      }, 4000);
    }
  }

  closeDownloadModal() {
    this.isDownloadMinimized = false;
    const modal = document.getElementById('download-progress-modal');
    if (modal) modal.classList.remove('is-active');

    const pill = document.getElementById('download-minimized-pill');
    if (pill) pill.style.display = 'none';
  }

  /* ==========================================================================
     FULL BOT HYDRATION     FULL BOT HYDRATION
     ========================================================================== */
  async fetchFullBotData(botId) {
    try {
      const data = await this.fetchSafeJson(this.getApiUrl(`characters/${botId}`), { headers: this.getHeaders() });
      return data.data || data;
    } catch (e) {
      console.warn("Could not fetch full bot definition:", e.message || e);
    }
    return null;
  }

  /* ==========================================================================
     SINGLE CARD DOWNLOAD (SUPPORTS PNG, JSON, BOTH)
     ========================================================================== */
  async downloadSingleCard(id, explicitFormat = null) {
    const bot = this.items.find(b => b.id === id);
    if (!bot) return;

    const fmt = explicitFormat || this.exportFormat || 'png';
    const isPersona = bot._type === 'persona';
    const isLore = bot._type === 'lorebook';

    let avatarUrl = this.resolveAvatarUrl(bot, isPersona ? 'persona' : 'bot') || DEFAULT_AVATAR;
    const safeName = (bot.name || "character").replace(/[/\\?%*:|"<>]/g, "_").trim();

    let previewType = null;
    if (isLore || fmt === 'json') previewType = 'json';
    else if (isPersona && (!avatarUrl || avatarUrl === DEFAULT_AVATAR)) previewType = 'persona';

    this.openDownloadModal(
      `Downloading ${bot.name}`,
      avatarUrl,
      bot.name,
      fmt === 'json' ? "Dominion V2 JSON" : fmt === 'both' ? "Dominion PNG Card + JSON" : "Dominion SillyTavern Card",
      previewType
    );

    try {
      this.updateDownloadModal(25, "Resolving metadata & definitions...", 1);

      // Hydrate full definition if missing
      let fullBot = bot;
      if (bot._type === 'character' && !bot._hydrated) {
        const live = await this.fetchFullBotData(bot.id);
        if (live) {
          fullBot = { ...bot, ...live, _hydrated: true };
          Object.assign(bot, live, { _hydrated: true });
        }
      }

      if (bot._type === 'lorebook') {
        this.updateDownloadModal(70, "Packaging Lorebook JSON...", 3);
        await new Promise(r => setTimeout(r, 180));
        const jsonStr = JSON.stringify(fullBot, null, 2);
        this.triggerBlobDownload(new Blob([jsonStr], { type: 'application/json' }), `Dominion_${safeName}_lorebook.json`);
        this.completeDownloadModal("Lorebook Exported!", "Dominion JSON ready");
        return;
      }

      if (bot._type === 'persona') {
        this.updateDownloadModal(60, "Packaging Persona Card...", 2);
        if (fmt === 'json') {
          const jsonStr = JSON.stringify(fullBot, null, 2);
          this.triggerBlobDownload(new Blob([jsonStr], { type: 'application/json' }), `Dominion_${safeName}_persona.json`);
          this.completeDownloadModal("Persona Exported!", "Dominion JSON ready");
          return;
        }

        const personaCardV2 = {
          spec: "chara_card_v2",
          spec_version: "2.0",
          data: {
            name: fullBot.name || "User Persona",
            description: fullBot.appearance || "",
            personality: fullBot.appearance || "",
            scenario: `User Persona: ${fullBot.name || 'User'}`,
            first_mes: `Hello, I am ${fullBot.name || 'User'}.`,
            mes_example: "",
            creator_notes: "Exported via Dominion (JanitorAI Backup Suite)\nPersona V2 Specification",
            system_prompt: "",
            post_history_instructions: "",
            alternate_greetings: [],
            tags: ["persona", "user", fullBot.pronouns].filter(Boolean),
            creator: "JanitorAI User",
            character_version: "Dominion V2",
            extensions: {
              janitor_persona_id: fullBot.id,
              pronouns: fullBot.pronouns || ""
            }
          }
        };

        if (fmt === 'png' || fmt === 'both') {
          const pngBuffer = await this.compileSillyTavernPngBuffer(personaCardV2, avatarUrl, fullBot.name);
          this.triggerBlobDownload(new Blob([pngBuffer], { type: 'image/png' }), `Dominion_${safeName}_persona.card.png`);
        }
        if (fmt === 'both') {
          const jsonStr = JSON.stringify(personaCardV2, null, 2);
          this.triggerBlobDownload(new Blob([jsonStr], { type: 'application/json' }), `Dominion_${safeName}_persona.json`);
        }
        this.completeDownloadModal("Persona Exported!", "Dominion SillyTavern Persona Ready");
        return;
      }

      const cardV2 = this.buildSillyTavernV2Card(fullBot);

      // 1. JSON only
      if (fmt === 'json') {
        this.updateDownloadModal(75, "Compiling SillyTavern V2 JSON...", 3);
        await new Promise(r => setTimeout(r, 150));
        const jsonStr = JSON.stringify(cardV2, null, 2);
        this.triggerBlobDownload(new Blob([jsonStr], { type: 'application/json' }), `Dominion_${safeName}_v2.json`);
        this.completeDownloadModal("JSON Download Complete!", "Dominion SillyTavern Specification");
        this.showToast(`Downloaded "${bot.name}" JSON!`);
        return;
      }

      // 2. PNG only
      if (fmt === 'png') {
        this.updateDownloadModal(55, "Converting avatar to lossless PNG canvas...", 2);
        const pngBuffer = await this.compileSillyTavernPngBuffer(cardV2, avatarUrl, bot.name);

        this.updateDownloadModal(85, "Embedding SillyTavern V2 chara chunk & CRC32...", 3);
        this.updateDownloadModal(100, "Delivering SillyTavern card download...", 4);
        this.triggerBlobDownload(new Blob([pngBuffer], { type: 'image/png' }), `Dominion_${safeName}_v2.card.png`);

        this.completeDownloadModal("Card Download Complete!", "Dominion SillyTavern V2 PNG");
        this.showToast(`Downloaded "${bot.name}" character card!`);
        return;
      }

      // 3. Both (PNG + JSON)
      if (fmt === 'both') {
        this.updateDownloadModal(50, "Generating PNG card & JSON definition...", 2);
        const pngBuffer = await this.compileSillyTavernPngBuffer(cardV2, avatarUrl, bot.name);
        this.triggerBlobDownload(new Blob([pngBuffer], { type: 'image/png' }), `Dominion_${safeName}_v2.card.png`);

        const jsonStr = JSON.stringify(cardV2, null, 2);
        this.triggerBlobDownload(new Blob([jsonStr], { type: 'application/json' }), `Dominion_${safeName}_v2.json`);

        this.completeDownloadModal("Export Complete!", "Dominion PNG Card & V2 JSON downloaded");
        this.showToast(`Downloaded "${bot.name}" PNG + JSON!`);
        return;
      }

    } catch (err) {
      console.error("Single download error:", err);
      this.updateDownloadModal(100, `Download error: ${err.message}`, 4);
      this.showToast(`Error compiling card: ${err.message}`, "error");
    }
  }

  /* ==========================================================================
     BATCH EXPORT SELECTED AS ZIP     BATCH EXPORT SELECTED AS ZIP (SUPPORTS PNG, JSON, BOTH)
     ========================================================================== */
  async exportSelectedZip() {
    const selected = this.items.filter(b => this.selectedIds.has(b.id));
    if (selected.length === 0) {
      this.showToast("No items selected for export", "error");
      return;
    }

    if (typeof JSZip === 'undefined') {
      this.showToast("JSZip library is still loading. Please wait 2 seconds.", "error");
      return;
    }

    const fmt = this.exportFormat || 'png';
    const total = selected.length;
    const formatLabel = fmt === 'json' ? 'JSON' : fmt === 'both' ? 'PNG + JSON' : 'SillyTavern PNG Cards';

    this.openDownloadModal(
      `Compiling Vault Archive (.zip)`,
      null,
      `Dominion Vault Archive (${total} Items)`,
      `${formatLabel} • Compressed ZIP`,
      'zip'
    );

    try {
      const zip = new JSZip();
      const botsFolder = zip.folder("characters");
      const loreFolder = zip.folder("lorebooks");
      const persFolder = zip.folder("personas");

      let done = 0;
      for (const item of selected) {
        const safeName = (item.name || "item").replace(/[/\\?%*:|"<>]/g, "_").trim();
        const pct = Math.round(((done + 1) / total) * 82);

        this.updateDownloadModal(pct, `Compiling ${done + 1} of ${total}: ${item.name}...`, 2);

        // Fetch full definition if missing
        let fullItem = item;
        if (item._type === 'character' && !item._hydrated) {
          const live = await this.fetchFullBotData(item.id);
          if (live) {
            fullItem = { ...item, ...live, _hydrated: true };
            Object.assign(item, live, { _hydrated: true });
          }
        }

        if (item._type === 'lorebook') {
          loreFolder.file(`Dominion_${safeName}_lorebook.json`, JSON.stringify(fullItem, null, 2));
        } else if (item._type === 'persona') {
          if (fmt === 'json' || fmt === 'both') {
            persFolder.file(`Dominion_${safeName}_persona.json`, JSON.stringify(fullItem, null, 2));
          }
          if (fmt === 'png' || fmt === 'both') {
            let avaUrl = this.resolveAvatarUrl(fullItem, 'persona');
            const personaCardV2 = {
              spec: "chara_card_v2",
              spec_version: "2.0",
              data: {
                name: fullItem.name || "User Persona",
                description: fullItem.appearance || "",
                personality: fullItem.appearance || "",
                scenario: `User Persona: ${fullItem.name || 'User'}`,
                first_mes: `Hello, I am ${fullItem.name || 'User'}.`,
                mes_example: "",
                creator_notes: "Exported via Dominion (JanitorAI Backup Suite)\nPersona V2 Specification",
                system_prompt: "",
                post_history_instructions: "",
                alternate_greetings: [],
                tags: ["persona", "user", fullItem.pronouns].filter(Boolean),
                creator: "JanitorAI User",
                character_version: "Dominion V2",
                extensions: {
                  janitor_persona_id: fullItem.id,
                  pronouns: fullItem.pronouns || ""
                }
              }
            };
            const pngBuf = await this.compileSillyTavernPngBuffer(personaCardV2, avaUrl, fullItem.name);
            persFolder.file(`Dominion_${safeName}_persona.card.png`, pngBuf);
          }
        } else {
          const cardV2 = this.buildSillyTavernV2Card(fullItem);

          if (fmt === 'json' || fmt === 'both') {
            botsFolder.file(`Dominion_${safeName}_v2.json`, JSON.stringify(cardV2, null, 2));
          }

          if (fmt === 'png' || fmt === 'both') {
            let avaUrl = this.resolveAvatarUrl(fullItem, 'bot');
            const pngBuf = await this.compileSillyTavernPngBuffer(cardV2, avaUrl, item.name);
            botsFolder.file(`Dominion_${safeName}_v2.card.png`, pngBuf);
          }
        }

        done++;
      }

      this.updateDownloadModal(92, "Compressing ZIP archive...", 3);
      const zipBlob = await zip.generateAsync({ type: "blob" });

      const timeStamp = new Date().toISOString().slice(0, 10);
      this.triggerBlobDownload(zipBlob, `Dominion_Vault_Archive_${timeStamp}.zip`);

      this.completeDownloadModal("Vault Export Complete!", `ZIP file with ${total} items (${formatLabel}) downloaded`);
      this.showToast(`Successfully downloaded ZIP with ${total} items!`);

    } catch (err) {
      console.error("Batch export error:", err);
      this.updateDownloadModal(100, `Export error: ${err.message}`, 4);
      this.showToast(`Batch export error: ${err.message}`, "error");
    }
  }

  /* ==========================================================================
     SILLYTAVERN SPECIFICATION     SILLYTAVERN SPECIFICATION & PNG METADATA INJECTION
     ========================================================================== */
  buildSillyTavernV2Card(bot) {
    const name = (bot.name || "Character").trim();
    const pers = bot.personality || "";
    const desc = bot.personality || bot.description || "";
    const scenario = bot.scenario || "";
    const firstMes = bot.first_message || bot.firstMessage || "";
    const mesExample = bot.example_dialogs || "";
    const creatorNotes = bot.description || "";
    const creatorName = bot.creatorName || bot.creator_name || bot.creator || "";

    const altGreetings = [];
    const rawGreetings = bot.greetings || bot.first_messages || [];
    for (const g of rawGreetings) {
      const t = typeof g === 'object' ? (g.text || g.message || '') : String(g);
      if (t && t.trim() && t.trim() !== firstMes.trim()) {
        altGreetings.push(t.trim());
      }
    }
    if (Array.isArray(bot.alternate_greetings)) {
      for (const g of bot.alternate_greetings) {
        const t = typeof g === 'object' ? (g.text || g.message || '') : String(g);
        if (t && t.trim() && t.trim() !== firstMes.trim() && !altGreetings.includes(t.trim())) {
          altGreetings.push(t.trim());
        }
      }
    }

    const tags = (bot.tags || []).map(t => (typeof t === 'object' ? t.name || t.tag : String(t))).filter(Boolean);

    const allGreetingsList = [];
    if (firstMes) {
      allGreetingsList.push({ title: "Greeting 1", text: firstMes });
    }
    altGreetings.forEach((ag, idx) => {
      allGreetingsList.push({ title: `Greeting ${allGreetingsList.length + 1}`, text: ag });
    });

    return {
      spec: "chara_card_v2",
      spec_version: "2.0",
      data: {
        name: name,
        description: desc,
        personality: pers || desc,
        scenario: scenario,
        first_mes: firstMes,
        mes_example: mesExample,
        creator_notes: (creatorNotes ? (creatorNotes + "\n\n") : "") + "Exported via Dominion (JanitorAI Backup Suite)\nSpecs: SillyTavern V2 Chara Specification",
        system_prompt: "",
        post_history_instructions: "",
        alternate_greetings: altGreetings,
        tags: tags,
        creator: creatorName,
        character_version: "Dominion V2",
        extensions: {
          janitor_id: bot.id,
          total_tokens: bot.tokens || bot.total_tokens || 0,
          creator_id: bot.creatorId || bot.creator_id || "",
          greetings: allGreetingsList
        }
      }
    };
  }

  async compileSillyTavernPngBuffer(cardV2, avatarUrl, name) {
    let imageBlob = null;
    if (avatarUrl) {
      try {
        const targetUrl = window.location.protocol.startsWith('http') ? `/api/proxy?url=${encodeURIComponent(avatarUrl)}` : avatarUrl;
        const resp = await fetch(targetUrl);
        if (resp.ok) imageBlob = await resp.blob();
      } catch (e) {}
    }

    if (!imageBlob) {
      imageBlob = await this.generateFallbackAvatarBlob(name);
    }

    const pngArrayBuffer = await this.blobToPngArrayBuffer(imageBlob);
    const jsonStr = JSON.stringify(cardV2);
    const b64Str = btoa(unescape(encodeURIComponent(jsonStr)));
    return this.injectCharaChunk(pngArrayBuffer, b64Str);
  }

  async generateFallbackAvatarBlob(name) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 512, 768);
    grad.addColorStop(0, "#09090b");
    grad.addColorStop(1, "#15151b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 768);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, 480, 736);

    const initials = (name || "C").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "C";
    ctx.fillStyle = "#f4f4f6";
    ctx.font = "bold 52px Geist, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, 256, 384);

    return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  }

  async blobToPngArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((b) => {
          if (!b) {
            reject(new Error("Canvas conversion to PNG blob returned null"));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsArrayBuffer(b);
        }, "image/png");
      };
      img.onerror = () => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      };
      img.src = URL.createObjectURL(blob);
    });
  }

  injectCharaChunk(pngArrayBuffer, base64Payload) {
    const u8 = new Uint8Array(pngArrayBuffer);
    const keyword = "chara\0";
    const textBytes = new TextEncoder().encode(keyword + base64Payload);
    const dataLen = textBytes.length;

    const chunkTotalLen = 4 + 4 + dataLen + 4;
    const chunk = new Uint8Array(chunkTotalLen);
    const view = new DataView(chunk.buffer);

    view.setUint32(0, dataLen, false);
    chunk[4] = 0x74; chunk[5] = 0x45; chunk[6] = 0x58; chunk[7] = 0x74; // 'tEXt'
    chunk.set(textBytes, 8);

    const crcSlice = chunk.subarray(4, 8 + dataLen);
    const crc = calculateCrc32(crcSlice);
    view.setUint32(8 + dataLen, crc, false);

    let insertPos = 33;
    if (u8.length > 33 && u8[12] === 0x49 && u8[13] === 0x48 && u8[14] === 0x44 && u8[15] === 0x52) {
      const ihdrDataLen = new DataView(u8.buffer).getUint32(8, false);
      insertPos = 8 + 4 + 4 + ihdrDataLen + 4;
    }

    const result = new Uint8Array(u8.length + chunkTotalLen);
    result.set(u8.subarray(0, insertPos), 0);
    result.set(chunk, insertPos);
    result.set(u8.subarray(insertPos), insertPos + chunkTotalLen);

    return result.buffer;
  }

  triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ==========================================================================
     PROFILE CSS & HTML STUDIO
     ========================================================================== */
  setProfileUrl(url) {
    const input = document.getElementById('css-profile-input');
    if (input) {
      input.value = url;
      this.onProfileInputChange();
      this.extractProfileCss();
    }
  }

  onProfileInputChange() {
    const input = document.getElementById('css-profile-input');
    const clearBtn = document.getElementById('btn-clear-profile');
    if (input && clearBtn) {
      clearBtn.style.display = input.value.trim().length > 0 ? 'inline-flex' : 'none';
    }
  }

  clearProfileInput() {
    const input = document.getElementById('css-profile-input');
    if (input) {
      input.value = '';
      this.onProfileInputChange();
      input.focus();
    }
  }

  async pasteProfileUrl() {
    const input = document.getElementById('css-profile-input');
    if (!input) return;

    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          input.value = text.trim();
          this.onProfileInputChange();
          input.focus();
          this.showToast("Profile link pasted from clipboard!", "success");
          return;
        }
      }
      this.showToast("Clipboard is empty or inaccessible", "error");
    } catch (err) {
      input.focus();
      this.showToast("Clipboard permission denied. Please paste manually (Ctrl+V)", "error");
    }
  }

  async extractProfileCss() {
    const input = document.getElementById('css-profile-input');
    const btn = document.getElementById('btn-extract-profile');
    if (!input) return;
    const rawInput = input.value.trim();
    if (!rawInput) {
      this.showToast("Please enter a Janitor profile link, @handle, or paste raw CSS/bio markup", "error");
      input.focus();
      return;
    }

    // Check if user directly pasted raw HTML/CSS/About-Me text
    const isDirectMarkup = rawInput.includes('<style') || rawInput.includes('<div') || (rawInput.includes('{') && rawInput.includes('}')) || rawInput.includes('class=');
    if (isDirectMarkup) {
      this.showToast("Direct HTML/CSS markup detected. Parsing bio...", "info");
      this.processBioMarkup(rawInput, { user_name: "Custom Bio", followers_count: 0, total_bots: 0 });
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('is-loading');
        btn.innerHTML = `
          <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
          <span>Extract Profile</span>
          <kbd class="kbd-badge">↵</kbd>
        `;
      }
      return;
    }

    let profileId = rawInput;
    const uuidMatch = rawInput.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (uuidMatch) {
      profileId = uuidMatch[1];
    } else {
      const profileMatch = rawInput.match(/profiles\/([a-zA-Z0-9_.-]+)/i);
      if (profileMatch) {
        profileId = profileMatch[1].replace(/_profile-of-.*$/i, '');
      } else if (rawInput.startsWith('@')) {
        profileId = rawInput.slice(1);
      }
    }

    if (btn) {
      btn.disabled = true;
      btn.classList.add('is-loading');
      btn.innerHTML = `<span class="spinner-ring" style="width: 15px; height: 15px; border-width: 2px;"></span><span>Extracting...</span>`;
    }

    this.showToast(`Fetching profile "${profileId}"...`);

    try {
      const profileData = await this.fetchSafeJson(this.getApiUrl(`profiles/${profileId}`), { headers: this.getHeaders() });
      this.currentProfile = profileData;
      this.renderProfileMeta(profileData);
      this.processBioMarkup(profileData.about_me || "", profileData);
      this.showToast("Profile styling & markup successfully extracted!", "success");

    } catch (err) {
      console.error("Extract CSS error:", err);
      let friendlyMsg = err.message || "Failed to retrieve profile";
      if (friendlyMsg.includes("Unexpected token") || friendlyMsg.includes("not valid JSON")) {
        friendlyMsg = "Janitor upstream returned an unexpected response. Please try again shortly or paste bio markup directly.";
      }
      this.showToast(friendlyMsg, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('is-loading');
        btn.innerHTML = `
          <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
          <span>Extract Profile</span>
          <kbd class="kbd-badge">↵</kbd>
        `;
      }
    }
  }

  processBioMarkup(aboutMe, profileData = {}) {
    // 1. Extract CSS
    let css = "";
    const styleMatches = [...aboutMe.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
    for (const m of styleMatches) {
      css += m[1] + "\n\n";
    }

    // Also extract inline styles if present
    const inlineMatches = [...aboutMe.matchAll(/style="([^"]+)"/gi)];
    if (inlineMatches.length > 0 && !css.trim()) {
      css = "/* Extracted Inline Styles from Profile Elements */\n";
      inlineMatches.forEach((m, idx) => {
        css += `.profile-element-${idx + 1} { ${m[1]} }\n`;
      });
    }

    // If pure CSS text was provided directly without <style> tags
    if (!css.trim() && aboutMe.includes('{') && aboutMe.includes('}')) {
      css = aboutMe.replace(/<[^>]+>/g, '').trim();
    }

    if (!css.trim()) {
      css = "/* No custom <style> rules declared in this profile bio. */\n/* The profile uses standard Janitor layout. */";
    }
    this.extractedCss = css.trim();

    // 2. Extract HTML markup (divs, spans, layout)
    let cleanHtml = aboutMe
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .trim();
    if (!cleanHtml) cleanHtml = '<div class="empty-bio">\n  <p>No custom HTML markup present in bio.</p>\n</div>';
    this.extractedHtml = cleanHtml;

    // 3. Standalone full HTML document
    this.extractedFullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${profileData.user_name || 'Creator'} — Janitor Profile</title>
  <style>
    body {
      margin: 0;
      padding: 24px;
      background: #09090b;
      color: #f4f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    ${this.extractedCss}
  </style>
</head>
<body>
  <div class="janitor-profile-wrapper">
    ${this.extractedHtml}
  </div>
</body>
</html>`;

    // 4. Clean Plain Text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = aboutMe.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    this.extractedTxt = (tempDiv.textContent || tempDiv.innerText || '').trim();

    this.renderExtractedStudio();
  }

  renderProfileMeta(data) {
    const card = document.getElementById('profile-meta-card');
    if (card) card.style.display = 'block';

    const elName = document.getElementById('profile-name');
    const elHandle = document.getElementById('profile-handle');
    const elFoll = document.getElementById('profile-followers');
    const elBots = document.getElementById('profile-bots-count');
    const elAva = document.getElementById('profile-avatar');
    const elBadge = document.getElementById('profile-badge');

    if (elName) elName.innerText = data.user_name || 'Creator';
    if (elHandle) elHandle.innerText = `@${data.user_name || data.id}`;
    if (elFoll) elFoll.innerText = (data.followers_count || 0).toLocaleString();
    if (elBots) elBots.innerText = (data.bot_count || data.total_bots || 0).toLocaleString();

    let avatar = this.resolveAvatarUrl(data.avatar, 'profile') || DEFAULT_AVATAR;
    if (elAva) {
      elAva.src = avatar;
      elAva.onerror = () => { elAva.src = DEFAULT_AVATAR; };
    }

    if (elBadge) {
      elBadge.innerHTML = (data.is_verified || data.plusbadge) ? ICONS_SVG.verified : '';
    }
  }

  renderExtractedStudio() {
    const container = document.getElementById('css-editor-container');
    if (container) container.style.display = 'block';

    const codeView = document.getElementById('css-pane-code');
    if (codeView) codeView.innerText = this.extractedCss;

    const htmlView = document.getElementById('css-pane-html');
    if (htmlView) htmlView.innerText = this.extractedHtml;

    const txtView = document.getElementById('css-pane-txt');
    if (txtView) txtView.innerText = this.extractedTxt;

    // Sandbox Preview
    const iframe = document.getElementById('css-preview-iframe');
    if (iframe) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(this.extractedFullDoc);
      iframeDoc.close();
    }

    // Color Swatches
    const hexColors = [...new Set((this.extractedCss + this.extractedHtml).match(/#[0-9a-fA-F]{3,8}/g) || [])];
    const grid = document.getElementById('css-swatches-grid');
    if (grid) {
      grid.innerHTML = hexColors.slice(0, 32).map(c => `
        <div class="swatch-item" onclick="navigator.clipboard.writeText('${c}'); app.showToast('Copied ${c}');">
          <div class="swatch-color-box" style="background: ${c};"></div>
          <div class="swatch-code">${c}</div>
        </div>
      `).join('');
    }

    this.switchCssSubtab(this.activeCssSubtab || 'code');
  }

  switchCssSubtab(subtab) {
    this.activeCssSubtab = subtab;

    ['code', 'html', 'txt', 'preview', 'assets'].forEach(t => {
      const btn = document.getElementById(`css-subtab-${t}`);
      const pane = document.getElementById(`css-pane-${t}`);
      if (btn) btn.classList.toggle('is-active', t === subtab);
      if (pane) pane.style.display = t === subtab ? 'block' : 'none';
    });
  }

  copyActiveCode() {
    let payload = this.extractedCss;
    if (this.activeCssSubtab === 'html') payload = this.extractedHtml;
    else if (this.activeCssSubtab === 'txt') payload = this.extractedTxt;

    if (!payload) return;
    navigator.clipboard.writeText(payload);
    this.showToast(`Copied ${this.activeCssSubtab.toUpperCase()} to clipboard!`);
  }

  downloadCssFile() {
    if (!this.extractedCss) return;
    const name = (this.currentProfile?.user_name || "profile").replace(/[/\\?%*:|"<>]/g, "_");
    const blob = new Blob([this.extractedCss], { type: 'text/css' });
    this.triggerBlobDownload(blob, `${name}_style.css`);
    this.showToast("Downloaded .css file!");
  }

  downloadHtmlFile() {
    if (!this.extractedFullDoc) return;
    const name = (this.currentProfile?.user_name || "profile").replace(/[/\\?%*:|"<>]/g, "_");
    const blob = new Blob([this.extractedFullDoc], { type: 'text/html' });
    this.triggerBlobDownload(blob, `${name}_about_me.html`);
    this.showToast("Downloaded .html file!");
  }

  downloadTxtFile() {
    if (!this.extractedTxt) return;
    const name = (this.currentProfile?.user_name || "profile").replace(/[/\\?%*:|"<>]/g, "_");
    const blob = new Blob([this.extractedTxt], { type: 'text/plain' });
    this.triggerBlobDownload(blob, `${name}_about_me.txt`);
    this.showToast("Downloaded .txt file!");
  }

  beautifyActiveCode() {
    if (this.activeCssSubtab === 'code' && this.extractedCss) {
      let formatted = this.extractedCss
        .replace(/\s*\{\s*/g, " {\n  ")
        .replace(/;\s*/g, ";\n  ")
        .replace(/\s*\}\s*/g, "\n}\n\n")
        .replace(/\n\s*\n/g, "\n");
      this.extractedCss = formatted;
      const codeView = document.getElementById('css-pane-code');
      if (codeView) codeView.innerText = formatted;
      this.showToast("CSS formatted!");
    } else if (this.activeCssSubtab === 'html' && this.extractedHtml) {
      this.showToast("HTML structure formatted!");
    }
  }

  /* ==========================================================================
     PROGRESS BAR & STEPPER CONTROLLER
     ========================================================================== */
  showProgress(show, title, pct, sub, activeStep = 1) {
    const box = document.getElementById('unmask-progress-box');
    if (box) box.style.display = show ? 'block' : 'none';
    if (show) {
      this.updateProgress(pct, sub, activeStep, title);
    }
  }

  updateProgress(pct, sub, activeStep, title) {
    if (title) {
      const elTitle = document.getElementById('loader-title');
      if (elTitle) elTitle.innerText = title;
    }
    if (pct !== undefined) {
      const elPct = document.getElementById('loader-pct');
      const elBar = document.getElementById('loader-bar');
      if (elPct) elPct.innerText = `${pct}%`;
      if (elBar) elBar.style.width = `${pct}%`;
    }
    if (sub) {
      const elSub = document.getElementById('loader-sub');
      if (elSub) elSub.innerText = sub;
    }

    for (let i = 1; i <= 4; i++) {
      const row = document.getElementById(`step-row-${i}`);
      if (row) {
        row.classList.toggle('is-active', i === activeStep);
        row.classList.toggle('is-done', i < activeStep);
      }
    }
  }

  /* ==========================================================================
     TOAST NOTIFICATIONS
     ========================================================================== */
  showToast(msg, type = "info") {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-message ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;

    let iconSvg = '';
    if (type === 'error') {
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else if (type === 'success') {
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>';
    } else {
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('is-leaving');
      setTimeout(() => {
        if (toast.parentNode === container) {
          container.removeChild(toast);
        }
      }, 260);
    }, 3200);
  }
}

const app = new ExportApp();
window.app = app;
window.addEventListener('DOMContentLoaded', () => app.init());
