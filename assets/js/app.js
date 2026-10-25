/* ==========================================================================
   APLICAÇÃO PRINCIPAL: SISTEMA DE INVESTIDORES PEREGRINO
   Navegação Modular SaaS em 3 Colunas, Viewport Emulado e Interações
   ========================================================================== */

const App = {
  activeTab: (function() {
    try {
      return localStorage.getItem("peregrino_active_tab") || sessionStorage.getItem("peregrino_active_tab") || "boas-vindas";
    } catch(e) { return "boas-vindas"; }
  })(), // 'boas-vindas' | 'devlog' | 'simulador' | 'bases' | 'distritos' | 'personagens' | 'termo' | 'dossie' | 'gestao' | 'usuarios'
  currentViewport: "desktop", // 'desktop' | 'tablet' | 'mobile'
  selectedCharacterId: "char-cronista",
  characterCategoryFilter: "todos",
  characterSearchQuery: "",
  sidebarCollapsed: localStorage.getItem("peregrino_sidebar_collapsed") === "true",
  inspectorCollapsed: localStorage.getItem("peregrino_inspector_collapsed") === "true",
  showNewContractForm: false,
  viewingContractId: null,
  deferredInstallPrompt: null,

  async init() {
    // 0. Inicializa listeners de PWA para instalação do App Mobile
    this.initPwa();

    // Detecção se o usuário está abrindo a versão App Instalado no smartphone (PWA standalone)
    const isStandalone = (typeof window !== "undefined") && (
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true || 
      window.location.search.includes('source=pwa')
    );

    // Na primeira abertura do App instalado, desloga sessão herdada do navegador para exibir o fluxo de abertura nativo
    if (isStandalone && !localStorage.getItem("peregrino_app_standalone_setup")) {
      localStorage.setItem("peregrino_app_standalone_setup", "true");
      Store.logout();
    }

    // Restaura a aba ativa salva pelo usuário para manter no mesmo local após F5
    try {
      const savedTab = localStorage.getItem("peregrino_active_tab") || sessionStorage.getItem("peregrino_active_tab");
      if (savedTab) {
        this.activeTab = savedTab;
      }
    } catch (e) {}

    // 1. Verifica se o acesso veio com parâmetro de convite VIP (?vip=..., ?convite=..., ?token=...)
    const urlParams = new URLSearchParams(window.location.search);
    const vipToken = urlParams.get("vip") || urlParams.get("convite") || urlParams.get("token");

    if (vipToken && !Store.auth.isLoggedIn) {
      await this.enterAsVipGuest(vipToken);
      return;
    }

    // Inicia direto na tela de login conforme fluxo solicitado (o preloader virá após a autenticação)
    this.checkAuth();
  },

  // Controle de Autenticação e Exibição de Telas
  checkAuth() {
    const loginScreen = document.getElementById("login-screen");
    const preloaderScreen = document.getElementById("preloader-screen");
    const viewportWrapper = document.querySelector(".viewport-wrapper");

    // Verifica se a sessão atual é de convidado VIP e se já expirou
    if (Store.auth.currentUser && Store.auth.currentUser.role === "guest") {
      const inviteStr = localStorage.getItem("peregrino_vip_invite");
      if (inviteStr) {
        try {
          const invite = JSON.parse(inviteStr);
          if (Date.now() > invite.expiresAt) {
            localStorage.removeItem("peregrino_vip_invite");
            localStorage.removeItem("peregrino_logged_user_id");
            Store.auth.isLoggedIn = false;
            Store.auth.currentUser = null;
            alert("O seu Passe de Apresentação VIP de 24 horas expirou.\n\nPara solicitar um novo passe ou formalizar sua adesão como apoiador oficial, entre em contato com a Diretoria do Haja Luz Studio.");
          }
        } catch(e) {}
      }
    }

    if (!Store.auth.isLoggedIn || !Store.auth.currentUser) {
      if (preloaderScreen) preloaderScreen.classList.add("hidden");
      if (loginScreen) loginScreen.classList.remove("hidden");
      if (viewportWrapper) viewportWrapper.style.display = "none";
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.classList.remove("user-logged-in");
      }
      this.initLoginParallaxAndDust();
      this.updateInstallUi();
    } else {
      if (loginScreen) loginScreen.classList.add("hidden");
      if (preloaderScreen) preloaderScreen.classList.add("hidden");
      if (viewportWrapper) viewportWrapper.style.display = "flex";
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.classList.add("user-logged-in");
      }
      this.applyPanelStates();
      this.renderHeader();
      this.renderSidebar();
      this.renderInspector();
      this.renderMobileTabsNav();
      this.renderMobileBottomNav();
      this.switchTab(this.activeTab || "boas-vindas");
      this.setupEventListeners();
      this.updateInstallUi();
    }
  },

  // Iniciar Acesso como Convidado VIP com validade estrita de 24 horas na nuvem
  async enterAsVipGuest(token = "peregrino24h") {
    let expiresAtMs = Date.now() + (24 * 60 * 60 * 1000);

    // Valida o token no Supabase Cloud
    if (typeof window !== "undefined" && window.SupabaseBridge) {
      try {
        const validation = await window.SupabaseBridge.validateVipToken(token);
        if (!validation.valid) {
          alert("O seu Passe de Apresentação VIP de 24 horas expirou ou não é válido.\n\nPara solicitar renovação de acesso ou formalizar sua adesão definitiva, contate a Diretoria do Haja Luz Studio.");
          localStorage.removeItem("peregrino_vip_invite");
          localStorage.removeItem("peregrino_logged_user_id");
          this.checkAuth();
          return;
        }
        if (validation.expiresAt) {
          expiresAtMs = validation.expiresAt;
        }
      } catch (e) {
        console.warn("Validação remota de VIP fallback local:", e);
      }
    }

    const vipData = {
      token: token,
      createdAt: Date.now(),
      durationHours: 24,
      expiresAt: expiresAtMs
    };
    try {
      localStorage.setItem("peregrino_vip_invite", JSON.stringify(vipData));
    } catch (e) {}

    // Configura o usuário Convidado VIP
    Store.auth.isLoggedIn = true;
    Store.auth.currentUser = {
      id: "USR-VIP",
      name: "Convidado VIP",
      role: "guest",
      title: "Acesso de Apresentação (Passe 24h)",
      avatarLetter: "VIP",
      canEditKanban: false,
      canSyncGodot: false,
      canPostDevlog: false
    };
    Store.currentRole = "guest";
    Store.currentInvestor = null;
    try {
      localStorage.setItem("peregrino_logged_user_id", "USR-VIP");
      localStorage.setItem("peregrino_is_logged_in", "true");
      sessionStorage.setItem("peregrino_logged_user_id", "USR-VIP");
      sessionStorage.setItem("peregrino_is_logged_in", "true");
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.classList.add("user-logged-in");
      }
    } catch(e) {}

    // Executa SEMPRE o preloader cinematográfico para dar o impacto visual profissional!
    this.startPreloader();
  },

  getVipRemainingTimeFormatted() {
    const inviteStr = localStorage.getItem("peregrino_vip_invite");
    if (!inviteStr) return "24h 00m";
    try {
      const invite = JSON.parse(inviteStr);
      const diff = invite.expiresAt - Date.now();
      if (diff <= 0) return "Expirado";
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${mins.toString().padStart(2, "0")}m`;
    } catch (e) {
      return "24h 00m";
    }
  },

  async copyVipInviteLink() {
    const currentUrl = window.location.href.split("?")[0];
    let token = "VIP-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    if (typeof window !== "undefined" && window.SupabaseBridge) {
      try {
        const res = await window.SupabaseBridge.createVipToken(24);
        if (res && res.token) token = res.token;
      } catch (e) {
        console.warn("Aviso ao gerar token na nuvem:", e);
      }
    }
    const vipLink = `${currentUrl}?vip=${token}`;
    this.copyPixKey(vipLink, `✓ Link de Apresentação VIP (24h) gerado na nuvem e copiado! Token: ${token}`);
  },

  handleLogin(event) {
    if (event) event.preventDefault();
    const email = document.getElementById("login-email-input").value;
    const pass = document.getElementById("login-pass-input").value;
    const errorEl = document.getElementById("login-error-msg");

    const result = Store.login(email, pass);
    if (result.success) {
      if (errorEl) errorEl.style.display = "none";
      this.startPreloader();
    } else {
      if (errorEl) {
        errorEl.innerText = result.message || "Credenciais não reconhecidas.";
        errorEl.style.display = "block";
      }
    }
  },

  fillLoginForm(email, pass) {
    // Deprecated for security: chips removed
  },

  renderLoginAccountChips() {
    // Security measure: Account chips permanently removed from public login screen
  },

  loginDirect(userId) {
    const user = Store.switchUser(userId);
    if (user) {
      this.startPreloader();
    }
  },

  startPreloader() {
    const loginScreen = document.getElementById("login-screen");
    const preloaderScreen = document.getElementById("preloader-screen");
    const video = document.getElementById("preloader-video");
    const viewportWrapper = document.querySelector(".viewport-wrapper");

    if (loginScreen) loginScreen.classList.add("hidden");
    if (viewportWrapper) viewportWrapper.style.display = "none";

    if (!preloaderScreen || !video) {
      this.checkAuth();
      return;
    }

    preloaderScreen.classList.remove("hidden");
    preloaderScreen.classList.remove("fade-out");

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.currentTime = 0;
    
    // Finaliza automaticamente e com fade-out apenas quando o vídeo conclui 100% da sua duração total
    video.onended = () => {
      this.finishPreloader();
    };

    // Reprodução silenciosa e imersiva para garantir autoplay sem bloqueios de política mobile
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn("Autoplay bloqueado pelo navegador mobile, aguardando toque ou carregamento completo:", err);
      });
    }

    // Timer de segurança amplo (60 segundos) caso o navegador trave o arquivo
    this._preloaderSafetyTimer = setTimeout(() => {
      this.finishPreloader();
    }, 60000);
  },

  finishPreloader() {
    if (this._preloaderSafetyTimer) {
      clearTimeout(this._preloaderSafetyTimer);
      this._preloaderSafetyTimer = null;
    }

    const preloaderScreen = document.getElementById("preloader-screen");
    const video = document.getElementById("preloader-video");
    if (video) {
      video.onended = null;
      try { video.pause(); } catch(e) {}
    }

    if (preloaderScreen) {
      preloaderScreen.classList.add("fade-out");
      setTimeout(() => {
        preloaderScreen.classList.add("hidden");
        preloaderScreen.classList.remove("fade-out");
        this.checkAuth();
      }, 400);
    } else {
      this.checkAuth();
    }
  },

  togglePasswordVisibility() {
    const input = document.getElementById("login-pass-input");
    const iconBtn = document.querySelector(".oraculum-pass-toggle");
    if (!input) return;
    if (input.type === "password") {
      input.type = "text";
      if (iconBtn) iconBtn.innerHTML = Icons.eyeOff(16);
    } else {
      input.type = "password";
      if (iconBtn) iconBtn.innerHTML = Icons.eye(16);
    }
  },

  handleLogout() {
    Store.logout();
    this.activeTab = "boas-vindas";
    if (typeof document !== "undefined" && document.documentElement) {
      document.documentElement.classList.remove("user-logged-in");
    }
    const video = document.getElementById("preloader-video");
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    this.checkAuth();
  },

  // ==========================================================================
  // EFEITO PARALLAX 3D & POEIRA ANTIGA ATMOSFÉRICA NA TELA DE LOGIN
  // Simulação de Partículas de Poeira Sagrada e Tilt Cinemático com Glare
  // ==========================================================================
  initLoginParallaxAndDust() {
    if (this._dustInitialized) return;
    this._dustInitialized = true;
    
    // Pequeno timeout para garantir montagem do DOM
    setTimeout(() => {
      this.initAncientDustParticles();
      this.initLoginParallax();
    }, 50);
  },

  initAncientDustParticles() {
    const canvas = document.getElementById("ancient-dust-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // 85 partículas de poeira antiga em tons de bronze, ouro e pedra mineral
    const particleCount = 85;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.65 + 0.15,
        speedY: -(Math.random() * 0.35 + 0.08), // Flutua suavemente para cima
        speedX: (Math.random() - 0.5) * 0.25,
        wobbleSpeed: Math.random() * 0.02 + 0.005,
        wobbleRadius: Math.random() * 1.5 + 0.5,
        depth: Math.random() * 0.8 + 0.2, // Profundidade 3D (para parallax multicamadas)
        time: Math.random() * 100
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX - width / 2) * 0.04;
      mouseY = (e.clientY - height / 2) * 0.04;
    });

    const animate = () => {
      const loginScreen = document.getElementById("login-screen");
      if (loginScreen && loginScreen.classList.contains("hidden")) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Renderiza cada partícula de poeira antiga
      for (let p of particles) {
        p.time += p.wobbleSpeed;
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.time) * 0.25;

        // Reposiciona quando sai da tela criando fluxo eterno
        if (p.y < -15) {
          p.y = height + 15;
          p.x = Math.random() * width;
        }
        if (p.x < -15) p.x = width + 15;
        if (p.x > width + 15) p.x = -15;

        // Deslocamento de Parallax suave baseado na camada de profundidade
        const drawX = p.x + mouseX * p.depth;
        const drawY = p.y + mouseY * p.depth;

        // Pulso sutil de luz
        const pulse = Math.sin(p.time * 2) * 0.12;
        const currentAlpha = Math.min(Math.max(p.alpha + pulse, 0.08), 0.85);

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.radius, 0, Math.PI * 2);

        // Gradiente radial para a partícula parecer um grão de poeira dourada iluminado
        const grad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, p.radius * 2);
        grad.addColorStop(0, `rgba(221, 196, 187, ${currentAlpha})`);
        grad.addColorStop(0.5, `rgba(199, 165, 152, ${currentAlpha * 0.6})`);
        grad.addColorStop(1, `rgba(199, 165, 152, 0)`);

        ctx.fillStyle = grad;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    animate();
  },

  initLoginParallax() {
    const screen = document.getElementById("login-screen");
    const card = document.querySelector(".login-card");
    const glare = document.querySelector(".login-card-glare");
    const glow = document.querySelector(".login-parallax-glow");
    if (!screen || !card) return;

    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;

    screen.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      // Ângulo de inclinação 3D proporcional ao mouse (máximo 10 graus)
      const deltaX = (e.clientX - cardCenterX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - cardCenterY) / (window.innerHeight / 2);

      targetRotateY = deltaX * 10;
      targetRotateX = -deltaY * 10;

      // Efeito de reflexo de vidro (glare) seguindo o cursor na superfície do card
      if (glare) {
        const mouseCardX = e.clientX - rect.left;
        const mouseCardY = e.clientY - rect.top;
        glare.style.background = `radial-gradient(circle 320px at ${mouseCardX}px ${mouseCardY}px, rgba(221, 196, 187, 0.22) 0%, rgba(199, 165, 152, 0.06) 45%, transparent 75%)`;
      }

      // Efeito de luz ambiente de fundo (spotlight)
      if (glow) {
        glow.style.transform = `translate(${deltaX * 50}px, ${deltaY * 50}px)`;
      }
    });

    screen.addEventListener("mouseleave", () => {
      targetRotateX = 0;
      targetRotateY = 0;
      if (glare) glare.style.background = "transparent";
      if (glow) glow.style.transform = "translate(0, 0)";
    });

    // Interpolação suave (Lerp) para movimento fluido e natural
    const updateTilt = () => {
      if (screen && !screen.classList.contains("hidden")) {
        currentRotateX += (targetRotateX - currentRotateX) * 0.12;
        currentRotateY += (targetRotateY - currentRotateY) * 0.12;
        card.style.transform = `perspective(1000px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
      }
      requestAnimationFrame(updateTilt);
    };

    updateTilt();
  },

  // ==========================================================================
  // CONTROLE DE PAINÉIS LATERAIS (MINIMIZAR / EXPANDIR SIDEBAR E INSPECTOR)
  // ==========================================================================
  toggleSidebar() {
    if (window.innerWidth <= 1080 || this.currentViewport === 'mobile' || this.currentViewport === 'tablet') {
      this.toggleMobileSidebar();
      return;
    }
    this.sidebarCollapsed = !this.sidebarCollapsed;
    try {
      localStorage.setItem("peregrino_sidebar_collapsed", this.sidebarCollapsed);
    } catch (e) {}
    this.applyPanelStates();
    this.renderHeader();
    this.updateWorkspaceHeaderToggles();
  },

  toggleInspector() {
    if (window.innerWidth <= 1080 || this.currentViewport === 'mobile' || this.currentViewport === 'tablet') {
      this.toggleMobileInspector();
      return;
    }
    this.inspectorCollapsed = !this.inspectorCollapsed;
    try {
      localStorage.setItem("peregrino_inspector_collapsed", this.inspectorCollapsed);
    } catch (e) {}
    this.applyPanelStates();
    this.renderHeader();
    this.updateWorkspaceHeaderToggles();
  },

  toggleMobileSidebar() {
    const container = document.getElementById("app-container");
    if (!container) return;
    const isOpen = container.classList.contains("sidebar-mobile-open");
    if (isOpen) {
      container.classList.remove("sidebar-mobile-open");
    } else {
      container.classList.remove("inspector-mobile-open");
      container.classList.add("sidebar-mobile-open");
    }
  },

  toggleMobileInspector() {
    const container = document.getElementById("app-container");
    if (!container) return;
    const isOpen = container.classList.contains("inspector-mobile-open");
    if (isOpen) {
      container.classList.remove("inspector-mobile-open");
    } else {
      container.classList.remove("sidebar-mobile-open");
      container.classList.add("inspector-mobile-open");
    }
  },

  closeMobilePanels() {
    const container = document.getElementById("app-container");
    if (container) {
      container.classList.remove("sidebar-mobile-open");
      container.classList.remove("inspector-mobile-open");
    }
  },

  applyPanelStates() {
    const container = document.getElementById("app-container");
    if (!container) return;

    if (this.sidebarCollapsed) {
      container.classList.add("sidebar-collapsed");
    } else {
      container.classList.remove("sidebar-collapsed");
    }

    if (this.inspectorCollapsed) {
      container.classList.add("inspector-collapsed");
    } else {
      container.classList.remove("inspector-collapsed");
    }

    // Remove qualquer botão flutuante antigo para evitar sobreposição
    const oldFloatLeft = document.getElementById("floating-sidebar-toggle");
    if (oldFloatLeft) oldFloatLeft.remove();
    const oldFloatRight = document.getElementById("floating-inspector-toggle");
    if (oldFloatRight) oldFloatRight.remove();
  },

  // Insere botões de restauração INLINE no cabeçalho do workspace (Zero Sobreposição)
  updateWorkspaceHeaderToggles() {
    const headerEl = document.getElementById("workspace-header");
    if (!headerEl) return;

    // Remove botões anteriores para evitar duplicações
    const oldLeft = headerEl.querySelector(".workspace-restore-btn-left");
    if (oldLeft) oldLeft.remove();
    const oldRight = headerEl.querySelector(".workspace-restore-btn-right");
    if (oldRight) oldRight.remove();

    // 1. Se a navegação lateral esquerda estiver minimizada: insere botão INLINE antes do título
    if (this.sidebarCollapsed) {
      const leftBtn = document.createElement("button");
      leftBtn.className = "workspace-restore-btn workspace-restore-btn-left";
      leftBtn.onclick = () => App.toggleSidebar();
      leftBtn.title = "Expandir Menu de Navegação";
      leftBtn.innerHTML = `${Icons.panelLeft(15)} <span>Navegação</span>`;

      const titleGroup = headerEl.querySelector(".workspace-title-group");
      if (titleGroup) {
        headerEl.insertBefore(leftBtn, titleGroup);
      } else {
        headerEl.prepend(leftBtn);
      }
    }

    // 2. Se o painel de governança direito estiver minimizado: insere botão INLINE em .workspace-actions
    if (this.inspectorCollapsed) {
      const rightBtn = document.createElement("button");
      rightBtn.className = "workspace-restore-btn workspace-restore-btn-right";
      rightBtn.onclick = () => App.toggleInspector();
      rightBtn.title = "Expandir Painel de Governança";
      rightBtn.innerHTML = `<span>Governança</span> ${Icons.panelRight(15)}`;

      const actionsEl = headerEl.querySelector(".workspace-actions");
      if (actionsEl) {
        actionsEl.appendChild(rightBtn);
      } else {
        headerEl.appendChild(rightBtn);
      }
    }
  },

  // ==========================================================================
  // RENDERIZAÇÃO DA BARRA SUPERIOR E CONTROLES DE VIEWPORT
  // ==========================================================================
  renderHeader() {
    const headerEl = document.getElementById("global-header");
    if (!headerEl) return;

    const user = Store.auth.currentUser || Store.users[1];
    const isCreator = Store.currentRole === "creator";
    const isMobileScreen = window.innerWidth <= 768;
    const isAppInstalled = this.isAppInstalled();

    headerEl.innerHTML = `
      <div class="header-brand">
        <button class="btn-header-panel-toggle ${this.sidebarCollapsed ? 'active-collapsed' : ''}" onclick="App.toggleSidebar()" title="${this.sidebarCollapsed ? 'Expandir Menu de Navegação' : 'Minimizar Menu de Navegação'}">
          ${Icons.panelLeft(15)}
        </button>
        <img src="assets/img/logo_peregrino.png" alt="Peregrino" class="header-brand-logo" />
      </div>

      ${(isCreator && !isMobileScreen) ? `
      <!-- SELETOR DE VIEWPORT EM TEMPO REAL (SOMENTE SUPERADMIN DESKTOP) -->
      <div class="viewport-switch" title="Alterne para testar a experiência visual em Desktop ou Mobile">
        <button class="viewport-btn ${this.currentViewport === 'desktop' ? 'active' : ''}" onclick="App.setViewport('desktop')">
          ${Icons.desktop(14)}
          <span>Desktop</span>
        </button>
        <button class="viewport-btn ${this.currentViewport === 'tablet' ? 'active' : ''}" onclick="App.setViewport('tablet')">
          ${Icons.tablet(14)}
          <span>Tablet</span>
        </button>
        <button class="viewport-btn ${this.currentViewport === 'mobile' ? 'active' : ''}" onclick="App.setViewport('mobile')">
          ${Icons.smartphone(14)}
          <span>Mobile</span>
        </button>
      </div>` : `<div style="flex: 1;"></div>`}

      <div class="header-actions">
        <!-- Botão PWA: Instalar Aplicativo -->
        ${!isAppInstalled ? `
        <button class="btn-header-pwa-install" id="header-install-app-btn" onclick="App.promptInstallApp()" title="Instalar aplicativo móvel oficial">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 14V7"/><polyline points="9 11 12 14 15 11"/></svg>
          <span class="pwa-header-label">Instalar App</span>
        </button>` : ''}

        ${user.role === 'guest' ? `
          <div class="role-badge" style="border-color: rgba(245, 158, 11, 0.45); background: rgba(245, 158, 11, 0.08);" title="Passe VIP de Apresentação com validade de 48 horas">
            <span class="role-indicator" style="background: #fbbf24; box-shadow: 0 0 8px #fbbf24;"></span>
            <span style="color: #fbbf24; font-weight: 700;">${isMobileScreen ? 'VIP' : 'PASSE VIP • ' + this.getVipRemainingTimeFormatted()}</span>
          </div>
          <button class="btn-primary hide-on-mobile" style="padding: 5px 12px; font-size: 11px; font-weight: 700; cursor: pointer;" onclick="App.switchTab('termo')" title="Formalizar proposta de apoio">
            <span>Quero Apoiar</span>
          </button>
        ` : `
          <div class="role-badge" title="Usuário Ativo: ${user.name} (${user.email})">
            <span class="role-indicator"></span>
            <span>${user.name.split(' ')[0]} • ${isCreator ? 'CRIADOR' : 'INVESTIDOR'}</span>
          </div>
        `}

        ${(isCreator && !isMobileScreen) ? `
        <button class="btn-secondary" style="padding: 5px 10px; font-size: 11px; display: inline-flex; align-items: center; gap: 5px; color: var(--gold-accent); border-color: rgba(221,196,187,0.3); cursor: pointer;" onclick="App.copyVipInviteLink()" title="Gerar link de convite VIP (24 horas) na nuvem para enviar no WhatsApp">
          ${Icons.link ? Icons.link(12) : ''}
          <span>Gerar Link VIP</span>
        </button>
        <button class="btn-toggle-role" onclick="App.toggleRole()" title="Alternar entre modo criador e modo investidor">
          ${Icons.refresh(13)}
          <span>Trocar Modo</span>
        </button>` : ''}
        <button class="btn-header-panel-toggle hide-on-mobile ${this.inspectorCollapsed ? 'active-collapsed' : ''}" onclick="App.toggleInspector()" title="${this.inspectorCollapsed ? 'Expandir Painel de Governança' : 'Minimizar Painel de Governança'}">
          ${Icons.panelRight(15)}
        </button>
        <button class="btn-header-logout" onclick="App.handleLogout()" title="Sair do Aplicativo">
          ${Icons.logOut(14)}
          <span class="logout-text">Sair</span>
        </button>
      </div>
    `;
  },

  // Troca de Viewport (Desktop / Tablet / Mobile)
  setViewport(mode) {
    this.currentViewport = mode;
    const stageEl = document.getElementById("viewport-stage");
    if (!stageEl) return;

    stageEl.className = `viewport-stage preview-${mode}`;
    this.closeMobilePanels();
    this.renderHeader();
    this.renderMobileTabsNav();
    this.renderMobileBottomNav();
    this.updateWorkspaceHeaderToggles();
  },

  // Alternar entre Visão de Investidor e Visão de Criador
  toggleRole() {
    if (Store.currentRole === "supporter") {
      Store.switchUser("USR-001"); // Troca para Haja Luz Studio
    } else {
      Store.switchUser("INV-0701"); // Troca para Pastor Adriano
    }
    this.renderHeader();
    this.renderSidebar();
    this.renderInspector();
    this.renderCurrentWorkspace();
  },

  // ==========================================================================
  // RENDERIZAÇÃO DA SIDEBAR (COLUNA 1)
  // ==========================================================================
  renderSidebar() {
    const sidebarEl = document.getElementById("sidebar");
    if (!sidebarEl) return;

    sidebarEl.innerHTML = `
      <div class="sidebar-top-bar">
        <span class="sidebar-top-title">Menu & Navegação</span>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button class="btn-drawer-quick-logout show-on-mobile" onclick="App.handleLogout()" title="Sair da Conta">
            ${Icons.logOut(13)}
            <span>Sair</span>
          </button>
          <button class="btn-panel-minimize hide-on-mobile" onclick="App.toggleSidebar()" title="Minimizar Menu de Navegação">
            ${Icons.chevronLeft(13)}
            <span>Minimizar</span>
          </button>
          <button class="btn-sidebar-close-mobile show-on-mobile" onclick="App.closeMobilePanels()" title="Fechar Menu">
            &times;
          </button>
        </div>
      </div>

      <!-- Item PWA de Instalação do Aplicativo -->
      <div class="sidebar-section sidebar-section-pwa">
        <ul class="nav-list">
          <li class="nav-item">
            <a class="nav-link nav-link-pwa" onclick="App.promptInstallApp()" title="Instalar versão oficial do aplicativo">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gold-accent); flex-shrink: 0;"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 14V7"/><polyline points="9 11 12 14 15 11"/></svg>
              <span id="sidebar-install-label" style="font-weight: 700; color: var(--gold-accent);">Instalar Aplicativo Oficial</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-label">Apresentação & Visão</div>
        <ul class="nav-list">
          <li class="nav-item">
            <a class="nav-link ${this.activeTab === 'boas-vindas' ? 'active' : ''}" onclick="App.switchTab('boas-vindas')">
              ${Icons.compass(16)}
              <span>Visão & Propósito</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${this.activeTab === 'apoiar' ? 'active' : ''}" onclick="App.switchTab('apoiar')">
              ${Icons.award(16)}
              <span>Como Apoiar & Recompensas</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-label">Comunicação & Dev</div>
        <ul class="nav-list">
          <li class="nav-item">
            <a class="nav-link ${this.activeTab === 'devlog' ? 'active' : ''}" onclick="App.switchTab('devlog')">
              ${Icons.camera(16)}
              <span>Devlog & Mídia</span>
              <span class="nav-counter">${Store.devlogPosts.length}</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-label">Arquitetura do Jogo</div>
        <ul class="nav-list">
          <li class="nav-item">
            <a class="nav-link ${this.activeTab === 'personagens' ? 'active' : ''}" onclick="App.switchTab('personagens')">
              ${Icons.box3d(16)}
              <span>Personagens 3D</span>
              <span class="nav-counter" style="background: var(--gold-subtle); color: var(--gold-accent); border: 1px solid rgba(199,165,152,0.3);">23</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${this.activeTab === 'bases' ? 'active' : ''}" onclick="App.switchTab('bases')">
              ${Icons.bases(16)}
              <span>As 7 Bases da Vila</span>
              <span class="nav-counter">7</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${this.activeTab === 'distritos' ? 'active' : ''}" onclick="App.switchTab('distritos')">
              ${Icons.map(16)}
              <span>Os 7 Distritos</span>
              <span class="nav-counter">7</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-label">Governança & Contrato</div>
        <ul class="nav-list">
          <li class="nav-item">
            <a class="nav-link ${this.activeTab === 'termo' || this.activeTab === 'simulador' ? 'active' : ''}" onclick="App.switchTab('termo')">
              ${Icons.calculator(16)}
              <span>Simulador & Termo Oficial</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${this.activeTab === 'dossie' ? 'active' : ''}" onclick="App.switchTab('dossie')">
              ${Icons.fileText(16)}
              <span>Dossiê Comercial</span>
            </a>
          </li>
          ${Store.currentRole === 'creator' ? `
          <li class="nav-item">
            <a class="nav-link ${this.activeTab === 'usuarios' ? 'active' : ''}" onclick="App.switchTab('usuarios')">
              ${Icons.users ? Icons.users(16) : Icons.user(16)}
              <span>Gestão de Usuários</span>
              <span class="nav-counter" style="background: rgba(199, 165, 152, 0.2); color: var(--gold-accent); border: 1px solid rgba(199, 165, 152, 0.4);">${Store.getUsers ? Store.getUsers().length : Store.users.length}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${this.activeTab === 'gestao' ? 'active' : ''}" onclick="App.switchTab('gestao')">
              ${Icons.coins(16)}
              <span>Gestão de Aportes</span>
              ${(Store.getContracts && Store.getContracts().filter(c => c.status === 'pendente').length > 0) ? `
                <span class="nav-counter" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 10px; padding: 1px 6px;">
                  ${Store.getContracts().filter(c => c.status === 'pendente').length}
                </span>
              ` : ''}
            </a>
          </li>` : ''}
        </ul>
      </div>

      <div class="sidebar-footer">
        <div class="project-summary-box">
          <div class="project-summary-title">Governança Societária</div>
          <div class="project-summary-val">
            <span>Criador: ${Store.config.creatorShare}%</span>
            <span style="color: var(--gold-accent);">Pool: ${Store.config.supportersPool}%</span>
          </div>
        </div>
        <div class="sidebar-logout-card">
          <button type="button" class="btn-sidebar-logout" onclick="App.handleLogout()" title="Encerrar sessão e sair do aplicativo">
            ${Icons.logOut(16)}
            <span>Sair do Aplicativo</span>
          </button>
        </div>
      </div>
    `;
  },

  // Alternar Tab Ativa
  switchTab(tabName) {
    this.activeTab = tabName;
    try {
      localStorage.setItem("peregrino_active_tab", tabName);
      sessionStorage.setItem("peregrino_active_tab", tabName);
    } catch (e) {}
    this.closeMobilePanels();
    this.renderSidebar();
    this.renderCurrentWorkspace();
    this.renderMobileTabsNav();
    this.renderMobileBottomNav();
  },

  // Barra de Navegação Horizontal das Abas no Mobile & Tablet
  renderMobileTabsNav() {
    const navEl = document.getElementById("mobile-tabs-nav");
    if (!navEl) return;

    const isCreator = Store.currentRole === "creator";
    const tabs = [
      { id: "boas-vindas", label: "Visão", icon: Icons.compass(13) },
      { id: "apoiar", label: "Apoiar", icon: Icons.award(13) },
      { id: "devlog", label: "Devlog", icon: Icons.camera(13), counter: Store.devlogPosts ? Store.devlogPosts.length : null },
      { id: "personagens", label: "3D", icon: Icons.box3d(13), counter: 23 },
      { id: "bases", label: "7 Bases", icon: Icons.bases(13), counter: 7 },
      { id: "distritos", label: "7 Distritos", icon: Icons.map(13), counter: 7 },
      { id: "termo", label: "Simulador", icon: Icons.calculator(13) },
      { id: "dossie", label: "Dossiê", icon: Icons.fileText(13) },
    ];

    if (isCreator) {
      tabs.push({ id: "usuarios", label: "Usuários", icon: Icons.users ? Icons.users(13) : Icons.user(13), counter: Store.getUsers ? Store.getUsers().length : Store.users.length });
      tabs.push({ id: "gestao", label: "Aportes", icon: Icons.coins(13) });
    }

    navEl.innerHTML = `
      <div class="mobile-tabs-scroll">
        ${tabs.map(t => {
          const isActive = this.activeTab === t.id || (t.id === 'termo' && this.activeTab === 'simulador');
          return `
            <button type="button" class="mobile-tab-chip ${isActive ? 'active' : ''}" onclick="App.switchTab('${t.id}')">
              ${t.icon}
              <span>${t.label}</span>
              ${t.counter ? `<span class="mobile-tab-counter">${t.counter}</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>
    `;

    const activeChip = navEl.querySelector(".mobile-tab-chip.active");
    if (activeChip) {
      setTimeout(() => {
        activeChip.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }, 50);
    }
  },

  // Barra de Navegação Inferior Estilo App Nativo (Mobile Bottom Navigation)
  renderMobileBottomNav() {
    const bottomNavEl = document.getElementById("mobile-bottom-nav");
    if (!bottomNavEl) return;

    const devlogCount = Store.devlogPosts ? Store.devlogPosts.length : null;
    const isTermoActive = this.activeTab === "termo" || this.activeTab === "simulador";
    const isSidebarOpen = document.getElementById("app-container")?.classList.contains("sidebar-mobile-open");

    bottomNavEl.innerHTML = `
      <div class="bottom-nav-container">
        <button type="button" class="bottom-nav-btn ${this.activeTab === 'boas-vindas' ? 'active' : ''}" onclick="App.switchTab('boas-vindas')" title="Visão Geral">
          <span class="bottom-nav-icon">${Icons.compass(18)}</span>
          <span class="bottom-nav-label">Visão</span>
        </button>
        <button type="button" class="bottom-nav-btn ${this.activeTab === 'apoiar' ? 'active' : ''}" onclick="App.switchTab('apoiar')" title="Cotas & Recompensas">
          <span class="bottom-nav-icon">${Icons.award(18)}</span>
          <span class="bottom-nav-label">Apoiar</span>
        </button>
        <button type="button" class="bottom-nav-btn ${this.activeTab === 'devlog' ? 'active' : ''}" onclick="App.switchTab('devlog')" title="Devlog 3D">
          <span class="bottom-nav-icon" style="position: relative;">
            ${Icons.camera(18)}
            ${devlogCount ? `<span class="bottom-nav-badge">${devlogCount}</span>` : ''}
          </span>
          <span class="bottom-nav-label">Devlog</span>
        </button>
        <button type="button" class="bottom-nav-btn ${isTermoActive ? 'active' : ''}" onclick="App.switchTab('termo')" title="Simulador de Cotas">
          <span class="bottom-nav-icon">${Icons.calculator(18)}</span>
          <span class="bottom-nav-label">Simulador</span>
        </button>
        <button type="button" class="bottom-nav-btn ${isSidebarOpen ? 'active' : ''}" onclick="App.toggleMobileSidebar()" title="Menu Completo">
          <span class="bottom-nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </span>
          <span class="bottom-nav-label">Menu</span>
        </button>
      </div>
    `;
  },

  // ==========================================================================
  // RENDERIZAÇÃO DO INSPECTOR LATERAL / TELEMETRIA (COLUNA 3)
  // ==========================================================================
  renderInspector() {
    const inspectorEl = document.getElementById("inspector");
    if (!inspectorEl) return;

    const isCreator = Store.currentRole === "creator";
    const userContract = Store.getUserContract(Store.auth.currentUser);
    const investor = userContract ? {
      name: userContract.name,
      institution: userContract.institution || "Apoiador Individual",
      monthlyContribution: Number(userContract.monthlyContribution) || 0,
      monthsCommitted: Number(userContract.monthsCommitted) || 12,
      equitySharePercent: Number(userContract.equitySharePercent) || 0,
      contractHash: userContract.contractHash,
      status: userContract.status,
      inGameLot: (Store.auth.currentUser && Store.auth.currentUser.inGameLot) || 'Base Comunitária'
    } : (Store.currentInvestor || {
      name: (Store.auth.currentUser && Store.auth.currentUser.name) || "Apoiador Não Qualificado",
      institution: "Pendente de Formalização",
      monthlyContribution: 0,
      monthsCommitted: 0,
      equitySharePercent: 0,
      contractHash: "Aguardando assinatura de termo",
      status: "novo",
      inGameLot: "Base Comunitária"
    });

    const supporterCardHtml = isCreator ? `
      <!-- Card Consolidado do Criador / Estúdio -->
      <div class="inspector-card">
        <div class="inspector-card-header">
          <div class="inspector-card-title">
            ${Icons.coins(14)}
            <span>Rodada de Investidores</span>
          </div>
          <span class="spec-badge" style="color: var(--gold-accent);">Fase 2 MVP</span>
        </div>
        <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">
          Haja Luz Studio (Diretoria)
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
          ${Store.getContracts().filter(c => c.status === 'aprovado').length} Investidores Homologados
        </div>
        <div class="stat-grid">
          <div class="stat-item">
            <span class="stat-label">Captação Total</span>
            <span class="stat-value">R$ ${Store.getContracts().reduce((acc, c) => acc + (Number(c.totalInvested) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span class="stat-subtext">Meta: R$ 120.000</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Pool Alocada</span>
            <span class="stat-value highlight">${Store.getContracts().reduce((acc, c) => acc + (Number(c.equitySharePercent) || 0), 0).toFixed(2)}%</span>
            <span class="stat-subtext">${(Store.config.supportersPool - Store.getContracts().reduce((acc, c) => acc + (Number(c.equitySharePercent) || 0), 0)).toFixed(2)}% Disponível</span>
          </div>
        </div>
      </div>
    ` : Store.currentRole === "guest" ? `
      <!-- Card do Convidado VIP (Passe 24h) -->
      <div class="inspector-card" style="border: 1px solid rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.05);">
        <div class="inspector-card-header">
          <div class="inspector-card-title">
            <span style="color: #fbbf24;">Passe de Apresentação VIP</span>
          </div>
          <span class="contract-badge pendente">Passe 24h</span>
        </div>
        <div style="font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 2px;">
          Tempo Restante: <strong style="color: #fbbf24; font-family: var(--font-mono); font-size: 14px;">${this.getVipRemainingTimeFormatted()}</strong>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
          Acesso exclusivo para apreciação e simulação de investimento
        </div>
        <div class="stat-grid">
          <div class="stat-item">
            <span class="stat-label">Sua Proposta</span>
            <span class="stat-value" style="font-size: 13px; color: #fbbf24;">Não Formalizada</span>
            <span class="stat-subtext">Sem vínculo ativo</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Cota Potencial</span>
            <span class="stat-value highlight">Até 49%</span>
            <span class="stat-subtext">Pool Aberto</span>
          </div>
        </div>
        <button class="btn-primary" style="width: 100%; margin-top: 12px; font-size: 11.5px; padding: 8px 12px; justify-content: center; cursor: pointer;" onclick="App.switchTab('termo')">
          <span>Formalizar Minha Proposta de Apoio →</span>
        </button>
      </div>
    ` : `
      <!-- Card do Apoiador Individual -->
      <div class="inspector-card">
        <div class="inspector-card-header">
          <div class="inspector-card-title">
            ${Icons.user(14)}
            <span>Sua Participação</span>
          </div>
          ${investor.status === 'pendente' 
            ? `<span class="contract-badge pendente">Em Análise</span>`
            : investor.status === 'aprovado'
            ? `<span class="contract-badge aprovado">Homologado</span>`
            : investor.status === 'recusado'
            ? `<span class="contract-badge recusado">Requer Ajuste</span>`
            : `<span class="spec-badge">Sem Contrato</span>`}
        </div>
        <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">
          ${investor.name}
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
          ${investor.institution} • ${investor.inGameLot || 'Base Comunitária'}
        </div>
        <div class="stat-grid">
          <div class="stat-item">
            <span class="stat-label">Aporte Mensal</span>
            <span class="stat-value">R$ ${Number(investor.monthlyContribution).toFixed(2)}</span>
            <span class="stat-subtext">${investor.monthsCommitted} meses</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Cota de RevShare</span>
            <span class="stat-value highlight">${Number(investor.equitySharePercent).toFixed(2)}%</span>
            <span class="stat-subtext">Marco Zero Líquido</span>
          </div>
        </div>
      </div>
    `;

    inspectorEl.innerHTML = `
      <div class="inspector-top-bar">
        <span class="inspector-top-title">Painel de Governança</span>
        <button class="btn-panel-minimize hide-on-mobile" onclick="App.toggleInspector()" title="Minimizar Painel Lateral">
          <span>Minimizar</span>
          ${Icons.chevronRight(13)}
        </button>
        <button class="btn-sidebar-close-mobile show-on-mobile" onclick="App.closeMobilePanels()" title="Fechar Telemetria">
          &times;
        </button>
      </div>

      <div class="inspector-body-content">
        ${supporterCardHtml}

        <!-- Card de Telemetria do Motor 3D -->
        <div class="inspector-card">
          <div class="inspector-card-header">
            <div class="inspector-card-title">
              ${Icons.cpu(14)}
              <span>Telemetria do Motor</span>
            </div>
            <span class="spec-badge" style="color: #38a169; border-color: rgba(56,161,105,0.4);">60 FPS</span>
          </div>
          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-label">Engine</span>
              <span class="stat-value" style="font-size: 12px;">Godot 4.x</span>
              <span class="stat-subtext">Cel-Shading</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Culling</span>
              <span class="stat-value engine" style="font-size: 12px;">120m</span>
              <span class="stat-subtext">MultiMesh Ativo</span>
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 11px; color: var(--text-secondary); line-height: 1.4;">
            Zero violência física. Ciclo espiritual: Encontrar → Conhecer → Ensinar → Transformar.
          </div>
        </div>

        <!-- Card de Garantia Jurídica e Hash SHA-256 -->
        <div class="inspector-card">
          <div class="inspector-card-header">
            <div class="inspector-card-title">
              ${Icons.shieldCheck(14)}
              <span>Registro Criptográfico</span>
            </div>
          </div>
          <div style="font-size: 11px; color: var(--text-secondary);">
            Hash do Contrato (SHA-256 gravado no banco de dados):
          </div>
          <div class="hash-box" id="sidebar-hash-display">
            ${investor.contractHash}
          </div>
          <div class="hash-status">
            ${Icons.check(12)}
            <span>Integridade contratual verificada</span>
          </div>
          <button class="btn-secondary" style="width: 100%; margin-top: 12px; justify-content: center;" onclick="App.downloadTermo()">
            ${Icons.download(13)}
            <span>Baixar Termo em PDF</span>
          </button>
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // RENDERIZAÇÃO DO WORKSPACE CENTRAL (COLUNA 2)
  // ==========================================================================
  renderCurrentWorkspace() {
    const workspaceHeaderEl = document.getElementById("workspace-header");
    const workspaceBodyEl = document.getElementById("workspace-body");
    if (!workspaceHeaderEl || !workspaceBodyEl) return;

    switch (this.activeTab) {
      case "boas-vindas":
        this.renderBoasVindas(workspaceHeaderEl, workspaceBodyEl);
        break;
      case "apoiar":
        this.renderComoApoiar(workspaceHeaderEl, workspaceBodyEl);
        break;
      case "devlog":
        this.renderDevlog(workspaceHeaderEl, workspaceBodyEl);
        break;
      case "simulador":
        this.activeTab = "termo";
        this.renderTermo(workspaceHeaderEl, workspaceBodyEl);
        break;
      case "bases":
        this.renderBases(workspaceHeaderEl, workspaceBodyEl);
        break;
      case "distritos":
        this.renderDistritos(workspaceHeaderEl, workspaceBodyEl);
        break;
      case "personagens":
        this.renderPersonagens(workspaceHeaderEl, workspaceBodyEl);
        break;
      case "termo":
        this.renderTermo(workspaceHeaderEl, workspaceBodyEl);
        break;
      case "dossie":
        this.renderDossie(workspaceHeaderEl, workspaceBodyEl);
        break;
      case "gestao":
        this.renderGestao(workspaceHeaderEl, workspaceBodyEl);
        break;
      case "usuarios":
        this.renderUsuarios(workspaceHeaderEl, workspaceBodyEl);
        break;
    }

    // Aplica os botões de restauração inline no header do workspace recém-renderizado
    this.updateWorkspaceHeaderToggles();

    // Renderiza a barra de abas mobile / tablet
    this.renderMobileTabsNav();
  },

  // 0. MÓDULO BOAS-VINDAS & PROPÓSITO DO JOGO
  renderBoasVindas(headerEl, bodyEl) {
    headerEl.innerHTML = `
      <div class="workspace-title-group">
        <h2>Boas-Vindas a Peregrino: Visão & Propósito</h2>
        <p>Apresentação oficial, fundamentação histórica, missão cultural e modelo de governança comunitária</p>
      </div>
      <div class="workspace-actions">
        <button class="btn-secondary" onclick="App.openGameGuideModal()" style="display: inline-flex; align-items: center; gap: 6px; color: var(--gold-accent); border-color: rgba(199,165,152,0.4);">
          ${Icons.fileText(14)}
          <span>Guia Completo da Jornada</span>
        </button>
        <button class="btn-primary" onclick="App.switchTab('devlog')" style="display: inline-flex; align-items: center; gap: 8px;">
          <span>Acessar Devlog & Produção 3D</span>
          ${Icons.arrowRight ? Icons.arrowRight(14) : '→'}
        </button>
      </div>
    `;

    bodyEl.innerHTML = `
      <div class="welcome-container">
        
        <!-- HERO BANNER COM O LOGO E SLOGAN -->
        <div class="welcome-hero-banner">
          <div class="welcome-hero-backdrop"></div>
          <div class="welcome-hero-content">
            <div class="welcome-emblem-badge">HAJA LUZ STUDIO • MANIFESTO OFICIAL</div>
            <img src="assets/img/logo_peregrino.png" alt="Peregrino" class="welcome-hero-logo" />
            <div class="welcome-hero-slogan">O caminho, e a verdade e a vida</div>
            <p class="welcome-hero-desc">
              Seja bem-vindo ao portal de investidores e governança comunitária de <strong>Peregrino</strong>. 
              Aqui, a tecnologia dos videogames de ponta encontra a fidelidade das Escrituras para criar uma obra atemporal 
              desenvolvida com rigor bíblico, motor gráfico Godot 4 e total transparência aos parceiros e conselheiros pioneiros.
            </p>
          </div>
        </div>

        <!-- BANNER DE DESTAQUE: GUIA COMPLETO DA JORNADA (MISSÕES, NÍVEIS & PROPÓSITO) -->
        <div style="background: linear-gradient(135deg, rgba(221, 196, 187, 0.08) 0%, rgba(199, 165, 152, 0.03) 100%); border: 1px solid rgba(199, 165, 152, 0.45); border-radius: var(--radius-lg); padding: 22px 26px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; box-shadow: 0 10px 28px rgba(0, 0, 0, 0.6); margin-bottom: 24px;">
          <div style="max-width: 680px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span class="spec-badge" style="color: var(--gold-accent); border-color: rgba(199,165,152,0.4);">DOCUMENTO CANÔNICO & GAMEPLAY</span>
              <span class="status-pill status-active" style="font-size: 10px;">LEITURA RECOMENDADA</span>
            </div>
            <h3 style="font-size: 17px; font-weight: 700; color: #ffffff; margin-bottom: 5px;">
              Guia da Jornada: Como se Joga, Missões, Níveis & Importância Cultural
            </h3>
            <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
              Compreenda a mecânica pacífica única (Encontrar, Conhecer, Ensinar, Transformar), a progressão espiritual em 5 níveis, os 4 grandes eixos de missões, a sobrevivência comunitária nas 7 bases e o propósito nobre de <strong>Peregrino</strong> para as novas gerações.
            </p>
          </div>
          <button type="button" class="btn-primary" onclick="App.openGameGuideModal()" style="padding: 11px 22px; font-size: 13px; font-weight: 700; white-space: nowrap; display: inline-flex; align-items: center; gap: 8px;">
            ${Icons.fileText(15)}
            <span>Ler o Guia Completo da Jornada</span>
            ${Icons.arrowRight ? Icons.arrowRight(13) : '→'}
          </button>
        </div>

        <!-- GRID DOS 3 PILARES: MISSÃO, A DOR QUE ELE RESOLVE E O PROPÓSITO -->
        <div class="welcome-pillars-grid">
          
          <!-- PILAR 1: A MISSÃO DO JOGO -->
          <div class="welcome-pillar-card">
            <div class="pillar-card-header">
              <div class="pillar-icon-box">
                ${Icons.compass(20)}
              </div>
              <span class="pillar-badge mission">A MISSÃO</span>
            </div>
            <h3 class="pillar-title">Recriar o Século I com Excelência e Alma</h3>
            <p class="pillar-text">
              Reconstruir a Judeia e a Galileia bíblica em mundo aberto no motor <strong>Godot 4.x</strong>, 
              permitindo que os jogadores caminhem por uma narrativa viva onde cada escolha ecoa ensinamentos eternos.
            </p>
            <div class="pillar-highlights">
              <div class="pillar-point">
                <strong>Narrativa Sem Violência Gratuita:</strong> Foco em sabedoria, conciliação e acolhimento comunitário.
              </div>
              <div class="pillar-point">
                <strong>Fidelidade Histórica & Teológica:</strong> Vilarejos, costumes, arquitetura de calcário e vestes fidedignas.
              </div>
              <div class="pillar-point">
                <strong>O Jogador como Discípulo:</strong> Na pele de um cronista peregrino que testemunha milagres e registra os caminhos da fé.
              </div>
            </div>
          </div>

          <!-- PILAR 2: A DOR QUE ELE RESOLVE -->
          <div class="welcome-pillar-card">
            <div class="pillar-card-header">
              <div class="pillar-icon-box">
                ${Icons.shieldCheck(20)}
              </div>
              <span class="pillar-badge pain">A DOR QUE RESOLVE</span>
            </div>
            <h3 class="pillar-title">Superar o Estigma dos "Jogos Bíblicos"</h3>
            <p class="pillar-text">
              Durante décadas, obras com temática bíblica foram limitadas por orçamentos inexpressivos e mecânicas simplórias, 
              afastando jovens e famílias que consomem jogos convencionais saturados de violência e vazio moral.
            </p>
            <div class="pillar-highlights">
              <div class="pillar-point">
                <strong>Padrão Técnico Contemporâneo:</strong> 60 FPS cravados, shaders cel-shading customizados e face scans 3D de alta densidade.
              </div>
              <div class="pillar-point">
                <strong>Alternativa Nobre para Famílias:</strong> Um jogo que edifica e inspira sem abrir mão do desafio e da diversão imersiva.
              </div>
              <div class="pillar-point">
                <strong>Engajamento Genuíno de Jovens:</strong> Atração cultural através da excelência estética e da profundidade de gameplay.
              </div>
            </div>
          </div>

          <!-- PILAR 3: O PROPÓSITO SAGRADO -->
          <div class="welcome-pillar-card">
            <div class="pillar-card-header">
              <div class="pillar-icon-box">
                ${Icons.sparkles(20)}
              </div>
              <span class="pillar-badge purpose">O PROPÓSITO</span>
            </div>
            <h3 class="pillar-title">Legado Geracional & Governança Viva</h3>
            <p class="pillar-text">
              Glorificar a Deus através da mais alta expressão em arte interativa e inaugurar um modelo pioneiro de investimento cristão sustentável e participativo.
            </p>
            <div class="pillar-highlights">
              <div class="pillar-point">
                <strong>Copropriedade com os Pioneiros:</strong> Pool de 49% das cotas societárias distribuídas aos investidores da congregação.
              </div>
              <div class="pillar-point">
                <strong>Auditoria Imutável em Tempo Real:</strong> Registro contratual blindado com Hash SHA-256 e sincronização direta com os arquivos do Godot.
              </div>
              <div class="pillar-point">
                <strong>Imersão In-Game dos Apoiadores:</strong> Presença comissionada dos patrocinadores em distritos e vilas como guardiões da comunidade.
              </div>
            </div>
          </div>

        </div>

        <!-- CHAMADA DE DESTAQUE: APOIO MISSIONÁRIO & PERSONAGEM 3D -->
        <div style="background: radial-gradient(ellipse at 50% 0%, rgba(199, 165, 152, 0.16) 0%, rgba(10, 10, 10, 0.95) 80%); border: 1px solid var(--gold-accent); border-radius: var(--radius-lg); padding: 22px 26px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.8);">
          <div style="max-width: 680px;">
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <span class="pillar-badge mission">OBRA 100% MISSIONÁRIA</span>
              <span class="pillar-badge purpose">RECOMPENSA 3D IN-GAME</span>
            </div>
            <h3 style="font-size: 16.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 5px;">
              Seja Imortalizado na Galileia: Ganhe seu Personagem 3D In-Game
            </h3>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
              Apoiadores contínuos com compromisso a partir de 12 meses ganham um NPC esculpido com suas feições reais nas bases do jogo (como o <strong>Pr. Adriano</strong>, <strong>William</strong> e <strong>Felipe</strong>). Ou apoie com qualquer oferta voluntária livre via PIX!
            </p>
          </div>
          <button class="btn-primary" onclick="App.switchTab('apoiar')" style="padding: 10px 20px; font-size: 13px; white-space: nowrap;">
            <span>Ver Como Apoiar & Exemplos 3D →</span>
          </button>
        </div>

        <!-- ATALHOS RÁPIDOS PARA NAVEGAÇÃO -->
        <div class="welcome-quicknav-card">
          <div class="quicknav-header">
            <div>
              <h4>Pronto para auditar e acompanhar o andamento da obra?</h4>
              <p>Navegue pelos módulos estratégicos da plataforma em tempo real:</p>
            </div>
          </div>
          <div class="quicknav-grid">
            <button class="quicknav-item" onclick="App.switchTab('apoiar')" style="border-color: rgba(199, 165, 152, 0.45); background: rgba(199, 165, 152, 0.08);">
              <div class="quicknav-icon">${Icons.award(18)}</div>
              <div class="quicknav-info">
                <strong style="color: var(--gold-accent-hover);">Como Apoiar & PIX</strong>
                <span>Personagem 3D (12 meses)</span>
              </div>
            </button>
            <button class="quicknav-item" onclick="App.switchTab('devlog')">
              <div class="quicknav-icon">${Icons.camera(18)}</div>
              <div class="quicknav-info">
                <strong>Devlog & Mídia Real</strong>
                <span>Capturas e telemetria da engine Godot 4</span>
              </div>
            </button>
            <button class="quicknav-item" onclick="App.switchTab('personagens')">
              <div class="quicknav-icon">${Icons.box3d(18)}</div>
              <div class="quicknav-info">
                <strong>Personagens 3D</strong>
                <span>23 modelos, skins históricas e atributos</span>
              </div>
            </button>
            <button class="quicknav-item" onclick="App.switchTab('bases')">
              <div class="quicknav-icon">${Icons.bases(18)}</div>
              <div class="quicknav-info">
                <strong>As 7 Bases da Vila</strong>
                <span>Fundações de sobrevivência comunitária</span>
              </div>
            </button>
          </div>
        </div>

      </div>
    `;
  },

  // ==========================================================================
  // MÓDULO: COMO APOIAR & RECOMPENSAS (OBRA MISSIONÁRIA, PIX & PERSONAGENS 3D)
  // ==========================================================================
  renderComoApoiar(headerEl, bodyEl) {
    headerEl.innerHTML = `
      <div class="workspace-title-group">
        <h2>Como Apoiar: Obra Missionária & Recompensas In-Game</h2>
        <p>Projeto de fé sem fins lucrativos. Conheça as formas voluntárias de apoiar e as recompensas exclusivas.</p>
      </div>
      <div class="workspace-actions">
        <button class="btn-primary" onclick="App.scrollToPix()" style="display: inline-flex; align-items: center; gap: 8px;">
          ${Icons.refresh(13)}
          <span>Fazer Oferta via PIX</span>
        </button>
      </div>
    `;

    bodyEl.innerHTML = `
      <div class="support-container">

        <!-- 1. DECLARAÇÃO DE OBRA MISSIONÁRIA (SEM FINS LUCRATIVOS / VALORES LIVRES) -->
        <div class="missionary-statement-card">
          <div class="missionary-icon-badge">
            ${Icons.sparkles(26)}
          </div>
          <div class="missionary-statement-text">
            <h3>Uma Obra Missionária Feita por e para a Igreja</h3>
            <p>
              <strong>Peregrino não visa lucro financeiro.</strong> Este jogo é um ministério de evangelização e edificação cultural conduzido pelo <strong>Haja Luz Studio</strong> para proclamar as Escrituras com o mais alto nível tecnológico da indústria. 
              Por ser uma obra missionária de fé, <strong>não estipulamos valores fixos nem cotas obrigatórias</strong>: o desenvolvimento, os servidores, a computação gráfica e a manutenção contínua são sustentados por orações e ofertas voluntárias de irmãos e investidores apaixonados pelo Reino.
            </p>
          </div>
        </div>

        <!-- 2. O GRANDE DESTAQUE: PERSONAGEM 3D DENTRO DO JOGO (12 MESES) -->
        <div class="perk-hero-section">
          <div class="perk-hero-header">
            <div class="perk-hero-title-group">
              <span class="pillar-badge purpose">RECOMPENSA DE HONRA AOS PIONEIROS</span>
              <h2>Eternize sua Vida na Galileia: Ganhe seu Personagem 3D In-Game</h2>
              <p>
                Os investidores mensais com compromisso ministerial contínuo (mínimo de 12 meses) recebem o maior reconhecimento do projeto: 
                <strong>um personagem 3D personalizado com a sua face real esculpida a caráter no século I</strong>, passando a residir e atuar nas bases e vilarejos do jogo!
              </p>
            </div>
            <div class="perk-requirement-pill">
              ${Icons.award(16)}
              <span>Apoiador Mensal • 12 Meses Mínimo</span>
            </div>
          </div>

          <!-- GALERIA SHOWCASE DOS 3 APOIADORES REAIS JÁ ESCULPIDOS -->
          <div class="supporters-3d-showcase">
            
            <!-- EXEMPLO 1: PASTOR ADRIANO -->
            <div class="supporter-3d-card">
              <div class="supporter-img-wrapper">
                <img src="assets/img/personagens/npc pastor adriano.jpeg" alt="Pastor Adriano 3D" class="supporter-3d-img" />
                <div class="supporter-verified-tag">
                  ${Icons.check(11)} In-Game Godot 4
                </div>
              </div>
              <div class="supporter-card-info">
                <div class="supporter-name-row">
                  <span class="supporter-name">Pastor Adriano</span>
                  <span class="supporter-role-badge">Conselheiro</span>
                </div>
                <div class="supporter-loc">
                  ${Icons.map(13)} Tenda de Oração • Distrito 4 (Platô Leste)
                </div>
                <div class="supporter-bonus-box">
                  <strong>Bônus Comunitário In-Game:</strong> Concede +25% de Fé permanente e acolhimento pastoral às famílias da vila.
                </div>
                <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4; margin-top: 4px;">
                  Modelado a partir do scan facial do Pastor Adriano. No jogo, é o mentor do centro de discipulado de Cafarnaum.
                </div>
              </div>
            </div>

            <!-- EXEMPLO 2: WILLIAM -->
            <div class="supporter-3d-card">
              <div class="supporter-img-wrapper">
                <img src="assets/img/personagens/npc william.jpeg" alt="William 3D" class="supporter-3d-img" />
                <div class="supporter-verified-tag">
                  ${Icons.check(11)} In-Game Godot 4
                </div>
              </div>
              <div class="supporter-card-info">
                <div class="supporter-name-row">
                  <span class="supporter-name">William</span>
                  <span class="supporter-role-badge">Suprimentos</span>
                </div>
                <div class="supporter-loc">
                  ${Icons.map(13)} Armazéns Centrais • Cafarnaum (Distrito 2)
                </div>
                <div class="supporter-bonus-box">
                  <strong>Bônus Comunitário In-Game:</strong> Garante +20% de Recursos perenes e proteção aos celeiros durante secas.
                </div>
                <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4; margin-top: 4px;">
                  Modelado com feições reais do investidor William. Administra estoques de trigo, azeite e rotas de mantimentos.
                </div>
              </div>
            </div>

            <!-- EXEMPLO 3: FELIPE -->
            <div class="supporter-3d-card">
              <div class="supporter-img-wrapper">
                <img src="assets/img/personagens/npc felipie.jpeg" alt="Felipe 3D" class="supporter-3d-img" />
                <div class="supporter-verified-tag">
                  ${Icons.check(11)} In-Game Godot 4
                </div>
              </div>
              <div class="supporter-card-info">
                <div class="supporter-name-row">
                  <span class="supporter-name">Felipe</span>
                  <span class="supporter-role-badge">Emissário</span>
                </div>
                <div class="supporter-loc">
                  ${Icons.map(13)} Posto de Fronteira • Rotas Norte (Distrito 1)
                </div>
                <div class="supporter-bonus-box">
                  <strong>Bônus Comunitário In-Game:</strong> +15% de Velocidade de caravanas e vigília contra riscos nas estradas.
                </div>
                <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4; margin-top: 4px;">
                  Modelagem 3D do irmão Felipe com túnica rústica de viagem. Avisa a vila sobre forasteiros e mercadores chegantes.
                </div>
              </div>
            </div>

          </div>

          <!-- COMO FUNCIONA O PROCESSO DE CRIAÇÃO DO SEU PERSONAGEM 3D -->
          <div>
            <h4 style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; letter-spacing: 0.3px;">
              Como Criamos o seu Personagem 3D (Passo a Passo do Estúdio):
            </h4>
            <div class="perk-steps-grid">
              <div class="perk-step-item">
                <span class="step-num">PASSO 01</span>
                <span class="step-title">Envio das Fotos</span>
                <span class="step-desc">Você nos envia fotos de frente e perfil em boa iluminação para a modelagem facial.</span>
              </div>
              <div class="perk-step-item">
                <span class="step-num">PASSO 02</span>
                <span class="step-title">Escultura 3D Histórica</span>
                <span class="step-desc">Nossos artistas 3D esculpem sua face e vestem seu avatar com tecidos e túnicas de época.</span>
              </div>
              <div class="perk-step-item">
                <span class="step-num">PASSO 03</span>
                <span class="step-title">Rig & Animação Godot</span>
                <span class="step-desc">Implementamos esqueleto 3D (IK), expressões faciais, ciclo de respiração e diálogo.</span>
              </div>
              <div class="perk-step-item">
                <span class="step-num">PASSO 04</span>
                <span class="step-title">Vida na Comunidade</span>
                <span class="step-desc">Seu personagem ganha seu lote demarcado, totem e função ativa nas 7 Bases do jogo!</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. OFERTA VOLUNTÁRIA LIVRE (PIX & QR CODE) -->
        <div class="pix-donation-section" id="pix-section">
          
          <!-- Card de Pagamento PIX e QR Code -->
          <div class="pix-card">
            <div class="pix-card-header">
              <span class="pillar-badge mission">OFERTA VOLUNTÁRIA AVULSA</span>
              <h3>Semie com Qualquer Quantia via PIX</h3>
              <p>
                Ajude nos custos imediatos de computação gráfica, licenças de software e servidores. 
                Cada oferta voluntária fortalece a produção e acelera a entrega do jogo para o mundo.
              </p>
            </div>

            <!-- QR Code Box e Instruções -->
            <div class="pix-qr-wrapper">
              <div class="pix-qr-box" id="pix-qr-container">
                <img src="assets/img/pix_qrcode.png" alt="QR Code PIX Banco Central - Haja Luz Studio" class="pix-qr-image" />
              </div>
              <div class="pix-instructions">
                <div class="pix-status-badge">
                  <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#38a169;"></span>
                  <span>QR Code Oficial Banco Central (EMVCo)</span>
                </div>
                <strong>1. Abra o app do seu banco</strong>
                <span>2. Escolha pagar via <strong>PIX QR Code</strong></span>
                <span>3. Aponte a câmera para o código ao lado ou use o Pix Copia e Cola / Chave CNPJ abaixo:</span>
                <div class="pix-account-summary">
                  Titular: <strong>HAJA LUZ STUDIO</strong><br>
                  CNPJ: <strong>61.511.844/0001-91</strong> • Praça: <strong>Passo Fundo/RS</strong>
                </div>
              </div>
            </div>

            <!-- Chave PIX Oficial CNPJ -->
            <div class="pix-key-group">
              <span class="pix-key-label">Chave PIX Oficial (CNPJ)</span>
              <div class="pix-key-input-row">
                <input type="text" readonly value="${Store.pix.keyFormatted}" id="pix-key-field" class="pix-key-input" />
                <button type="button" class="btn-copy-pix" onclick="App.copyPixKey('${Store.pix.keyFormatted}', '✓ Chave CNPJ copiada com sucesso!')">
                  ${Icons.copy(13)}
                  <span>Copiar CNPJ</span>
                </button>
              </div>
            </div>

            <!-- Pix Copia e Cola Oficial -->
            <div class="pix-key-group">
              <span class="pix-key-label">Código Pix Copia e Cola (Payload Oficial)</span>
              <div class="pix-key-input-row">
                <input type="text" readonly value="${Store.pix.payload}" id="pix-payload-field" class="pix-key-input pix-key-mono" />
                <button type="button" class="btn-copy-pix" onclick="App.copyPixKey('${Store.pix.payload}', '✓ Código Pix Copia e Cola copiado com sucesso!')">
                  ${Icons.copy(13)}
                  <span>Copiar Código</span>
                </button>
              </div>
              <span class="pix-payload-meta">
                Beneficiário Oficial: <strong>Haja Luz Studio</strong> • CNPJ: <strong>61.511.844/0001-91</strong> • Passo Fundo/RS
              </span>
            </div>
          </div>

          <!-- Card Comparativo de Modalidades de Apoio -->
          <div class="pix-card">
            <div class="pix-card-header">
              <span class="pillar-badge purpose">COMPROMISSO MISSIONÁRIO</span>
              <h3>Tabela de Honra & Reconhecimento</h3>
              <p>
                Como retribuição à sua fidelidade na obra, estabelecemos marcos sagrados de reconhecimento para todos os apoiadores:
              </p>
            </div>

            <div class="honor-table-wrapper">
              
              <!-- Nível 1: Oferta Voluntária -->
              <div class="honor-tier-card">
                <div class="honor-tier-header">
                  <strong class="honor-tier-title">Semeador Voluntário</strong>
                  <span class="honor-tier-tag">Oferta Livre / PIX</span>
                </div>
                <ul class="honor-tier-list">
                  <li>Nome gravado nos Créditos Finais do Jogo (Mural dos Semeadores).</li>
                  <li>Acesso contínuo ao Devlog em Tempo Real e telemetria da engine.</li>
                  <li>Boletim ministerial trimestral com relatórios e pedidos de oração.</li>
                </ul>
              </div>

              <!-- Nível 2: Investidor Pioneiro 12 Meses -->
              <div class="honor-tier-card featured">
                <div class="honor-tier-badge-top">
                  MÁXIMA DISTINÇÃO
                </div>
                <div class="honor-tier-header">
                  <strong class="honor-tier-title">Patrono & Investidor Pioneiro</strong>
                  <span class="honor-tier-tag green">12 Meses Mínimo</span>
                </div>
                <ul class="honor-tier-list">
                  <li><strong>Seu Personagem 3D Personalizado dentro do jogo</strong> (feições reais escaneadas).</li>
                  <li>Lote exclusivo e tenda demarcada com seu totem na Base Comunitária.</li>
                  <li>Termo contratual formal registrado com <strong>Hash Criptográfico SHA-256</strong>.</li>
                  <li>Cotas de participação societária no Pool Comunitário (49%).</li>
                  <li>Voto consultivo em reuniões de conselho com a diretoria do estúdio.</li>
                </ul>
              </div>

            </div>

            <div style="text-align: center; margin-top: 6px;">
              <button class="btn-primary" style="width: 100%; justify-content: center; padding: 11px;" onclick="App.switchTab('termo')">
                <span>Ver Termo Contratual com Hash SHA-256 →</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    `;

    setTimeout(() => {
      this.renderPixQrCode();
    }, 40);
  },

  scrollToPix() {
    const el = document.getElementById("pix-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  },

  // 1. MÓDULO DEVLOG & MÍDIA
  renderDevlog(headerEl, bodyEl) {
    headerEl.innerHTML = `
      <div class="workspace-title-group">
        <h2>Devlog em Tempo Real: Progresso do Jogo</h2>
        <p>Atualizações contínuas de arte 3D, mecânicas de comunidade e performance do motor</p>
      </div>
      <div class="workspace-actions">
        ${Store.currentRole === 'creator' ? `
          <button class="btn-primary" onclick="App.openNewPostModal()">
            ${Icons.plus(14)}
            <span>Nova Atualização</span>
          </button>` : `
          <span class="spec-badge" style="color: var(--gold-accent);">Feed Oficial Auditado</span>
        `}
      </div>
    `;

    let postsHtml = Store.devlogPosts.map(post => {
      const initialMediaUrl = (post.gallery && post.gallery.length > 0) ? (post.mediaUrl || post.gallery[0]) : post.mediaUrl;
      const initialReaction = initialMediaUrl ? Store.getPhotoReaction(initialMediaUrl) : { likes: 0, isLiked: false, comments: [] };
      const hasMultiple = post.gallery && post.gallery.length > 1;

      return `
      <article class="devlog-post insta-feed-post" id="post-${post.id}">
        <!-- HEADER ESTILO INSTAGRAM COM AVATAR, NOME E LOCALIZAÇÃO -->
        <div class="insta-post-header">
          <div class="insta-author-info">
            <div class="insta-avatar-ring">
              <img src="favicon_logo_PPrancheta-1.png" alt="Haja Luz Studio" class="insta-avatar-img" />
            </div>
            <div class="insta-user-details">
              <div class="insta-user-name-row">
                <span class="insta-username">hajaluzstudio</span>
                <span class="insta-verified-badge" title="Estúdio Oficial Verificado">${Icons.check(11)}</span>
              </div>
              <span class="insta-post-location">${post.category} • Galileia 1º Século</span>
            </div>
          </div>
          <div class="insta-header-right">
            <span class="devlog-badge ${post.badgeType || ''}">${post.category}</span>
            <span class="insta-post-time">${post.date}</span>
          </div>
        </div>

        <!-- MÍDIA CENTRAL ESTILO INSTAGRAM (CARROSSEL NATIVO MULTI-SLIDE ESTILO INSTAGRAM) -->
        ${initialMediaUrl ? `
          <div class="insta-media-wrapper" id="media-container-${post.id}" data-post-id="${post.id}" ondblclick="App.handleInstagramDoubleTap('${post.id}')" ontouchend="App.handleTouchDoubleTap('${post.id}', event)">
            <div class="insta-carousel-slider">
              <div class="insta-carousel-track" id="carousel-track-${post.id}" onscroll="App.handleCarouselScroll('${post.id}')">
                ${(post.gallery && post.gallery.length > 0 ? post.gallery : [initialMediaUrl]).map((photoUrl, idx) => `
                  <div class="insta-carousel-slide" data-slide-idx="${idx}">
                    <img 
                      src="${photoUrl}" 
                      alt="${post.title} - Foto ${idx + 1}" 
                      class="insta-media-img" 
                      loading="${idx === 0 ? 'eager' : 'lazy'}" 
                      onclick="App.handleDevlogSlideClick(event, '${photoUrl}', '${post.id}', ${idx})" 
                      title="Toque para ampliar ou arraste para os lados como no Instagram" 
                    />
                  </div>
                `).join('')}
              </div>

              <!-- Floating Heart no Duplo Toque -->
              <div id="insta-doubletap-heart-${post.id}" class="insta-floating-heart">
                <svg viewBox="0 0 24 24" width="75" height="75" fill="#ef4444" stroke="#ef4444"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>

              <!-- Pill de Contagem de Fotos (1/8) estilo Instagram -->
              ${hasMultiple ? `
                <div class="insta-carousel-pill" id="gallery-counter-${post.id}">
                  1/${post.gallery.length}
                </div>
                <button type="button" class="insta-nav-arrow arrow-prev" onclick="event.stopPropagation(); App.navDevlogSlide('${post.id}', -1)" aria-label="Foto anterior">‹</button>
                <button type="button" class="insta-nav-arrow arrow-next" onclick="event.stopPropagation(); App.navDevlogSlide('${post.id}', 1)" aria-label="Próxima foto">›</button>
              ` : ''}
            </div>

            <!-- Indicadores de Pontos (Dots) estilo Carrossel do Instagram -->
            ${hasMultiple ? `
              <div class="insta-dots-row" id="dots-${post.id}">
                ${post.gallery.map((_, i) => `<span class="insta-dot ${i === 0 ? 'active' : ''}" onclick="App.goToDevlogSlide('${post.id}', ${i})"></span>`).join('')}
              </div>
            ` : ''}
          </div>

          <!-- BARRA DE AÇÕES INSTAGRAM (CURTIR, COMENTAR, COMPARTILHAR, TELA CHEIA) -->
          <div class="insta-action-bar">
            <div class="insta-actions-left">
              <button type="button" class="insta-btn-action ${initialReaction.isLiked ? 'liked' : ''}" id="feed-like-btn-${post.id}" onclick="App.toggleFeedPhotoLike('${post.id}')" title="Curtir foto">
                <span id="feed-like-icon-${post.id}">${Icons.heart(22, initialReaction.isLiked)}</span>
              </button>
              <button type="button" class="insta-btn-action" id="feed-comment-btn-${post.id}" onclick="App.toggleFeedComments('${post.id}')" title="Ver e adicionar comentários">
                ${Icons.messageCircle(22)}
              </button>
              <button type="button" class="insta-btn-action" onclick="App.shareDevlogPost('${post.id}')" title="Compartilhar">
                ${Icons.send(20)}
              </button>
            </div>
            <div class="insta-actions-right">
              <button type="button" class="insta-btn-action" onclick="App.openLightbox(App.getCurrentDevlogPhoto('${post.id}'), null, '${post.id}')" title="Tela Cheia">
                ${Icons.maximize(19)}
              </button>
            </div>
          </div>

          <!-- TOTAL DE CURTIDAS ESTILO INSTAGRAM -->
          <div class="insta-likes-summary">
            <span class="insta-likes-text" id="feed-like-count-${post.id}">${initialReaction.likes} curtidas</span>
            <span class="insta-likes-sub">• Comunidade Peregrino & Conselheiros</span>
          </div>
        ` : ''}

        <!-- LEGENDA E CONTEÚDO DO POST ESTILO INSTAGRAM -->
        <div class="insta-caption-block">
          <p class="insta-caption-text">
            <strong class="insta-author-tag">hajaluzstudio</strong>
            <span class="insta-post-title">${post.title}</span> — 
            <span class="insta-caption-body">${post.summary}</span>
          </p>
          <div class="insta-hashtags">
            ${(post.tags || []).map(t => `<span class="insta-tag">#${t.replace(/\s+/g, '')}</span>`).join(' ')}
          </div>
        </div>

        <!-- TOGGLE DE COMENTÁRIOS -->
        <div class="insta-comments-toggle" onclick="App.toggleFeedComments('${post.id}')">
          <span id="feed-comment-label-${post.id}">
            ${initialReaction.comments.length > 0 ? `Ver todos os ${initialReaction.comments.length} comentários` : 'Adicionar um comentário oficial...'}
          </span>
        </div>

        <!-- FORMULÁRIO RÁPIDO DE COMENTÁRIO INLINE ESTILO INSTAGRAM -->
        <form class="insta-quick-comment-form" onsubmit="App.submitFeedComment(event, '${post.id}')">
          <input type="text" id="feed-comment-input-${post.id}" class="insta-comment-input" placeholder="Adicione um comentário como apoiador..." required autocomplete="off" />
          <button type="submit" class="insta-comment-post-btn">Publicar</button>
        </form>

        <!-- GAVETA EXPANSÍVEL DE COMENTÁRIOS -->
        <div class="devlog-comments-drawer" id="feed-comments-drawer-${post.id}" style="display: none;">
          <div class="comments-header">
            <h4>${Icons.messageCircle(14)} Comentários da Comunidade</h4>
            <span style="font-size: 11px; color: var(--text-muted);" id="feed-comments-sub-${post.id}">${initialReaction.comments.length} mensagens</span>
          </div>
          <div class="comments-list" id="feed-comments-list-${post.id}">
            ${this.renderCommentsListHtml(initialReaction.comments, initialMediaUrl, post.id)}
          </div>
        </div>
      </article>
    `}).join('');

    bodyEl.innerHTML = `
      <div class="devlog-feed insta-feed-container">
        ${postsHtml}
      </div>
    `;

    setTimeout(() => {
      this.setupDevlogFeedSwipeGestures();
    }, 30);
  },

  // Navegação no Carrossel Nativo Instagram com Scroll Suave
  navDevlogSlide(postId, direction) {
    const track = document.getElementById(`carousel-track-${postId}`);
    if (!track) return;
    const post = Store.devlogPosts.find(p => p.id === postId);
    const total = (post && post.gallery) ? post.gallery.length : 1;
    if (total <= 1) return;

    const slideWidth = track.clientWidth || track.offsetWidth || 300;
    const currentIdx = Math.round(track.scrollLeft / slideWidth);

    let nextIdx = currentIdx + direction;
    if (nextIdx < 0) nextIdx = total - 1;
    if (nextIdx >= total) nextIdx = 0;

    track.scrollTo({
      left: nextIdx * slideWidth,
      behavior: 'smooth'
    });
  },

  goToDevlogSlide(postId, targetIdx) {
    const track = document.getElementById(`carousel-track-${postId}`);
    if (!track) return;
    const slideWidth = track.clientWidth || track.offsetWidth || 300;
    track.scrollTo({
      left: targetIdx * slideWidth,
      behavior: 'smooth'
    });
  },

  // Monitora o Scroll Nativo do Carrossel e Sincroniza Contador, Dots e Foto Ativa
  handleCarouselScroll(postId) {
    const track = document.getElementById(`carousel-track-${postId}`);
    if (!track) return;
    const slideWidth = track.clientWidth || track.offsetWidth || 1;
    const post = Store.devlogPosts.find(p => p.id === postId);
    if (!post || !post.gallery || post.gallery.length <= 1) return;

    const currentIdx = Math.min(Math.max(0, Math.round(track.scrollLeft / slideWidth)), post.gallery.length - 1);
    if (post._activeCarouselIdx === currentIdx) return;
    post._activeCarouselIdx = currentIdx;

    // Atualiza o pill de contagem (ex: 2/8)
    const counterEl = document.getElementById(`gallery-counter-${postId}`);
    if (counterEl) {
      counterEl.innerText = `${currentIdx + 1}/${post.gallery.length}`;
    }

    // Atualiza os dots indicadores
    const dotsContainer = document.getElementById(`dots-${postId}`);
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll(".insta-dot");
      dots.forEach((d, i) => d.classList.toggle("active", i === currentIdx));
    }

    // Atualiza reações (likes & comments) da foto atualmente visível
    const activeUrl = post.gallery[currentIdx];
    if (activeUrl) {
      const res = Store.getPhotoReaction(activeUrl);
      const likeBtn = document.getElementById(`feed-like-btn-${postId}`);
      const likeIcon = document.getElementById(`feed-like-icon-${postId}`);
      const likeCount = document.getElementById(`feed-like-count-${postId}`);
      const commentCount = document.getElementById(`feed-comment-count-${postId}`);

      if (likeBtn) likeBtn.classList.toggle("liked", res.isLiked);
      if (likeIcon) likeIcon.innerHTML = Icons.heart(22, res.isLiked);
      if (likeCount) likeCount.innerText = `${res.likes} curtidas`;
      if (commentCount) commentCount.innerText = res.comments.length;

      const drawer = document.getElementById(`feed-comments-drawer-${postId}`);
      if (drawer && drawer.style.display !== "none") {
        this.refreshFeedComments(postId);
      }
    }
  },

  // Retorna a URL da Foto Ativa no Post (ou a inicial)
  getCurrentDevlogPhoto(postId) {
    const post = Store.devlogPosts.find(p => p.id === postId);
    if (!post) return "";
    const track = document.getElementById(`carousel-track-${postId}`);
    if (!track || !post.gallery || post.gallery.length <= 1) {
      return post.mediaUrl || (post.gallery ? post.gallery[0] : "");
    }
    const slideWidth = track.clientWidth || track.offsetWidth || 1;
    const idx = Math.min(Math.max(0, Math.round(track.scrollLeft / slideWidth)), post.gallery.length - 1);
    return post.gallery[idx] || post.mediaUrl || "";
  },

  handleInstagramDoubleTap(postId) {
    const heartEl = document.getElementById(`insta-doubletap-heart-${postId}`);
    if (heartEl) {
      heartEl.classList.remove("pop");
      void heartEl.offsetWidth; // reflow
      heartEl.classList.add("pop");
      setTimeout(() => heartEl.classList.remove("pop"), 850);
    }
    
    const photoUrl = this.getCurrentDevlogPhoto(postId);
    if (photoUrl) {
      const reaction = Store.getPhotoReaction(photoUrl);
      if (!reaction.isLiked) {
        this.toggleFeedPhotoLike(postId);
      }
    }
  },

  handleTouchDoubleTap(postId, event) {
    const track = document.getElementById(`carousel-track-${postId}`);
    if (track && track._hasDragged) return;

    const now = Date.now();
    if (!this._lastTouchTapTime) this._lastTouchTapTime = {};
    const lastTap = this._lastTouchTapTime[postId] || 0;
    
    if (now - lastTap < 380 && now - lastTap > 40) {
      if (event) event.preventDefault();
      this.handleInstagramDoubleTap(postId);
      this._lastTouchTapTime[postId] = 0;
    } else {
      this._lastTouchTapTime[postId] = now;
    }
  },

  handleDevlogSlideClick(event, src, postId, slideIdx) {
    const track = document.getElementById(`carousel-track-${postId}`);
    if (track && track._hasDragged) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }
    const post = Store.devlogPosts.find(p => p.id === postId);
    const title = post ? post.title : null;
    this.openLightbox(src, title, postId);
  },

  handleDevlogImageClick(event, src, postId) {
    this.handleDevlogSlideClick(event, src, postId, 0);
  },

  shareDevlogPost(postId) {
    const post = Store.devlogPosts.find(p => p.id === postId);
    const title = post ? post.title : "Devlog Peregrino";
    const shareUrl = window.location.href.split("?")[0] + `?tab=devlog&post=${postId}`;
    
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: `Peregrino 3D: ${title}`,
        text: `Confira o devlog oficial do jogo Peregrino (Haja Luz Studio): ${title}`,
        url: shareUrl
      }).catch(() => {});
    } else {
      this.copyPixKey(shareUrl, `✓ Link do post ${postId} copiado para a área de transferência!`);
    }
  },

  // Gerador do HTML da Lista de Comentários
  renderCommentsListHtml(comments, photoUrl, postId) {
    if (!comments || comments.length === 0) {
      return `<div class="comment-empty-msg">Nenhum comentário ainda nesta foto. Seja o primeiro conselheiro ou apoiador a comentar!</div>`;
    }
    const isCreator = Store.currentRole === "creator";
    const currentUserId = Store.auth.currentUser ? Store.auth.currentUser.id : null;

    return comments.map(c => `
      <div class="comment-card">
        <div class="comment-avatar">${c.avatarLetter || "P"}</div>
        <div class="comment-body">
          <div class="comment-author-bar">
            <span class="comment-author-name">${c.userName}</span>
            <span class="comment-author-badge">${c.userBadge || c.userRole}</span>
            <span class="comment-date">${c.date}</span>
            ${(isCreator || c.userId === currentUserId) ? `
              <button type="button" class="checklist-remove-btn" style="margin-left: 6px; padding: 2px;" onclick="App.deleteComment('${photoUrl}', '${c.id}', '${postId}')" title="Excluir comentário">
                ${Icons.trash(12)}
              </button>
            ` : ""}
          </div>
          <p class="comment-text">${c.text}</p>
        </div>
      </div>
    `).join("");
  },

  // Alternar Curtida no Feed Principal
  toggleFeedPhotoLike(postId) {
    const photoUrl = this.getCurrentDevlogPhoto(postId);
    if (!photoUrl) return;
    const res = Store.togglePhotoLike(photoUrl);

    const btn = document.getElementById(`feed-like-btn-${postId}`);
    const icon = document.getElementById(`feed-like-icon-${postId}`);
    const count = document.getElementById(`feed-like-count-${postId}`);

    if (btn) btn.classList.toggle("liked", res.isLiked);
    if (icon) icon.innerHTML = Icons.heart(22, res.isLiked);
    if (count) count.innerText = `${res.likes} curtidas`;
  },

  // Alternar Gaveta de Comentários no Feed
  toggleFeedComments(postId) {
    const drawer = document.getElementById(`feed-comments-drawer-${postId}`);
    const btn = document.getElementById(`feed-comment-btn-${postId}`);
    if (!drawer) return;
    const isOpen = drawer.style.display !== "none";
    if (isOpen) {
      drawer.style.display = "none";
      if (btn) btn.classList.remove("active");
    } else {
      drawer.style.display = "flex";
      if (btn) btn.classList.add("active");
      this.refreshFeedComments(postId);
      const input = document.getElementById(`feed-comment-input-${postId}`);
      if (input) input.focus();
    }
  },

  // Atualizar Comentários no Feed
  refreshFeedComments(postId) {
    const photoUrl = this.getCurrentDevlogPhoto(postId);
    if (!photoUrl) return;
    const res = Store.getPhotoReaction(photoUrl);

    const list = document.getElementById(`feed-comments-list-${postId}`);
    const count = document.getElementById(`feed-comment-count-${postId}`);
    const sub = document.getElementById(`feed-comments-sub-${postId}`);

    if (list) list.innerHTML = this.renderCommentsListHtml(res.comments, photoUrl, postId);
    if (count) count.innerText = res.comments.length;
    if (sub) sub.innerText = `${res.comments.length} mensagem${res.comments.length === 1 ? "" : "ns"} de investidores & criador`;
  },

  // Enviar Comentário no Feed
  submitFeedComment(e, postId) {
    if (e) e.preventDefault();
    const photoUrl = this.getCurrentDevlogPhoto(postId);
    const input = document.getElementById(`feed-comment-input-${postId}`);
    if (!photoUrl || !input || !input.value.trim()) return;

    Store.addPhotoComment(photoUrl, input.value);
    input.value = "";

    this.refreshFeedComments(postId);
    this.showToast("✓ Comentário publicado na captura 3D!");
  },

  // Normalização de Caminho de Arquivo para Comparação Robusta
  normalizeImagePath(path) {
    if (!path) return "";
    try {
      path = decodeURIComponent(path);
    } catch(e) {}
    path = path.replace(/\\/g, "/");
    const idx = path.lastIndexOf("assets/");
    if (idx !== -1) {
      return path.substring(idx);
    }
    return path;
  },

  // ==========================================================================
  // ARRASTAR COM MOUSE NO DESKTOP (NO TOUCH É NATIVO VIA CSS SCROLL-SNAP)
  // ==========================================================================
  setupDevlogFeedSwipeGestures() {
    const tracks = document.querySelectorAll(".insta-carousel-track");
    tracks.forEach(track => {
      if (track._mouseDragAttached) return;
      track._mouseDragAttached = true;

      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      let hasDragged = false;

      track.addEventListener("mousedown", (e) => {
        if (e.target.closest(".insta-nav-arrow") || e.target.closest(".insta-dot")) return;
        isDown = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
        hasDragged = false;
        track.style.cursor = "grabbing";
      });

      const onMouseMove = (e) => {
        if (!isDown) return;
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.3;
        if (Math.abs(walk) > 6) {
          hasDragged = true;
          track._hasDragged = true;
        }
        track.scrollLeft = scrollLeft - walk;
      };

      const onMouseUp = () => {
        if (!isDown) return;
        isDown = false;
        track.style.cursor = "";
        if (hasDragged) {
          const slideWidth = track.clientWidth || 300;
          const targetIdx = Math.round(track.scrollLeft / slideWidth);
          track.scrollTo({
            left: targetIdx * slideWidth,
            behavior: 'smooth'
          });
          setTimeout(() => {
            track._hasDragged = false;
          }, 200);
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    });
  },

  setupLightboxGestures() {
    const stage = document.querySelector(".lightbox-stage");
    if (!stage || stage._swipeAttached) return;
    stage._swipeAttached = true;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isTracking = false;
    let isHorizontal = null;
    let diffX = 0;

    const getImg = () => document.getElementById("lightbox-img");

    const onStart = (clientX, clientY) => {
      if (!this.lightboxGallery || this.lightboxGallery.length <= 1) return;
      startX = clientX;
      startY = clientY;
      startTime = Date.now();
      isTracking = true;
      isHorizontal = null;
      diffX = 0;
      this._lightboxDragged = false;
    };

    const onMove = (clientX, clientY, e) => {
      if (!isTracking || !this.lightboxGallery || this.lightboxGallery.length <= 1) return;
      const dX = clientX - startX;
      const dY = clientY - startY;

      if (isHorizontal === null) {
        if (Math.abs(dX) > 7 || Math.abs(dY) > 7) {
          isHorizontal = Math.abs(dX) > Math.abs(dY);
        }
      }

      if (isHorizontal === true) {
        if (e && e.cancelable) e.preventDefault();
        diffX = dX;
        if (Math.abs(dX) > 8) {
          this._lightboxDragged = true;
        }

        const imgEl = getImg();
        if (imgEl) {
          imgEl.style.transition = "none";
          imgEl.style.transform = `translateX(${dX * 0.55}px) scale(${1 - Math.min(Math.abs(dX) / 1200, 0.05)})`;
        }
      }
    };

    const onEnd = () => {
      if (!isTracking) return;
      isTracking = false;

      const imgEl = getImg();
      if (imgEl) {
        imgEl.style.transition = "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)";
        imgEl.style.transform = "translateX(0) scale(1)";
      }

      if (isHorizontal === true && Math.abs(diffX) > 32) {
        const timeTaken = Date.now() - startTime;
        const isFast = Math.abs(diffX) > 22 && timeTaken < 320;
        if (diffX < -32 || (isFast && diffX < 0)) {
          this.lightboxNext();
        } else if (diffX > 32 || (isFast && diffX > 0)) {
          this.lightboxPrev();
        }
      }

      if (this._lightboxDragged) {
        setTimeout(() => {
          this._lightboxDragged = false;
        }, 200);
      }
    };

    stage.addEventListener("touchstart", (e) => {
      if (e.touches && e.touches[0]) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    stage.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches[0]) {
        onMove(e.touches[0].clientX, e.touches[0].clientY, e);
      }
    }, { passive: false });

    stage.addEventListener("touchend", onEnd, { passive: true });
    stage.addEventListener("touchcancel", onEnd, { passive: true });

    stage.addEventListener("mousedown", (e) => {
      if (e.button === 0 && !e.target.closest("button") && !e.target.closest(".lightbox-comments-drawer")) {
        onStart(e.clientX, e.clientY);
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (isTracking) onMove(e.clientX, e.clientY, e);
    });

    window.addEventListener("mouseup", () => {
      if (isTracking) onEnd();
    });
  },

  // ==========================================================================
  // CONTROLES DE VISUALIZAÇÃO EM TELA CHEIA (LIGHTBOX / GALERIA 4K)
  // ==========================================================================
  openLightbox(src, title = null, postId = null, customGallery = null) {
    let gallery = [];
    let post = null;

    if (postId) {
      post = Store.devlogPosts.find(p => p.id === postId);
    }

    if (customGallery && customGallery.length > 0) {
      gallery = customGallery;
    } else if (post && post.gallery && post.gallery.length > 0) {
      gallery = post.gallery;
    } else if (src) {
      const normSrc = this.normalizeImagePath(src);
      post = Store.devlogPosts.find(p => {
        if (p.mediaUrl && this.normalizeImagePath(p.mediaUrl) === normSrc) return true;
        if (p.gallery && p.gallery.some(g => this.normalizeImagePath(g) === normSrc)) return true;
        return false;
      });
      if (post && post.gallery && post.gallery.length > 0) {
        gallery = post.gallery;
      } else {
        gallery = [src];
      }
    }

    this.lightboxGallery = gallery.length > 0 ? gallery : (src ? [src] : []);
    this.lightboxPost = post;

    const normCurrent = this.normalizeImagePath(src || (this.lightboxGallery.length > 0 ? this.lightboxGallery[0] : ""));
    let activeIdx = this.lightboxGallery.findIndex(g => this.normalizeImagePath(g) === normCurrent);
    if (activeIdx === -1) activeIdx = 0;
    this.lightboxIndex = activeIdx;

    this.lightboxTitle = title || (post ? post.title : "Captura 3D Oficial");
    this.lightboxCaption = (post && post.caption) ? post.caption : "Registro Oficial do Motor Godot 4.7.2 • Renderização em Tempo Real";

    this.renderLightboxContent();

    const modalEl = document.getElementById("lightbox-modal");
    if (modalEl) {
      modalEl.classList.add("active");
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        this.setupLightboxGestures();
      }, 50);
    }
  },

  renderLightboxContent(direction = 0) {
    if (!this.lightboxGallery || this.lightboxGallery.length === 0) return;
    const currentImg = this.lightboxGallery[this.lightboxIndex];
    const total = this.lightboxGallery.length;
    const currentNum = this.lightboxIndex + 1;

    const imgEl = document.getElementById("lightbox-img");
    const titleEl = document.getElementById("lightbox-title");
    const captionEl = document.getElementById("lightbox-caption");
    const counterEl = document.getElementById("lightbox-counter");
    const prevBtn = document.getElementById("lightbox-prev-btn");
    const nextBtn = document.getElementById("lightbox-next-btn");
    const thumbsContainer = document.getElementById("lightbox-thumbnails");

    if (imgEl) {
      if (direction !== 0) {
        const offset = direction > 0 ? "35px" : "-35px";
        imgEl.style.transition = "none";
        imgEl.style.transform = `translateX(${offset}) scale(0.97)`;
        imgEl.style.opacity = "0.4";
        imgEl.src = currentImg;
        requestAnimationFrame(() => {
          imgEl.style.transition = "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease";
          imgEl.style.transform = "translateX(0) scale(1)";
          imgEl.style.opacity = "1";
        });
      } else {
        imgEl.style.opacity = "0.3";
        imgEl.style.transform = "scale(0.98)";
        imgEl.src = currentImg;
        imgEl.onload = () => {
          imgEl.style.transition = "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease";
          imgEl.style.opacity = "1";
          imgEl.style.transform = "scale(1)";
        };
        setTimeout(() => {
          imgEl.style.opacity = "1";
          imgEl.style.transform = "scale(1)";
        }, 50);
      }
    }

    if (titleEl) titleEl.innerText = this.lightboxTitle || "Visualização em Tela Cheia";
    if (captionEl) captionEl.innerText = this.lightboxCaption || `Captura ${currentNum} de ${total}`;
    if (counterEl) {
      if (total > 1) {
        counterEl.style.display = "inline-flex";
        counterEl.innerText = `${currentNum} / ${total} capturas`;
      } else {
        counterEl.style.display = "none";
      }
    }

    if (prevBtn) prevBtn.style.display = total > 1 ? "flex" : "none";
    if (nextBtn) nextBtn.style.display = total > 1 ? "flex" : "none";

    // Reações (Curtidas e Comentários) no Lightbox
    const photoReaction = Store.getPhotoReaction(currentImg);
    const lbLikeBtn = document.getElementById("lightbox-like-btn");
    const lbLikeIcon = document.getElementById("lightbox-like-icon");
    const lbLikeCount = document.getElementById("lightbox-like-count");
    const lbCommentCount = document.getElementById("lightbox-comment-count");

    if (lbLikeBtn) lbLikeBtn.classList.toggle("liked", photoReaction.isLiked);
    if (lbLikeIcon) lbLikeIcon.innerHTML = Icons.heart(14, photoReaction.isLiked);
    if (lbLikeCount) lbLikeCount.innerText = photoReaction.likes;
    if (lbCommentCount) lbCommentCount.innerText = photoReaction.comments.length;

    const lbCommentsList = document.getElementById("lightbox-comments-list");
    if (lbCommentsList) {
      lbCommentsList.innerHTML = this.renderCommentsListHtml(photoReaction.comments, currentImg, this.lightboxPost ? this.lightboxPost.id : null);
    }

    if (thumbsContainer) {
      if (total > 1) {
        thumbsContainer.style.display = "flex";
        thumbsContainer.innerHTML = this.lightboxGallery.map((thumb, idx) => `
          <img 
            src="${thumb}" 
            alt="Miniatura ${idx + 1}" 
            class="lightbox-thumb ${idx === this.lightboxIndex ? 'active' : ''}" 
            onclick="App.setLightboxIndex(${idx})"
          />
        `).join('');
        const activeThumb = thumbsContainer.children[this.lightboxIndex];
        if (activeThumb) {
          activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      } else {
        thumbsContainer.style.display = "none";
      }
    }
  },

  // Alternar Curtida no Lightbox
  toggleLightboxLike() {
    if (!this.lightboxGallery || !this.lightboxGallery[this.lightboxIndex]) return;
    const currentImg = this.lightboxGallery[this.lightboxIndex];
    const res = Store.togglePhotoLike(currentImg);

    const lbLikeBtn = document.getElementById("lightbox-like-btn");
    const lbLikeIcon = document.getElementById("lightbox-like-icon");
    const lbLikeCount = document.getElementById("lightbox-like-count");

    if (lbLikeBtn) lbLikeBtn.classList.toggle("liked", res.isLiked);
    if (lbLikeIcon) lbLikeIcon.innerHTML = Icons.heart(14, res.isLiked);
    if (lbLikeCount) lbLikeCount.innerText = res.likes;

    // Sincroniza com o Feed do Devlog
    if (this.lightboxPost && this.lightboxPost.id) {
      const postId = this.lightboxPost.id;
      const feedLikeBtn = document.getElementById(`feed-like-btn-${postId}`);
      const feedLikeIcon = document.getElementById(`feed-like-icon-${postId}`);
      const feedLikeCount = document.getElementById(`feed-like-count-${postId}`);
      if (feedLikeBtn) feedLikeBtn.classList.toggle("liked", res.isLiked);
      if (feedLikeIcon) feedLikeIcon.innerHTML = Icons.heart(14, res.isLiked);
      if (feedLikeCount) feedLikeCount.innerText = res.likes;
    }
  },

  // Alternar Painel Lateral de Comentários no Lightbox
  toggleLightboxComments() {
    const drawer = document.getElementById("lightbox-comments-drawer");
    const btn = document.getElementById("lightbox-comments-toggle-btn");
    if (!drawer) return;
    drawer.classList.toggle("open");
    if (btn) btn.classList.toggle("active", drawer.classList.contains("open"));
    if (drawer.classList.contains("open")) {
      const input = document.getElementById("lightbox-comment-input");
      if (input) setTimeout(() => input.focus(), 200);
    }
  },

  // Publicar Comentário no Lightbox
  submitLightboxComment(e) {
    if (e) e.preventDefault();
    if (!this.lightboxGallery || !this.lightboxGallery[this.lightboxIndex]) return;
    const currentImg = this.lightboxGallery[this.lightboxIndex];
    const input = document.getElementById("lightbox-comment-input");
    if (!input || !input.value.trim()) return;

    Store.addPhotoComment(currentImg, input.value);
    input.value = "";

    const reaction = Store.getPhotoReaction(currentImg);
    const lbCommentCount = document.getElementById("lightbox-comment-count");
    if (lbCommentCount) lbCommentCount.innerText = reaction.comments.length;

    const lbCommentsList = document.getElementById("lightbox-comments-list");
    if (lbCommentsList) {
      lbCommentsList.innerHTML = this.renderCommentsListHtml(reaction.comments, currentImg, this.lightboxPost ? this.lightboxPost.id : null);
    }

    // Sincroniza com o feed
    if (this.lightboxPost && this.lightboxPost.id) {
      this.refreshFeedComments(this.lightboxPost.id);
    }

    this.showToast("✓ Comentário publicado na captura 3D!");
  },

  // Excluir Comentário (Criador ou Autor)
  deleteComment(photoUrl, commentId, postId) {
    if (!confirm("Deseja realmente remover este comentário?")) return;
    Store.deletePhotoComment(photoUrl, commentId);

    const reaction = Store.getPhotoReaction(photoUrl);
    const lbCommentCount = document.getElementById("lightbox-comment-count");
    if (lbCommentCount) lbCommentCount.innerText = reaction.comments.length;

    const lbCommentsList = document.getElementById("lightbox-comments-list");
    if (lbCommentsList) {
      lbCommentsList.innerHTML = this.renderCommentsListHtml(reaction.comments, photoUrl, postId);
    }

    if (postId) {
      this.refreshFeedComments(postId);
    }
    this.showToast("Comentário removido.");
  },

  lightboxPrev(e) {
    if (e) e.stopPropagation();
    if (!this.lightboxGallery || this.lightboxGallery.length <= 1) return;
    this.lightboxIndex = (this.lightboxIndex - 1 + this.lightboxGallery.length) % this.lightboxGallery.length;
    this.renderLightboxContent(-1);
    this.syncFeedSelection();
  },

  lightboxNext(e) {
    if (e) e.stopPropagation();
    if (!this.lightboxGallery || this.lightboxGallery.length <= 1) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % this.lightboxGallery.length;
    this.renderLightboxContent(1);
    this.syncFeedSelection();
  },

  setLightboxIndex(idx) {
    if (!this.lightboxGallery || idx < 0 || idx >= this.lightboxGallery.length) return;
    const direction = idx > this.lightboxIndex ? 1 : (idx < this.lightboxIndex ? -1 : 0);
    this.lightboxIndex = idx;
    this.renderLightboxContent(direction);
    this.syncFeedSelection();
  },

  syncFeedSelection() {
    if (this.lightboxPost && this.lightboxPost.id && this.lightboxGallery) {
      const currentThumb = this.lightboxGallery[this.lightboxIndex];
      this.selectDevlogThumb(this.lightboxPost.id, currentThumb, this.lightboxIndex + 1, this.lightboxGallery.length);
    }
  },

  closeLightbox() {
    const modalEl = document.getElementById("lightbox-modal");
    if (modalEl) {
      modalEl.classList.remove("active");
      document.body.style.overflow = "";
      const drawer = document.getElementById("lightbox-comments-drawer");
      if (drawer) drawer.classList.remove("open");
      const btn = document.getElementById("lightbox-comments-toggle-btn");
      if (btn) btn.classList.remove("active");
    }
    if (document.fullscreenElement) {
      try {
        document.exitFullscreen();
      } catch(err) {}
    }
  },

  toggleLightboxFullscreen() {
    const modalEl = document.getElementById("lightbox-modal");
    if (!modalEl) return;
    if (!document.fullscreenElement) {
      if (modalEl.requestFullscreen) {
        modalEl.requestFullscreen().catch(err => console.warn(err));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn(err));
      }
    }
  },

  openLightboxOriginal() {
    if (this.lightboxGallery && this.lightboxGallery[this.lightboxIndex]) {
      window.open(this.lightboxGallery[this.lightboxIndex], "_blank");
    }
  },

  handleLightboxBackdropClick(e) {
    if (this._lightboxDragged) {
      this._lightboxDragged = false;
      return;
    }
    if (e.target.id === "lightbox-modal" || e.target.classList.contains("lightbox-stage") || e.target.classList.contains("lightbox-image-wrapper")) {
      this.closeLightbox();
    }
  },

  // 2. MÓDULO SIMULADOR DE COTAS & TERMO UNIFICADO
  renderSimulador(headerEl, bodyEl) {
    this.activeTab = "termo";
    this.renderTermo(headerEl, bodyEl);
  },

  onSimUpdate() {
    const amountInput = document.getElementById("sim-slider-amount");
    const monthsInput = document.getElementById("sim-slider-months");
    if (!amountInput || !monthsInput) return;

    const amount = Number(amountInput.value);
    const months = Number(monthsInput.value);

    document.getElementById("sim-display-amount").innerText = `R$ ${amount.toFixed(2)}`;
    document.getElementById("sim-display-months").innerText = `${months} meses`;

    const result = Store.calculateEquity(amount, months);

    document.getElementById("sim-res-total").innerText = `R$ ${result.totalInvested.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById("sim-res-weighted").innerText = `R$ ${result.weightedAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById("sim-res-equity").innerText = `${result.equityPercent.toFixed(3)}%`;

    document.getElementById("sim-ret-50k").innerText = `R$ ${result.returns.faturamento50k.toLocaleString('pt-BR', {minimumFractionDigits: 0})}/mês`;
    document.getElementById("sim-ret-100k").innerText = `R$ ${result.returns.faturamento100k.toLocaleString('pt-BR', {minimumFractionDigits: 0})}/mês`;
    document.getElementById("sim-ret-250k").innerText = `R$ ${result.returns.faturamento250k.toLocaleString('pt-BR', {minimumFractionDigits: 0})}/mês`;
  },

  // Verifica se o usuário atual tem permissão para editar/mover o Kanban (Exclusivo Superadmin)
  isKanbanEditable() {
    const user = Store.auth.currentUser || (Store.currentRole === "creator" ? Store.users[0] : Store.users[1]);
    return Boolean(user && user.canEditKanban === true && user.role === "creator");
  },

  // 3. MÓDULO AS 7 BASES DA COMUNIDADE (QUADRO KANBAN)
  renderBases(headerEl, bodyEl) {
    const overallProgress = Math.round(Store.bases.reduce((acc, b) => acc + (b.progress || 0), 0) / Store.bases.length);
    const canEdit = this.isKanbanEditable();

    headerEl.innerHTML = `
      <div class="workspace-title-group">
        <h2>As 7 Bases Estratégicas • Quadro Kanban</h2>
        <p>Acompanhamento de expansão comunitária (State of Decay) com checklist e progresso em tempo real</p>
      </div>
      <div class="workspace-actions">
        ${canEdit ? `
        <button class="btn-secondary" onclick="App.openSyncModal()">
          ${Icons.refresh(14)}
          <span>Sincronizar Jogo Local</span>
        </button>
        <button class="btn-primary" onclick="App.openKanbanModal('base', 1)">
          ${Icons.plus(14)}
          <span>Editar Bases</span>
        </button>
        ` : `
        <div class="modal-readonly-notice">
          ${Icons.lock(13)}
          <span>Modo Visualização (Somente Superadmin pode editar)</span>
        </div>
        `}
      </div>
    `;

    bodyEl.innerHTML = `
      <!-- Banner de Progresso Geral das Bases -->
      <div class="kanban-summary-banner">
        <div class="kanban-summary-text">
          <h3>Progresso Global das Bases: ${overallProgress}% Concluído</h3>
          <p>Mapeamento de alojamentos, carpintaria de leitos, postos de pesca e mega-base do cume.</p>
        </div>
        <div class="kanban-progress-global">
          <div class="kanban-progress-track">
            <div class="kanban-progress-fill ${overallProgress === 100 ? 'done' : ''}" style="width: ${overallProgress}%;"></div>
          </div>
          <span class="kanban-progress-val">${overallProgress}%</span>
        </div>
      </div>

      <!-- Quadro Kanban das 7 Bases -->
      <div class="kanban-board">
        ${this.generateKanbanColumn("backlog", `${Icons.layers(13)} Planejamento`, Store.bases, "base")}
        ${this.generateKanbanColumn("in_progress", `${Icons.refresh(13)} Em Produção`, Store.bases, "base")}
        ${this.generateKanbanColumn("testing", `${Icons.sliders(13)} Em Testes`, Store.bases, "base")}
        ${this.generateKanbanColumn("done", `${Icons.check(13)} Concluído`, Store.bases, "base")}
      </div>
    `;
  },

  // 4. MÓDULO OS 7 DISTRITOS DA CIDADE FICTÍCIA (QUADRO KANBAN)
  renderDistritos(headerEl, bodyEl) {
    const overallProgress = Math.round(Store.districts.reduce((acc, d) => acc + (d.progress || 0), 0) / Store.districts.length);
    const canEdit = this.isKanbanEditable();

    headerEl.innerHTML = `
      <div class="workspace-title-group">
        <h2>Os 7 Distritos da Cidade Monumental • Quadro Kanban</h2>
        <p>Quadro de evolução técnica dos setores históricos (Galileia do 1º século) a 60 FPS</p>
      </div>
      <div class="workspace-actions">
        ${canEdit ? `
        <button class="btn-secondary" onclick="App.openSyncModal()">
          ${Icons.refresh(14)}
          <span>Sincronizar Jogo Local</span>
        </button>
        <button class="btn-primary" onclick="App.openKanbanModal('district', 1)">
          ${Icons.plus(14)}
          <span>Editar Distritos</span>
        </button>
        ` : `
        <div class="modal-readonly-notice">
          ${Icons.lock(13)}
          <span>Modo Visualização (Somente Superadmin pode editar)</span>
        </div>
        `}
      </div>
    `;

    bodyEl.innerHTML = `
      <!-- Banner de Progresso Geral dos Distritos -->
      <div class="kanban-summary-banner">
        <div class="kanban-summary-text">
          <h3>Evolução dos Distritos: ${overallProgress}% Concluído</h3>
          <p>Substituição de greyboxing por modelos .glb definitivos, shaders de calcário e culling ativo.</p>
        </div>
        <div class="kanban-progress-global">
          <div class="kanban-progress-track">
            <div class="kanban-progress-fill ${overallProgress === 100 ? 'done' : ''}" style="width: ${overallProgress}%;"></div>
          </div>
          <span class="kanban-progress-val">${overallProgress}%</span>
        </div>
      </div>

      <!-- Quadro Kanban dos 7 Distritos -->
      <div class="kanban-board">
        ${this.generateKanbanColumn("backlog", `${Icons.layers(13)} Planejamento`, Store.districts, "district")}
        ${this.generateKanbanColumn("in_progress", `${Icons.refresh(13)} Em Produção`, Store.districts, "district")}
        ${this.generateKanbanColumn("testing", `${Icons.sliders(13)} Em Testes`, Store.districts, "district")}
        ${this.generateKanbanColumn("done", `${Icons.check(13)} Concluído`, Store.districts, "district")}
      </div>
    `;
  },

  // Gerador de Colunas do Kanban
  generateKanbanColumn(colKey, colTitle, items, type) {
    const colItems = items.filter(it => (it.column || "backlog") === colKey);
    const canEdit = this.isKanbanEditable();
    
    const cardsHtml = colItems.map(item => {
      const checklistDone = (item.checklist || []).filter(c => c.done).length;
      const checklistTotal = (item.checklist || []).length;
      const isDone = item.progress >= 100;

      return `
        <div class="kanban-card" onclick="App.openKanbanModal('${type}', ${item.id})">
          ${item.image ? `
            <div style="position: relative; border-radius: 8px 8px 0 0; overflow: hidden; height: 110px; margin: -12px -12px 10px -12px; background: #0f172a;">
              <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1.0)'" onerror="this.parentElement.style.display='none'" />
              <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15,23,42,0.85) 100%);"></div>
              <div style="position: absolute; bottom: 6px; left: 8px; font-size: 9.5px; color: #f1f5f9; font-weight: 600; text-shadow: 0 1px 3px rgba(0,0,0,0.8); display: flex; align-items: center; gap: 4px;">
                ${Icons.eye(11)} Captura do Jogo 3D
              </div>
            </div>
          ` : ''}
          <div class="kanban-card-top">
            <span class="kanban-card-id">${type === 'district' ? 'DISTRITO 0' + item.id : 'BASE 0' + item.id}</span>
            <span class="spec-badge" style="font-size: 10px; ${isDone ? 'color: #38a169;' : ''}">${item.progress}%</span>
          </div>

          <div class="kanban-card-title">${item.name}</div>
          <div class="kanban-card-desc">${item.description}</div>

          <div class="kanban-card-progress">
            <div class="kanban-card-progress-bar">
              <div class="kanban-card-progress-bar-fill ${isDone ? 'done' : ''}" style="width: ${item.progress}%;"></div>
            </div>
          </div>

          <div class="kanban-card-footer">
            <div class="kanban-card-checklist-count">
              ${Icons.check(12)}
              <span>${checklistDone}/${checklistTotal} tarefas</span>
            </div>
            <span style="font-size: 10.5px; color: ${canEdit ? 'var(--gold-accent)' : 'var(--text-muted)'}; font-weight: ${canEdit ? '600' : '500'};">
              ${canEdit ? 'Editar Card &rarr;' : 'Visualizar Tarefas &rarr;'}
            </span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="kanban-column">
        <div class="kanban-col-header">
          <div class="kanban-col-title">${colTitle}</div>
          <span class="kanban-col-count">${colItems.length}</span>
        </div>
        <div class="kanban-cards-list">
          ${cardsHtml || '<div style="font-size: 11.5px; color: var(--text-muted); text-align: center; padding: 20px 0;">Nenhum item nesta coluna</div>'}
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // MODAL EDITÁVEL DE KANBAN & CHECKLIST
  // ==========================================================================
  activeModalItem: null,
  activeModalType: null,

  openKanbanModal(type, id) {
    const list = type === "district" ? Store.districts : Store.bases;
    const item = list.find(it => it.id === Number(id));
    if (!item) return;

    const canEdit = this.isKanbanEditable();
    this.activeModalItem = JSON.parse(JSON.stringify(item));
    this.activeModalType = type;

    document.getElementById("modal-card-id").value = item.id;
    document.getElementById("modal-card-type").value = type;
    document.getElementById("modal-card-type-badge").innerText = (type === "district" ? `DISTRITO 0${item.id}` : `BASE 0${item.id}`) + (canEdit ? "" : " • SOMENTE VISUALIZAÇÃO");
    document.getElementById("modal-card-title-display").innerText = item.name;

    const imgPreview = document.getElementById("modal-card-image-preview");
    const imgEl = document.getElementById("modal-card-img");
    const imgLink = document.getElementById("modal-card-img-link");
    if (imgPreview && imgEl) {
      if (item.image) {
        imgEl.src = item.image;
        if (imgLink) imgLink.href = item.imageFull || item.image;
        imgPreview.style.display = "block";
      } else {
        imgPreview.style.display = "none";
      }
    // Injeta galeria no modal de visualização do distrito se existir
    let modalGalleryStrip = document.getElementById("modal-card-gallery-strip");
    if (!modalGalleryStrip && imgPreview) {
      modalGalleryStrip = document.createElement("div");
      modalGalleryStrip.id = "modal-card-gallery-strip";
      modalGalleryStrip.style.cssText = "display: flex; gap: 6px; overflow-x: auto; padding: 8px; background: rgba(15,23,42,0.6); border-radius: 0 0 8px 8px; margin-top: -6px; border: 1px solid var(--border-color); border-top: none;";
      imgPreview.parentNode.insertBefore(modalGalleryStrip, imgPreview.nextSibling);
    }
    if (modalGalleryStrip) {
      if (item.gallery && item.gallery.length > 1) {
        modalGalleryStrip.style.display = "flex";
        modalGalleryStrip.innerHTML = item.gallery.map((thumb, idx) => `
          <img src="${thumb}" alt="Captura ${idx + 1}" style="width: 58px; height: 38px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 2px solid ${idx === 0 ? 'var(--gold-accent)' : 'transparent'}; opacity: ${idx === 0 ? '1' : '0.6'}; transition: all 0.2s;" onclick="document.getElementById('modal-card-img').src='${thumb}'; if(document.getElementById('modal-card-img-link')) document.getElementById('modal-card-img-link').href='${thumb}'; this.parentElement.querySelectorAll('img').forEach(im => { im.style.borderColor='transparent'; im.style.opacity='0.6'; }); this.style.borderColor='var(--gold-accent)'; this.style.opacity='1';" />
        `).join('');
      } else {
        modalGalleryStrip.style.display = "none";
      }
    }

    }

    const descEl = document.getElementById("modal-card-desc");
    descEl.value = item.description || "";
    descEl.readOnly = !canEdit;
    descEl.style.cursor = canEdit ? "text" : "default";

    const colEl = document.getElementById("modal-card-column");
    colEl.value = item.column || "backlog";
    colEl.disabled = !canEdit;

    const progEl = document.getElementById("modal-card-progress");
    progEl.value = item.progress || 0;
    progEl.disabled = !canEdit;
    document.getElementById("modal-card-progress-val").innerText = `${item.progress || 0}%`;

    // Formulário de adicionar nova tarefa (Somente Superadmin)
    const addTaskContainer = document.getElementById("modal-add-task-container");
    if (addTaskContainer) {
      addTaskContainer.style.display = canEdit ? "flex" : "none";
    }

    // Botão de salvar e aviso no rodapé
    const saveBtn = document.getElementById("modal-save-btn");
    const footerNotice = document.getElementById("modal-footer-notice");
    if (saveBtn) {
      saveBtn.style.display = canEdit ? "inline-flex" : "none";
    }
    if (footerNotice) {
      footerNotice.innerHTML = canEdit 
        ? "Sincronização persistida em tempo real." 
        : `<span style="color: var(--gold-accent-hover); display: inline-flex; align-items: center; gap: 6px; font-weight: 500;">${Icons.lock(13)} Modo Visualização: apenas o Superadmin pode mover ou editar.</span>`;
    }

    this.renderModalChecklist();

    const modalEl = document.getElementById("kanban-edit-modal");
    if (modalEl) modalEl.classList.add("active");
  },

  closeKanbanModal() {
    const modalEl = document.getElementById("kanban-edit-modal");
    if (modalEl) modalEl.classList.remove("active");
  },

  renderModalChecklist() {
    const container = document.getElementById("modal-card-checklist-items");
    const statusBadge = document.getElementById("modal-card-checklist-status");
    if (!container || !this.activeModalItem) return;

    const canEdit = this.isKanbanEditable();
    const checklist = this.activeModalItem.checklist || [];
    const doneCount = checklist.filter(c => c.done).length;
    statusBadge.innerText = `${doneCount} / ${checklist.length} Concluídos`;

    container.innerHTML = checklist.map((item, index) => `
      <div class="checklist-item-row" style="${canEdit ? '' : 'cursor: default; opacity: 0.9;'}">
        <input type="checkbox" class="checklist-checkbox" ${item.done ? 'checked' : ''} ${canEdit ? `onchange="App.toggleChecklistItem(${index})"` : 'disabled'} />
        <span class="checklist-item-title ${item.done ? 'done' : ''}">${item.title}</span>
        ${canEdit ? `<button type="button" class="checklist-remove-btn" onclick="App.removeChecklistItem(${index})" title="Remover tarefa">&times;</button>` : ''}
      </div>
    `).join('');
  },

  toggleChecklistItem(index) {
    if (!this.isKanbanEditable()) {
      this.showToast("Permissão negada: somente o Superadmin pode alterar o Kanban.");
      return;
    }
    if (!this.activeModalItem || !this.activeModalItem.checklist) return;
    this.activeModalItem.checklist[index].done = !this.activeModalItem.checklist[index].done;
    
    // Recalcular porcentagem automaticamente com base no checklist
    const checklist = this.activeModalItem.checklist;
    const doneCount = checklist.filter(c => c.done).length;
    const autoProgress = Math.round((doneCount / checklist.length) * 100);

    this.activeModalItem.progress = autoProgress;
    document.getElementById("modal-card-progress").value = autoProgress;
    document.getElementById("modal-card-progress-val").innerText = `${autoProgress}%`;

    // Atualizar coluna se atingir 100% ou progredir
    if (autoProgress === 100) {
      this.activeModalItem.column = "done";
      document.getElementById("modal-card-column").value = "done";
    } else if (autoProgress > 70) {
      this.activeModalItem.column = "testing";
      document.getElementById("modal-card-column").value = "testing";
    } else if (autoProgress > 25) {
      this.activeModalItem.column = "in_progress";
      document.getElementById("modal-card-column").value = "in_progress";
    }

    this.renderModalChecklist();
  },

  onModalProgressInput() {
    if (!this.isKanbanEditable()) return;
    const val = Number(document.getElementById("modal-card-progress").value);
    document.getElementById("modal-card-progress-val").innerText = `${val}%`;
    if (this.activeModalItem) this.activeModalItem.progress = val;
  },

  onModalColumnChange() {
    if (!this.isKanbanEditable()) return;
    const col = document.getElementById("modal-card-column").value;
    if (this.activeModalItem) this.activeModalItem.column = col;
  },

  addChecklistItem() {
    if (!this.isKanbanEditable()) {
      this.showToast("Permissão negada: somente o Superadmin pode alterar o Kanban.");
      return;
    }
    const input = document.getElementById("modal-new-task-input");
    if (!input || !input.value.trim()) return;

    if (!this.activeModalItem.checklist) this.activeModalItem.checklist = [];
    this.activeModalItem.checklist.push({ title: input.value.trim(), done: false });
    input.value = "";

    // Recalcular porcentagem
    const checklist = this.activeModalItem.checklist;
    const doneCount = checklist.filter(c => c.done).length;
    const autoProgress = Math.round((doneCount / checklist.length) * 100);
    this.activeModalItem.progress = autoProgress;
    document.getElementById("modal-card-progress").value = autoProgress;
    document.getElementById("modal-card-progress-val").innerText = `${autoProgress}%`;

    this.renderModalChecklist();
  },

  removeChecklistItem(index) {
    if (!this.isKanbanEditable()) {
      this.showToast("Permissão negada: somente o Superadmin pode alterar o Kanban.");
      return;
    }
    if (!this.activeModalItem || !this.activeModalItem.checklist) return;
    this.activeModalItem.checklist.splice(index, 1);

    if (this.activeModalItem.checklist.length > 0) {
      const checklist = this.activeModalItem.checklist;
      const doneCount = checklist.filter(c => c.done).length;
      const autoProgress = Math.round((doneCount / checklist.length) * 100);
      this.activeModalItem.progress = autoProgress;
      document.getElementById("modal-card-progress").value = autoProgress;
      document.getElementById("modal-card-progress-val").innerText = `${autoProgress}%`;
    }

    this.renderModalChecklist();
  },

  async saveKanbanModal() {
    if (!this.isKanbanEditable()) {
      this.showToast("Permissão negada: somente o Superadmin pode salvar alterações no Kanban.");
      return;
    }
    if (!this.activeModalItem || !this.activeModalType) return;

    const desc = document.getElementById("modal-card-desc").value;
    const col = document.getElementById("modal-card-column").value;
    const progress = Number(document.getElementById("modal-card-progress").value);

    this.activeModalItem.description = desc;
    this.activeModalItem.column = col;
    this.activeModalItem.progress = progress;

    const saveBtn = document.getElementById("modal-save-btn");
    const origText = saveBtn ? saveBtn.textContent : "";
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Salvando na Nuvem...";
    }

    try {
      if (this.activeModalType === "district") {
        await Store.updateDistrict(this.activeModalItem.id, this.activeModalItem);
        this.renderDistritos(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      } else {
        await Store.updateBase(this.activeModalItem.id, this.activeModalItem);
        this.renderBases(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      }

      this.closeKanbanModal();
      this.showToast("✓ Alterações salvas na nuvem com sucesso!");
    } catch (e) {
      console.error("Erro ao salvar kanban:", e);
      this.showToast("⚠️ Erro ao salvar na nuvem.");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = origText;
      }
    }
  },

  // ==========================================================================
  // SINCRONIZAÇÃO AUTOMÁTICA COM O JOGO LOCAL (GODOT)
  // ==========================================================================
  openSyncModal() {
    const modal = document.getElementById("sync-checklist-modal");
    if (modal) modal.classList.add("active");
  },

  syncDirectLocal() {
    Store.resetToSyncedData();
    this.closeSyncModal();
  },

  closeSyncModal() {
    const modal = document.getElementById("sync-checklist-modal");
    if (modal) modal.classList.remove("active");
  },

  downloadChecklistJson() {
    const jsonStr = Store.exportChecklist();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "checklist_peregrino.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  handleFileChecklistUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const success = Store.importChecklist(content);
      if (success) {
        alert("Checklist do jogo sincronizado com sucesso! Todas as barras de porcentagem e tarefas foram atualizadas na nuvem.");
        this.closeSyncModal();
        if (this.activeTab === "distritos") {
          this.renderDistritos(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
        } else if (this.activeTab === "bases") {
          this.renderBases(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
        }
      } else {
        alert("Erro ao ler arquivo de checklist. Certifique-se de que é um JSON válido.");
      }
    };
    reader.readAsText(file);
  },

  // ==========================================================================
  // CONFIGURAÇÃO SUPABASE CLOUD (BANCO DE DADOS POSTGRESQL)
  // ==========================================================================
  openSupabaseModal() {
    const modal = document.getElementById("supabase-config-modal");
    if (!modal) return;
    const urlInput = document.getElementById("supabase-modal-url");
    const keyInput = document.getElementById("supabase-modal-key");
    const config = window.SupabaseBridge ? window.SupabaseBridge.getConfig() : { url: "", anonKey: "" };

    if (urlInput) urlInput.value = config.url || "";
    if (keyInput) keyInput.value = config.anonKey || "";

    this.updateSupabaseModalStatus();
    modal.classList.add("active");
  },

  closeSupabaseModal() {
    const modal = document.getElementById("supabase-config-modal");
    if (modal) modal.classList.remove("active");
  },

  updateSupabaseModalStatus() {
    const dot = document.getElementById("supabase-status-dot");
    const title = document.getElementById("supabase-status-title");
    const desc = document.getElementById("supabase-status-desc");
    const isOnline = window.SupabaseBridge && window.SupabaseBridge.isOnline;

    if (isOnline) {
      if (dot) dot.style.backgroundColor = "#38a169";
      if (title) {
        title.innerText = "Status: Conectado com Sucesso à Nuvem";
        title.style.color = "#38a169";
      }
      if (desc) desc.innerText = "Os dados estão sincronizados em tempo real com o PostgreSQL do Supabase.";
    } else {
      if (dot) dot.style.backgroundColor = "#f59e0b";
      if (title) {
        title.innerText = "Status: Desconectado (Modo Local Offline)";
        title.style.color = "#fbbf24";
      }
      if (desc) desc.innerText = "Os dados estão sendo salvos no navegador via localStorage.";
    }
  },

  updateSupabaseStatusBadge() {
    this.updateSupabaseModalStatus();
    const btn = document.querySelector("button[onclick='App.openSupabaseModal()']");
    const isOnline = window.SupabaseBridge && window.SupabaseBridge.isOnline;
    if (btn) {
      btn.style.color = isOnline ? "#38a169" : "#f59e0b";
      const dot = btn.querySelector("span:first-child");
      if (dot) dot.style.background = isOnline ? "#38a169" : "#f59e0b";
    }
  },

  async saveSupabaseConfig(event) {
    if (event) event.preventDefault();
    const url = (document.getElementById("supabase-modal-url").value || "").trim();
    const key = (document.getElementById("supabase-modal-key").value || "").trim();

    if (!url || !key) {
      alert("Por favor, preencha a URL e a Anon Key do Supabase.");
      return;
    }

    if (window.SupabaseBridge) {
      window.SupabaseBridge.setConfig(url, key);
      const connected = await window.SupabaseBridge.init();
      this.updateSupabaseModalStatus();
      this.renderHeader();
      if (connected) {
        this.showToast("✓ Conectado ao Supabase! Dados sincronizados.");
      } else {
        alert("Não foi possível conectar ao Supabase. Verifique se a URL e a Chave estão corretas e se as tabelas foram criadas via supabase_schema.sql.");
      }
    }
  },

  async testSupabaseConnection() {
    if (window.SupabaseBridge) {
      const isOnline = await window.SupabaseBridge.init();
      this.updateSupabaseModalStatus();
      this.renderHeader();
      if (isOnline) {
        this.showToast("✓ Conexão com o Supabase ativa e respondendo!");
      } else {
        alert("Supabase não está respondendo. Verifique a URL e a Anon Key.");
      }
    }
  },

  disconnectSupabase() {
    if (confirm("Deseja desconectar do Supabase e retornar ao armazenamento local?")) {
      try {
        localStorage.removeItem("peregrino_supabase_url");
        localStorage.removeItem("peregrino_supabase_anon_key");
        if (window.SupabaseBridge) {
          window.SupabaseBridge.client = null;
          window.SupabaseBridge.isOnline = false;
        }
        const urlInput = document.getElementById("supabase-modal-url");
        const keyInput = document.getElementById("supabase-modal-key");
        if (urlInput) urlInput.value = "";
        if (keyInput) keyInput.value = "";
        this.updateSupabaseModalStatus();
        this.renderHeader();
        this.showToast("Supabase desconectado. Modo local ativo.");
      } catch (e) {}
    }
  },

  copySupabaseSql() {
    fetch("supabase_schema.sql")
      .then(r => r.text())
      .then(sql => {
        navigator.clipboard.writeText(sql);
        this.showToast("✓ Script supabase_schema.sql copiado! Cole no SQL Editor do Supabase.");
      })
      .catch(() => {
        this.showToast("Abra o arquivo supabase_schema.sql na raiz do projeto.");
      });
  },

  // ==========================================================================
  // NOVO MÓDULO: PERSONAGENS 3D EM DESENVOLVIMENTO (GAME LAYOUT HUD)
  // Roster Completo, Pedestal com Iluminação, Seletor de Skins e Atributos RPG
  // ==========================================================================
  renderPersonagens(headerEl, bodyEl) {
    const allChars = Store.characters || [];
    
    // Filtro por Categoria
    let filteredChars = allChars;
    if (this.characterCategoryFilter && this.characterCategoryFilter !== "todos") {
      filteredChars = filteredChars.filter(c => c.category === this.characterCategoryFilter);
    }

    // Filtro por Busca de Texto
    if (this.characterSearchQuery && this.characterSearchQuery.trim() !== "") {
      const q = this.characterSearchQuery.toLowerCase().trim();
      filteredChars = filteredChars.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.title.toLowerCase().includes(q) || 
        c.role.toLowerCase().includes(q) || 
        c.district.toLowerCase().includes(q)
      );
    }

    // Garante que haja um personagem selecionado válido
    let selectedChar = Store.getCharacter(this.selectedCharacterId);
    if (!selectedChar && filteredChars.length > 0) {
      selectedChar = filteredChars[0];
      this.selectedCharacterId = selectedChar.id;
    } else if (!selectedChar) {
      selectedChar = allChars[0];
      this.selectedCharacterId = selectedChar.id;
    }

    const currentSkinIdx = selectedChar.selectedSkin || 0;
    const activeSkin = selectedChar.skins[currentSkinIdx] || selectedChar.skins[0];

    // Contadores de categorias
    const counts = {
      todos: allChars.length,
      mestre: allChars.filter(c => c.category === 'mestre').length,
      apostolos: allChars.filter(c => c.category === 'apostolos').length,
      mulheres: allChars.filter(c => c.category === 'mulheres').length,
      apoiadores: allChars.filter(c => c.category === 'apoiadores').length,
      montarias: allChars.filter(c => c.category === 'montarias').length
    };

    // 1. Cabeçalho do Workspace
    headerEl.innerHTML = `
      <div class="workspace-title-group">
        <div style="display: flex; align-items: center; gap: 10px;">
          <h2>Personagens 3D em Desenvolvimento</h2>
          <span class="spec-badge" style="color: var(--gold-accent); border-color: rgba(199,165,152,0.4);">
            ${allChars.length} Modelos Integrados
          </span>
          <span class="spec-badge" style="color: #38a169; border-color: rgba(56,161,105,0.4);">
            Godot 4.3 Cel-Shading
          </span>
        </div>
        <p>Roster Oficial do Jogo • Visualizador de Renders 3D em Alta Fidelidade, Troca de Skins Bíblicas e Ficha de Atributos</p>
      </div>
      <div class="workspace-actions">
        <div class="char-search-wrapper">
          ${Icons.user(13)}
          <input 
            type="text" 
            placeholder="Buscar personagem..." 
            class="char-search-input" 
            value="${this.characterSearchQuery || ''}" 
            oninput="App.onCharacterSearch(this.value)" 
          />
          ${this.characterSearchQuery ? `<button class="char-search-clear" onclick="App.onCharacterSearch('')">&times;</button>` : ''}
        </div>
      </div>
    `;

    // 2. Corpo do Workspace: Filtros e Layout em 3 Colunas de Game HUD
    bodyEl.innerHTML = `
      <!-- BARRA DE FILTROS POR CATEGORIA BÍBLICA -->
      <div class="char-filter-bar">
        <button class="char-filter-btn ${this.characterCategoryFilter === 'todos' ? 'active' : ''}" onclick="App.filterCharacters('todos')">
          <span>Todos</span>
          <span class="char-filter-counter">${counts.todos}</span>
        </button>
        <button class="char-filter-btn ${this.characterCategoryFilter === 'mestre' ? 'active' : ''}" onclick="App.filterCharacters('mestre')">
          <span>O Mestre & Protagonista</span>
          <span class="char-filter-counter">${counts.mestre}</span>
        </button>
        <button class="char-filter-btn ${this.characterCategoryFilter === 'apostolos' ? 'active' : ''}" onclick="App.filterCharacters('apostolos')">
          <span>12 Apóstolos</span>
          <span class="char-filter-counter">${counts.apostolos}</span>
        </button>
        <button class="char-filter-btn ${this.characterCategoryFilter === 'mulheres' ? 'active' : ''}" onclick="App.filterCharacters('mulheres')">
          <span>Mulheres Discípulas</span>
          <span class="char-filter-counter">${counts.mulheres}</span>
        </button>
        <button class="char-filter-btn ${this.characterCategoryFilter === 'apoiadores' ? 'active' : ''}" onclick="App.filterCharacters('apoiadores')">
          <span>Patronos Pioneiros VIP</span>
          <span class="char-filter-counter">${counts.apoiadores}</span>
        </button>
        <button class="char-filter-btn ${this.characterCategoryFilter === 'montarias' ? 'active' : ''}" onclick="App.filterCharacters('montarias')">
          <span>Montaria Fiel</span>
          <span class="char-filter-counter">${counts.montarias}</span>
        </button>
      </div>

      <!-- GRID HUD GAME ROSTER (COLUNA 1: ROSTER | COLUNA 2: PALCO 3D & SKINS | COLUNA 3: ATRIBUTOS & ENGINE) -->
      <div class="game-roster-layout">
        
        <!-- COLUNA 1: ROSTER LATERAL (LISTA SELECIONÁVEL DE PERSONAGENS) -->
        <div class="roster-sidebar-panel">
          <div class="roster-panel-header">
            <div class="roster-panel-title">
              ${Icons.box3d(14)}
              <span>Galeria de Roster (${filteredChars.length})</span>
            </div>
            <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
              Render PBR 4K
            </span>
          </div>

          <div class="roster-list-scroll">
            ${filteredChars.length === 0 ? `
              <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 12px;">
                Nenhum personagem encontrado para "${this.characterSearchQuery}".
              </div>
            ` : filteredChars.map(char => {
              const isSelected = char.id === selectedChar.id;
              const catLabel = this.getCategoryBadgeText(char.category);
              return `
                <div class="roster-item-card ${isSelected ? 'selected' : ''}" onclick="App.selectCharacter('${char.id}')">
                  <div class="roster-avatar-box">
                    <img src="assets/img/personagens/${char.file}" alt="${char.name}" loading="lazy" />
                  </div>
                  <div class="roster-item-content">
                    <div class="roster-item-top">
                      <span class="roster-item-name">${char.name}</span>
                      <span class="roster-badge-cat cat-${char.category}">${catLabel}</span>
                    </div>
                    <div class="roster-item-role">${char.role}</div>
                    <div class="roster-item-meta">
                      <span>${char.district.split('•')[0].split('-')[0].trim()}</span>
                      <span class="roster-item-skins-badge">${char.skins.length} Trajes</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- COLUNA 2: PALCO CENTRAL DO HERÓI & SELETOR DE SKINS -->
        <div class="hero-stage-panel">
          
          <!-- BANNER DO PALCO COM DISTRITO E AÇÃO DE ZOOM -->
          <div class="stage-top-bar">
            <div class="stage-district-tag">
              ${Icons.map(13)}
              <span>${selectedChar.district}</span>
            </div>
            <button class="btn-inspect-4k" onclick="App.openCharacterModal('${selectedChar.id}')" title="Inspecionar renderização em 4K tela cheia">
              ${Icons.maximize(13)}
              <span>Inspecionar 4K</span>
            </button>
          </div>

          <!-- PEDESTAL E RENDER DO MODELO 3D -->
          <div class="hero-pedestal-container" onclick="App.openCharacterModal('${selectedChar.id}')">
            <!-- Aura de Iluminação Celestial e Efeito Radial Bronze -->
            <div class="pedestal-ambient-glow"></div>
            
            <!-- Render 3D de Alta Fidelidade -->
            <img 
              src="assets/img/personagens/${selectedChar.file}" 
              alt="${selectedChar.name}" 
              class="hero-render-img" 
              id="hero-render-display"
            />

            <!-- Base do Pedestal de Pedra e Runas Minerais -->
            <div class="pedestal-base-plate">
              <div class="pedestal-ring-outer"></div>
              <div class="pedestal-ring-inner"></div>
              <div class="pedestal-label">
                <span>HAJA LUZ • GODOT 4.3</span>
              </div>
            </div>
          </div>

          <!-- DOCK DE SKINS / ROUPAGENS BÍBLICAS -->
          <div class="stage-skins-dock">
            <div class="skins-dock-header">
              <div class="skins-dock-title">
                ${Icons.shirt(14)}
                <span>Trajes Bíblicos & Skins em Produção</span>
              </div>
              <span class="skins-dock-count">
                ${currentSkinIdx + 1} de ${selectedChar.skins.length} Skins
              </span>
            </div>

            <!-- Seletor em Pílulas de Skins -->
            <div class="skin-pills-row">
              ${selectedChar.skins.map((skin, idx) => `
                <button 
                  class="skin-pill-btn ${idx === currentSkinIdx ? 'active' : ''}" 
                  onclick="App.selectSkin('${selectedChar.id}', ${idx})"
                >
                  <span class="skin-pill-indicator"></span>
                  <span class="skin-pill-name">${skin.name}</span>
                  <span class="skin-pill-tag">${skin.tag}</span>
                </button>
              `).join('')}
            </div>

            <!-- Card Informativo do Traje Ativo (Lore e Bônus de Jogo) -->
            <div class="active-skin-details-box">
              <div class="active-skin-title-row">
                <span class="active-skin-title">${activeSkin.name}</span>
                <span class="spec-badge" style="color: var(--gold-accent); border-color: rgba(199,165,152,0.4);">
                  ${activeSkin.tag}
                </span>
              </div>
              <p class="active-skin-description">${activeSkin.desc}</p>
              <div class="active-skin-buff-row">
                ${Icons.sparkles(13)}
                <span>Efeito In-Game: <strong>${activeSkin.buff}</strong></span>
              </div>
            </div>
          </div>

        </div>

        <!-- COLUNA 3: FICHA DE ATRIBUTOS ESPIRITUAIS & ESPECIFICAÇÕES GODOT -->
        <div class="hero-stats-panel">
          
          <!-- CABEÇALHO DO HERÓI -->
          <div class="hero-profile-card">
            <div class="hero-cat-tag cat-${selectedChar.category}">
              ${this.getCategoryBadgeText(selectedChar.category)}
            </div>
            <h3 class="hero-full-name">${selectedChar.name}</h3>
            <div class="hero-subtitle">${selectedChar.title}</div>
            <div class="hero-role-pill">
              ${Icons.award(12)}
              <span>${selectedChar.role}</span>
            </div>
          </div>

          <!-- LORE / BIOGRAFIA NARRATIVA BÍBLICA -->
          <div class="hero-lore-box">
            <div class="hero-section-title">
              ${Icons.fileText(13)}
              <span>Biografia & Papel na Caravana</span>
            </div>
            <p class="hero-bio-text">${selectedChar.bio}</p>
          </div>

          <!-- ATRIBUTOS ESPIRITUAIS (MECÂNICAS DE JOGO RPG HUD) -->
          <div class="hero-stats-section">
            <div class="hero-section-title">
              ${Icons.award(13)}
              <span>Atributos Espirituais (Ciclo de Fé)</span>
            </div>

            <div class="stat-bars-container">
              ${this.renderStatBar("Fé & Convicção", selectedChar.stats.fe)}
              ${this.renderStatBar("Mansidão & Paciência", selectedChar.stats.mansidao)}
              ${this.renderStatBar("Sabedoria & Discernimento", selectedChar.stats.sabedoria)}
              ${this.renderStatBar("Firmeza & Resiliência", selectedChar.stats.firmeza)}
              ${this.renderStatBar("Liderança & Pastoreio", selectedChar.stats.lideranca)}
              ${this.renderStatBar("Comunhão Comunitária", selectedChar.stats.comunidade)}
            </div>
          </div>

          <!-- HABILIDADE PASSIVA EXCLUSIVA -->
          <div class="hero-passive-box">
            <div class="passive-header">
              <div class="passive-icon-wrapper">
                ${Icons.zap(14)}
              </div>
              <div>
                <span class="passive-label">Passiva Espiritual Exclusiva</span>
                <div class="passive-name">${selectedChar.passive.name}</div>
              </div>
            </div>
            <p class="passive-desc">${selectedChar.passive.desc}</p>
          </div>

          <!-- TELEMETRIA TÉCNICA DO MOTOR GODOT 4.3 -->
          <div class="hero-godot-specs-card">
            <div class="hero-section-title">
              ${Icons.cpu(13)}
              <span>Ficha Técnica do Modelo (Godot 4.3 Engine)</span>
            </div>

            <div class="specs-mini-grid">
              <div class="spec-cell">
                <span class="spec-cell-label">Polígonos</span>
                <span class="spec-cell-val">${selectedChar.godotSpecs.polycount}</span>
              </div>
              <div class="spec-cell">
                <span class="spec-cell-label">Rigging / IK</span>
                <span class="spec-cell-val" style="font-size: 11px;">${selectedChar.godotSpecs.rig}</span>
              </div>
              <div class="spec-cell">
                <span class="spec-cell-label">Texturas PBR</span>
                <span class="spec-cell-val">${selectedChar.godotSpecs.textures}</span>
              </div>
              <div class="spec-cell">
                <span class="spec-cell-label">Animações</span>
                <span class="spec-cell-val">${selectedChar.godotSpecs.animCount}</span>
              </div>
            </div>

            <div class="engine-ready-badge">
              ${Icons.check(13)}
              <span>${selectedChar.godotSpecs.engineReady}</span>
            </div>
          </div>

        </div>

      </div>
    `;
  },

  // Auxiliares de Renderização do Roster
  getCategoryBadgeText(category) {
    switch (category) {
      case 'mestre': return 'O Mestre';
      case 'apostolos': return 'Apóstolo';
      case 'mulheres': return 'Matriz';
      case 'apoiadores': return 'Patrono VIP';
      case 'montarias': return 'Montaria';
      default: return 'Personagem';
    }
  },

  renderStatBar(label, value) {
    let tier = "Normal";
    if (value === 100) tier = "Pleno";
    else if (value >= 95) tier = "Eminente";
    else if (value >= 90) tier = "Consagrado";
    else if (value >= 80) tier = "Elevado";
    else tier = "Firme";

    return `
      <div class="char-stat-row">
        <div class="char-stat-header">
          <span class="char-stat-name">${label}</span>
          <div class="char-stat-val-group">
            <span class="char-stat-tier">${tier}</span>
            <span class="char-stat-num">${value}/100</span>
          </div>
        </div>
        <div class="char-stat-track">
          <div class="char-stat-fill" style="width: ${value}%;"></div>
        </div>
      </div>
    `;
  },

  selectCharacter(id) {
    this.selectedCharacterId = id;
    this.renderPersonagens(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
  },

  filterCharacters(category) {
    this.characterCategoryFilter = category;
    this.renderPersonagens(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
  },

  onCharacterSearch(query) {
    this.characterSearchQuery = query;
    this.renderPersonagens(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
  },

  selectSkin(charId, skinIdx) {
    Store.selectCharacterSkin(charId, skinIdx);
    this.renderPersonagens(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
  },

  openCharacterModal(charId) {
    const char = Store.getCharacter(charId);
    if (!char) return;
    const modalEl = document.getElementById("character-modal");
    const imgEl = document.getElementById("char-modal-img");
    const titleEl = document.getElementById("char-modal-title");
    const infoEl = document.getElementById("char-modal-info");
    const badgeEl = document.getElementById("char-modal-badge");
    
    if (imgEl) imgEl.src = `assets/img/personagens/${char.file}`;
    if (titleEl) titleEl.innerText = `${char.name} — ${char.title}`;
    if (badgeEl) badgeEl.innerText = `${char.godotSpecs.polycount} • Godot 4.3`;
    
    const activeSkin = char.skins[char.selectedSkin || 0];
    if (infoEl) {
      infoEl.innerHTML = `
        <div style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div>
              <div style="font-size: 16px; font-weight: 700; color: #ffffff;">${char.name}</div>
              <div style="font-size: 13px; color: var(--gold-accent); margin-top: 2px;">${char.title}</div>
            </div>
            <span class="spec-badge" style="color: var(--gold-accent); border-color: rgba(199,165,152,0.4);">${char.role}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">Atribuição: ${char.district}</div>
        </div>

        <p style="font-size: 13px; line-height: 1.6; color: var(--text-secondary); margin-bottom: 16px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
          ${char.bio}
        </p>

        <div style="background: var(--bg-surface); padding: 12px 14px; border-radius: 6px; border: 1px solid rgba(199,165,152,0.25); margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--gold-accent); font-weight: 700;">
              Traje em Exibição: ${activeSkin.name}
            </span>
            <span class="spec-badge" style="font-size: 10px;">${activeSkin.tag}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-secondary);">${activeSkin.desc}</div>
          <div style="font-size: 11px; color: #38a169; margin-top: 6px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
            ${Icons.sparkles(12)}
            <span>Bônus em Jogo: ${activeSkin.buff}</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 11px; font-family: var(--font-mono); margin-bottom: 16px;">
          <div style="background: var(--bg-surface-elevated); padding: 10px; border-radius: 4px; border: 1px solid var(--border-subtle);">
            <div style="color: var(--text-muted); font-size: 10px;">MALHA 3D</div>
            <div style="color: #ffffff; font-weight: 600; margin-top: 2px;">${char.godotSpecs.polycount}</div>
          </div>
          <div style="background: var(--bg-surface-elevated); padding: 10px; border-radius: 4px; border: 1px solid var(--border-subtle);">
            <div style="color: var(--text-muted); font-size: 10px;">RIG HUMANOIDE</div>
            <div style="color: #ffffff; font-weight: 600; margin-top: 2px;">${char.godotSpecs.rig}</div>
          </div>
          <div style="background: var(--bg-surface-elevated); padding: 10px; border-radius: 4px; border: 1px solid var(--border-subtle);">
            <div style="color: var(--text-muted); font-size: 10px;">TEXTURAS</div>
            <div style="color: #ffffff; font-weight: 600; margin-top: 2px;">${char.godotSpecs.textures}</div>
          </div>
          <div style="background: var(--bg-surface-elevated); padding: 10px; border-radius: 4px; border: 1px solid var(--border-subtle);">
            <div style="color: var(--text-muted); font-size: 10px;">STATUS NO MOTOR</div>
            <div style="color: #38a169; font-weight: 600; margin-top: 2px;">${char.godotSpecs.engineReady}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button class="btn-secondary" onclick="App.closeCharacterModal()">Fechar</button>
          <button class="btn-primary" onclick="window.open('assets/img/personagens/${char.file}', '_blank')">Abrir Arquivo Original em Nova Aba</button>
        </div>
      `;
    }
    if (modalEl) modalEl.classList.add("active");
  },

  closeCharacterModal() {
    const modalEl = document.getElementById("character-modal");
    if (modalEl) modalEl.classList.remove("active");
  },

  // 5. MÓDULO TERMO DE ADESÃO COM HASH SHA-256 E QUALIFICAÇÃO COMPLETA
  renderTermo(headerEl, bodyEl) {
    const isCreator = Store.currentRole === "creator";
    const user = Store.auth.currentUser;
    const allContracts = Store.getContracts();
    const pendingContracts = allContracts.filter(c => c.status === "pendente");
    const userContract = Store.getUserContract(user);

    // Se estiver visualizando um contrato específico selecionado pelo Superadmin
    const activeContract = this.viewingContractId 
      ? allContracts.find(c => c.id === this.viewingContractId) 
      : userContract;

    // Se deve exibir o formulário limpo de cadastro de novo apoiador
    const isCreating = this.showNewContractForm || (!activeContract && !isCreator);

    headerEl.innerHTML = `
      <div class="workspace-title-group">
        <h2>Simulador de Cotas & Termo de Adesão Oficial</h2>
        <p>Simulação em tempo real com Fator Pioneiro (1,25x), qualificação civil e formalização jurídica via Hash SHA-256</p>
      </div>
      <div class="workspace-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
        <span class="spec-badge">Soberania do Criador: 51%</span>
        <span class="spec-badge" style="color: var(--gold-accent); border-color: rgba(221,196,187,0.3);">Pool Aberto: 49%</span>
        ${isCreator ? `
          <button class="btn-secondary" onclick="App.switchTab('gestao')" style="display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.coins(14)}
            <span>Painel de Gestão (${pendingContracts.length} pendente${pendingContracts.length !== 1 ? 's' : ''})</span>
          </button>
        ` : ''}
        ${!isCreating && activeContract ? `
          <button class="btn-secondary" onclick="App.showNewTermoForm()" style="display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.calculator(14)}
            <span>Simular & Emitir Novo Termo</span>
          </button>
          <button class="btn-secondary" onclick="App.downloadTermo()" style="display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.download(14)}
            <span>Imprimir / Salvar PDF</span>
          </button>
        ` : (activeContract || isCreator ? `
          <button class="btn-secondary" onclick="App.cancelNewTermoForm()" style="display: inline-flex; align-items: center; gap: 6px;">
            <span>← Voltar aos Contratos</span>
          </button>
        ` : '')}
      </div>
    `;

    // 1. Visão do Superadmin quando há contratos para auditar e não está preenchendo um novo nem visualizando um específico
    if (isCreator && !isCreating && !this.viewingContractId) {
      bodyEl.innerHTML = `
        <div class="card" style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div>
              <h3 style="font-size: 15px; color: #ffffff; margin: 0 0 4px 0;">Painel de Auditoria & Homologação de Contratos (Superadmin Master)</h3>
              <p style="font-size: 12px; color: var(--text-secondary); margin: 0;">
                Audite os dados de qualificação civil (Nome, CPF/CNPJ, Cidade, Contato) e aprove ou recuse termos assinados via Hash SHA-256.
              </p>
            </div>
            <button class="btn-primary" onclick="App.showNewTermoForm()">
              ${Icons.plus(13)}
              <span>Novo Modelo em Branco</span>
            </button>
          </div>

          ${pendingContracts.length > 0 ? `
            <div class="contract-status-banner pendente" style="margin-bottom: 16px;">
              <div style="color: #fbbf24; display: flex; align-items: center;">${Icons.clock ? Icons.clock(22) : ''}</div>
              <div>
                <h4>${pendingContracts.length} CONTRATO(S) AGUARDANDO SUA HOMOLOGAÇÃO</h4>
                <p>Nenhum contrato é aprovado automaticamente. Analise a qualificação e clique em 'Homologar & Aprovar' para deferir o termo e ativar o personagem 3D no jogo.</p>
              </div>
            </div>
          ` : `
            <div class="contract-status-banner aprovado" style="margin-bottom: 16px;">
              <div style="color: #38a169; display: flex; align-items: center;">${Icons.check ? Icons.check(22) : ''}</div>
              <div>
                <h4>TODOS OS CONTRATOS ESTÃO EM DIA</h4>
                <p>Não há nenhum contrato pendente de análise no momento. Todos os apoiadores ativos foram homologados.</p>
              </div>
            </div>
          `}

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-muted);">
                  <th style="padding: 10px 8px;">Protocolo</th>
                  <th style="padding: 10px 8px;">Apoiador & Documento</th>
                  <th style="padding: 10px 8px;">Localização & Contato</th>
                  <th style="padding: 10px 8px;">Aporte / Prazo</th>
                  <th style="padding: 10px 8px;">Cota (%)</th>
                  <th style="padding: 10px 8px;">Status</th>
                  <th style="padding: 10px 8px; text-align: right;">Ações da Diretoria</th>
                </tr>
              </thead>
              <tbody>
                ${allContracts.map(c => `
                  <tr style="border-bottom: 1px solid var(--border-subtle);">
                    <td style="padding: 10px 8px; font-family: var(--font-mono); font-weight: 600; color: var(--text-primary);">
                      ${c.id}
                      <div style="font-size: 10px; color: var(--text-muted);">${c.signedAt}</div>
                    </td>
                    <td style="padding: 10px 8px;">
                      <div style="font-weight: 600; color: #ffffff;">${c.name}</div>
                      <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">CPF/CNPJ: ${c.cpf || 'Não informado'}</div>
                      <div style="font-size: 11px; color: var(--text-secondary);">${c.institution || 'Apoiador Individual'}</div>
                    </td>
                    <td style="padding: 10px 8px;">
                      <div style="color: var(--text-primary);">${c.city || 'Passo Fundo'} / ${c.state || 'RS'}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${c.phone || c.email || '—'}</div>
                    </td>
                    <td style="padding: 10px 8px;">
                      <div style="font-family: var(--font-mono); color: var(--text-primary); font-weight: 600;">R$ ${Number(c.monthlyContribution).toFixed(2)}/mês</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${c.monthsCommitted} meses (Total: R$ ${Number(c.totalInvested).toFixed(2)})</div>
                    </td>
                    <td style="padding: 10px 8px; font-family: var(--font-mono); font-weight: 700; color: var(--gold-accent);">
                      ${Number(c.equitySharePercent).toFixed(2)}%
                    </td>
                    <td style="padding: 10px 8px;">
                      ${c.status === 'pendente' 
                        ? `<span class="contract-badge pendente">Em Análise</span>`
                        : c.status === 'aprovado'
                        ? `<span class="contract-badge aprovado">Homologado</span>`
                        : `<span class="contract-badge recusado">Recusado</span>`}
                    </td>
                    <td style="padding: 10px 8px; text-align: right;">
                      <div style="display: inline-flex; gap: 6px; align-items: center;">
                        ${c.status === 'pendente' ? `
                          <button class="btn-approve" onclick="App.approveContract('${c.id}')" title="Homologar e Aprovar Contrato">
                            ${Icons.check(11)}
                            <span>Aprovar</span>
                          </button>
                          <button class="btn-reject" onclick="App.rejectContract('${c.id}')" title="Recusar Contrato">
                            <span>Recusar</span>
                          </button>
                        ` : ''}
                        <button class="btn-secondary" style="padding: 5px 9px; font-size: 11px;" onclick="App.viewContractInTermo('${c.id}')" title="Ver Termo Completo">
                          <span>Ver Termo</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      return;
    }

    // 2. Formulário UNIFICADO: Simulador Interativo + Qualificação Civil + Termo de Adesão Oficial
    if (isCreating) {
      bodyEl.innerHTML = `
        <div class="termo-card">
          <div style="background: rgba(199, 165, 152, 0.08); border: 1px solid rgba(199, 165, 152, 0.25); padding: 14px 18px; border-radius: var(--radius-sm); margin-bottom: 22px;">
            <div style="display: flex; gap: 10px; align-items: flex-start;">
              <span style="color: var(--gold-accent); display: flex; align-items: center; margin-top: 2px;">${Icons.shieldCheck ? Icons.shieldCheck(18) : ''}</span>
              <div>
                <strong style="color: var(--gold-accent); font-size: 13px;">Simulador de Participação & Adesão Oficial com Registro Criptográfico</strong>
                <p style="margin: 4px 0 0 0; font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
                  Ajuste sua intenção de apoio nos controles interativos abaixo para calcular em tempo real a cota proporcional e retornos estimados.
                  Em seguida, complete sua qualificação civil autêntica para geração imediata do Termo de Adesão com Hash SHA-256.
                  <strong>Segurança Antifraude:</strong> Todo termo assinado entra automaticamente em 
                  <strong style="color: #fbbf24;">EM ANÁLISE PELA DIRETORIA</strong> e aguarda homologação soberana do Superadmin Master.
                </p>
              </div>
            </div>
          </div>

          <!-- BLOCO 1: SIMULADOR INTERATIVO DE COTAS & CENÁRIOS DE RETORNO -->
          <h3 style="font-size: 14px; color: #ffffff; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.6px; display: flex; align-items: center; gap: 8px;">
            ${Icons.calculator(15)}
            <span>1. Simulação Interativa de Cota & Retorno aos Apoiadores</span>
          </h3>

          <div class="simulador-grid" style="margin-bottom: 24px;">
            <!-- Controles do Investimento com Sliders -->
            <div style="display: flex; flex-direction: column; gap: 14px;">
              <div class="sim-slider-group">
                <div class="sim-slider-header">
                  <span class="sim-slider-title">Aporte Mensal do Apoiador</span>
                  <span class="sim-slider-val" id="sim-display-amount">R$ 500,00</span>
                </div>
                <input type="range" min="100" max="5000" step="50" value="500" class="sim-range" id="sim-slider-amount" oninput="App.onSimUpdate()" />
                <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">
                  <span>R$ 100/mês</span>
                  <span>R$ 2.500/mês</span>
                  <span>R$ 5.000/mês</span>
                </div>
              </div>

              <div class="sim-slider-group">
                <div class="sim-slider-header">
                  <span class="sim-slider-title">Período de Apoio no Desenvolvimento</span>
                  <span class="sim-slider-val" id="sim-display-months">12 meses</span>
                </div>
                <input type="range" min="3" max="36" step="1" value="12" class="sim-range" id="sim-slider-months" oninput="App.onSimUpdate()" />
                <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">
                  <span>3 meses</span>
                  <span>12 meses</span>
                  <span>36 meses</span>
                </div>
              </div>

              <div class="card" style="font-size: 12px; line-height: 1.5; color: var(--text-secondary); background: var(--bg-canvas);">
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Fórmula Ponderada do Risco Pioneiro:</div>
                Valor Ponderado = Aporte Acumulado × 1,25 (Bônus da Fase de MVP). Cada R$ 1.000 aportados na fase inicial garantem retorno maximizado no rateio final dos 49%.
              </div>
            </div>

            <!-- Resultados e Retornos Projetados -->
            <div class="sim-results-card">
              <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Consolidação da Participação</div>
              
              <div class="sim-calc-row">
                <span class="sim-calc-label">Total Investido no Período:</span>
                <span class="sim-calc-val" id="sim-res-total">R$ 6.000,00</span>
              </div>

              <div class="sim-calc-row">
                <span class="sim-calc-label">Valor Ponderado (Fator 1,25x):</span>
                <span class="sim-calc-val" id="sim-res-weighted">R$ 7.500,00</span>
              </div>

              <div class="sim-calc-row" style="background-color: var(--bg-canvas); padding: 10px; border-radius: var(--radius-sm);">
                <span class="sim-calc-label" style="color: var(--text-primary); font-weight: 600;">Cota Definitiva no Faturamento:</span>
                <span class="sim-calc-val highlight" id="sim-res-equity">2,500%</span>
              </div>

              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-secondary); margin-top: 6px;">
                Projeção de Dividendos Mensais (Retorno Recorrente)
              </div>

              <div class="dividendos-cenarios">
                <div class="cenario-box">
                  <div class="cenario-faturamento">Faturamento R$ 50k</div>
                  <div class="cenario-retorno" id="sim-ret-50k">R$ 1.250/mês</div>
                </div>
                <div class="cenario-box" style="border-color: var(--gold-accent);">
                  <div class="cenario-faturamento">Faturamento R$ 100k</div>
                  <div class="cenario-retorno" id="sim-ret-100k">R$ 2.500/mês</div>
                </div>
                <div class="cenario-box">
                  <div class="cenario-faturamento">Faturamento R$ 250k</div>
                  <div class="cenario-retorno" id="sim-ret-250k">R$ 6.250/mês</div>
                </div>
              </div>
            </div>
          </div>

          <!-- BLOCO 2: DADOS DE QUALIFICAÇÃO CIVIL DO APOIADOR -->
          <h3 style="font-size: 14px; color: #ffffff; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.6px; display: flex; align-items: center; gap: 8px;">
            ${Icons.user(15)}
            <span>2. Dados de Qualificação Civil do Apoiador</span>
          </h3>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div class="form-group">
              <label class="form-label" for="termo-nome">Nome Completo do Apoiador *</label>
              <input type="text" id="termo-nome" class="form-input" placeholder="Ex: Pr. João Pereira da Silva" value="" />
            </div>
            <div class="form-group">
              <label class="form-label" for="termo-cpf">CPF ou CNPJ *</label>
              <input type="text" id="termo-cpf" class="form-input" placeholder="000.000.000-00" value="" maxlength="18" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div class="form-group">
              <label class="form-label" for="termo-cidade">Cidade *</label>
              <input type="text" id="termo-cidade" class="form-input" placeholder="Ex: Passo Fundo" value="Passo Fundo" />
            </div>
            <div class="form-group">
              <label class="form-label" for="termo-uf">Estado / UF *</label>
              <select id="termo-uf" class="form-input">
                <option value="RS" selected>Rio Grande do Sul (RS)</option>
                <option value="SC">Santa Catarina (SC)</option>
                <option value="PR">Paraná (PR)</option>
                <option value="SP">São Paulo (SP)</option>
                <option value="RJ">Rio de Janeiro (RJ)</option>
                <option value="MG">Minas Gerais (MG)</option>
                <option value="GO">Goiás (GO)</option>
                <option value="DF">Distrito Federal (DF)</option>
                <option value="BA">Bahia (BA)</option>
                <option value="PE">Pernambuco (PE)</option>
                <option value="CE">Ceará (CE)</option>
                <option value="OUTRO">Outro / Exterior</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="termo-telefone">Telefone / WhatsApp *</label>
              <input type="text" id="termo-telefone" class="form-input" placeholder="(54) 99999-9999" value="" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
            <div class="form-group">
              <label class="form-label" for="termo-email">E-mail Oficial *</label>
              <input type="email" id="termo-email" class="form-input" placeholder="apoiador@peregrino.org" value="${(user && user.role === 'supporter' && user.email) || ''}" />
            </div>
            <div class="form-group">
              <label class="form-label" for="termo-inst">Igreja / Ministério / Instituição</label>
              <input type="text" id="termo-inst" class="form-input" placeholder="Ex: Comunidade Cristã Local / Pessoa Física" value="" />
            </div>
          </div>

          <!-- BLOCO 3: CLÁUSULAS GERAIS DE GOVERNANÇA, SOBERANIA & AMPARO LEGAL -->
          <h3 style="font-size: 14px; color: #ffffff; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.6px; display: flex; align-items: center; gap: 8px;">
            ${Icons.fileText(15)}
            <span>3. Cláusulas Gerais de Governança, Soberania & Amparo Legal</span>
          </h3>

          <div class="termo-doc" style="max-height: 280px;">
            <h4>TERMO DE ADESÃO DE APOIADOR, PARTICIPAÇÃO EM REVENUE SHARE E REGISTRO CRIPTOGRÁFICO</h4>
            <p style="background: rgba(199, 165, 152, 0.08); padding: 8px 12px; border-left: 3px solid var(--gold-accent); margin-bottom: 10px; font-size: 11.5px;">
              <strong>DAS PARTES CONTRATANTES:</strong><br />
              <strong>ESTÚDIO DESENVOLVEDOR / TITULAR SOBERANO:</strong> <strong>Andressa do Prado Costa Corá</strong> (Nome Fantasia: <strong>Haja Luz Studio</strong>), pessoa jurídica inscrita no CNPJ/MF sob o nº <strong>61.511.844/0001-91</strong>, com sede e foro na comarca de Passo Fundo/RS.<br />
              <strong>APOIADOR PARTICIPANTE:</strong> Qualificado eletronicamente pelos dados civis preenchidos no presente formulário com assinatura digital via Hash SHA-256.
            </p>
            <p><strong>1. DO OBJETO:</strong> O presente Termo formaliza a parceria de apoio financeiro ao desenvolvimento, infraestrutura de engine e lançamento do jogo eletrônico <strong>"Peregrino"</strong>, produzido com exclusividade pela empresa <strong>Andressa do Prado Costa Corá (Haja Luz Studio - CNPJ 61.511.844/0001-91)</strong>, com sede em Passo Fundo/RS. O projeto é de natureza missionária, cultural e pacífica, com zero armas de fogo ou combate violento.</p>
            <p><strong>2. DA SOBERANIA CRIATIVA E VETO DO CRIADOR (51% PERMANENTE):</strong> Fica estabelecido em caráter perpétuo e irrevogável que 51% (cinquenta e um por cento) dos direitos patrimoniais, de propriedade intelectual e deliberações do projeto permanecem sob controle soberano da titularidade jurídica de <strong>Andressa do Prado Costa Corá (Haja Luz Studio - CNPJ 61.511.844/0001-91)</strong>, assegurando a integridade doutrinária, a linha narrativa e os princípios de paz de Peregrino.</p>
            <p><strong>3. DA NATUREZA DE REVENUE SHARE E BLINDAGEM PATRIMONIAL (NÃO-EQUITY):</strong> O apoiador adquire direito proporcional e definitivo sobre o faturamento líquido global do jogo comercializado nas plataformas PC (Steam/Itch.io) e Mobile (Google Play/App Store), a partir do <strong>Marco Zero de Lançamento Comercial</strong>. O presente instrumento é contrato atípico de participação em receitas e <strong>NÃO</strong> constitui sociedade empresária, cessão de propriedade intelectual, nem transfere cotas societárias (equity) de <strong>Andressa do Prado Costa Corá</strong>, não havendo qualquer responsabilização do apoiador por dívidas cíveis, tributárias ou operacionais da pessoa jurídica.</p>
            <p><strong>4. DA CONTRAPARTIDA DE PERSONAGEM 3D E LOTE NA BASE:</strong> Para contratos de apoio com compromisso mínimo de 12 (doze) meses, o apoiador qualificado ganha direito à modelagem de seu personagem 3D personalizado inserido nas 7 Bases Estratégicas de Sobrevivência (State of Decay Bíblico), atuando como patrono e mentor espiritual no jogo.</p>
            <p><strong>5. DA VALIDADE JURÍDICA E ASSINATURA ELETRÔNICA AVANÇADA:</strong> O presente documento possui plena validade jurídica e eficácia probatória em conformidade com o <strong>Art. 10, § 2º da Medida Provisória nº 2.200-2/2001</strong>, com a <strong>Lei Federal nº 14.063/2020 (Assinatura Eletrônica Avançada)</strong> e com os <strong>Arts. 421, 425 e 434 do Código Civil Brasileiro</strong>. A integridade textual é atestada por resumo criptográfico unidirecional Hash SHA-256 gerado e arquivado eletronicamente.</p>
            <p><strong>6. DO FLUXO DE HOMOLOGAÇÃO E PROIBIÇÃO DE APROVAÇÃO AUTOMÁTICA:</strong> Ao clicar em confirmar, este termo receberá protocolo imediato com status <strong>"EM ANÁLISE PELA DIRETORIA"</strong>. O contrato será submetido à auditoria do Superadmin Master para checagem da qualificação civil e emissão da homologação definitiva pela empresa titular.</p>
          </div>

          <div style="margin: 16px 0; display: flex; align-items: flex-start; gap: 10px; cursor: pointer;" onclick="if(event.target.id !== 'termo-concordo'){ const cb = document.getElementById('termo-concordo'); if(cb) cb.checked = !cb.checked; }">
            <input type="checkbox" id="termo-concordo" style="margin-top: 3px; cursor: pointer; transform: scale(1.15);" />
            <label for="termo-concordo" style="font-size: 12.5px; color: var(--text-secondary); cursor: pointer; line-height: 1.5;">
              Declaro, sob as penas da lei, a veracidade dos dados civis informados acima e concordo integralmente com as cláusulas deste Termo de Adesão, com a soberania de 51% do Criador e com o modelo de Revenue Share do Marco Zero.
            </label>
          </div>

          <div class="contract-legal-seal">
            <div class="contract-legal-seal-icon">
              ${Icons.shieldCheck(24)}
            </div>
            <div class="contract-legal-seal-content">
              <strong>GARANTIA DE HIGIDEZ JURÍDICA & CRIPTOGRAFIA AVANÇADA</strong><br />
              Instrumento amparado pela <strong>MP nº 2.200-2/2001 (Art. 10, § 2º)</strong> e <strong>Lei nº 14.063/2020</strong>. A assinatura via chave Hash SHA-256 assegura não-repudiação, autenticidade e integridade perpétua do registro.
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            ${(activeContract || isCreator) ? `
              <button class="btn-secondary" onclick="App.cancelNewTermoForm()">
                Cancelar
              </button>
            ` : ''}
            <button class="btn-primary" style="padding: 11px 22px; font-size: 13px;" onclick="App.generateAndSignTermo()">
              ${Icons.shieldCheck(15)}
              <span>Confirmar Assinatura do Contrato via Hash SHA-256</span>
            </button>
          </div>
        </div>
      `;
      this.onSimUpdate();
      return;
    }

    // 3. Exibição do Contrato Já Assinado (Pendente de Homologação OU Homologado & Ativo)
    const isApproved = activeContract.status === "aprovado";
    const isRejected = activeContract.status === "recusado";

    bodyEl.innerHTML = `
      <div class="termo-card">
        
        <!-- Banner de Status com Destaque -->
        ${!isApproved && !isRejected ? `
          <div class="contract-status-banner pendente">
            <div style="color: #fbbf24; display: flex; align-items: center;">${Icons.clock ? Icons.clock(24) : ''}</div>
            <div style="flex: 1;">
              <h4>CONTRATO EM ANÁLISE PELA DIRETORIA (STATUS: PENDENTE)</h4>
              <p>
                O seu Termo de Adesão foi assinado eletronicamente sob protocolo <strong>${activeContract.id}</strong> com Hash SHA-256. 
                A Diretoria do Haja Luz Studio (Superadmin Master) está realizando a conferência da sua qualificação civil.
                Nenhum contrato é aprovado automaticamente. Assim que o Superadmin homologar o documento, sua cota e personagem no jogo serão ativados.
              </p>
              ${isCreator ? `
                <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
                  <button class="btn-primary" style="padding: 7px 14px; font-size: 12px;" onclick="App.openContractModal('${activeContract.id}')">
                    ${Icons.fileText ? Icons.fileText(12) : ''}
                    <span>Auditar Dados no Modal</span>
                  </button>
                  <button class="btn-approve" onclick="App.approveContract('${activeContract.id}')">
                    ${Icons.check(12)}
                    <span>Homologar Direto</span>
                  </button>
                  <button class="btn-reject" onclick="App.rejectContract('${activeContract.id}')">
                    <span>Recusar</span>
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        ` : isApproved ? `
          <div class="contract-status-banner aprovado">
            <div style="color: #38a169; display: flex; align-items: center;">${Icons.check ? Icons.check(24) : ''}</div>
            <div style="flex: 1;">
              <h4>CONTRATO HOMOLOGADO & APROVADO PELA DIRETORIA</h4>
              <p>
                Homologado soberanamente pelo Criador Master (${activeContract.approvedBy || 'Haja Luz Studio'}) em <strong>${activeContract.approvedAt || activeContract.signedAt}</strong>.
                Sua cota definitiva de <strong>${Number(activeContract.equitySharePercent).toFixed(2)}%</strong> sobre o Revenue Share do jogo e sua representação como NPC nas 7 Bases estão plenamente confirmadas.
              </p>
              ${isCreator ? `
                <div style="margin-top: 10px; display: flex; gap: 8px;">
                  <button class="btn-primary" style="padding: 6px 12px; font-size: 11px;" onclick="App.openContractModal('${activeContract.id}')">
                    ${Icons.fileText ? Icons.fileText(12) : ''}
                    <span>Auditar / Abrir no Modal</span>
                  </button>
                  <button class="btn-secondary" style="color: #fbbf24; border-color: rgba(245, 158, 11, 0.4); padding: 6px 12px; font-size: 11px; display: inline-flex; align-items: center; gap: 5px;" onclick="App.reopenContractAnalysis('${activeContract.id}')" title="Reverter para pendente para testar aprovação">
                    ${Icons.refresh ? Icons.refresh(12) : ''}
                    <span>Reabrir Análise (Tornar Pendente)</span>
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        ` : `
          <div class="contract-status-banner recusado">
            <div style="color: #e53e3e; display: flex; align-items: center;">${Icons.alertCircle ? Icons.alertCircle(24) : ''}</div>
            <div style="flex: 1;">
              <h4>CONTRATO COM PENDÊNCIA / REQUER AJUSTES</h4>
              <p>${activeContract.rejectReason || 'A Diretoria solicitou revisão nos dados cadastrais. Por favor entre em contato ou envie um novo termo retificado.'}</p>
            </div>
          </div>
        `}

        <!-- Ficha de Qualificação do Apoiador -->
        <div style="background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 18px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; margin-bottom: 14px;">
            <div>
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--gold-accent); font-weight: 700;">INSTRUMENTO ELETRÔNICO AUDITÁVEL</span>
              <h3 style="font-size: 17px; color: #ffffff; margin: 2px 0 0;">Protocolo ${activeContract.id}</h3>
            </div>
            <div>
              ${activeContract.status === 'pendente' 
                ? `<span class="contract-badge pendente">Em Análise</span>`
                : activeContract.status === 'aprovado'
                ? `<span class="contract-badge aprovado">Homologado</span>`
                : `<span class="contract-badge recusado">Recusado</span>`}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; font-size: 12.5px;">
            <div>
              <span style="color: var(--text-muted); font-size: 11px; display: block;">NOME DO APOIADOR</span>
              <strong style="color: #ffffff; font-size: 14px;">${activeContract.name}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11px; display: block;">CPF / CNPJ</span>
              <strong style="color: #ffffff; font-family: var(--font-mono);">${activeContract.cpf || 'Não informado'}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11px; display: block;">CIDADE / ESTADO</span>
              <strong style="color: #ffffff;">${activeContract.city || 'Passo Fundo'} / ${activeContract.state || 'RS'}</strong>
            </div>

            <div>
              <span style="color: var(--text-muted); font-size: 11px; display: block;">E-MAIL DE CONTATO</span>
              <strong style="color: #ffffff;">${activeContract.email || '—'}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11px; display: block;">TELEFONE / WHATSAPP</span>
              <strong style="color: #ffffff;">${activeContract.phone || '—'}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11px; display: block;">MINISTÉRIO / IGREJA</span>
              <strong style="color: #ffffff;">${activeContract.institution || 'Apoiador Individual'}</strong>
            </div>

            <div>
              <span style="color: var(--text-muted); font-size: 11px; display: block;">APORTE MENSAL</span>
              <strong style="color: var(--gold-accent); font-size: 14px; font-family: var(--font-mono);">R$ ${Number(activeContract.monthlyContribution).toFixed(2)}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11px; display: block;">PRAZO COMPROMETIDO</span>
              <strong style="color: #ffffff;">${activeContract.monthsCommitted} meses (Total: R$ ${Number(activeContract.totalInvested).toFixed(2)})</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11px; display: block;">COTA DE REVENUE SHARE</span>
              <strong style="color: #38a169; font-size: 15px; font-family: var(--font-mono);">${Number(activeContract.equitySharePercent).toFixed(2)}%</strong>
            </div>
          </div>
        </div>

        <!-- Cláusulas Oficiais -->
        <div class="termo-doc" style="max-height: 270px;">
          <h4>CLÁUSULAS CONTRATUAIS FORMALIZADAS</h4>
          <p style="background: rgba(199, 165, 152, 0.08); padding: 8px 12px; border-left: 3px solid var(--gold-accent); margin-bottom: 10px; font-size: 11.5px;">
            <strong>QUALIFICAÇÃO DO ESTÚDIO DESENVOLVEDOR (PESSOA JURÍDICA):</strong><br />
            <strong>Andressa do Prado Costa Corá</strong> (Nome Fantasia: <strong>Haja Luz Studio</strong>) • CNPJ/MF nº <strong>61.511.844/0001-91</strong> • Sede: Passo Fundo / RS.
          </p>
          <p><strong>1. DO OBJETO:</strong> O presente Termo formaliza a parceria de apoio financeiro ao desenvolvimento, infraestrutura de engine e lançamento do jogo eletrônico <strong>"Peregrino"</strong>, produzido com exclusividade pela empresa <strong>Andressa do Prado Costa Corá (Haja Luz Studio - CNPJ 61.511.844/0001-91)</strong>, com sede em Passo Fundo/RS. O projeto é de natureza missionária, cultural e pacífica, com zero armas de fogo ou combate violento.</p>
          <p><strong>2. DA SOBERANIA CRIATIVA (51% TITULARIDADE):</strong> Fica estabelecido em caráter permanente e irrevogável que 51% (cinquenta e um por cento) dos direitos patrimoniais, autorais e decisões estratégicas do projeto pertencem e permanecem sob controle soberano da empresa <strong>Andressa do Prado Costa Corá (Haja Luz Studio - CNPJ 61.511.844/0001-91)</strong>, assegurando a integridade doutrinária e pacífica do jogo.</p>
          <p><strong>3. DO REVENUE SHARE E NÃO-EQUITY (49% POOL):</strong> O apoiador adquire direito de participação sobre o faturamento líquido global auferido a partir do <strong>Marco Zero de Lançamento Comercial</strong>, calculado de acordo com sua cota proporcional e Fator Pioneiro. O apoiador não adquire quotas societárias da empresa <strong>Andressa do Prado Costa Corá</strong>, não possui direito a voto e <strong>não responde por quaisquer dívidas ou passivos operacionais do estúdio</strong>.</p>
          <p><strong>4. DA CONTRAPARTIDA DE PERSONAGEM 3D:</strong> Contratos com compromisso a partir de 12 meses garantem a modelagem e inclusão de NPC 3D personalizado nas 7 Bases Estratégicas de Sobrevivência (State of Decay Bíblico).</p>
          <p><strong>5. DA VALIDADE JURÍDICA & CHAVE CRIPTOGRÁFICA:</strong> Instrumento com eficácia legal plena fundamentado na <strong>Medida Provisória nº 2.200-2/2001 (Art. 10, § 2º)</strong>, na <strong>Lei Federal nº 14.063/2020 (Assinatura Eletrônica Avançada)</strong> e nos <strong>Arts. 421 e 425 do Código Civil</strong>, registrado sob chave Hash SHA-256 pública.</p>
        </div>

        <!-- Hash SHA-256 e Botões de Ação -->
        <div style="background-color: var(--bg-canvas); border: 1px solid var(--border-subtle); padding: 14px 18px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-top: 14px;">
          <div style="flex: 1; min-width: 260px;">
            <div style="font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
              <span>HASH SHA-256 REGISTRADO DO CONTRATO:</span>
              <span style="color: #38a169;">✓ Integridade Criptográfica Verificada</span>
            </div>
            <div style="font-family: var(--font-mono); font-size: 11.5px; color: var(--gold-accent); word-break: break-all; margin-top: 3px;" id="termo-hash-display">
              ${activeContract.contractHash}
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-secondary" onclick="App.copyPixKey('${activeContract.contractHash}', '✓ Hash SHA-256 copiado para a área de transferência!')">
              ${Icons.copy ? Icons.copy(13) : ''}
              <span>Copiar Hash</span>
            </button>
            <button class="btn-secondary" onclick="App.downloadTermo()">
              ${Icons.download(13)}
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        <div class="contract-legal-seal">
          <div class="contract-legal-seal-icon">
            ${Icons.shieldCheck(24)}
          </div>
          <div class="contract-legal-seal-content">
            <strong>DOCUMENTO ELETRÔNICO AUDITÁVEL & HOMOLOGADO</strong><br />
            Data de Assinatura: <strong>${activeContract.signedAt}</strong> • 
            Status de Governança: <strong>${activeContract.status.toUpperCase()}</strong> • 
            Amparo: <strong>MP nº 2.200-2/2001</strong> e <strong>Lei nº 14.063/2020</strong>.
          </div>
        </div>

      </div>
    `;
  },

  async generateAndSignTermo() {
    const nomeEl = document.getElementById("termo-nome");
    const cpfEl = document.getElementById("termo-cpf");
    const cidadeEl = document.getElementById("termo-cidade");
    const ufEl = document.getElementById("termo-uf");
    const telefoneEl = document.getElementById("termo-telefone");
    const emailEl = document.getElementById("termo-email");
    const instEl = document.getElementById("termo-inst");
    const sliderAmountEl = document.getElementById("sim-slider-amount");
    const sliderMonthsEl = document.getElementById("sim-slider-months");
    const valorEl = sliderAmountEl || document.getElementById("termo-valor");
    const mesesEl = sliderMonthsEl || document.getElementById("termo-meses");
    const concordoEl = document.getElementById("termo-concordo");

    if (!nomeEl || !cpfEl) return;

    const nome = (nomeEl.value || "").trim();
    const cpf = (cpfEl.value || "").trim();
    const cidade = (cidadeEl ? cidadeEl.value : "").trim();
    const uf = (ufEl ? ufEl.value : "RS").trim();
    const telefone = (telefoneEl ? telefoneEl.value : "").trim();
    const email = (emailEl ? emailEl.value : "").trim();
    const inst = (instEl ? instEl.value : "Apoiador Individual").trim();
    const valor = Number(valorEl ? valorEl.value : 500) || 500;
    const meses = Number(mesesEl ? mesesEl.value : 12) || 12;

    // Validações rigorosas de qualificação civil (combate a fraude e qualificação real solicitada pelo usuário)
    if (!nome) {
      alert("Por favor informe o Nome Completo do Apoiador.");
      nomeEl.focus();
      return;
    }
    if (!cpf || cpf.length < 11) {
      alert("Por favor informe um CPF ou CNPJ válido para qualificação civil no contrato.");
      cpfEl.focus();
      return;
    }
    if (!cidade) {
      alert("Por favor informe a Cidade do Apoiador.");
      cidadeEl.focus();
      return;
    }
    if (!telefone) {
      alert("Por favor informe um Telefone / WhatsApp de contato.");
      telefoneEl.focus();
      return;
    }
    if (!email || !email.includes("@")) {
      alert("Por favor informe um E-mail de contato válido.");
      emailEl.focus();
      return;
    }
    if (valor <= 0) {
      alert("O valor de aporte mensal deve ser superior a zero.");
      valorEl.focus();
      return;
    }
    if (meses <= 0) {
      alert("O período comprometido deve ser de no mínimo 1 mês (recomendado 12 meses).");
      mesesEl.focus();
      return;
    }
    if (concordoEl && !concordoEl.checked) {
      alert("É necessário marcar o aceite das cláusulas de governança e veracidade dos dados para assinar digitalmente.");
      concordoEl.focus();
      return;
    }

    const calc = Store.calculateEquity(valor, meses);
    const hash = await Store.generateContractHash({
      name: nome,
      cpf: cpf,
      city: cidade,
      state: uf,
      phone: telefone,
      email: email,
      institution: inst,
      amount: valor,
      months: meses,
      equityPercent: calc.equityPercent
    });

    // Feedback visual de transmissão para a nuvem
    const signBtn = document.querySelector("button[onclick='App.generateAndSignTermo()']");
    const origBtnHtml = signBtn ? signBtn.innerHTML : "";
    if (signBtn) {
      signBtn.disabled = true;
      signBtn.innerHTML = `<span>Gravando na Nuvem Supabase...</span>`;
    }

    try {
      // Registra o contrato com status OBRIGATÓRIO: 'pendente'
      const newContract = await Store.addContract({
        name: nome,
        cpf: cpf,
        city: cidade,
        state: uf,
        phone: telefone,
        email: email,
        institution: inst,
        monthlyContribution: valor,
        monthsCommitted: meses,
        totalInvested: calc.totalInvested,
        weightedValue: calc.weightedAmount,
        equitySharePercent: calc.equityPercent,
        contractHash: hash
      });

      // Atualiza investidor atual da sessão
      Store.currentInvestor = {
        name: nome,
        cpf: cpf,
        city: cidade,
        state: uf,
        phone: telefone,
        email: email,
        institution: inst,
        monthlyContribution: valor,
        monthsCommitted: meses,
        totalInvested: calc.totalInvested,
        weightedValue: calc.weightedAmount,
        equitySharePercent: calc.equityPercent,
        contractHash: hash,
        status: "pendente",
        contractId: newContract.id
      };

      try {
        localStorage.setItem("peregrino_investor", JSON.stringify(Store.currentInvestor));
      } catch(e) {}

      this.showNewContractForm = false;
      this.viewingContractId = newContract.id;

      this.renderInspector();
      this.renderSidebar();
      this.renderTermo(document.getElementById("workspace-header"), document.getElementById("workspace-body"));

      alert(`✓ Contrato protocolado com sucesso sob ID ${newContract.id}!\n\nStatus: EM ANÁLISE PELA DIRETORIA.\nO contrato foi assinado com Hash SHA-256 e transmitido para o banco de dados na nuvem. Ele já está visível na mesa de homologação do Superadmin.`);
    } catch (err) {
      alert(`⚠️ Erro ao registrar contrato: ${err.message || err}`);
    } finally {
      if (signBtn) {
        signBtn.disabled = false;
        signBtn.innerHTML = origBtnHtml;
      }
    }
  },

  recalcTermoQuote() {
    const valInput = document.getElementById("termo-valor");
    const mesesInput = document.getElementById("termo-meses");
    const cotaInput = document.getElementById("termo-cota");
    const totalPreview = document.getElementById("termo-preview-total");
    const weightedPreview = document.getElementById("termo-preview-weighted");
    const percentPreview = document.getElementById("termo-preview-percent");

    if (!valInput || !mesesInput) return;

    const valor = Math.max(0, Number(valInput.value) || 0);
    const meses = Math.max(1, Number(mesesInput.value) || 1);

    const calc = Store.calculateEquity(valor, meses);
    if (cotaInput) cotaInput.value = `${calc.equityPercent.toFixed(2)}%`;
    if (totalPreview) totalPreview.innerText = `R$ ${calc.totalInvested.toFixed(2)}`;
    if (weightedPreview) weightedPreview.innerText = `R$ ${calc.weightedAmount.toFixed(2)}`;
    if (percentPreview) percentPreview.innerText = `${calc.equityPercent.toFixed(2)}%`;
  },

  showNewTermoForm() {
    this.showNewContractForm = true;
    this.viewingContractId = null;
    this.renderTermo(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
  },

  cancelNewTermoForm() {
    this.showNewContractForm = false;
    this.viewingContractId = null;
    this.renderTermo(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
  },

  viewContractInTermo(contractId) {
    this.viewingContractId = contractId;
    this.showNewContractForm = false;
    this.switchTab("termo");
  },

  // Modal de Auditoria e Aprovação do Contrato
  openContractModal(contractId) {
    const modalEl = document.getElementById("contract-audit-modal");
    if (!modalEl) return;

    const contract = Store.getContracts().find(c => c.id === contractId);
    if (!contract) return;

    const titleEl = document.getElementById("contract-modal-title");
    const badgeEl = document.getElementById("contract-modal-badge");
    const bodyEl = document.getElementById("contract-modal-body");

    if (titleEl) {
      titleEl.innerText = `Auditoria de Contrato — Protocolo ${contract.id}`;
    }

    if (badgeEl) {
      if (contract.status === "pendente") {
        badgeEl.className = "contract-badge pendente";
        badgeEl.innerHTML = `Em Análise`;
      } else if (contract.status === "aprovado") {
        badgeEl.className = "contract-badge aprovado";
        badgeEl.innerHTML = `Homologado`;
      } else {
        badgeEl.className = "contract-badge recusado";
        badgeEl.innerHTML = `Recusado`;
      }
    }

    if (bodyEl) {
      const isApproved = contract.status === "aprovado";
      const isRejected = contract.status === "recusado";

      bodyEl.innerHTML = `
        <!-- Banner de Status com Destaque -->
        ${!isApproved && !isRejected ? `
          <div class="contract-status-banner pendente" style="margin-bottom: 16px;">
            <div style="color: #fbbf24; display: flex; align-items: center;">${Icons.clock ? Icons.clock(24) : ''}</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 4px; color: #f59e0b; font-size: 14px;">CONTRATO EM ANÁLISE — AGUARDANDO SUA HOMOLOGAÇÃO</h4>
              <p style="margin: 0; font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
                Analise os dados civis e a proposta de aporte antes de deferir. 
                Ao clicar em <strong>"Aprovar & Homologar Contrato"</strong>, o registro é validado oficialmente pela Diretoria, 
                concedendo o direito à cota de <strong>${Number(contract.equitySharePercent).toFixed(2)}%</strong> e o personagem 3D in-game.
              </p>
            </div>
          </div>
        ` : isApproved ? `
          <div class="contract-status-banner aprovado" style="margin-bottom: 16px;">
            <div style="color: #38a169; display: flex; align-items: center;">${Icons.check ? Icons.check(24) : ''}</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 4px; color: #10b981; font-size: 14px;">CONTRATO HOMOLOGADO & APROVADO PELA DIRETORIA</h4>
              <p style="margin: 0; font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
                Homologado soberanamente por <strong>${contract.approvedBy || 'Haja Luz Studio'}</strong> em <strong>${contract.approvedAt || contract.signedAt}</strong>.
                Cota de Revenue Share de <strong>${Number(contract.equitySharePercent).toFixed(2)}%</strong> e lote nas 7 Bases devidamente ativos.
              </p>
            </div>
          </div>
        ` : `
          <div class="contract-status-banner recusado" style="margin-bottom: 16px;">
            <div style="color: #ef4444; display: flex; align-items: center;">${Icons.alertCircle ? Icons.alertCircle(24) : ''}</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 4px; color: #ef4444; font-size: 14px;">CONTRATO COM PENDÊNCIA / RECUSADO</h4>
              <p style="margin: 0; font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
                ${contract.rejectReason || 'Dados cadastrais requerem revisão com a Diretoria.'}
              </p>
            </div>
          </div>
        `}

        <!-- Bloco 1: Dados de Qualificação Civil Completa (COM MODO DE EDIÇÃO DO SUPERADMIN) -->
        ${this.editingContractId === contract.id ? `
          <div style="background: var(--bg-surface-elevated); border: 1px solid var(--gold-accent); border-radius: var(--radius-sm); padding: 18px; margin-bottom: 16px; box-shadow: 0 0 15px rgba(221,196,187,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;">
              <div style="font-size: 11px; font-weight: 700; color: var(--gold-accent); text-transform: uppercase; letter-spacing: 0.8px; display: flex; align-items: center; gap: 6px;">
                ${Icons.edit ? Icons.edit(12) : ''}
                <span>EDITAR DADOS CADASTRAIS DO APOIADOR</span>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn-primary" style="padding: 6px 14px; font-size: 11.5px; background: #10b981; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;" onclick="App.saveEditedContract('${contract.id}')">
                  ${Icons.save ? Icons.save(12) : ''}
                  <span>Salvar Alterações</span>
                </button>
                <button class="btn-secondary" style="padding: 6px 10px; font-size: 11px; cursor: pointer;" onclick="App.cancelEditContract('${contract.id}')">
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 12px;">
              <div>
                <label style="color: var(--text-muted); font-size: 11px; display: block; margin-bottom: 3px; font-weight: 600;">NOME COMPLETO *</label>
                <input type="text" id="modal-edit-name" class="form-input" value="${contract.name || ''}" style="width: 100%; font-size: 12.5px; padding: 7px 10px;" />
              </div>
              <div>
                <label style="color: var(--text-muted); font-size: 11px; display: block; margin-bottom: 3px; font-weight: 600;">CPF / CNPJ *</label>
                <input type="text" id="modal-edit-cpf" class="form-input" value="${contract.cpf || ''}" style="width: 100%; font-size: 12.5px; padding: 7px 10px; font-family: var(--font-mono);" />
              </div>
              <div>
                <label style="color: var(--text-muted); font-size: 11px; display: block; margin-bottom: 3px; font-weight: 600;">CIDADE *</label>
                <input type="text" id="modal-edit-city" class="form-input" value="${contract.city || 'Passo Fundo'}" style="width: 100%; font-size: 12.5px; padding: 7px 10px;" />
              </div>

              <div>
                <label style="color: var(--text-muted); font-size: 11px; display: block; margin-bottom: 3px; font-weight: 600;">ESTADO (UF) *</label>
                <input type="text" id="modal-edit-state" class="form-input" value="${contract.state || 'RS'}" maxlength="2" style="width: 100%; font-size: 12.5px; padding: 7px 10px; text-transform: uppercase;" />
              </div>
              <div>
                <label style="color: var(--text-muted); font-size: 11px; display: block; margin-bottom: 3px; font-weight: 600;">TELEFONE / WHATSAPP</label>
                <input type="text" id="modal-edit-phone" class="form-input" value="${contract.phone || ''}" style="width: 100%; font-size: 12.5px; padding: 7px 10px;" />
              </div>
              <div>
                <label style="color: var(--text-muted); font-size: 11px; display: block; margin-bottom: 3px; font-weight: 600;">E-MAIL OFICIAL</label>
                <input type="email" id="modal-edit-email" class="form-input" value="${contract.email || ''}" style="width: 100%; font-size: 12.5px; padding: 7px 10px;" />
              </div>

              <div style="grid-column: span 3;">
                <label style="color: var(--text-muted); font-size: 11px; display: block; margin-bottom: 3px; font-weight: 600;">IGREJA / MINISTÉRIO / INSTITUIÇÃO</label>
                <input type="text" id="modal-edit-inst" class="form-input" value="${contract.institution || 'Apoiador Individual'}" style="width: 100%; font-size: 12.5px; padding: 7px 10px;" />
              </div>

              <div>
                <label style="color: var(--text-muted); font-size: 11px; display: block; margin-bottom: 3px; font-weight: 600;">APORTE MENSAL (R$)</label>
                <input type="number" id="modal-edit-valor" class="form-input" value="${contract.monthlyContribution || 500}" min="50" step="50" style="width: 100%; font-size: 12.5px; padding: 7px 10px; font-family: var(--font-mono);" />
              </div>
              <div>
                <label style="color: var(--text-muted); font-size: 11px; display: block; margin-bottom: 3px; font-weight: 600;">PRAZO (MESES)</label>
                <input type="number" id="modal-edit-meses" class="form-input" value="${contract.monthsCommitted || 12}" min="1" max="36" style="width: 100%; font-size: 12.5px; padding: 7px 10px;" />
              </div>
            </div>
          </div>
        ` : `
          <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 18px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div style="font-size: 11px; font-weight: 700; color: var(--gold-accent); text-transform: uppercase; letter-spacing: 0.8px; display: flex; align-items: center; gap: 6px;">
                ${Icons.user ? Icons.user(13) : ''}
                <span>1. Qualificação Civil & Identificação do Apoiador</span>
              </div>
              <button class="btn-secondary" style="padding: 4px 10px; font-size: 11px; display: inline-flex; align-items: center; gap: 5px; cursor: pointer; border-color: rgba(255,255,255,0.2);" onclick="App.toggleEditContractInModal('${contract.id}')" title="Editar dados cadastrais para corrigir eventuais divergências">
                ${Icons.edit ? Icons.edit(11) : ''}
                <span>Editar Dados</span>
              </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; font-size: 12.5px;">
              <div>
                <span style="color: var(--text-muted); font-size: 11px; display: block;">NOME COMPLETO</span>
                <strong style="color: #ffffff; font-size: 14px;">${contract.name}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted); font-size: 11px; display: block;">CPF / CNPJ</span>
                <strong style="color: #ffffff; font-family: var(--font-mono); font-size: 13.5px;">${contract.cpf || 'Não informado'}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted); font-size: 11px; display: block;">CIDADE / ESTADO (UF)</span>
                <strong style="color: #ffffff;">${contract.city || 'Passo Fundo'} / ${contract.state || 'RS'}</strong>
              </div>

              <div>
                <span style="color: var(--text-muted); font-size: 11px; display: block;">TELEFONE / WHATSAPP</span>
                <strong style="color: #ffffff;">${contract.phone || 'Não informado'}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted); font-size: 11px; display: block;">E-MAIL OFICIAL</span>
                <strong style="color: #ffffff;">${contract.email || 'Não informado'}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted); font-size: 11px; display: block;">IGREJA / MINISTÉRIO / INSTITUIÇÃO</span>
                <strong style="color: #ffffff;">${contract.institution || 'Apoiador Individual'}</strong>
              </div>
            </div>
          </div>
        `}

        <!-- Bloco 2: Condições do Aporte & Revenue Share -->
        <div style="background: var(--bg-canvas); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); padding: 18px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--gold-accent); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            ${Icons.coins ? Icons.coins(13) : ''}
            <span>2. Condições Financeiras & Participação no Marco Zero</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 12.5px;">
            <div>
              <span style="color: var(--text-muted); font-size: 11px; display: block;">APORTE MENSAL</span>
              <strong style="color: var(--gold-accent); font-family: var(--font-mono); font-size: 14.5px;">R$ ${Number(contract.monthlyContribution).toFixed(2)}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11px; display: block;">PRAZO COMPROMETIDO</span>
              <strong style="color: #ffffff;">${contract.monthsCommitted} meses</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11px; display: block;">APORTE TOTAL PREVISTO</span>
              <strong style="color: #ffffff; font-family: var(--font-mono);">R$ ${Number(contract.totalInvested).toFixed(2)}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11px; display: block;">COTA DE REVENUE SHARE</span>
              <strong style="color: #38a169; font-family: var(--font-mono); font-size: 16px;">${Number(contract.equitySharePercent).toFixed(2)}%</strong>
            </div>
          </div>
        </div>

        <!-- Bloco 3: Cláusulas Gerais e Validade Jurídica -->
        <div class="termo-doc" style="max-height: 200px; margin-bottom: 14px;">
          <h4>CLÁUSULAS GERAIS DE GOVERNANÇA, SOBERANIA & AMPARO LEGAL</h4>
          <p style="background: rgba(199, 165, 152, 0.08); padding: 8px 12px; border-left: 3px solid var(--gold-accent); margin-bottom: 8px; font-size: 11px;">
            <strong>TITULARIDADE JURÍDICA:</strong> <strong>Andressa do Prado Costa Corá</strong> (Nome Fantasia: <strong>Haja Luz Studio</strong>) • CNPJ: <strong>61.511.844/0001-91</strong> • Passo Fundo/RS.
          </p>
          <p><strong>1. DO OBJETO E CARÁTER MISSIONÁRIO:</strong> Apoio financeiro ao desenvolvimento e lançamento do jogo eletrônico <strong>"Peregrino"</strong>, produzido exclusivamente por <strong>Andressa do Prado Costa Corá (Haja Luz Studio - CNPJ 61.511.844/0001-91)</strong>, projeto pacífico e de edificação bíblica sem armas de fogo.</p>
          <p><strong>2. DA SOBERANIA PERMANENTE (51% TITULARIDADE):</strong> 51% dos direitos de propriedade intelectual, direção criativa e doutrinária permanecem irrevogavelmente com a titularidade de <strong>Andressa do Prado Costa Corá (Haja Luz Studio)</strong>.</p>
          <p><strong>3. DO REVENUE SHARE E BLINDAGEM PATRIMONIAL (NÃO-EQUITY):</strong> Participação percentual estrita sobre o faturamento líquido apurado a partir do <strong>Marco Zero de Lançamento Comercial</strong>. Não confere quotas societárias de <strong>Andressa do Prado Costa Corá</strong>, não transfere votos administrativos e <strong>não transfere qualquer dívida ou passivo operacional da empresa ao apoiador</strong>.</p>
          <p><strong>4. DA CONTRAPARTIDA DE PERSONAGEM 3D:</strong> Contratos a partir de 12 meses garantem a modelagem e inclusão de NPC 3D personalizado nas 7 Bases Estratégicas de Sobrevivência (State of Decay Bíblico).</p>
          <p><strong>5. DA VALIDADE JURÍDICA:</strong> Eficácia legal fundamentada na <strong>Medida Provisória nº 2.200-2/2001 (Art. 10, § 2º)</strong>, na <strong>Lei Federal nº 14.063/2020 (Assinatura Eletrônica Avançada)</strong> e nos <strong>Arts. 421 e 425 do Código Civil</strong>.</p>
        </div>

        <!-- Bloco 4: Chave Criptográfica SHA-256 -->
        <div style="background: #080a0f; border: 1px solid var(--border-strong); padding: 14px 18px; border-radius: var(--radius-sm); margin-bottom: 20px;">
          <div style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
            <span>HASH CRIPTOGRÁFICO SHA-256 DO TERMO:</span>
            <span style="color: #38a169; font-weight: 600;">✓ Integridade Criptográfica Verificada</span>
          </div>
          <div style="font-family: var(--font-mono); font-size: 11.5px; color: var(--gold-accent); word-break: break-all; margin: 4px 0 8px;">
            ${contract.contractHash}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px;">
            <span>Data de Emissão: <strong>${contract.signedAt}</strong></span>
            <button class="btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="App.copyPixKey('${contract.contractHash}', '✓ Hash SHA-256 copiado!')">
              ${Icons.copy ? Icons.copy(12) : ''}
              <span>Copiar Hash</span>
            </button>
          </div>
        </div>

        <!-- Rodapé de Ações do Superadmin -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 16px; gap: 10px; flex-wrap: wrap;">
          <div style="display: flex; gap: 8px;">
            ${contract.status === 'pendente' ? `
              <button class="btn-primary" style="background: #10b981; color: #ffffff; padding: 10px 18px; font-size: 13px; font-weight: 700; border: none; cursor: pointer;" onclick="App.approveContractFromModal('${contract.id}')">
                ${Icons.check(13)}
                <span>Aprovar & Homologar Contrato Agora</span>
              </button>
              <button class="btn-reject" style="padding: 10px 14px; font-size: 12px; cursor: pointer;" onclick="App.rejectContractFromModal('${contract.id}')">
                <span>Recusar / Solicitar Ajuste</span>
              </button>
            ` : `
              <button class="btn-secondary" style="color: #fbbf24; border-color: rgba(245, 158, 11, 0.4); padding: 9px 15px; font-size: 12px; display: inline-flex; align-items: center; gap: 5px;" onclick="App.reopenContractAnalysis('${contract.id}')" title="Reabrir análise deste contrato e torná-lo pendente">
                ${Icons.refresh ? Icons.refresh(12) : ''}
                <span>Reabrir Análise (Tornar Pendente)</span>
              </button>
              <button class="btn-secondary" onclick="App.downloadTermo('${contract.id}')">
                ${Icons.download(13)}
                <span>Imprimir / Salvar PDF</span>
              </button>
            `}
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-secondary" style="color: #f87171; border-color: rgba(239, 68, 68, 0.4); padding: 9px 13px; font-size: 12px; display: inline-flex; align-items: center; gap: 4px;" onclick="App.openDeleteContractModal('${contract.id}')" title="Excluir este contrato permanentemente">
              <span>✕ Excluir Contrato</span>
            </button>
            <button class="btn-secondary" onclick="App.closeContractModal()">
              <span>Fechar Modal</span>
            </button>
          </div>
        </div>
      `;
    }

    modalEl.classList.add("active");
  },

  toggleEditContractInModal(contractId) {
    this.editingContractId = contractId;
    this.openContractModal(contractId);
  },

  cancelEditContract(contractId) {
    this.editingContractId = null;
    this.openContractModal(contractId);
  },

  async saveEditedContract(contractId) {
    const name = document.getElementById("modal-edit-name")?.value;
    const cpf = document.getElementById("modal-edit-cpf")?.value;
    const city = document.getElementById("modal-edit-city")?.value;
    const state = document.getElementById("modal-edit-state")?.value;
    const phone = document.getElementById("modal-edit-phone")?.value;
    const email = document.getElementById("modal-edit-email")?.value;
    const institution = document.getElementById("modal-edit-inst")?.value;
    const monthlyContribution = document.getElementById("modal-edit-valor")?.value;
    const monthsCommitted = document.getElementById("modal-edit-meses")?.value;

    const updated = await Store.updateContract(contractId, {
      name,
      cpf,
      city,
      state,
      phone,
      email,
      institution,
      monthlyContribution,
      monthsCommitted
    });

    if (updated) {
      this.editingContractId = null;
      this.showToast(`✓ Dados do contrato ${contractId} atualizados com sucesso!`);
      this.renderSidebar();
      this.renderInspector();
      if (this.activeTab === "gestao") {
        this.renderGestao(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      } else if (this.activeTab === "termo") {
        this.renderTermo(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      }
      this.openContractModal(contractId);
    }
  },

  closeContractModal() {
    this.editingContractId = null;
    const modalEl = document.getElementById("contract-audit-modal");
    if (modalEl) modalEl.classList.remove("active");
  },

  async approveContractFromModal(contractId) {
    const approved = await Store.approveContract(contractId);
    if (approved) {
      this.showToast(`✓ Contrato ${contractId} homologado com sucesso!`);
      this.renderSidebar();
      this.renderInspector();
      if (this.activeTab === "gestao") {
        this.renderGestao(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      } else if (this.activeTab === "termo") {
        this.renderTermo(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      }
      this.openContractModal(contractId);
    }
  },

  async reopenContractAnalysis(contractId) {
    const reopened = await Store.setContractPending(contractId);
    if (reopened) {
      this.showToast(`Contrato ${contractId} retornado para status EM ANÁLISE.`);
      this.renderSidebar();
      this.renderInspector();
      if (this.activeTab === "gestao") {
        this.renderGestao(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      } else if (this.activeTab === "termo") {
        this.renderTermo(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      }
      this.openContractModal(contractId);
    }
  },

  async rejectContractFromModal(contractId) {
    const reason = prompt("Informe o motivo da recusa ou pendência cadastral:", "Dados cadastrais incompletos ou divergentes.");
    if (reason !== null) {
      await Store.rejectContract(contractId, reason);
      this.showToast(`Contrato ${contractId} marcado com pendência.`);
      this.renderSidebar();
      this.renderInspector();
      if (this.activeTab === "gestao") {
        this.renderGestao(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      } else if (this.activeTab === "termo") {
        this.renderTermo(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      }
      this.openContractModal(contractId);
    }
  },

  async approveContract(contractId) {
    const approved = await Store.approveContract(contractId);
    if (approved) {
      this.showToast(`✓ Contrato ${contractId} homologado com sucesso!`);
      this.renderSidebar();
      this.renderInspector();
      if (this.activeTab === "termo") {
        this.renderTermo(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      } else if (this.activeTab === "gestao") {
        this.renderGestao(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      }
    }
  },

  async rejectContract(contractId) {
    const reason = prompt("Informe o motivo da recusa ou pendência do contrato:", "Dados cadastrais incompletos ou requerem confirmação.");
    if (reason !== null) {
      await Store.rejectContract(contractId, reason);
      this.showToast(`Contrato ${contractId} marcado com pendência.`);
      this.renderSidebar();
      this.renderInspector();
      if (this.activeTab === "termo") {
        this.renderTermo(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      } else if (this.activeTab === "gestao") {
        this.renderGestao(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      }
    }
  },

  // ==========================================================================
  // GESTÃO DE APORTES: EDIÇÃO E EXCLUSÃO DE CONTRATOS (SUPERADMIN)
  // ==========================================================================
  openEditContractModal(contractId) {
    const contract = Store.getContracts().find(c => c.id === contractId);
    if (!contract) return;

    const modal = document.getElementById("contract-edit-modal");
    if (!modal) return;

    document.getElementById("edit-contract-id").value = contract.id;
    document.getElementById("edit-contract-name").value = contract.name || "";
    document.getElementById("edit-contract-cpf").value = contract.cpf || "";
    document.getElementById("edit-contract-email").value = contract.email || "";
    document.getElementById("edit-contract-phone").value = contract.phone || "";
    document.getElementById("edit-contract-city").value = contract.city || "Passo Fundo";
    document.getElementById("edit-contract-state").value = contract.state || "RS";
    document.getElementById("edit-contract-institution").value = contract.institution || "";
    document.getElementById("edit-contract-value").value = contract.monthlyContribution || 500;
    document.getElementById("edit-contract-months").value = contract.monthsCommitted || 12;
    document.getElementById("edit-contract-status").value = contract.status || "pendente";
    document.getElementById("edit-contract-notes").value = contract.notes || contract.auditNotes || "";

    modal.classList.add("active");
  },

  closeEditContractModal() {
    const modal = document.getElementById("contract-edit-modal");
    if (modal) modal.classList.remove("active");
  },

  async submitEditContractForm(e) {
    if (e && e.preventDefault) e.preventDefault();
    const contractId = document.getElementById("edit-contract-id").value;
    if (!contractId) return;

    const name = document.getElementById("edit-contract-name").value;
    const cpf = document.getElementById("edit-contract-cpf").value;
    const email = document.getElementById("edit-contract-email").value;
    const phone = document.getElementById("edit-contract-phone").value;
    const city = document.getElementById("edit-contract-city").value;
    const state = document.getElementById("edit-contract-state").value;
    const institution = document.getElementById("edit-contract-institution").value;
    const monthlyContribution = document.getElementById("edit-contract-value").value;
    const monthsCommitted = document.getElementById("edit-contract-months").value;
    const status = document.getElementById("edit-contract-status").value;
    const notes = document.getElementById("edit-contract-notes").value;

    const btn = document.getElementById("save-edit-contract-btn");
    const origHtml = btn ? btn.innerHTML : "";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>Salvando no Supabase...</span>`;
    }

    try {
      const updated = await Store.updateContract(contractId, {
        name,
        cpf,
        email,
        phone,
        city,
        state,
        institution,
        monthlyContribution,
        monthsCommitted,
        status,
        notes
      });

      this.closeEditContractModal();
      this.renderSidebar();
      this.renderInspector();
      if (this.activeTab === "gestao") {
        this.renderGestao(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      } else if (this.activeTab === "termo") {
        this.renderTermo(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      }
      this.showToast(`✓ Contrato ${contractId} atualizado com sucesso no Supabase!`);
    } catch (err) {
      this.showToast(`⚠️ Erro ao atualizar contrato: ${err.message || err}`);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  },

  openDeleteContractModal(contractId) {
    const contract = Store.getContracts().find(c => c.id === contractId);
    if (!contract) return;

    const modal = document.getElementById("contract-delete-modal");
    if (!modal) return;

    document.getElementById("delete-contract-target-id").value = contract.id;
    const preview = document.getElementById("delete-contract-preview-card");
    if (preview) {
      preview.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <strong style="color: #ffffff; font-size: 13.5px;">${contract.name}</strong>
            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
              Protocolo: ${contract.id} • CPF: ${contract.cpf || 'Não informado'}
            </div>
          </div>
          <span class="contract-badge ${contract.status || 'pendente'}">${contract.status === 'aprovado' ? 'Homologado' : (contract.status === 'recusado' ? 'Recusado' : 'Em Análise')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; margin-top: 8px;">
          <span>Aporte: R$ ${Number(contract.monthlyContribution || 0).toFixed(2)}/mês (${contract.monthsCommitted} meses)</span>
          <span style="color: var(--gold-accent); font-weight: 700;">Cota: ${Number(contract.equitySharePercent || 0).toFixed(2)}%</span>
        </div>
      `;
    }

    modal.classList.add("active");
  },

  closeDeleteContractModal() {
    const modal = document.getElementById("contract-delete-modal");
    if (modal) modal.classList.remove("active");
  },

  async executeDeleteContract() {
    const contractId = document.getElementById("delete-contract-target-id").value;
    if (!contractId) return;

    const contract = Store.getContracts().find(c => c.id === contractId);
    const supporterName = contract ? contract.name : contractId;

    const btn = document.getElementById("confirm-delete-contract-btn");
    const origHtml = btn ? btn.innerHTML : "";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>Excluindo na nuvem...</span>`;
    }

    try {
      await Store.deleteContract(contractId);
      this.closeDeleteContractModal();
      this.closeContractModal();
      this.renderSidebar();
      this.renderInspector();
      if (this.activeTab === "gestao") {
        this.renderGestao(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      } else if (this.activeTab === "termo") {
        this.renderTermo(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      }
      this.showToast(`✓ Contrato ${contractId} (${supporterName}) excluído com sucesso!`);
    } catch (err) {
      this.showToast(`⚠️ Erro ao excluir contrato: ${err.message || err}`);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  },

  deleteContract(contractId) {
    this.openDeleteContractModal(contractId);
  },

  // ==========================================================================
  // MOTOR DE IMPRESSÃO & GERAÇÃO DE PDF DE ALTO PADRÃO (A4 EXECUTIVO)
  // ==========================================================================
  openExecutivePrintWindow(title, contentHtml) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor, permita pop-ups no navegador para gerar o documento em PDF de alto padrão.");
      return;
    }

    const printDoc = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="icon" type="image/png" href="favicon_logo_PPrancheta-1.png">
  <link rel="shortcut icon" type="image/png" href="assets/img/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 14mm 14mm 14mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      background: #e2e8f0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      line-height: 1.6;
      font-size: 12.5px;
    }
    .print-control-bar {
      position: sticky;
      top: 0;
      background: #090a0f;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 10000;
    }
    .btn-action-print {
      background: #c7a598;
      color: #000000;
      font-weight: 700;
      padding: 8px 18px;
      border-radius: 6px;
      border: none;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-action-close {
      background: transparent;
      color: #94a3b8;
      border: 1px solid #334155;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
    }
    .page-sheet {
      background: #ffffff;
      width: 210mm;
      min-height: 297mm;
      margin: 20px auto;
      padding: 16mm 16mm;
      box-shadow: 0 10px 35px rgba(0,0,0,0.12);
      border: 1px solid #cbd5e1;
    }
    @media print {
      body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .print-control-bar {
        display: none !important;
      }
      .page-sheet {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        box-shadow: none !important;
        border: none !important;
        min-height: auto !important;
      }
      .page-break {
        page-break-before: always;
      }
    }
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #0f172a;
      margin: 0;
      line-height: 1;
    }
    .brand-sub {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #b45309;
      margin-top: 4px;
      text-transform: uppercase;
    }
    .doc-meta {
      text-align: right;
      font-size: 10.5px;
      color: #475569;
      line-height: 1.5;
    }
    .doc-meta strong {
      color: #0f172a;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .doc-main-title {
      font-size: 15px;
      font-weight: 800;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin: 14px 0 14px 0;
      padding: 8px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
    }
    .doc-section {
      margin-bottom: 14px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin: 14px 0 8px 0;
    }
    .doc-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 11px;
    }
    .doc-table th, .doc-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 9px;
      text-align: left;
    }
    .doc-table th {
      background: #f1f5f9;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      font-size: 9.5px;
      letter-spacing: 0.5px;
    }
    .doc-table td {
      color: #1e293b;
    }
    .highlight-cell {
      background: #fefce8;
      font-weight: 700;
      color: #b45309;
    }
    p {
      margin: 0 0 7px 0;
      text-align: justify;
      line-height: 1.55;
    }
    .quote-box {
      background: #f8fafc;
      border-left: 3px solid #b45309;
      padding: 8px 14px;
      margin: 10px 0;
      font-style: italic;
      color: #334155;
      font-size: 11.5px;
    }
    .security-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      border-radius: 4px;
      margin: 12px 0;
      font-size: 10.5px;
    }
    .hash-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      color: #0f172a;
      word-break: break-all;
      background: #ffffff;
      padding: 5px 8px;
      border: 1px dashed #94a3b8;
      margin: 4px 0;
    }
    .signatures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 26px;
      page-break-inside: avoid;
    }
    .sig-field {
      text-align: center;
      font-size: 10.5px;
      color: #475569;
    }
    .sig-line {
      border-top: 1px solid #334155;
      margin-bottom: 6px;
    }
    .sig-name {
      font-weight: 700;
      color: #0f172a;
      font-size: 11.5px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 10px 0;
    }
    .card-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 8px 10px;
      font-size: 11px;
    }
    .card-box strong {
      color: #0f172a;
      display: block;
      margin-bottom: 2px;
    }
    .doc-footer {
      border-top: 1px solid #e2e8f0;
      margin-top: 20px;
      padding-top: 8px;
      font-size: 9.5px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>
  <div class="print-control-bar">
    <div>
      <strong style="color: #ffffff; font-size: 14px;">Pré-Visualização do Documento Oficial</strong>
      <span style="color: #94a3b8; font-size: 12px; margin-left: 8px;">(Pronto para Salvar em PDF de Alta Resolução ou Imprimir)</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="btn-action-close" onclick="window.close()">Fechar</button>
      <button class="btn-action-print" onclick="window.print()">
        <span>Imprimir / Salvar em PDF</span>
      </button>
    </div>
  </div>

  <div class="page-sheet">
    ${contentHtml}
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 450);
    };
  <\/script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(printDoc);
    printWindow.document.close();
  },

  downloadTermo(contractId) {
    const userContract = Store.getUserContract(Store.auth.currentUser);
    const contract = (contractId ? Store.getContracts().find(c => c.id === contractId) : null) 
      || (this.viewingContractId ? Store.getContracts().find(c => c.id === this.viewingContractId) : null)
      || userContract 
      || Store.getContracts()[0];

    if (!contract) {
      alert("Nenhum contrato localizado para impressão.");
      return;
    }

    const isApproved = contract.status === "aprovado";

    const contentHtml = `
      <div class="doc-header">
        <div>
          <h1 class="brand-title">PEREGRINO</h1>
          <div class="brand-sub">HAJA LUZ STUDIO • GOVERNANÇA & DESENVOLVIMENTO</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Passo Fundo / RS • CNPJ: 61.511.844/0001-91</div>
        </div>
        <div class="doc-meta">
          <div class="status-badge" style="${isApproved ? 'background: #dcfce7; color: #15803d; border: 1px solid #86efac;' : 'background: #fef3c7; color: #b45309; border: 1px solid #fde68a;'}">
            ${isApproved ? 'CONTRATO HOMOLOGADO' : 'EM ANÁLISE PELA DIRETORIA'}
          </div>
          <div>PROTOCOLO: <strong>${contract.id}</strong></div>
          <div>EMISSÃO: <strong>${contract.signedAt || new Date().toLocaleDateString('pt-BR')}</strong></div>
          <div>HASH: <strong style="font-family: 'JetBrains Mono', monospace; font-size: 10px;">${(contract.contractHash || '').substring(0, 16)}...</strong></div>
        </div>
      </div>

      <div class="doc-main-title">
        INSTRUMENTO PARTICULAR DE ADESÃO, APOIO FINANCEIRO E PARTICIPAÇÃO EM RECEITA (REVENUE SHARE)
      </div>

      <div class="doc-section">
        <div class="section-title">1. QUALIFICAÇÃO DAS PARTES</div>
        <p>
          <strong>ESTÚDIO DESENVOLVEDOR / TITULAR SOBERANO:</strong> <strong>Andressa do Prado Costa Corá</strong> (Nome Fantasia: <strong>Haja Luz Studio</strong>), pessoa jurídica inscrita no CNPJ/MF sob o nº <strong>61.511.844/0001-91</strong>, com sede e foro na comarca de Passo Fundo/RS, doravante denominada simplesmente <strong>ESTÚDIO / CRIADOR</strong>.
        </p>
        <p>
          <strong>APOIADOR PARTICIPANTE:</strong> <strong>${contract.name}</strong>, inscrito no CPF/CNPJ sob o nº <strong>${contract.cpf || 'Cadastrado'}</strong>, residente e domiciliado na comarca de <strong>${contract.city || 'Passo Fundo'} / ${contract.state || 'RS'}</strong>, contato telefônico/WhatsApp <strong>${contract.phone || 'Cadastrado'}</strong>, e-mail <strong>${contract.email || 'Cadastrado'}</strong>, vinculado à instituição/comunidade <strong>${contract.institution || 'Apoiador Individual'}</strong>, doravante denominado simplesmente <strong>APOIADOR</strong>.
        </p>
      </div>

      <div class="doc-section">
        <div class="section-title">2. QUADRO-RESUMO DA PARTICIPAÇÃO E COTAS</div>
        <table class="doc-table">
          <thead>
            <tr>
              <th>Aporte Mensal</th>
              <th>Prazo de Apoio</th>
              <th>Total Previsto</th>
              <th>Cota de Revenue Share</th>
              <th>Fator Pioneiro</th>
              <th>Contrapartida In-Game</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>R$ ${Number(contract.monthlyContribution).toFixed(2)}</strong></td>
              <td>${contract.monthsCommitted} meses</td>
              <td><strong>R$ ${Number(contract.totalInvested).toFixed(2)}</strong></td>
              <td class="highlight-cell">${Number(contract.equitySharePercent).toFixed(2)}% do Faturamento Líquido</td>
              <td>1.5x (Lote Pioneiro)</td>
              <td>Personagem 3D Esculpido In-Game</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="doc-section">
        <div class="section-title">3. CLÁUSULAS CONTRATUAIS GERAIS</div>
        <p>
          <strong>CLÁUSULA PRIMEIRA — DO OBJETO E CARÁTER MISSIONÁRIO:</strong> O presente instrumento formaliza a adesão e o apoio financeiro voluntário do APOIADOR ao desenvolvimento e lançamento do jogo eletrônico <strong>"Peregrino"</strong>, produzido com exclusividade pelo <strong>Haja Luz Studio (titularidade de Andressa do Prado Costa Corá - CNPJ 61.511.844/0001-91)</strong>, projeto de natureza missionária, cultural e pacífica, com foco na narrativa bíblica do primeiro século, sem armas de fogo e sem combate violento.
        </p>
        <p>
          <strong>CLÁUSULA SEGUNDA — DA SOBERANIA PERPÉTUA (51% TITULARIDADE):</strong> Fica estabelecido em caráter perpétuo e irrevogável que 51% (cinquenta e um por cento) dos direitos patrimoniais, autorais, teológicos e decisões estratégicas do projeto pertencem e permanecem sob controle soberano da titularidade jurídica de <strong>Andressa do Prado Costa Corá (Haja Luz Studio)</strong>, assegurando a integridade doutrinária e pacífica de Peregrino.
        </p>
        <p>
          <strong>CLÁUSULA TERCEIRA — DO REVENUE SHARE E BLINDAGEM PATRIMONIAL (NÃO-EQUITY):</strong> O APOIADOR adquire o direito de participação econômica sobre o faturamento líquido global do jogo (receita de vendas deduzidas as taxas obrigatórias das plataformas digitais Steam, Google Play, Apple App Store e tributos diretos), a partir do <strong>Marco Zero de Lançamento Comercial</strong>. O presente instrumento é contrato atípico de participação em receitas e <strong>NÃO</strong> confere quotas societárias de <strong>Andressa do Prado Costa Corá</strong>, não confere voto administrativo e <strong>NÃO responsabiliza o APOIADOR por quaisquer dívidas, passivos cíveis, trabalhistas ou tributários da pessoa jurídica</strong>.
        </p>
        <p>
          <strong>CLÁUSULA QUARTA — DA CONTRAPARTIDA DE PERSONAGEM 3D:</strong> Em razão do compromisso financeiro com prazo igual ou superior a 12 meses, o APOIADOR tem assegurado o direito de ser modelado em 3D cel-shading com suas feições reais (mediante envio de fotos) e inserido como personagem guardião/recepcionista em uma das 7 Bases da Vila na Galileia e Judeia.
        </p>
        <p>
          <strong>CLÁUSULA QUINTA — DA EFICÁCIA JURÍDICA E ASSINATURA ELETRÔNICA:</strong> As partes reconhecem a plena validade e eficácia executiva do presente contrato celebrado por meios eletrônicos, nos termos do Art. 10, § 2º da <strong>Medida Provisória nº 2.200-2/2001</strong>, da <strong>Lei Federal nº 14.063/2020 (Assinatura Eletrônica Avançada)</strong> e dos Arts. 421 e 425 do <strong>Código Civil Brasileiro</strong>.
        </p>
        <p>
          <strong>CLÁUSULA SEXTA — DO FORO:</strong> Fica eleito o Foro da Comarca de Passo Fundo, Estado do Rio Grande do Sul, com expressa renúncia a qualquer outro, por mais privilegiado que seja, para dirimir eventuais controvérsias decorrentes deste instrumento.
        </p>
      </div>

      <div class="security-box">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">REGISTRO CRIPTOGRÁFICO DE INTEGRIDADE (SHA-256)</div>
        <div style="font-size: 10.5px; color: #64748b;">Este contrato foi autenticado e registrado com hash criptográfico imutável gravado no sistema:</div>
        <div class="hash-code">${contract.contractHash}</div>
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #475569; margin-top: 4px;">
          <span>Homologação: <strong>${contract.approvedBy || 'Haja Luz Studio'}</strong></span>
          <span>Data de Validação: <strong>${contract.approvedAt || contract.signedAt}</strong></span>
          <span>Certificação: <strong>Inviolável</strong></span>
        </div>
      </div>

      <div class="signatures-grid">
        <div class="sig-field">
          <div class="sig-line"></div>
          <div class="sig-name">ANDRESSA DO PRADO COSTA CORÁ</div>
          <div>Haja Luz Studio • CNPJ: 61.511.844/0001-91</div>
          <div style="color: #64748b; font-size: 10px;">Desenvolvedor Principal & Titular Soberano (Passo Fundo/RS)</div>
        </div>
        <div class="sig-field">
          <div class="sig-line"></div>
          <div class="sig-name">${contract.name.toUpperCase()}</div>
          <div>CPF/CNPJ: ${contract.cpf || 'Registrado no Sistema'}</div>
          <div style="color: #64748b; font-size: 10px;">Apoiador Participante • Cota: ${Number(contract.equitySharePercent).toFixed(2)}%</div>
        </div>
      </div>

      <div class="doc-footer">
        <span>Peregrino © 2026 Haja Luz Studio • Passo Fundo/RS • Registro de Governança Comunitária</span>
        <span>Página 1 de 1 • Documento Oficial Autenticado</span>
      </div>
    `;

    this.openExecutivePrintWindow(`Contrato_Peregrino_${contract.id}`, contentHtml);
  },

  openDossieWindow(customUserId) {
    let targetId = customUserId;
    if (!targetId) {
      if (this.viewingContractId) {
        const c = Store.getContracts().find(item => item.id === this.viewingContractId);
        if (c && (c.userId || c.id)) targetId = c.userId || c.id;
      }
    }
    if (!targetId) {
      if (Store.auth && Store.auth.currentUser && Store.auth.currentUser.role === 'supporter') {
        targetId = Store.auth.currentUser.id;
      } else if (Store.currentInvestor && (Store.currentInvestor.userId || Store.currentInvestor.contractId)) {
        targetId = Store.currentInvestor.userId || Store.currentInvestor.contractId;
      } else {
        const firstContract = Store.getContracts()[0];
        targetId = firstContract ? (firstContract.userId || firstContract.id) : 'INV-0701';
      }
    }
    try {
      localStorage.setItem('peregrino_selected_dossie_user', targetId);
    } catch(e) {}
    window.open(`dossie_comercial.html?user=${encodeURIComponent(targetId)}`, '_blank');
  },

  // 6. MÓDULO DOSSIÊ COMERCIAL COMPLETO
  renderDossie(headerEl, bodyEl) {
    // Identifica o investidor ativo ou visualizado
    const allSupporters = Store.users ? Store.users.filter(u => u.role === 'supporter') : [];
    let activeInvestor = null;

    if (this.viewingContractId) {
      const c = Store.getContracts().find(item => item.id === this.viewingContractId);
      if (c) activeInvestor = c;
    }
    if (!activeInvestor && Store.auth && Store.auth.currentUser && Store.auth.currentUser.role === 'supporter') {
      activeInvestor = Store.auth.currentUser;
    }
    if (!activeInvestor && Store.currentInvestor) {
      activeInvestor = Store.currentInvestor;
    }
    if (!activeInvestor) {
      activeInvestor = allSupporters[0] || {
        name: "Pastor Adriano",
        monthlyContribution: 500,
        monthsCommitted: 12,
        totalInvested: 6000,
        weightedValue: 7500,
        equitySharePercent: 2.50
      };
    }

    const invName = activeInvestor.name || 'Pastor Adriano';
    const invMonthly = Number(activeInvestor.monthlyContribution) || 500;
    const invMonths = Number(activeInvestor.monthsCommitted) || 12;
    const invTotal = Number(activeInvestor.totalInvested) || (invMonthly * invMonths);
    const invWeighted = Number(activeInvestor.weightedValue) || (invTotal * 1.25);
    const invCota = Number(activeInvestor.equitySharePercent) || 2.50;
    const invCotaStr = invCota.toFixed(2).replace('.', ',') + '%';
    const invTargetId = activeInvestor.userId || activeInvestor.id || 'INV-0701';

    const ret50kM = 50000 * (invCota / 100);
    const ret50kA = ret50kM * 12;
    const ret100kM = 100000 * (invCota / 100);
    const ret100kA = ret100kM * 12;
    const ret250kM = 250000 * (invCota / 100);
    const ret250kA = ret250kM * 12;

    headerEl.innerHTML = `
      <div class="workspace-title-group">
        <h2>Dossiê Executivo & Modelo Comercial Completo</h2>
        <p>Apresentação comercial e técnica detalhada para investidores, pastores e conselhos</p>
      </div>
      <div class="workspace-actions">
        <button class="btn-primary" onclick="App.openDossieWindow('${invTargetId}')">
          ${Icons.fileText(14)}
          <span>Abrir Versão PDF / Impressão</span>
        </button>
      </div>
    `;

    bodyEl.innerHTML = `
      <div class="card" style="display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Bloco 1: Oportunidade de Mercado e Pitch -->
        <div>
          <div style="font-size: 11px; font-weight: 700; color: var(--gold-accent); text-transform: uppercase; letter-spacing: 0.8px;">01 • PITCH COMERCIAL & MERCADO</div>
          <h3 style="color: #ffffff; font-size: 18px; margin: 4px 0 8px;">Peregrino — Inovação com Propósito</h3>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.65;">
            O mercado global de jogos digitais ultrapassa <strong>US$ 180 bilhões anuais</strong>, mas carece de produções de alto valor técnico e visual voltadas para valores bíblicos e princípios éticos. <strong>Peregrino</strong> une a exploração dinâmica de mundo aberto (estilo <em>GTA Clássico</em>) com a profundidade estratégica de sobrevivência comunitária (inspirada em <em>State of Decay</em>), substituindo a violência por discipulado ativo e restauração comunitária.
          </p>
          <div class="stat-grid" style="grid-template-columns: repeat(3, 1fr); margin-top: 10px;">
            <div class="cenario-box">
              <div class="cenario-faturamento">Plataformas</div>
              <div style="font-size: 13.5px; font-weight: 700; color: #ffffff; margin-top: 4px;">PC & Mobile (Cross-play)</div>
            </div>
            <div class="cenario-box">
              <div class="cenario-faturamento">Público-Alvo</div>
              <div style="font-size: 13.5px; font-weight: 700; color: #ffffff; margin-top: 4px;">Comunidades, Famílias e Jovens</div>
            </div>
            <div class="cenario-box">
              <div class="cenario-faturamento">Combate Físico</div>
              <div style="font-size: 13.5px; font-weight: 700; color: #38a169; margin-top: 4px;">Zero Violência (100% Pacífico)</div>
            </div>
          </div>
        </div>

        <hr style="border: 0; border-top: 1px solid var(--border-subtle);" />

        <!-- Bloco 2: Sobrevivência e Gestão Comunitária (State of Decay) -->
        <div>
          <div style="font-size: 11px; font-weight: 700; color: var(--gold-accent); text-transform: uppercase; letter-spacing: 0.8px;">02 • DIFERENCIAL CENTRAL: STATE OF DECAY BÍBLICO</div>
          <h3 style="color: #ffffff; font-size: 17px; margin: 4px 0 8px;">As 7 Bases Estratégicas e Migração Contínua</h3>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.65;">
            A comunidade do jogador não é estática. A progressão ocorre por meio de migração progressiva: inicia-se no <strong>Acampamento do Vale</strong> (6 a 10 pessoas), avança-se pela <strong>Feitoria do Cais</strong> (12 a 16 pessoas), <strong>Estalagem dos Mercadores</strong> (18 a 22), <strong>Posto Avançado do Deserto</strong> (15 a 20), <strong>Refúgio das Fontes</strong> (25 a 30), <strong>Fortaleza da Ilha</strong> (30 a 40) e culmina na <strong>Cidadela do Cume</strong> (mais de 50 habitantes).
          </p>
          <div style="background-color: var(--bg-canvas); border: 1px solid var(--border-strong); padding: 14px; border-radius: var(--radius-sm); margin-top: 8px;">
            <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 6px;">As 5 Vocações dos Habitantes Convertidos:</div>
            <ul style="margin-left: 20px; font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
              <li><strong>Pescador / Agricultor:</strong> Coleta contínua de alimentos, impedindo o decaimento por fome na vila.</li>
              <li><strong>Carpinteiro / Construtor:</strong> Expansão da infraestrutura e aumento do limite de camas da base.</li>
              <li><strong>Médico (Apoticário):</strong> Cuidados com ervas e óleos, mantendo a saúde e a moral da comunidade.</li>
              <li><strong>Tecelão (Fazedor de Tendas):</strong> Confecção de alforjes para o jumentinho e mantimentos de viagem.</li>
              <li><strong>Escriba / Mestre:</strong> Discipulado interno que sustenta a fé coletiva e previne crises de apostasia.</li>
            </ul>
          </div>
        </div>

        <hr style="border: 0; border-top: 1px solid var(--border-subtle);" />

        <!-- Bloco 3: Cidade Monumental e 7 Distritos -->
        <div>
          <div style="font-size: 11px; font-weight: 700; color: var(--gold-accent); text-transform: uppercase; letter-spacing: 0.8px;">03 • CENÁRIO & MUNDO ABERTO</div>
          <h3 style="color: #ffffff; font-size: 17px; margin: 4px 0 8px;">Cidade Monumental Inédita e os 7 Distritos</h3>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.65;">
            Uma cidade inédita e massiva inspirada na Galileia do primeiro século (Cafarnaum e Nazaré), com 100% dos esforços iniciais concentrados em consolidar este território antes de abrir novas cidades. Vias urbanas de 2,5m de largura e trilhas rurais com menos de 1m, oferecendo micro-pontos de interesse a cada 40 a 60 segundos de deslocamento.
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px;">
            <div class="box" style="padding: 10px;">
              <strong style="color: var(--gold-accent); font-size: 13px;">Distritos 1 a 4:</strong>
              <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 4px;">Porto dos Pescadores (orla e cais de basalto), Mercado Central (arcos e poço), Colina da Sinagoga (calcário claro monumental) e Base da Comunidade (celeiros).</div>
            </div>
            <div class="box" style="padding: 10px;">
              <strong style="color: var(--gold-accent); font-size: 13px;">Distritos 5 a 7:</strong>
              <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 4px;">Santuário do Monte (desfiladeiro 45m e oliveiras), Vale das Cavernas (cachoeira e acampamento nômade de lã) e Oásis Distante (tamareiras no deserto).</div>
            </div>
          </div>
        </div>

        <hr style="border: 0; border-top: 1px solid var(--border-subtle);" />

        <!-- Bloco 4: Mecânicas, IA e Zero Violência -->
        <div>
          <div style="font-size: 11px; font-weight: 700; color: var(--gold-accent); text-transform: uppercase; letter-spacing: 0.8px;">04 • MECÂNICAS CENTRAIS & IA ESPIRITUAL</div>
          <h3 style="color: #ffffff; font-size: 17px; margin: 4px 0 8px;">Ciclo Espiritual, Dons e Montaria</h3>
          <ul style="margin-left: 20px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.65;">
            <li><strong>Máquina de Estados dos Cidadãos:</strong> <em>Sombra</em> (não alcançado, desafio bíblico) &rarr; <em>Cinza</em> (ouvinte, requer discipulado) &rarr; <em>Luz</em> (discípulo autônomo com IA que patrulha e converte outros cidadãos sozinho).</li>
            <li><strong>Motor Zero-Repeat (DDA):</strong> Banco cognitivo que não repete perguntas bíblicas e sorteio sem reposição de nomes históricos da época.</li>
            <li><strong>Árvore de Dons (1 Co 12):</strong> Habilidades ativadas por Santificação (Dom de Curas em 15m, Discernimento de Espíritos, Palavra de Sabedoria, Operação de Milagres).</li>
            <li><strong>Montaria do Jumentinho:</strong> +60% de velocidade de locomoção, redução da desconfiança de céticos e alforjes como baú móvel para transporte de suprimentos.</li>
            <li><strong>Missões Históricas & Recrutamento:</strong> Eventos táteis da <em>Pesca Maravilhosa</em>, <em>Andar Sobre as Águas</em>, <em>Multiplicação dos Pães</em> e recrutamento de figuras centrais como Paulo e Silas e João Batista.</li>
          </ul>
        </div>

        <hr style="border: 0; border-top: 1px solid var(--border-subtle);" />

        <!-- Bloco 5: Engenharia a 60 FPS -->
        <div>
          <div style="font-size: 11px; font-weight: 700; color: var(--gold-accent); text-transform: uppercase; letter-spacing: 0.8px;">05 • PERFORMANCE & ENGENHARIA</div>
          <h3 style="color: #ffffff; font-size: 17px; margin: 4px 0 8px;">60 FPS Cravados em PC e Mobile (Godot 4.x)</h3>
          <div class="stat-grid" style="grid-template-columns: repeat(4, 1fr); margin-top: 10px;">
            <div class="cenario-box">
              <div class="cenario-faturamento">Distance Culling</div>
              <div style="font-size: 12px; font-weight: 600; color: #ffffff; margin-top: 4px;">Oculta adereços a >120m</div>
            </div>
            <div class="cenario-box">
              <div class="cenario-faturamento">Simulation Culling</div>
              <div style="font-size: 12px; font-weight: 600; color: #ffffff; margin-top: 4px;">Congela física fora da visão</div>
            </div>
            <div class="cenario-box">
              <div class="cenario-faturamento">MultiMeshInstance3D</div>
              <div style="font-size: 12px; font-weight: 600; color: #ffffff; margin-top: 4px;">Desenho em draw call único</div>
            </div>
            <div class="cenario-box">
              <div class="cenario-faturamento">Geração Modular</div>
              <div style="font-size: 12px; font-weight: 600; color: #ffffff; margin-top: 4px;">Baixo consumo de RAM</div>
            </div>
          </div>
        </div>

        <hr style="border: 0; border-top: 1px solid var(--border-subtle);" />

        <!-- Bloco 6: Modelo de Investimento e Cotas -->
        <div>
          <div style="font-size: 11px; font-weight: 700; color: var(--gold-accent); text-transform: uppercase; letter-spacing: 0.8px;">06 • GOVERNANÇA SOCIETÁRIA & RETORNO FINANCEIRO</div>
          <h3 style="color: #ffffff; font-size: 17px; margin: 4px 0 8px;">Fórmula Ponderada do Risco Pioneiro (51% / 49%)</h3>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.65;">
            51% pertencem permanentemente ao Criador (soberania artística e doutrinária). Os 49% restantes formam o pool comercial ponderado pelo Fator Pioneiro (1,25x na fase de MVP atual):
          </p>
          <div style="background-color: var(--bg-surface-elevated); border: 1px solid var(--border-strong); padding: 14px; border-radius: var(--radius-sm); margin: 10px 0;">
            <div style="font-size: 13px; color: var(--gold-accent); font-weight: 700;">Exemplo Prático: ${invName} (R$ ${invMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês por ${invMonths} meses)</div>
            <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
              Aporte Total: <strong>R$ ${invTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> &rarr; Valor Ponderado (1,25x): <strong>R$ ${invWeighted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> &rarr; Cota Definitiva: <strong>${invCotaStr} dos lucros líquidos globais</strong>.
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-muted); text-align: left;">
                <th style="padding: 8px;">Faturamento Líquido Mensal</th>
                <th style="padding: 8px;">Pool de Apoiadores (49%)</th>
                <th style="padding: 8px;">Retorno do Investidor (${invCotaStr})</th>
                <th style="padding: 8px;">Retorno Anual</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 10px 8px; font-weight: 600;">R$ 50.000,00 / mês</td>
                <td style="padding: 10px 8px;">R$ 24.500,00</td>
                <td style="padding: 10px 8px; color: var(--gold-accent); font-weight: 700;">R$ ${ret50kM.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês</td>
                <td style="padding: 10px 8px; font-family: var(--font-mono);">R$ ${ret50kA.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 10px 8px; font-weight: 600;">R$ 100.000,00 / mês (Meta)</td>
                <td style="padding: 10px 8px;">R$ 49.000,00</td>
                <td style="padding: 10px 8px; color: var(--gold-accent); font-weight: 700;">R$ ${ret100kM.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês</td>
                <td style="padding: 10px 8px; font-family: var(--font-mono);">R$ ${ret100kA.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style="padding: 10px 8px; font-weight: 600;">R$ 250.000,00 / mês (Expansão)</td>
                <td style="padding: 10px 8px;">R$ 122.500,00</td>
                <td style="padding: 10px 8px; color: var(--gold-accent); font-weight: 700;">R$ ${ret250kM.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês</td>
                <td style="padding: 10px 8px; font-family: var(--font-mono);">R$ ${ret250kA.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
          <button class="btn-primary" onclick="App.openDossieWindow('${invTargetId}')">
            ${Icons.fileText(14)}
            <span>Visualizar Documento Executivo Completo para Impressão</span>
          </button>
        </div>

      </div>
    `;
  },

  async refreshContractsFromCloud(btn) {
    const origHtml = btn ? btn.innerHTML : "";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>Sincronizando...</span>`;
    }
    try {
      if (typeof window !== "undefined" && window.SupabaseBridge) {
        await window.SupabaseBridge.syncContracts();
      }
      const h = document.getElementById("workspace-header");
      const b = document.getElementById("workspace-body");
      if (h && b && this.activeTab === "gestao") {
        this.renderGestao(h, b);
      }
      this.renderSidebar();
      this.showToast("✓ Contratos sincronizados com a nuvem!");
    } catch (e) {
      console.warn("Erro ao atualizar contratos da nuvem:", e);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  },

  // 7. MÓDULO GESTÃO DE APORTES (PAINEL DO CRIADOR / SUPERADMIN MASTER)
  renderGestao(headerEl, bodyEl) {
    // Sincroniza silenciosamente com o Supabase Cloud se online
    if (typeof window !== "undefined" && window.SupabaseBridge && window.SupabaseBridge.isOnline) {
      const now = Date.now();
      if (!this._lastContractsSync || now - this._lastContractsSync > 8000) {
        this._lastContractsSync = now;
        window.SupabaseBridge.syncContracts().then(changed => {
          if (changed && this.activeTab === "gestao") {
            const h = document.getElementById("workspace-header");
            const b = document.getElementById("workspace-body");
            if (h && b) this.renderGestao(h, b);
            this.renderSidebar();
          }
        });
      }
    }

    const allContracts = Store.getContracts();
    const pendingContracts = allContracts.filter(c => c.status === "pendente");
    const approvedContracts = allContracts.filter(c => c.status === "aprovado");
    const totalRaised = allContracts.reduce((acc, c) => acc + (Number(c.totalInvested) || 0), 0);
    const allocatedPool = allContracts.reduce((acc, c) => acc + (Number(c.equitySharePercent) || 0), 0);

    headerEl.innerHTML = `
      <div class="workspace-title-group">
        <h2>Painel de Gestão de Aportes & Caixa</h2>
        <p>Validação de comprovantes, auditoria civil de apoiadores e homologação soberana de contratos</p>
      </div>
      <div class="workspace-actions" style="display: flex; align-items: center; gap: 8px;">
        <button class="btn-secondary" style="padding: 5px 12px; font-size: 11px; display: inline-flex; align-items: center; gap: 6px; color: var(--gold-accent); border-color: rgba(199,165,152,0.4); cursor: pointer;" onclick="App.refreshContractsFromCloud(this)" title="Buscar novos contratos assinados no banco de dados Supabase">
          ${Icons.refresh(12)}
          <span>Atualizar da Nuvem</span>
        </button>
        <span class="spec-badge" style="color: #38a169; border-color: rgba(56,161,105,0.4);">Superadmin Master Ativo</span>
      </div>
    `;

    bodyEl.innerHTML = `
      <!-- Métricas Resumo -->
      <div class="stat-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 16px;">
        <div class="stat-item" style="background: var(--bg-surface); padding: 14px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <span class="stat-label">Total de Contratos</span>
          <span class="stat-value">${allContracts.length}</span>
          <span class="stat-subtext">${approvedContracts.length} Homologados</span>
        </div>
        <div class="stat-item" style="background: var(--bg-surface); padding: 14px; border: 1px solid ${pendingContracts.length > 0 ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}; border-radius: var(--radius-sm);">
          <span class="stat-label">Pendentes de Homologação</span>
          <span class="stat-value" style="color: ${pendingContracts.length > 0 ? '#fbbf24' : '#ffffff'};">${pendingContracts.length}</span>
          <span class="stat-subtext">${pendingContracts.length > 0 ? 'Requer análise da diretoria' : 'Nenhuma pendência'}</span>
        </div>
        <div class="stat-item" style="background: var(--bg-surface); padding: 14px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <span class="stat-label">Captação Contratada</span>
          <span class="stat-value" style="color: var(--gold-accent);">R$ ${totalRaised.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <span class="stat-subtext">Meta Dev: R$ 120.000,00</span>
        </div>
        <div class="stat-item" style="background: var(--bg-surface); padding: 14px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <span class="stat-label">Pool Distribuída</span>
          <span class="stat-value highlight">${allocatedPool.toFixed(2)}%</span>
          <span class="stat-subtext">${(Store.config.supportersPool - allocatedPool).toFixed(2)}% Disponível (49% teto)</span>
        </div>
      </div>

      <!-- Tabela de Auditoria e Aprovação -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div>
            <h3 style="font-size: 14px; margin: 0 0 4px;">Auditoria de Contratos & Apoiadores Registrados</h3>
            <p style="font-size: 11.5px; color: var(--text-secondary); margin: 0;">
              Analise os dados de quem assinou, confira o CPF, localização e valide ou recuse os termos.
            </p>
          </div>
          <button class="btn-primary" onclick="App.showNewTermoForm(); App.switchTab('termo');">
            ${Icons.plus(12)}
            <span>Cadastrar Novo Contrato</span>
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-muted);">
                <th style="padding: 10px 8px;">Protocolo / Data</th>
                <th style="padding: 10px 8px;">Apoiador & Documento</th>
                <th style="padding: 10px 8px;">Localização / Contato</th>
                <th style="padding: 10px 8px;">Aporte / Prazo</th>
                <th style="padding: 10px 8px;">Cota (%)</th>
                <th style="padding: 10px 8px;">Status</th>
                <th style="padding: 10px 8px; text-align: right;">Ações de Homologação</th>
              </tr>
            </thead>
            <tbody>
              ${allContracts.length === 0 ? `
                <tr>
                  <td colspan="7" style="padding: 40px 16px; text-align: center; color: var(--text-muted);">
                    <div style="font-size: 14px; font-weight: 600; color: #ffffff; margin-bottom: 6px;">Nenhum contrato ativo no momento</div>
                    <div style="font-size: 12px; color: var(--text-secondary); max-width: 460px; margin: 0 auto 14px;">Os contratos excluídos foram removidos da nuvem. Novos termos gerados ou assinados via Link VIP aparecerão aqui em tempo real.</div>
                    <button type="button" class="btn-primary" onclick="App.showNewTermoForm(); App.switchTab('termo');" style="margin: 0 auto; display: inline-flex; align-items: center; gap: 6px;">
                      <span>+ Cadastrar Novo Aporte</span>
                    </button>
                  </td>
                </tr>
              ` : allContracts.map(c => `
                <tr style="border-bottom: 1px solid var(--border-subtle); cursor: pointer; transition: background 0.15s ease;"
                    onmouseover="this.style.background='rgba(255,255,255,0.03)'"
                    onmouseout="this.style.background='transparent'"
                    onclick="App.openContractModal('${c.id}')"
                    title="Clique para abrir e auditar os dados deste contrato antes de aprovar">
                  <td style="padding: 10px 8px; font-family: var(--font-mono); font-weight: 600; color: var(--text-primary);">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span>${c.id}</span>
                      <span style="color: var(--gold-accent); display: inline-flex; align-items: center;" title="Abrir Modal">${Icons.search ? Icons.search(11) : ''}</span>
                    </div>
                    <div style="font-size: 10px; color: var(--text-muted);">${c.signedAt}</div>
                  </td>
                  <td style="padding: 10px 8px;">
                    <div style="font-weight: 600; color: #ffffff;">${c.name}</div>
                    <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">CPF/CNPJ: ${c.cpf || 'Não informado'}</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">${c.institution || 'Apoiador Individual'}</div>
                  </td>
                  <td style="padding: 10px 8px;">
                    <div style="color: var(--text-primary);">${c.city || 'Passo Fundo'} / ${c.state || 'RS'}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${c.phone || c.email || '—'}</div>
                  </td>
                  <td style="padding: 10px 8px;">
                    <div style="font-family: var(--font-mono); color: var(--text-primary); font-weight: 600;">R$ ${Number(c.monthlyContribution).toFixed(2)}/mês</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${c.monthsCommitted} meses (Total: R$ ${Number(c.totalInvested).toFixed(2)})</div>
                  </td>
                  <td style="padding: 10px 8px; font-family: var(--font-mono); font-weight: 700; color: var(--gold-accent);">
                    ${Number(c.equitySharePercent).toFixed(2)}%
                  </td>
                  <td style="padding: 10px 8px;">
                    ${c.status === 'pendente' 
                      ? `<span class="contract-badge pendente">Em Análise</span>`
                      : c.status === 'aprovado'
                      ? `<span class="contract-badge aprovado">Homologado</span>`
                      : `<span class="contract-badge recusado">Recusado</span>`}
                  </td>
                  <td style="padding: 10px 8px; text-align: right;">
                    <div style="display: inline-flex; gap: 6px; align-items: center; justify-content: flex-end;">
                      <button class="btn-primary" style="padding: 6px 12px; font-size: 11px; display: inline-flex; align-items: center; gap: 5px; cursor: pointer;" onclick="event.stopPropagation(); App.openContractModal('${c.id}')" title="Abrir Modal e Auditar Dados">
                        ${Icons.fileText ? Icons.fileText(12) : ''}
                        <span>Auditar / Abrir Contrato</span>
                      </button>
                      ${c.status === 'pendente' ? `
                        <button class="btn-approve" style="padding: 6px 10px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;" onclick="event.stopPropagation(); App.openContractModal('${c.id}')" title="Abrir Modal e Homologar">
                          ${Icons.check(11)}
                          <span>Aprovar</span>
                        </button>
                        <button class="btn-reject" style="padding: 6px 10px; font-size: 11px; cursor: pointer;" onclick="event.stopPropagation(); App.rejectContract('${c.id}')" title="Recusar Contrato">
                          <span>Recusar</span>
                        </button>
                      ` : `
                        <button class="btn-secondary" style="padding: 6px 10px; font-size: 11px; color: #fbbf24; border-color: rgba(245, 158, 11, 0.4); cursor: pointer;" onclick="event.stopPropagation(); App.reopenContractAnalysis('${c.id}')" title="Reabrir análise (tornar pendente)">
                          <span>Reabrir</span>
                        </button>
                      `}
                      <button class="btn-secondary" style="padding: 6px 10px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; color: var(--gold-accent); border-color: rgba(199,165,152,0.35);" onclick="event.stopPropagation(); App.openEditContractModal('${c.id}')" title="Editar dados cadastrais e financeiros do contrato">
                        ${Icons.edit ? Icons.edit(11) : '✎'}
                        <span>Editar</span>
                      </button>
                      <button class="btn-secondary" style="padding: 6px 10px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; color: #f87171; border-color: rgba(239,68,68,0.35);" onclick="event.stopPropagation(); App.openDeleteContractModal('${c.id}')" title="Excluir este contrato permanentemente">
                        <span>✕ Excluir</span>
                      </button>
                      <button class="btn-secondary" style="padding: 6px 9px; font-size: 11px; cursor: pointer;" onclick="event.stopPropagation(); App.viewContractInTermo('${c.id}')" title="Ver Termo Completo">
                        <span>Ver Termo</span>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // 8. MÓDULO GESTÃO DE USUÁRIOS DO SISTEMA (EXCLUSIVO SUPERADMIN MASTER)
  // ==========================================================================
  userSearchTerm: "",
  userRoleFilter: "all",

  renderUsuarios(headerEl, bodyEl) {
    const users = Store.getUsers();
    const creators = users.filter(u => u.role === "creator");
    const supporters = users.filter(u => u.role === "supporter");
    const guests = users.filter(u => u.role === "guest");
    const totalAllocated = supporters.reduce((acc, u) => acc + (Number(u.equitySharePercent) || 0), 0);

    headerEl.innerHTML = `
      <div class="workspace-title-group">
        <h2>Gestão de Usuários & Credenciamento de Acesso</h2>
        <p>Painel exclusivo do Superadmin Master para criar, credenciar, auditar e gerenciar usuários da plataforma</p>
      </div>
      <div class="workspace-actions">
        <button class="btn-primary" onclick="App.openNewUserModal()" style="display: inline-flex; align-items: center; gap: 8px;">
          ${Icons.userPlus ? Icons.userPlus(15) : Icons.plus(15)}
          <span>Cadastrar Novo Usuário</span>
        </button>
      </div>
    `;

    bodyEl.innerHTML = `
      <!-- Métricas Resumo -->
      <div class="stat-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 20px;">
        <div class="stat-item" style="background: var(--bg-surface); padding: 14px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <span class="stat-label">Total de Usuários</span>
          <span class="stat-value">${users.length}</span>
          <span class="stat-subtext">Cadastros no Sistema</span>
        </div>
        <div class="stat-item" style="background: var(--bg-surface); padding: 14px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <span class="stat-label">Superadmins / Criadores</span>
          <span class="stat-value" style="color: #38a169;">${creators.length}</span>
          <span class="stat-subtext">Soberania 51% Assegurada</span>
        </div>
        <div class="stat-item" style="background: var(--bg-surface); padding: 14px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <span class="stat-label">Investidores & Apoiadores</span>
          <span class="stat-value highlight">${supporters.length}</span>
          <span class="stat-subtext">${totalAllocated.toFixed(2)}% do Pool Alocado</span>
        </div>
        <div class="stat-item" style="background: var(--bg-surface); padding: 14px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <span class="stat-label">Convidados / Apresentação</span>
          <span class="stat-value" style="color: #fbbf24;">${guests.length}</span>
          <span class="stat-subtext">Acesso VIP 48h</span>
        </div>
      </div>

      <!-- Barra de Filtros e Ações Rápidas -->
      <div class="card" style="margin-bottom: 20px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 260px;">
          <input type="text" id="user-search-input" class="form-input" placeholder="Buscar por nome, e-mail, cargo ou CPF..." oninput="App.onUserSearch(this.value)" value="${this.userSearchTerm || ''}" style="margin: 0; padding: 8px 12px; font-size: 13px; max-width: 360px;" />
          <select id="user-role-filter" class="form-select" onchange="App.onUserRoleFilter(this.value)" style="margin: 0; padding: 8px 12px; font-size: 12.5px; width: auto;">
            <option value="all" ${this.userRoleFilter === 'all' ? 'selected' : ''}>Todos os Perfis (${users.length})</option>
            <option value="creator" ${this.userRoleFilter === 'creator' ? 'selected' : ''}>Superadmins (${creators.length})</option>
            <option value="supporter" ${this.userRoleFilter === 'supporter' ? 'selected' : ''}>Investidores (${supporters.length})</option>
            <option value="guest" ${this.userRoleFilter === 'guest' ? 'selected' : ''}>Convidados (${guests.length})</option>
          </select>
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn-secondary" onclick="App.exportUsersCsv()" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; padding: 7px 12px;">
            ${Icons.download(13)}
            <span>Exportar CSV</span>
          </button>
          <button class="btn-primary" onclick="App.openNewUserModal()" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; padding: 7px 14px;">
            ${Icons.plus(13)}
            <span>+ Novo Usuário</span>
          </button>
        </div>
      </div>

      <!-- Grid de Usuários -->
      <div id="users-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px;">
        ${this.renderUserCardsHtml(this.getFilteredUsers())}
      </div>
    `;
  },

  getFilteredUsers() {
    let list = Store.getUsers();
    if (this.userRoleFilter && this.userRoleFilter !== "all") {
      list = list.filter(u => u.role === this.userRoleFilter);
    }
    if (this.userSearchTerm && this.userSearchTerm.trim()) {
      const term = this.userSearchTerm.trim().toLowerCase();
      list = list.filter(u => 
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.title && u.title.toLowerCase().includes(term)) ||
        (u.institution && u.institution.toLowerCase().includes(term)) ||
        (u.cpf && u.cpf.toLowerCase().includes(term)) ||
        (u.id && u.id.toLowerCase().includes(term))
      );
    }
    return list;
  },

  onUserSearch(term) {
    this.userSearchTerm = term;
    const grid = document.getElementById("users-cards-grid");
    if (grid) {
      grid.innerHTML = this.renderUserCardsHtml(this.getFilteredUsers());
    }
  },

  onUserRoleFilter(role) {
    this.userRoleFilter = role;
    const grid = document.getElementById("users-cards-grid");
    if (grid) {
      grid.innerHTML = this.renderUserCardsHtml(this.getFilteredUsers());
    }
  },

  renderUserCardsHtml(usersList) {
    if (!usersList || usersList.length === 0) {
      return `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--bg-surface); border: 1px dashed var(--border-strong); border-radius: 8px;">
          <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 12px;">Nenhum usuário encontrado para os filtros atuais.</div>
          <button class="btn-primary" onclick="App.openNewUserModal()" style="display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.plus(13)}
            <span>Cadastrar Novo Usuário</span>
          </button>
        </div>
      `;
    }

    return usersList.map(u => {
      const isCreator = u.role === "creator";
      const isSupporter = u.role === "supporter";
      const isGuest = u.role === "guest";

      let badgeLabel = "Investidor Pioneiro";
      let badgeBg = "rgba(199, 165, 152, 0.12)";
      let badgeColor = "var(--gold-accent)";
      let badgeBorder = "rgba(199, 165, 152, 0.35)";
      let avatarBg = "rgba(199, 165, 152, 0.15)";
      let avatarColor = "var(--gold-accent)";
      let avatarBorder = "var(--gold-accent)";

      if (isCreator) {
        badgeLabel = "Superadmin Criador";
        badgeBg = "rgba(56, 161, 105, 0.12)";
        badgeColor = "#38a169";
        badgeBorder = "rgba(56, 161, 105, 0.35)";
        avatarBg = "rgba(56, 161, 105, 0.15)";
        avatarColor = "#38a169";
        avatarBorder = "#38a169";
      } else if (isGuest) {
        badgeLabel = "Convidado VIP 48h";
        badgeBg = "rgba(245, 158, 11, 0.12)";
        badgeColor = "#fbbf24";
        badgeBorder = "rgba(245, 158, 11, 0.35)";
        avatarBg = "rgba(245, 158, 11, 0.15)";
        avatarColor = "#fbbf24";
        avatarBorder = "#fbbf24";
      }

      return `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px; position: relative; border: 1px solid var(--border-strong); background: var(--card-bg, #0a0a0a); border-radius: var(--radius-md, 8px); padding: 18px;">
          
          <!-- Cabeçalho do Card com Avatar, Nome e Badge -->
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: ${avatarBg}; color: ${avatarColor}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; border: 2px solid ${avatarBorder}; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
                ${u.avatarLetter || 'U'}
              </div>
              <div style="min-width: 0;">
                <div style="font-size: 15px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  <span style="overflow: hidden; text-overflow: ellipsis;">${u.name}</span>
                  ${u.id === 'USR-001' ? `<span title="Criador Soberano Master" style="color: var(--gold-accent); font-size: 13px;">★</span>` : ''}
                </div>
                <div style="font-size: 12px; color: var(--gold-accent); font-weight: 600; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${u.title || (isCreator ? 'Superadmin Master' : (isGuest ? 'Convidado VIP' : 'Investidor Pioneiro'))}
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${u.institution || 'Apoiador Individual'} ${u.city ? `• ${u.city}/${u.state || 'RS'}` : ''}
                </div>
              </div>
            </div>
            <span class="spec-badge" style="background: ${badgeBg}; color: ${badgeColor}; border-color: ${badgeBorder}; font-size: 10px; text-transform: uppercase; white-space: nowrap;">
              ${badgeLabel}
            </span>
          </div>

          <!-- Box de Credenciais (Login e Senha) -->
          <div style="background: var(--bg-canvas, #060709); border: 1px solid var(--border-subtle, #1e222d); border-radius: 6px; padding: 10px 12px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Login / E-mail:</span>
              <span style="font-family: var(--font-mono); font-weight: 600; color: #f1f5f9; font-size: 11.5px; user-select: all;">${u.email}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Senha:</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span id="user-pwd-${u.id}" style="font-family: var(--font-mono); font-weight: 700; color: var(--gold-accent); font-size: 12px; letter-spacing: 1px;" data-real="${u.password || 'peregrino2026'}">••••••••</span>
                <button type="button" class="btn-secondary" style="padding: 2px 7px; font-size: 10.5px; line-height: 1; border-color: rgba(255,255,255,0.15);" onclick="App.toggleUserPasswordVisibility('${u.id}')" title="Mostrar/Ocultar Senha">👁</button>
              </div>
            </div>
          </div>

          <!-- Métricas Financeiras / Permissões -->
          ${isSupporter ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; background: rgba(199, 165, 152, 0.04); border: 1px solid rgba(199, 165, 152, 0.15); border-radius: 6px; padding: 8px 10px;">
            <div>
              <span style="color: var(--text-muted); font-size: 10px; display: block;">Aporte Mensal:</span>
              <strong style="color: #ffffff; font-size: 12.5px;">R$ ${Number(u.monthlyContribution || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              <span style="font-size: 10px; color: var(--text-muted); display: block;">Total: R$ ${Number(u.totalInvested || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
            </div>
            <div style="text-align: right;">
              <span style="color: var(--text-muted); font-size: 10px; display: block;">Cota no Pool (49%):</span>
              <strong style="color: var(--gold-accent); font-size: 13px; font-family: var(--font-mono);">${Number(u.equitySharePercent || 0).toFixed(2)}%</strong>
              <span style="font-size: 10px; color: #38a169; display: block;">Fator Pioneiro 1.25x</span>
            </div>
          </div>
          ` : `
          <div style="display: flex; gap: 6px; flex-wrap: wrap; font-size: 11px;">
            ${u.canEditKanban ? `<span class="spec-badge" style="font-size: 10px; padding: 2px 6px; color: #38a169;">Kanban</span>` : ''}
            ${u.canSyncGodot ? `<span class="spec-badge" style="font-size: 10px; padding: 2px 6px; color: #38a169;">Godot Engine</span>` : ''}
            ${u.canPostDevlog ? `<span class="spec-badge" style="font-size: 10px; padding: 2px 6px; color: #38a169;">Devlog</span>` : ''}
            ${isCreator ? `<span class="spec-badge" style="font-size: 10px; padding: 2px 6px; color: var(--gold-accent);">Acesso Master Global</span>` : ''}
            ${isGuest ? `<span class="spec-badge" style="font-size: 10px; padding: 2px 6px; color: #fbbf24;">Somente Leitura (48h)</span>` : ''}
          </div>
          `}

          <!-- Barra de Ações do Card -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; border-top: 1px solid var(--border-subtle); padding-top: 12px; margin-top: 2px; flex-wrap: wrap;">
            <div style="display: flex; gap: 6px;">
              <button class="btn-primary" style="padding: 5px 10px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;" onclick="App.loginDirect('${u.id}')" title="Entrar no sistema simulando a visão deste usuário">
                ${Icons.user(12)}
                <span>Entrar Como</span>
              </button>
              <button class="btn-secondary" style="padding: 5px 10px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px; color: var(--gold-accent); border-color: rgba(199,165,152,0.3);" onclick="App.copyUserCredentials('${u.id}')" title="Copiar mensagem com link, login e senha para enviar no WhatsApp">
                ${Icons.fileText(12)}
                <span>Copiar Acesso</span>
              </button>
            </div>

            <div style="display: flex; gap: 6px;">
              <button class="btn-secondary" style="padding: 5px 9px; font-size: 11px;" onclick="App.openEditUserModal('${u.id}')" title="Editar dados cadastrais e permissões">
                ✎ Editar
              </button>
              ${u.id !== 'USR-001' ? `
              <button class="btn-secondary" style="padding: 5px 9px; font-size: 11px; color: #f87171; border-color: rgba(239, 68, 68, 0.3);" onclick="App.openDeleteUserModal('${u.id}')" title="Excluir este usuário">
                ✕
              </button>` : ''}
            </div>
          </div>

        </div>
      `;
    }).join('');
  },

  toggleUserPasswordVisibility(userId) {
    const pwdEl = document.getElementById(`user-pwd-${userId}`);
    if (!pwdEl) return;
    const real = pwdEl.getAttribute("data-real") || "";
    if (pwdEl.textContent === "••••••••") {
      pwdEl.textContent = real;
      pwdEl.style.letterSpacing = "normal";
    } else {
      pwdEl.textContent = "••••••••";
      pwdEl.style.letterSpacing = "1px";
    }
  },

  openNewUserModal() {
    const modal = document.getElementById("user-form-modal");
    if (!modal) return;

    document.getElementById("user-modal-title").textContent = "Cadastrar Novo Usuário";
    document.getElementById("user-form-submit-btn").querySelector("span").textContent = "Salvar & Credenciar Usuário";
    document.getElementById("user-form-id").value = "";
    document.getElementById("user-form-name").value = "";
    document.getElementById("user-form-email").value = "";
    document.getElementById("user-form-password").value = this.generateRandomPasswordString();
    document.getElementById("user-form-role").value = "supporter";
    document.getElementById("user-form-title").value = "Investidor Pioneiro";
    document.getElementById("user-form-institution").value = "Mecenas da Comunidade";
    document.getElementById("user-form-cpf").value = "";
    document.getElementById("user-form-phone").value = "";
    document.getElementById("user-form-city").value = "Passo Fundo/RS";
    document.getElementById("user-form-monthly").value = "500";
    document.getElementById("user-form-months").value = "12";
    document.getElementById("user-form-lot").value = "";
    document.getElementById("user-form-perm-kanban").checked = false;
    document.getElementById("user-form-perm-godot").checked = false;
    document.getElementById("user-form-perm-devlog").checked = false;

    const err = document.getElementById("user-form-error");
    if (err) err.style.display = "none";

    const delBtn = document.getElementById("user-form-delete-btn");
    if (delBtn) delBtn.style.display = "none";

    this.onUserRoleChange("supporter");
    this.calcUserFormQuota();

    modal.classList.add("active");
  },

  openEditUserModal(userId) {
    const user = Store.users.find(u => u.id === userId);
    if (!user) return;

    const modal = document.getElementById("user-form-modal");
    if (!modal) return;

    document.getElementById("user-modal-title").textContent = `Editar Usuário: ${user.name}`;
    document.getElementById("user-form-submit-btn").querySelector("span").textContent = "Salvar Alterações";
    document.getElementById("user-form-id").value = user.id;
    document.getElementById("user-form-name").value = user.name || "";
    document.getElementById("user-form-email").value = user.email || "";
    document.getElementById("user-form-password").value = user.password || "";
    document.getElementById("user-form-role").value = user.role || "supporter";
    document.getElementById("user-form-title").value = user.title || "";
    document.getElementById("user-form-institution").value = user.institution || "";
    document.getElementById("user-form-cpf").value = user.cpf || "";
    document.getElementById("user-form-phone").value = user.phone || "";
    document.getElementById("user-form-city").value = (user.city ? `${user.city}/${user.state || 'RS'}` : "Passo Fundo/RS");
    document.getElementById("user-form-monthly").value = user.monthlyContribution || 500;
    document.getElementById("user-form-months").value = user.monthsCommitted || 12;
    document.getElementById("user-form-lot").value = user.inGameLot || "";
    document.getElementById("user-form-perm-kanban").checked = Boolean(user.canEditKanban);
    document.getElementById("user-form-perm-godot").checked = Boolean(user.canSyncGodot);
    document.getElementById("user-form-perm-devlog").checked = Boolean(user.canPostDevlog);

    const err = document.getElementById("user-form-error");
    if (err) err.style.display = "none";

    const delBtn = document.getElementById("user-form-delete-btn");
    if (delBtn) {
      delBtn.style.display = (user.id !== "USR-001") ? "inline-flex" : "none";
    }

    this.onUserRoleChange(user.role || "supporter");
    this.calcUserFormQuota();

    modal.classList.add("active");
  },

  closeUserModal() {
    const modal = document.getElementById("user-form-modal");
    if (modal) modal.classList.remove("active");
  },

  onUserRoleChange(role) {
    const supporterFields = document.getElementById("user-form-supporter-fields");
    if (supporterFields) {
      supporterFields.style.display = (role === "supporter") ? "block" : "none";
    }
    const permKanban = document.getElementById("user-form-perm-kanban");
    const permGodot = document.getElementById("user-form-perm-godot");
    const permDevlog = document.getElementById("user-form-perm-devlog");
    if (role === "creator") {
      if (permKanban) permKanban.checked = true;
      if (permGodot) permGodot.checked = true;
      if (permDevlog) permDevlog.checked = true;
    }
  },

  calcUserFormQuota() {
    const monthly = Number(document.getElementById("user-form-monthly")?.value) || 0;
    const months = Number(document.getElementById("user-form-months")?.value) || 12;
    const total = monthly * months;
    const weighted = total * (Store.config.pioneerRiskFactor || 1.25);
    const quota = ((weighted / (Store.config.targetFundingDevPhase || 120000)) * (Store.config.supportersPool || 49)).toFixed(2);
    const quotaEl = document.getElementById("user-form-quota-preview");
    if (quotaEl) {
      quotaEl.textContent = `${quota.replace('.', ',')}%`;
    }
  },

  generateRandomPasswordString() {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let pass = "peregrino";
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  },

  generateRandomPassword() {
    const pwdInput = document.getElementById("user-form-password");
    if (pwdInput) {
      pwdInput.value = this.generateRandomPasswordString();
    }
  },

  async submitUserForm(e) {
    if (e) e.preventDefault();

    const id = document.getElementById("user-form-id").value;
    const name = document.getElementById("user-form-name").value.trim();
    const email = document.getElementById("user-form-email").value.trim();
    const password = document.getElementById("user-form-password").value.trim();
    const role = document.getElementById("user-form-role").value;
    const title = document.getElementById("user-form-title").value.trim();
    const institution = document.getElementById("user-form-institution").value.trim();
    const cpf = document.getElementById("user-form-cpf").value.trim();
    const phone = document.getElementById("user-form-phone").value.trim();
    const cityUf = document.getElementById("user-form-city").value.trim();
    const monthly = Number(document.getElementById("user-form-monthly").value) || 0;
    const months = Number(document.getElementById("user-form-months").value) || 12;
    const lot = document.getElementById("user-form-lot").value.trim();
    const canEditKanban = document.getElementById("user-form-perm-kanban").checked;
    const canSyncGodot = document.getElementById("user-form-perm-godot").checked;
    const canPostDevlog = document.getElementById("user-form-perm-devlog").checked;
    const errorEl = document.getElementById("user-form-error");

    let city = "Passo Fundo";
    let state = "RS";
    if (cityUf.includes("/")) {
      const parts = cityUf.split("/");
      city = parts[0].trim();
      state = parts[1].trim().toUpperCase();
    } else if (cityUf) {
      city = cityUf;
    }

    const userData = {
      name,
      email,
      password,
      role,
      title: title || (role === "creator" ? "Administrador & Equipe Haja Luz" : (role === "guest" ? "Convidado VIP" : "Investidor Pioneiro")),
      institution: institution || "Mecenas da Comunidade",
      cpf,
      phone,
      city,
      state,
      monthlyContribution: monthly,
      monthsCommitted: months,
      inGameLot: lot,
      canEditKanban,
      canSyncGodot,
      canPostDevlog
    };

    const submitBtn = document.getElementById("user-form-submit-btn");
    const origBtnHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Salvando no Supabase Cloud...</span>`;
    }

    try {
      let result;
      if (id) {
        result = await Store.updateUser(id, userData);
      } else {
        result = await Store.addUser(userData);
      }

      if (!result.success) {
        if (errorEl) {
          errorEl.textContent = result.message;
          errorEl.style.display = "block";
        }
        return;
      }

      this.closeUserModal();
      this.renderSidebar();
      if (typeof this.renderUsuarios === "function") {
        this.renderUsuarios(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
      }
      this.showToast(id ? `✓ Dados de ${userData.name} persistidos no Supabase Cloud!` : `✓ Usuário ${userData.name} cadastrado na nuvem com sucesso!`);
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      if (errorEl) {
        errorEl.textContent = `Erro ao salvar: ${err.message || err}`;
        errorEl.style.display = "block";
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
    }
  },

  openDeleteUserModal(userId) {
    const user = Store.users.find(u => u.id === userId);
    if (!user) return;
    if (user.id === "USR-001") {
      this.showToast("⚠️ O Superadmin Criador Soberano (USR-001) não pode ser excluído.");
      return;
    }

    const modal = document.getElementById("user-delete-confirm-modal");
    if (!modal) return;

    document.getElementById("delete-user-target-id").value = user.id;

    const previewEl = document.getElementById("delete-user-preview-card");
    if (previewEl) {
      previewEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(199, 165, 152, 0.2); border: 1px solid var(--gold-accent); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--gold-accent); font-size: 13px;">
            ${user.avatarLetter || user.name.charAt(0)}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; font-size: 13.5px; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${user.name}
            </div>
            <div style="font-size: 11.5px; color: var(--text-muted); font-family: var(--font-mono);">
              ${user.email} • ID: ${user.id}
            </div>
          </div>
          <span class="status-pill status-${user.role === 'creator' ? 'active' : (user.role === 'supporter' ? 'signed' : 'pending')}" style="font-size: 10px;">
            ${user.role === 'creator' ? 'Criador' : (user.role === 'supporter' ? 'Apoiador' : 'Convidado')}
          </span>
        </div>
        ${user.role === 'supporter' && user.equitySharePercent ? `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; font-size: 11.5px; color: var(--text-secondary);">
            <span>Aporte: R$ ${Number(user.monthlyContribution || 0).toLocaleString("pt-BR")}/mês</span>
            <span style="color: var(--gold-accent); font-weight: 600;">Cota: ${Number(user.equitySharePercent).toFixed(2)}%</span>
          </div>
        ` : ''}
      `;
    }

    modal.classList.add("active");
  },

  closeDeleteUserModal() {
    const modal = document.getElementById("user-delete-confirm-modal");
    if (modal) modal.classList.remove("active");
  },

  deleteUserFromModal() {
    const id = document.getElementById("user-form-id").value;
    if (!id || id === "USR-001") return;
    this.closeUserModal();
    this.openDeleteUserModal(id);
  },

  async executeDeleteUser() {
    const userId = document.getElementById("delete-user-target-id").value;
    if (!userId) return;

    const user = Store.users.find(u => u.id === userId);
    const userName = user ? user.name : "Usuário";

    const btn = document.getElementById("confirm-delete-user-btn");
    const origHtml = btn ? btn.innerHTML : "";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>Excluindo na nuvem...</span>`;
    }

    try {
      const result = await Store.deleteUser(userId);
      this.closeDeleteUserModal();

      if (result.success) {
        this.renderSidebar();
        this.renderUsuarios(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
        this.showToast(`✓ ${userName} foi excluído do sistema e do banco de dados!`);
      } else {
        this.showToast(`⚠️ ${result.message || "Erro ao excluir usuário."}`);
      }
    } catch (err) {
      this.closeDeleteUserModal();
      this.showToast(`⚠️ Erro ao excluir usuário: ${err.message || err}`);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  },

  deleteUserConfirm(userId) {
    this.openDeleteUserModal(userId);
  },

  copyUserCredentials(userId) {
    const user = Store.users.find(u => u.id === userId);
    if (!user) return;
    const msg = `*Acesso à Plataforma Peregrino — Haja Luz Studio*\n\n` +
      `Olá, *${user.name}*!\nSeu cadastro oficial de governança foi concluído com sucesso.\n\n` +
      `🔗 *Link do Sistema:* ${window.location.origin + window.location.pathname}\n` +
      `👤 *Login / E-mail:* ${user.email}\n` +
      `🔑 *Senha de Acesso:* ${user.password}\n` +
      `📜 *Perfil:* ${user.title || user.role}\n` +
      (user.role === 'supporter' && user.equitySharePercent ? `💎 *Cota Societária:* ${Number(user.equitySharePercent).toFixed(2)}% no Pool de 49%\n` : '') +
      `\n_Favor guardar suas credenciais em local seguro._`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).then(() => {
        this.showToast(`✓ Dados de acesso de ${user.name} copiados para a área de transferência!`);
      }).catch(() => {
        this.fallbackCopy(msg, `✓ Dados de acesso de ${user.name} copiados!`);
      });
    } else {
      this.fallbackCopy(msg, `✓ Dados de acesso de ${user.name} copiados!`);
    }
  },

  exportUsersCsv() {
    const users = Store.getUsers();
    const headers = ["ID", "Nome", "E-mail", "Senha", "Perfil", "Cargo", "Instituicao", "CPF", "Telefone", "Cidade", "UF", "Aporte_Mensal", "Cota_Percent", "Data_Cadastro"];
    const rows = users.map(u => [
      u.id,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      u.email,
      u.password,
      u.role,
      `"${(u.title || '').replace(/"/g, '""')}"`,
      `"${(u.institution || '').replace(/"/g, '""')}"`,
      u.cpf || '',
      u.phone || '',
      u.city || '',
      u.state || '',
      u.monthlyContribution || 0,
      u.equitySharePercent || 0,
      u.joinDate || ''
    ]);
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Usuarios_Peregrino_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast("✓ Planilha de usuários exportada com sucesso!");
  },

  // ==========================================================================
  // MODAL DE NOVA ATUALIZAÇÃO NO DEVLOG (CRIADOR)
  // ==========================================================================
  openNewPostModal() {
    const modalEl = document.getElementById("new-post-modal");
    if (modalEl) modalEl.classList.add("active");
  },

  closeNewPostModal() {
    const modalEl = document.getElementById("new-post-modal");
    if (modalEl) modalEl.classList.remove("active");
  },

  submitNewPost(e) {
    if (e) e.preventDefault();
    const title = document.getElementById("modal-post-title").value;
    const category = document.getElementById("modal-post-category").value;
    const summary = document.getElementById("modal-post-summary").value;
    const mediaUrl = document.getElementById("modal-post-media").value;
    const tagsInput = document.getElementById("modal-post-tags").value;

    if (!title || !summary) {
      alert("Por favor preencha título e resumo.");
      return;
    }

    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);

    Store.addDevlogPost({
      title,
      category,
      summary,
      mediaUrl: mediaUrl || "assets/img/cidade_galileia_3d.jpg",
      tags: tags.length ? tags : ["Godot 4", "Devlog Oficial"]
    });

    this.closeNewPostModal();
    this.renderSidebar();
    this.renderDevlog(document.getElementById("workspace-header"), document.getElementById("workspace-body"));
  },

  // ==========================================================================
  // CONTROLES DO MODAL DO GUIA COMPLETO DA JORNADA PEREGRINO
  // ==========================================================================
  openGameGuideModal() {
    const modalEl = document.getElementById("game-guide-modal");
    if (modalEl) {
      modalEl.classList.add("active");
      const bodyEl = document.getElementById("game-guide-body");
      if (bodyEl) bodyEl.scrollTop = 0;
    }
  },

  closeGameGuideModal() {
    const modalEl = document.getElementById("game-guide-modal");
    if (modalEl) modalEl.classList.remove("active");
  },

  scrollToGuideSection(sectionId) {
    const sec = document.getElementById(sectionId);
    if (sec) {
      sec.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },

  printGameGuide() {
    const guideHtml = `
      <div class="doc-header">
        <div>
          <h1 class="brand-title">PEREGRINO</h1>
          <div class="brand-sub">HAJA LUZ STUDIO • DOCUMENTO CANÔNICO & DIRETRIZES TÉCNICAS</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Passo Fundo / RS • CNPJ: 61.511.844/0001-91</div>
        </div>
        <div class="doc-meta">
          <div class="status-badge" style="background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc;">
            DOSSIÊ DE GAMEPLAY & TEOLOGIA
          </div>
          <div>ENGINE: <strong>GODOT 4.7.2 (CEL-SHADING 60 FPS)</strong></div>
          <div>VERSÃO: <strong>CANÔNICA 2026.1</strong></div>
          <div>DIREÇÃO: <strong>PACÍFICA & MISSIONÁRIA</strong></div>
        </div>
      </div>

      <div class="doc-main-title">
        GUIA COMPLETO DA JORNADA: MISSÕES, PROGRESSÃO & PROPÓSITO
      </div>

      <!-- CAPÍTULO 1 -->
      <div class="doc-section">
        <div class="section-title">CAPÍTULO 1: A GRANDE IMPORTÂNCIA DE PEREGRINO NO CENÁRIO CULTURAL & ESPIRITUAL</div>
        <p>
          Durante décadas, a indústria global de videogames apresentou uma dualidade prejudicial para as famílias cristãs. Por um lado, grandes produções seculares saturadas de violência gráfica gratuita, vulgaridade e niilismo moral que capturam a atenção de jovens e adolescentes por sua perfeição técnica. Por outro lado, o chamado mercado de "jogos bíblicos" permaneceu historicamente estagnado em orçamentos irrisórios, mecânicas rasas de perguntas e respostas ou gráficos amadores que afastavam qualquer jogador acostumado ao padrão moderno.
        </p>

        <div class="quote-box">
          "Não vos conformeis com este século, mas transformai-vos pela renovação da vossa mente..."<br>
          <span style="font-size: 10px; text-transform: uppercase; color: #b45309; font-weight: 700;">Romanos 12:2 • Fundamento Teológico do Projeto</span>
        </div>

        <p>
          <strong>Peregrino</strong> nasce no <strong>Haja Luz Studio</strong> para quebrar em definitivo esse paradigma. Desenvolvido no motor gráfico <strong>Godot 4.7.2</strong>, o projeto combina pesquisa arqueológica rigorosa da Judeia e Galileia do Século I com técnicas modernas de cel-shading em tempo real, física de terreno e performance cravada a 60 quadros por segundo.
        </p>

        <div class="grid-2">
          <div class="card-box">
            <strong>Resgate Cultural da Juventude</strong>
            Oferece uma alternativa artística genuinamente nobre e envolvente, onde as horas de jogo edificam a mente, inspiram virtudes e aproximam as novas gerações dos Evangelhos.
          </div>
          <div class="card-box">
            <strong>Fidelidade Histórica & Teológica</strong>
            Reconstrução fidedigna de vilarejos de calcário, oliveiras milenares, rotas comerciais romanas, costumes hebraicos e diálogos fiéis às Escrituras Sagradas.
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 2 -->
      <div class="doc-section">
        <div class="section-title">CAPÍTULO 2: COMO SE JOGA — A MECÂNICA PACÍFICA DOS 4 VERBOS SAGRADOS</div>
        <p>
          Em <strong>Peregrino</strong>, o jogador não empunha espadas, arcos ou armas de fogo. Seguindo a advertência de que <em>as armas da nossa milícia não são carnais</em>, toda a jogabilidade é estruturada em torno de escolhas morais, auxílio comunitário e autoridade espiritual exercida através da fé e do amor. O ciclo contínuo de ação opera em <strong>4 Verbos Sagrados</strong>:
        </p>

        <div class="grid-2">
          <div class="card-box" style="border-left: 3px solid #b45309;">
            <strong style="color: #b45309;">1. Encontrar</strong>
            Explorar o mundo aberto da Galileia e Judeia em busca de viajantes exaustos, famílias desamparadas, doentes marginalizados e leprosos que clamam por socorro nas estradas e olivais.
          </div>
          <div class="card-box" style="border-left: 3px solid #0284c7;">
            <strong style="color: #0284c7;">2. Conhecer</strong>
            Praticar a escuta ativa e a empatia bíblica. Interagir com os personagens sem julgamentos precipitados para compreender a raiz de suas dores espirituais, materiais ou familiares.
          </div>
          <div class="card-box" style="border-left: 3px solid #d97706;">
            <strong style="color: #d97706;">3. Ensinar</strong>
            Compartilhar a Palavra de Deus, parábolas de sabedoria e palavras de consolação. Tomar decisões assertivas em árvores de diálogo que restauram a esperança e desarmam a hostilidade.
          </div>
          <div class="card-box" style="border-left: 3px solid #16a34a;">
            <strong style="color: #16a34a;">4. Transformar</strong>
            Executar ações concretas de restauração: curar enfermidades, reconstruir lares abalados, partilhar pão e azeite das bases e integrar o necessitado à comunidade da vila.
          </div>
        </div>
      </div>

      <div class="page-break"></div>

      <!-- CAPÍTULO 3 -->
      <div class="doc-section">
        <div class="section-title">CAPÍTULO 3: OS 4 GRANDES EIXOS DE MISSÕES DO JOGO</div>
        <p>O universo de Peregrino é dividido em quatro eixos narrativos e mecânicos interligados:</p>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
          <div class="card-box">
            <strong>Eixo 1: O Fio de Ouro (A Linha do Tempo de Jesus)</strong>
            O jogador vive a experiência como uma testemunha ocular que caminha pelos cenários onde o Messias atua. Missões canônicas incluem presenciar o milagre em Caná da Galileia, organizar e acolher a multidão no Sermão do Monte, testemunhar a tempestade acalmada no Mar da Galileia, vivenciar o diálogo transformador junto ao Poço de Jacó em Sicar e amparar os enlutados em Betânia.
          </div>
          <div class="card-box">
            <strong>Eixo 2: O Despertar dos 12 Apóstolos</strong>
            Missões focadas no chamado, nos dilemas pessoais e no amadurecimento dos 12 apóstolos. Ajudar Simão Pedro a superar o desânimo na beira do lago, auxiliar na inclusão de Mateus entre os discípulos superando o preconceito da comunidade e apoiar o envio de dois em dois pelas aldeias da Judeia para proclamar as Boas-Novas.
          </div>
          <div class="card-box">
            <strong>Eixo 3: Sobrevivência Comunitária & As 7 Bases (State of Decay Bíblico)</strong>
            Gerenciamento cooperativo da comunidade. O jogador coleta e distribui recursos vitais (trigo, azeite, água pura, linho, madeira e ervas medicinais), constrói melhorias nas 7 bases históricas, cria enfermarias para viúvas e acolhe peregrinos que fogem de secas ou opressões nas regiões circunvizinhas.
          </div>
          <div class="card-box">
            <strong>Eixo 4: Ameaças Espirituais & Oposição</strong>
            Enfrentar desafios morais e espirituais sem recorrer à violência carnal. Debates teológicos contra a hipocrisia farisaica, libertação de indivíduos atormentados por angústias e opressões espirituais mediante oração e jejum, e manutenção da paz em vilas cercadas pelo medo ou pela hostilidade de guarnições romanas.
          </div>
        </div>
      </div>

      <!-- CAPÍTULO 4 -->
      <div class="doc-section">
        <div class="section-title">CAPÍTULO 4: COMO EVOLUI — ATRIBUTOS DA ALMA & NÍVEIS DE MATURIDADE</div>
        <p>
          A evolução em <strong>Peregrino</strong> reflete a <strong>Maturidade Espiritual</strong> e a consistência no cumprimento dos princípios do Reino:
        </p>

        <div class="grid-2" style="margin-bottom: 10px;">
          <div class="card-box"><strong>FÉ:</strong> Potencializa a eficácia da oração, resiliência espiritual e auxílio sobrenatural.</div>
          <div class="card-box"><strong>MANSIDÃO:</strong> Desarma a hostilidade em conversas e acalma multidões sem conflito físico.</div>
          <div class="card-box"><strong>SABEDORIA:</strong> Desbloqueia opções profundas nas Escrituras e respostas éticas corretas.</div>
          <div class="card-box"><strong>FIRMEZA:</strong> Aumenta a estamina e a resistência física em longas caminhadas pelo deserto.</div>
          <div class="card-box"><strong>LIDERANÇA:</strong> Mobiliza caravanas voluntárias e otimiza o trabalho nas bases comunitárias.</div>
          <div class="card-box"><strong>COMUNHÃO:</strong> Eleva a harmonia dos habitantes e multiplica a eficiência dos celeiros.</div>
        </div>

        <table class="doc-table">
          <thead>
            <tr>
              <th style="width: 50px;">Nível</th>
              <th style="width: 90px;">Título</th>
              <th>Foco de Gameplay</th>
              <th>Desbloqueio Principal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1</strong></td>
              <td><strong>Firme</strong></td>
              <td>Aprendizado dos caminhos, primeiros socorros nas rotas e acolhimento em Nazaré.</td>
              <td>Uso de ervas curativas e montagem de pequenas tendas.</td>
            </tr>
            <tr>
              <td><strong>2</strong></td>
              <td><strong>Elevado</strong></td>
              <td>Mediação em vilarejos, transporte de suprimentos e suporte a pescadores.</td>
              <td>Dom de Curar Enfermidades Leves por intercessão.</td>
            </tr>
            <tr>
              <td><strong>3</strong></td>
              <td><strong>Consagrado</strong></td>
              <td>Administração avançada das 7 bases e proteção de órfãos e viúvas.</td>
              <td>Discernimento de Espíritos em conversas com opositores.</td>
            </tr>
            <tr>
              <td><strong>4</strong></td>
              <td><strong>Eminente</strong></td>
              <td>Comando de caravanas entre distritos e resolução de crises doutrinárias.</td>
              <td>Liderança inspiradora e multiplicação de mantimentos.</td>
            </tr>
            <tr>
              <td><strong>5</strong></td>
              <td><strong class="highlight-cell" style="padding: 2px 4px;">Pleno</strong></td>
              <td>Embaixador da reconciliação, testemunha madura dos milagres e consolidação do legado.</td>
              <td>Operação de Fé Inabalável em tempestades e crises extremas.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- CAPÍTULO 5 -->
      <div class="doc-section">
        <div class="section-title">CAPÍTULO 5: AS 7 BASES DA VILA — O CORAÇÃO DA SOLIDARIEDADE</div>
        <p>Inspiradas na dinâmica de sobrevivência comunitária (estilo <em>State of Decay</em> em perspectiva bíblica), as 7 bases funcionam como uma rede viva interligada:</p>

        <div class="grid-2">
          <div class="card-box"><strong>1. Pousada de Betânia:</strong> Acolhimento de viajantes cansados e recuperação rápida de estamina. Local de paz com Marta, Maria e Lázaro.</div>
          <div class="card-box"><strong>2. Poço de Sicar:</strong> Ponto vital de água potável no coração de Samaria. Símbolo de quebra de preconceitos históricos.</div>
          <div class="card-box"><strong>3. Olaria de Nazaré:</strong> Fabricação artesanal de ânforas, telhas e utensílios de cerâmica para estocar grãos e azeite com segurança.</div>
          <div class="card-box"><strong>4. Sinagoga de Cafarnaum:</strong> Centro de ensino das Escrituras Sagradas, oração comunitária e acolhimento dos que buscam cura.</div>
          <div class="card-box"><strong>5. Oficina de Caná:</strong> Manutenção e forja de ferramentas agrícolas (enxadas, arados) e reparo de carretas de transporte.</div>
          <div class="card-box"><strong>6. Horta de Betfagé:</strong> Produção de figos, trigo, leguminosas e cultivo de ervas medicinais para os enfermos.</div>
          <div class="card-box" style="grid-column: 1 / -1;"><strong>7. Refúgio do Mar da Galileia:</strong> Píer cooperativo e secador de redes. Permite a pesca sustentável de peixes para distribuição gratuita e transporte de caridade.</div>
        </div>
      </div>

      <!-- CAPÍTULO 6 -->
      <div class="doc-section">
        <div class="section-title">CAPÍTULO 6: GOVERNANÇA, SOBERANIA & A IMORTALIZAÇÃO 3D DOS APOIADORES</div>
        <p>
          <strong>Peregrino</strong> é um projeto sustentado por um pacto transparente entre os desenvolvedores e a congregação pioneira. A governança do projeto é estruturada de forma inegociável:
        </p>

        <div class="grid-2">
          <div class="card-box">
            <strong>Soberania Doutrinária Perpétua (51%)</strong>
            A titularidade e direção criativa pertencem exclusivamente ao <strong>Haja Luz Studio</strong>, garantindo fidelidade bíblica perpétua sem interferência de corporações seculares.
          </div>
          <div class="card-box">
            <strong>Pool de Participação Comunitária (49%)</strong>
            49% do resultado líquido gerado pelas vendas futuras do jogo é reservado aos conselheiros e apoiadores pioneiros, auditado com hash criptográfico SHA-256 e contrato civil.
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px 14px; margin-top: 10px;">
          <strong style="color: #b45309; display: block; margin-bottom: 4px;">A Imortalização 3D: Rostos Reais da Congregação Dentro da Galileia</strong>
          <p style="margin: 0; font-size: 11.5px; color: #334155;">
            Como testemunho vivo de gratidão aos parceiros que sustentam o desenvolvimento (com compromisso contínuo a partir de 12 meses), o <strong>Haja Luz Studio</strong> realiza o escaneamento e a modelagem 3D dos apoiadores reais (como o <strong>Pastor Adriano</strong>, <strong>William</strong> e <strong>Felipe</strong>). Seus modelos cel-shading em alta resolução habitam as 7 bases da Galileia e Judeia como guardiões da vila, distribuindo provisões e recepcionando os peregrinos que chegam em busca de paz.
          </p>
        </div>
      </div>

      <div class="doc-footer">
        <span>Peregrino © 2026 Haja Luz Studio • Passo Fundo/RS • Registro de Governança Comunitária</span>
        <span>Guia Canônico de Gameplay • Documento Oficial</span>
      </div>
    `;

    this.openExecutivePrintWindow("Peregrino_Guia_Completo_da_Jornada", guideHtml);
  },

  setupEventListeners() {
    // Tecla ESC fecha modais e setas navegam na galeria em tela cheia
    window.addEventListener("keydown", (e) => {
      const lightboxModal = document.getElementById("lightbox-modal");
      const isLightboxActive = lightboxModal && lightboxModal.classList.contains("active");

      if (isLightboxActive) {
        if (e.key === "Escape") {
          this.closeLightbox();
          return;
        }
        if (e.key === "ArrowLeft") {
          this.lightboxPrev();
          return;
        }
        if (e.key === "ArrowRight") {
          this.lightboxNext();
          return;
        }
        if (e.key === "f" || e.key === "F") {
          this.toggleLightboxFullscreen();
          return;
        }
      }

      if (e.key === "Escape") {
        this.closeNewPostModal();
        this.closeCharacterModal();
        this.closeContractModal();
        this.closeKanbanModal();
        this.closeGameGuideModal();
        this.closeLightbox();
      }
    });

    // Clique no backdrop escuro fecha o modal de contrato
    const contractModal = document.getElementById("contract-audit-modal");
    if (contractModal) {
      contractModal.addEventListener("click", (e) => {
        if (e.target === contractModal) {
          this.closeContractModal();
        }
      });
    }

    // Clique no backdrop escuro fecha o modal do guia
    const guideModal = document.getElementById("game-guide-modal");
    if (guideModal) {
      guideModal.addEventListener("click", (e) => {
        if (e.target === guideModal) {
          this.closeGameGuideModal();
        }
      });
    }

    // Ajuste dinâmico imediato ao redimensionar ou girar o dispositivo (retrato <-> paisagem)
    window.addEventListener("resize", () => {
      this.handleResizeOrOrientationChange();
    });
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.handleResizeOrOrientationChange();
      }, 120);
    });

    // Gestos de swipe e arrasto para galeria e lightbox
    this.setupLightboxGestures();
  },

  handleResizeOrOrientationChange() {
    this.closeMobilePanels();
    this.renderMobileTabsNav();
    this.updateWorkspaceHeaderToggles();
  },

  renderPixQrCode() {
    const container = document.getElementById("pix-qr-container");
    if (!container) return;
    if (!container.querySelector("img")) {
      container.innerHTML = `<img src="assets/img/pix_qrcode.png" alt="QR Code PIX Banco Central - Haja Luz Studio" class="pix-qr-image" />`;
    }
  },

  copyPixKey(pixKey = (window.Store && window.Store.pix ? window.Store.pix.keyFormatted : "61.511.844/0001-91"), msg = "✓ Chave PIX copiada com sucesso!") {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pixKey).then(() => {
        this.showToast(msg);
      }).catch(() => {
        this.fallbackCopy(pixKey, msg);
      });
    } else {
      this.fallbackCopy(pixKey, msg);
    }
  },

  fallbackCopy(text, msg = "✓ Chave PIX copiada com sucesso!") {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    this.showToast(msg);
  },

  showToast(msg) {
    let toast = document.getElementById("global-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "global-toast";
      toast.className = "global-toast";
      document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.classList.add("visible");
    setTimeout(() => {
      toast.classList.remove("visible");
    }, 2800);
  },

  // ==========================================================================
  // PROGRESSIVE WEB APP (PWA) & INSTALAÇÃO MOBILE
  // ==========================================================================
  initPwa() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      this.updateInstallUi();
    });

    window.addEventListener("appinstalled", () => {
      this.deferredInstallPrompt = null;
      this.updateInstallUi();
      this.showToast("🎉 App Peregrino instalado com sucesso!");
    });

    this.updateInstallUi();
  },

  isAppInstalled() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  },

  updateInstallUi() {
    const isInstalled = this.isAppInstalled();
    const loginBtn = document.getElementById("login-install-app-btn");
    const loginLabel = document.getElementById("login-install-app-label");
    const headerBtn = document.getElementById("header-install-app-btn");
    const sidebarLabel = document.getElementById("sidebar-install-label");
    const sidebarPwaSection = document.querySelector(".sidebar-section-pwa");

    if (isInstalled) {
      // Quando já instalado, remove completamente da tela de login para não poluir nem confundir
      if (loginBtn) loginBtn.style.display = "none";
      if (headerBtn) headerBtn.style.display = "none";
      if (sidebarPwaSection) sidebarPwaSection.style.display = "none";
      if (sidebarLabel) sidebarLabel.textContent = "Aplicativo Instalado ✓";
    } else {
      if (loginBtn) {
        loginBtn.style.display = "flex";
        if (loginLabel) loginLabel.textContent = "INSTALAR APLICATIVO OFICIAL";
      }
      if (sidebarLabel) sidebarLabel.textContent = "Instalar Aplicativo Oficial";
      if (headerBtn) headerBtn.style.display = "inline-flex";
      if (sidebarPwaSection) sidebarPwaSection.style.display = "block";
    }
  },

  promptInstallApp() {
    if (this.isAppInstalled()) {
      this.showToast("✓ O aplicativo Peregrino já está instalado neste dispositivo!");
      return;
    }

    // Se o evento nativo foi capturado (Android Chrome / Edge / Desktop Chrome)
    if (this.deferredInstallPrompt) {
      this.deferredInstallPrompt.prompt();
      this.deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult && choiceResult.outcome === "accepted") {
          this.showToast("Instalando aplicativo Peregrino...");
          this.deferredInstallPrompt = null;
          this.updateInstallUi();
        }
      });
      return;
    }

    // Modal com passo a passo para iOS Safari ou Android manual
    this.openInstallModal();
  },

  openInstallModal() {
    const modal = document.getElementById("pwa-install-modal");
    const bodyEl = document.getElementById("pwa-install-body");
    const actionBtn = document.getElementById("pwa-modal-action-btn");
    if (!modal || !bodyEl) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

    if (isIos) {
      bodyEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="background: rgba(199, 165, 152, 0.1); border: 1px solid rgba(199, 165, 152, 0.3); padding: 12px; border-radius: 6px; font-size: 13px; color: var(--gold-accent);">
            <strong>Instalação no iPhone / iPad (Apple Safari)</strong>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--gold-accent); color: #000; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px;">1</div>
            <div>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima na barra inferior do Safari).</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--gold-accent); color: #000; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px;">2</div>
            <div>Role o menu para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--gold-accent); color: #000; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px;">3</div>
            <div>Toque em <strong>"Adicionar"</strong> no canto superior direito. Pronto! O ícone oficial do Peregrino ficará na sua tela inicial como um app nativo.</div>
          </div>
        </div>
      `;
      if (actionBtn) {
        actionBtn.textContent = "Concluir";
        actionBtn.onclick = () => this.closeInstallModal();
      }
    } else {
      bodyEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="background: rgba(199, 165, 152, 0.1); border: 1px solid rgba(199, 165, 152, 0.3); padding: 12px; border-radius: 6px; font-size: 13px; color: var(--gold-accent);">
            <strong>Instalação no Smartphone Android ou Desktop</strong>
          </div>
          <p>O Peregrino roda com tecnologia <strong>Progressive Web App (PWA)</strong>, permitindo que você instale o app diretamente no celular sem precisar da loja e com inicialização em tela cheia.</p>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--gold-accent); color: #000; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px;">1</div>
            <div>Toque no menu do seu navegador (<strong>três pontinhos</strong> no canto superior direito).</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--gold-accent); color: #000; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px;">2</div>
            <div>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</div>
          </div>
        </div>
      `;
      if (actionBtn) {
        actionBtn.textContent = "Entendi";
        actionBtn.onclick = () => this.closeInstallModal();
      }
    }

    modal.classList.add("active");
  },

  closeInstallModal() {
    const modal = document.getElementById("pwa-install-modal");
    if (modal) modal.classList.remove("active");
  },

  executeInstallAction() {
    if (this.deferredInstallPrompt) {
      this.promptInstallApp();
      this.closeInstallModal();
    } else {
      this.closeInstallModal();
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
