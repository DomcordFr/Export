/* ==========================================================================
   EXPORT SUITE — JAVASCRIPT ENGINE (CARDS DESIGN SYSTEM PARITY)
   Pure client-side in-memory zero-storage architecture.
   ========================================================================== */

// 1. CRC32 Table & Computation
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

// 2. Icons definitions
const ICONS_SVG = {
  chat: '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  token: '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5H9.5a2.5 2.5 0 0 0 0 5H15"/></svg>',
  download: '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
  checkSquare: '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  square: '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>',
  verified: '<svg class="ui-icon-xs" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
};

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%231d1d25'/%3E%3Ctext x='50' y='55' font-size='24' fill='%2371717e' text-anchor='middle' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

class ExportApp {
  constructor() {
    this.activeTab = 'vault';
    this.token = '';
    this.items = [];
    this.selectedIds = new Set();
    this.currentFilter = 'all';
    this.currentModalBot = null;
    this.extractedCss = '';
  }

  init() {
    // Theme initialization
    const savedTheme = localStorage.getItem('export_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Restore token if in session storage
    const savedTok = sessionStorage.getItem('export_session_jwt');
    if (savedTok) {
      this.token = savedTok;
      const input = document.getElementById('token-input');
      if (input) input.value = savedTok;
    }

    // Load sample cards for luxury immediate rendering
    this.loadDemoVault();
  }

  toggleTheme() {
    const curr = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = curr === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('export_theme', next);
    this.showToast(`Switched to ${next} theme`);
  }

  switchTab(tab) {
    this.activeTab = tab;
    const btnVault = document.getElementById('nav-btn-vault');
    const btnCss = document.getElementById('nav-btn-css');
    if (btnVault) btnVault.classList.toggle('is-active', tab === 'vault');
    if (btnCss) btnCss.classList.toggle('is-active', tab === 'css');
    const viewVault = document.getElementById('view-vault');
    const viewCss = document.getElementById('view-css');
    if (viewVault) viewVault.style.display = tab === 'vault' ? 'block' : 'none';
    if (viewCss) viewCss.style.display = tab === 'css' ? 'block' : 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onTokenInput() {
    const input = document.getElementById('token-input');
    if (!input) return;
    const val = input.value.trim();
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
          input.value = text.trim();
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
     DEMO SAMPLE VAULT
     ========================================================================== */
  loadDemoVault() {
    this.switchTab('vault');
    const demoBots = [
      {
        id: 'caroline-nicole',
        name: "Your Two Mother's | Caroline & Nicole",
        category: 'PRIVATE',
        is_public: false,
        _type: 'character',
        avatar: 'https://ella.janitorai.com/bot-avatars/71fb2b72-243e-4fa0-8f9f-0c46522c0ff5.png',
        creatorName: 'Caroline',
        creatorAvatar: 'https://ella.janitorai.com/bot-avatars/71fb2b72-243e-4fa0-8f9f-0c46522c0ff5.png',
        tokens: 2840,
        chats: 412000,
        tags: ['Family', 'Drama', 'Wholesome', 'Slice of Life'],
        description: 'Caroline (39) and Nicole (38) are your protective, devoted mothers navigating life together with quiet elegance.',
        first_message: 'The soft chime of dinnerware resonates through the warm kitchen. Nicole looks up from the stove with a gentle smile while Caroline reviews papers at the counter.'
      },
      {
        id: 'evelyn-noir',
        name: 'Evelyn — Obsidian Vanguard',
        category: 'PUBLIC',
        is_public: true,
        _type: 'character',
        avatar: 'https://ella.janitorai.com/bot-avatars/evelyn.png',
        creatorName: 'Nocturne',
        creatorAvatar: DEFAULT_AVATAR,
        tokens: 3410,
        chats: 890000,
        tags: ['Cyberpunk', 'Action', 'Cold', 'Loyal'],
        description: 'High-ranking operative in the void surveillance division. Ruthless to enemies, intensely protective of her partner.',
        first_message: 'Rain taps ceaselessly against the armored glass of the skybridge. Evelyn stands motionless, her neon-lit trenchcoat swaying slightly in the draft.'
      },
      {
        id: 'lorebook-nexus',
        name: 'Aethelgard Codex & World Lore',
        category: 'LOREBOOK',
        is_public: true,
        _type: 'lorebook',
        avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%231a1a24"/%3E%3Ctext x="50" y="55" font-size="14" fill="%23a1a1ab" text-anchor="middle" font-family="sans-serif"%3ELOREBOOK%3C/text%3E%3C/svg%3E',
        creatorName: 'Archivist',
        creatorAvatar: DEFAULT_AVATAR,
        tokens: 1250,
        chats: 15400,
        tags: ['Fantasy', 'Lore', 'Worldbuilding'],
        description: 'Comprehensive historical entries, faction dynamics, and arcane regulations across the seven realms.',
        first_message: 'The scrolls illuminate forgotten treaties and silent oaths.'
      },
      {
        id: 'persona-detective',
        name: 'Detective Sterling (Persona)',
        category: 'PERSONA',
        is_public: false,
        _type: 'persona',
        avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23242433"/%3E%3Ctext x="50" y="55" font-size="14" fill="%23a1a1ab" text-anchor="middle" font-family="sans-serif"%3EPERSONA%3C/text%3E%3C/svg%3E',
        creatorName: 'Self',
        creatorAvatar: DEFAULT_AVATAR,
        tokens: 420,
        chats: 8400,
        tags: ['Detective', 'Persona', 'User'],
        description: 'Calm, observant investigator specializing in anomalous incidents and covert negotiations.',
        first_message: 'A match flares in the shadow of the doorway.'
      }
    ];

    this.items = demoBots;
    this.selectedIds = new Set(demoBots.map(b => b.id));
    this.renderVault();
    this.showToast("Loaded sample demo cards");
  }

  /* ==========================================================================
     SCAN ACCOUNT (JANITOR API)
     ========================================================================== */
  async scanAccount() {
    if (!this.token) {
      this.showToast("Please paste your JanitorAI session token first", "error");
      const input = document.getElementById('token-input');
      if (input) input.focus();
      return;
    }

    const scanBtn = document.getElementById('btn-scan');
    if (scanBtn) {
      scanBtn.disabled = true;
      scanBtn.innerHTML = `<span>Connecting to Hampter...</span>`;
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
        const res = await fetch(url, { headers: this.getHeaders() });
        if (!res.ok) break;

        const json = await res.json();
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

      // 2. Fetch Lorebooks / Scripts
      if (incLorebooks && userId) {
        this.updateProgress(50, "Fetching lorebooks and scripts...", 2);
        try {
          const lRes = await fetch(this.getApiUrl(`script/user/${userId}`), { headers: this.getHeaders() });
          if (lRes.ok) {
            const lJson = await lRes.json();
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
          const pRes = await fetch(this.getApiUrl('personas/mine'), { headers: this.getHeaders() });
          if (pRes.ok) {
            const pList = await pRes.json();
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

      if (discovered.length === 0) {
        this.showToast("No items found under chosen scopes. Loading sample demo.", "error");
        this.loadDemoVault();
      } else {
        this.items = discovered;
        this.selectedIds = new Set(discovered.map(b => b.id));
        this.renderVault();
        this.showToast(`Loaded ${discovered.length} items from your account`);
      }

    } catch (err) {
      console.error("Scan failure:", err);
      this.showToast(`Scan error: ${err.message}`, "error");
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
     RENDER VAULT & BOT CARDS
     ========================================================================== */
  renderVault() {
    const toolbar = document.getElementById('vault-toolbar-section');
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
    const chats = bot.chats || bot.messages || 0;
    const chatDisplay = chats >= 1000000 ? (chats / 1000000).toFixed(1) + 'M' : chats >= 1000 ? (chats / 1000).toFixed(1) + 'k' : chats;
    const tokensDisplay = ((bot.tokens || bot.total_tokens || 0)).toLocaleString();

    let avatar = bot.avatar || DEFAULT_AVATAR;
    if (avatar && !avatar.startsWith('http') && !avatar.startsWith('data:')) {
      avatar = `https://ella.janitorai.com/bot-avatars/${avatar}`;
    }

    const creator = bot.creatorName || bot.creator_name || 'Creator';
    let creatorAvatar = bot.creatorAvatar || bot.creator_avatar || DEFAULT_AVATAR;
    if (creatorAvatar && !creatorAvatar.startsWith('http') && !creatorAvatar.startsWith('data:')) {
      creatorAvatar = `https://ella.janitorai.com/bot-avatars/${creatorAvatar}`;
    }

    const tags = Array.isArray(bot.tags) ? bot.tags.map(t => typeof t === 'object' ? t.name : t) : [];

    return `
      <div class="bot-card stagger-item ${isSelected ? 'is-selected' : ''}" style="--index: ${index};" onclick="app.openDetailModal('${bot.id}')">
        <!-- Full Bleed Character Portrait -->
        <img class="bot-card-bg-image" src="${avatar}" alt="${bot.name}" loading="lazy" onerror="this.onerror=null;this.src=DEFAULT_AVATAR;">
        
        <!-- Multi-stop Gradient Protection -->
        <div class="bot-card-gradient-overlay"></div>

        <!-- Top Controls -->
        <div class="bot-card-top-bar">
          <span class="bot-card-cat-chip">${bot.category || 'BOT'}</span>
          <div class="bot-card-actions-group">
            <button class="card-action-btn card-select-btn ${isSelected ? 'is-checked' : ''}" title="${isSelected ? 'Deselect item' : 'Select item'}" onclick="event.stopPropagation(); app.toggleSelect('${bot.id}');">
              ${isSelected ? ICONS_SVG.checkSquare : ICONS_SVG.square}
            </button>
            <button class="card-action-btn" title="Download SillyTavern Card" onclick="event.stopPropagation(); app.downloadSingleCard('${bot.id}');">
              ${ICONS_SVG.download}
            </button>
          </div>
        </div>

        <!-- Bottom Refined Micro-Content Overlay -->
        <div class="bot-card-content-area">
          <div class="bot-card-stat-pills-row">
            <span class="bot-card-stat-pill">
              ${ICONS_SVG.chat}
              <span>${chatDisplay}</span>
            </span>
            <span class="bot-card-stat-pill">
              ${ICONS_SVG.token}
              <span>${tokensDisplay} t</span>
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
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.renderVault();
  }

  toggleSelectAll() {
    if (this.selectedIds.size === this.items.length) {
      this.selectedIds.clear();
    } else {
      this.selectedIds = new Set(this.items.map(b => b.id));
    }
    this.renderVault();
  }

  /* ==========================================================================
     DETAIL MODAL & SINGLE DOWNLOAD
     ========================================================================== */
  openDetailModal(id) {
    const bot = this.items.find(b => b.id === id);
    if (!bot) return;
    this.currentModalBot = bot;

    const elName = document.getElementById('modal-char-name');
    const elTitle = document.getElementById('modal-char-title');
    const elCat = document.getElementById('modal-char-category');
    const elCreator = document.getElementById('modal-char-creator');
    const elTok = document.getElementById('modal-char-tokens');
    const elChats = document.getElementById('modal-char-chats');
    const elDesc = document.getElementById('modal-char-desc');
    const elFirst = document.getElementById('modal-char-firstmes');
    const elImg = document.getElementById('modal-char-avatar');

    if (elName) elName.innerText = bot.name || 'Character Details';
    if (elTitle) elTitle.innerText = bot.name || '';
    if (elCat) elCat.innerText = bot.category || 'CHARACTER';
    if (elCreator) elCreator.innerText = `by ${bot.creatorName || bot.creator_name || 'Creator'}`;
    if (elTok) elTok.innerText = (bot.tokens || bot.total_tokens || 0).toLocaleString();
    if (elChats) elChats.innerText = (bot.chats || bot.messages || 0).toLocaleString();
    if (elDesc) elDesc.innerText = bot.personality || bot.description || 'No description provided.';
    if (elFirst) elFirst.innerText = bot.first_message || 'No first message recorded.';

    let avatar = bot.avatar || DEFAULT_AVATAR;
    if (avatar && !avatar.startsWith('http') && !avatar.startsWith('data:')) {
      avatar = `https://ella.janitorai.com/bot-avatars/${avatar}`;
    }
    if (elImg) elImg.src = avatar;

    const modal = document.getElementById('card-detail-modal');
    if (modal) modal.classList.add('is-active');
  }

  closeDetailModal() {
    const modal = document.getElementById('card-detail-modal');
    if (modal) modal.classList.remove('is-active');
    this.currentModalBot = null;
  }

  async downloadCurrentModalCard() {
    if (this.currentModalBot) {
      await this.downloadSingleCard(this.currentModalBot.id);
    }
  }

  async downloadSingleCard(id) {
    const bot = this.items.find(b => b.id === id);
    if (!bot) return;

    this.showToast(`Compiling SillyTavern V2 card for "${bot.name}"...`);
    try {
      const safeName = (bot.name || "character").replace(/[/\\?%*:|"<>]/g, "_").trim();

      if (bot._type === 'lorebook') {
        const jsonStr = JSON.stringify(bot, null, 2);
        this.triggerBlobDownload(new Blob([jsonStr], { type: 'application/json' }), `${safeName}_lorebook.json`);
        this.showToast(`Downloaded lorebook "${bot.name}"`);
        return;
      }

      if (bot._type === 'persona') {
        const jsonStr = JSON.stringify(bot, null, 2);
        this.triggerBlobDownload(new Blob([jsonStr], { type: 'application/json' }), `${safeName}_persona.json`);
        this.showToast(`Downloaded persona "${bot.name}"`);
        return;
      }

      let avatarUrl = bot.avatar;
      if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
        avatarUrl = `https://ella.janitorai.com/bot-avatars/${avatarUrl}`;
      }

      const cardV2 = this.buildSillyTavernV2Card(bot);
      const pngBuffer = await this.compileSillyTavernPngBuffer(cardV2, avatarUrl, bot.name);
      this.triggerBlobDownload(new Blob([pngBuffer], { type: 'image/png' }), `${safeName}_v2.card.png`);
      this.showToast(`Downloaded "${bot.name}" character card!`);
    } catch (err) {
      console.error("Single download error:", err);
      this.showToast(`Error compiling card: ${err.message}`, "error");
    }
  }

  /* ==========================================================================
     BATCH ZIP EXPORTER
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

    this.showProgress(true, "Building SillyTavern Vault Zip", 5, "Preparing zip archive...", 1);

    try {
      const zip = new JSZip();
      const botsFolder = zip.folder("characters");
      const loreFolder = zip.folder("lorebooks");
      const persFolder = zip.folder("personas");

      const total = selected.length;
      let done = 0;

      for (const item of selected) {
        const safeName = (item.name || "item").replace(/[/\\?%*:|"<>]/g, "_").trim();
        const pct = Math.round(((done + 1) / total) * 80);

        this.updateProgress(pct, `Processing ${item.name} (${done + 1}/${total})...`, 3);

        if (item._type === 'lorebook') {
          loreFolder.file(`${safeName}.json`, JSON.stringify(item, null, 2));
        } else if (item._type === 'persona') {
          persFolder.file(`${safeName}.json`, JSON.stringify(item, null, 2));
        } else {
          let avaUrl = item.avatar;
          if (avaUrl && !avaUrl.startsWith('http') && !avaUrl.startsWith('data:')) {
            avaUrl = `https://ella.janitorai.com/bot-avatars/${avaUrl}`;
          }
          const cardV2 = this.buildSillyTavernV2Card(item);
          const pngBuf = await this.compileSillyTavernPngBuffer(cardV2, avaUrl, item.name);
          botsFolder.file(`${safeName}_v2.card.png`, pngBuf);
        }

        done++;
      }

      this.updateProgress(90, "Compressing ZIP archive...", 4);
      const zipBlob = await zip.generateAsync({ type: "blob" });

      const timeStamp = new Date().toISOString().slice(0, 10);
      this.triggerBlobDownload(zipBlob, `JanitorAI_SillyTavern_Vault_${timeStamp}.zip`);

      this.updateProgress(100, `Complete! Exported ${total} items.`, 4);
      this.showToast(`Successfully downloaded ZIP with ${total} items!`);
    } catch (err) {
      console.error("Batch export error:", err);
      this.showToast(`Batch export error: ${err.message}`, "error");
    } finally {
      setTimeout(() => this.showProgress(false), 2500);
    }
  }

  /* ==========================================================================
     SILLYTAVERN SPEC & PNG CHUNK INJECTION
     ========================================================================== */
  buildSillyTavernV2Card(bot) {
    const name = (bot.name || "Character").trim();
    const desc = bot.personality || bot.description || "";
    const scenario = bot.scenario || "";
    const firstMes = bot.first_message || bot.firstMessage || "";
    const mesExample = bot.example_dialogs || "";
    const creatorName = bot.creatorName || bot.creator_name || "";

    const altGreetings = [];
    const rawGreetings = bot.greetings || bot.first_messages || [];
    for (const g of rawGreetings) {
      const t = typeof g === 'object' ? (g.text || g.message || '') : String(g);
      if (t && t !== firstMes) altGreetings.push(t);
    }

    const tags = (bot.tags || []).map(t => (typeof t === 'object' ? t.name || t.tag : String(t))).filter(Boolean);

    return {
      spec: "chara_card_v2",
      spec_version: "2.0",
      data: {
        name: name,
        description: desc,
        personality: desc,
        scenario: scenario,
        first_mes: firstMes,
        mes_example: mesExample,
        creator_notes: bot.description || "",
        system_prompt: "",
        post_history_instructions: "",
        alternate_greetings: altGreetings,
        tags: tags,
        creator: creatorName,
        character_version: "1.0",
        extensions: {
          janitor_id: bot.id,
          total_tokens: bot.tokens || bot.total_tokens || 0,
          creator_id: bot.creatorId || bot.creator_id || ""
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
     PROFILE CSS STUDIO
     ========================================================================== */
  setProfileUrl(url) {
    const input = document.getElementById('css-profile-input');
    if (input) {
      input.value = url;
      this.extractProfileCss();
    }
  }

  async extractProfileCss() {
    const input = document.getElementById('css-profile-input');
    if (!input) return;
    const rawInput = input.value.trim();
    if (!rawInput) {
      this.showToast("Please enter a JanitorAI profile link or @handle", "error");
      return;
    }

    let profileId = rawInput;
    const profileMatch = rawInput.match(/profiles\/([a-zA-Z0-9_-]+)/i);
    if (profileMatch) {
      profileId = profileMatch[1];
    } else if (rawInput.startsWith('@')) {
      profileId = rawInput.slice(1);
    }

    this.showToast(`Fetching profile "${profileId}"...`);

    try {
      const res = await fetch(this.getApiUrl(`profiles/${profileId}`), { headers: this.getHeaders() });
      if (!res.ok) {
        throw new Error(`Profile not found (Status ${res.status})`);
      }

      const profileData = await res.json();
      this.renderProfileMeta(profileData);

      const aboutMe = profileData.about_me || "";
      let css = "";
      const styleMatches = [...aboutMe.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
      for (const m of styleMatches) {
        css += m[1] + "\n\n";
      }

      if (!css.trim()) {
        css = "/* No <style> tags detected in this profile's About Me. */\n/* Profile uses default JanitorAI layout. */";
      }

      this.extractedCss = css.trim();
      this.renderExtractedCss(this.extractedCss, aboutMe, profileData);
      this.showToast("Profile CSS successfully extracted!");

    } catch (err) {
      console.error("Extract CSS error:", err);
      this.showToast(`Could not extract profile: ${err.message}`, "error");
    }
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

    let avatar = data.avatar || DEFAULT_AVATAR;
    if (avatar && !avatar.startsWith('http') && !avatar.startsWith('data:')) {
      avatar = `https://ella.janitorai.com/bot-avatars/${avatar}`;
    }
    if (elAva) elAva.src = avatar;

    if (elBadge) {
      elBadge.innerHTML = (data.is_verified || data.plusbadge) ? ICONS_SVG.verified : '';
    }
  }

  renderExtractedCss(css, rawHtml, profileData) {
    const container = document.getElementById('css-editor-container');
    if (container) container.style.display = 'block';

    const codeView = document.getElementById('css-pane-code');
    if (codeView) codeView.innerText = css;

    const iframe = document.getElementById('css-preview-iframe');
    if (iframe) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              margin: 0;
              padding: 24px;
              background: #09090b;
              color: #f4f4f6;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            ${css}
          </style>
        </head>
        <body>
          <div class="profile-container">
            ${rawHtml}
          </div>
        </body>
        </html>
      `);
      iframeDoc.close();
    }

    const hexColors = [...new Set(css.match(/#[0-9a-fA-F]{3,8}/g) || [])];
    const grid = document.getElementById('css-swatches-grid');
    if (grid) {
      grid.innerHTML = hexColors.slice(0, 24).map(c => `
        <div class="swatch-item" onclick="navigator.clipboard.writeText('${c}'); app.showToast('Copied ${c}');">
          <div class="swatch-color-box" style="background: ${c};"></div>
          <div class="swatch-code">${c}</div>
        </div>
      `).join('');
    }
  }

  switchCssSubtab(subtab) {
    const btnCode = document.getElementById('css-subtab-code');
    const btnPrev = document.getElementById('css-subtab-preview');
    const btnAssets = document.getElementById('css-subtab-assets');
    if (btnCode) btnCode.classList.toggle('is-active', subtab === 'code');
    if (btnPrev) btnPrev.classList.toggle('is-active', subtab === 'preview');
    if (btnAssets) btnAssets.classList.toggle('is-active', subtab === 'assets');

    const paneCode = document.getElementById('css-pane-code');
    const panePrev = document.getElementById('css-pane-preview');
    const paneAssets = document.getElementById('css-pane-assets');
    if (paneCode) paneCode.style.display = subtab === 'code' ? 'block' : 'none';
    if (panePrev) panePrev.style.display = subtab === 'preview' ? 'block' : 'none';
    if (paneAssets) paneAssets.style.display = subtab === 'assets' ? 'block' : 'none';
  }

  copyCss() {
    if (!this.extractedCss) return;
    navigator.clipboard.writeText(this.extractedCss);
    this.showToast("CSS copied to clipboard!");
  }

  downloadCssFile() {
    if (!this.extractedCss) return;
    const blob = new Blob([this.extractedCss], { type: 'text/css' });
    this.triggerBlobDownload(blob, "janitor_profile_style.css");
    this.showToast("Downloaded .css file!");
  }

  beautifyCss() {
    if (!this.extractedCss) return;
    let formatted = this.extractedCss
      .replace(/\s*\{\s*/g, " {\n  ")
      .replace(/;\s*/g, ";\n  ")
      .replace(/\s*\}\s*/g, "\n}\n\n")
      .replace(/\n\s*\n/g, "\n");
    this.extractedCss = formatted;
    const codeView = document.getElementById('css-pane-code');
    if (codeView) codeView.innerText = formatted;
    this.showToast("CSS formatted!");
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
    toast.className = `toast-message ${type === 'error' ? 'toast-error' : ''}`;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (toast.parentNode === container) {
          container.removeChild(toast);
        }
      }, 300);
    }, 3200);
  }
}

const app = new ExportApp(); window.app = app;
window.addEventListener('DOMContentLoaded', () => app.init());
