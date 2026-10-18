/* ==============================================================================
   INTEGRAÇÃO SUPABASE CLOUD: SISTEMA PEREGRINO
   Haja Luz Studio • CNPJ 61.511.844/0001-91
   ==============================================================================
   Camada de sincronização com o banco de dados Supabase (PostgreSQL) com
   resiliência total para fallback offline / localStorage.
   ============================================================================== */

const SupabaseBridge = {
  client: null,
  isOnline: false,

  // Configuração das Credenciais do Supabase
  // Podem ser definidas via variáveis globais, Vercel ou salvas no localStorage
  getConfig() {
    let url = "";
    let anonKey = "";

    try {
      if (typeof window !== "undefined") {
        url = window.ENV_SUPABASE_URL || localStorage.getItem("peregrino_supabase_url") || "";
        anonKey = window.ENV_SUPABASE_ANON_KEY || localStorage.getItem("peregrino_supabase_anon_key") || "";
      }
    } catch (e) {}

    return { url: url.trim(), anonKey: anonKey.trim() };
  },

  setConfig(url, anonKey) {
    try {
      if (url) localStorage.setItem("peregrino_supabase_url", url.trim());
      if (anonKey) localStorage.setItem("peregrino_supabase_anon_key", anonKey.trim());
      this.init();
    } catch (e) {}
  },

  isConfigured() {
    const config = this.getConfig();
    return Boolean(config.url && config.anonKey);
  },

  // Inicializa o cliente oficial do Supabase (@supabase/supabase-js)
  async init() {
    const config = this.getConfig();

    if (!config.url || !config.anonKey) {
      console.info("ℹ️ Supabase não configurado. O sistema operará com persistência local (localStorage).");
      this.isOnline = false;
      return false;
    }

    if (typeof window.supabase === "undefined" || typeof window.supabase.createClient !== "function") {
      console.warn("⚠️ Biblioteca Supabase JS não carregada. Verifique a conexão com a CDN.");
      this.isOnline = false;
      return false;
    }

    try {
      this.client = window.supabase.createClient(config.url, config.anonKey);
      
      // Teste rápido de conectividade
      const { data, error } = await this.client.from("peregrino_users").select("id").limit(1);
      if (error) {
        console.warn("⚠️ Falha na conexão com Supabase:", error.message);
        this.isOnline = false;
        return false;
      }

      this.isOnline = true;
      console.log("⚡ Supabase Conectado com Sucesso! Sincronizando dados da nuvem...");
      
      // Sincroniza dados da nuvem para o Store
      await this.syncFromCloud();
      return true;
    } catch (err) {
      console.warn("⚠️ Erro ao inicializar Supabase:", err);
      this.isOnline = false;
      return false;
    }
  },

  // Sincroniza dados do Supabase para o Store local
  async syncFromCloud() {
    if (!this.client || !this.isOnline) return false;

    try {
      // 1. Sincronizar Usuários
      const { data: users, error: errUsers } = await this.client.from("peregrino_users").select("*");
      if (!errUsers && users && users.length > 0) {
        // Mapeia do schema SQL snake_case para o modelo camelCase do Store
        const mappedUsers = users.map(u => ({
          id: u.id,
          email: u.email,
          aliases: u.aliases || [],
          password: u.password,
          name: u.name,
          legalName: u.legal_name,
          cnpj: u.cnpj,
          cpf: u.cpf,
          phone: u.phone,
          city: u.city,
          state: u.state,
          role: u.role,
          title: u.title,
          institution: u.institution,
          avatarLetter: u.avatar_letter,
          joinDate: u.join_date,
          monthlyContribution: Number(u.monthly_contribution) || 0,
          monthsCommitted: Number(u.months_committed) || 12,
          totalInvested: Number(u.total_invested) || 0,
          weightedValue: Number(u.weighted_value) || 0,
          equitySharePercent: Number(u.equity_share_percent) || 0,
          inGameLot: u.in_game_lot,
          contractHash: u.contract_hash,
          canEditKanban: Boolean(u.can_edit_kanban),
          canSyncGodot: Boolean(u.can_sync_godot),
          canPostDevlog: Boolean(u.can_post_devlog)
        }));

        Store.users = mappedUsers;
        Store.saveUsers();
        if (window.App && typeof App.renderSidebar === "function") {
          App.renderSidebar();
        }
      }

      // 2. Sincronizar Contratos
      const { data: contracts, error: errContracts } = await this.client.from("peregrino_contracts").select("*");
      if (!errContracts && Array.isArray(contracts)) {
        Store.contracts = contracts.map(c => ({
          id: c.id,
          userId: c.user_id,
          name: c.name,
          cpf: c.cpf,
          email: c.email,
          phone: c.phone,
          city: c.city,
          state: c.state,
          institution: c.institution,
          monthlyContribution: Number(c.monthly_contribution) || 0,
          monthsCommitted: Number(c.months_committed) || 12,
          totalInvested: Number(c.total_invested) || 0,
          weightedValue: Number(c.weighted_value) || 0,
          equitySharePercent: Number(c.equity_share_percent) || 0,
          contractHash: c.contract_hash,
          signedAt: c.signed_at,
          status: c.status || "pendente",
          approvedAt: c.approved_at,
          auditNotes: c.audit_notes,
          notes: c.audit_notes
        }));
        try {
          localStorage.setItem("peregrino_contracts", JSON.stringify(Store.contracts));
        } catch (e) {}
      }

      // Notifica a UI para renderizar os dados sincronizados
      if (typeof window !== "undefined" && window.App) {
        if (typeof App.updateSupabaseStatusBadge === "function") App.updateSupabaseStatusBadge();
        if (typeof App.renderSidebar === "function") App.renderSidebar();
        if (App.activeTab === "usuarios" && typeof App.renderUsuarios === "function") {
          const h = document.getElementById("workspace-header");
          const b = document.getElementById("workspace-body");
          if (h && b) App.renderUsuarios(h, b);
        }
        if (App.activeTab === "gestao" && typeof App.renderGestao === "function") {
          const h = document.getElementById("workspace-header");
          const b = document.getElementById("workspace-body");
          if (h && b) App.renderGestao(h, b);
        }
      }

      // 3. Sincronizar Reações de Fotos (Curtidas e Comentários)
      const { data: reactions, error: errReactions } = await this.client.from("peregrino_photo_reactions").select("*");
      if (!errReactions && reactions && reactions.length > 0) {
        const reactionsMap = {};
        reactions.forEach(r => {
          reactionsMap[r.photo_url] = {
            likes: r.likes_count || 0,
            likedByUsers: r.liked_by_users || [],
            comments: Array.isArray(r.comments) ? r.comments : []
          };
        });
        Store.photoReactions = { ...Store.photoReactions, ...reactionsMap };
        try {
          localStorage.setItem("peregrino_photo_reactions", JSON.stringify(Store.photoReactions));
        } catch (e) {}
      }

      return true;
    } catch (e) {
      console.warn("Erro durante sincronização com Supabase:", e);
      return false;
    }
  },

  // Persistir Usuário no Supabase (Upsert)
  async saveUserToCloud(user) {
    await this.ensureClient();
    if (!this.client) return false;
    try {
      const record = {
        id: user.id,
        email: user.email,
        aliases: user.aliases || [],
        password: user.password || "peregrino2026",
        name: user.name,
        legal_name: user.legalName || null,
        cnpj: user.cnpj || null,
        cpf: user.cpf || null,
        phone: user.phone || null,
        city: user.city || "Passo Fundo",
        state: user.state || "RS",
        role: user.role || "supporter",
        title: user.title || null,
        institution: user.institution || "Mecenas da Comunidade",
        avatar_letter: user.avatarLetter || "P",
        join_date: user.joinDate || new Date().toLocaleDateString("pt-BR"),
        monthly_contribution: user.monthlyContribution || 0,
        months_committed: user.monthsCommitted || 12,
        total_invested: user.totalInvested || 0,
        weighted_value: user.weightedValue || 0,
        equity_share_percent: user.equitySharePercent || 0,
        in_game_lot: user.inGameLot || null,
        contract_hash: user.contractHash || null,
        can_edit_kanban: Boolean(user.canEditKanban),
        can_sync_godot: Boolean(user.canSyncGodot),
        can_post_devlog: Boolean(user.canPostDevlog),
        updated_at: new Date().toISOString()
      };

      const { error } = await this.client.from("peregrino_users").upsert(record, { onConflict: "id" });
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn("Falha ao salvar usuário no Supabase:", e);
      return false;
    }
  },

  async ensureClient() {
    if (this.client && this.isOnline) return this.client;
    await this.init();
    return this.client;
  },

  // Excluir Usuário no Supabase e limpar contratos vinculados
  async deleteUserFromCloud(userId) {
    await this.ensureClient();
    if (!this.client) return false;
    try {
      // Exclui contratos vinculados a esse user_id para integridade referencial
      try {
        await this.client.from("peregrino_contracts").delete().eq("user_id", userId);
      } catch (ce) {}

      const { error } = await this.client.from("peregrino_users").delete().eq("id", userId);
      if (error) throw error;
      console.log(`✓ Usuário ${userId} excluído com sucesso do Supabase.`);
      return true;
    } catch (e) {
      console.warn("Falha ao excluir usuário no Supabase:", e);
      return false;
    }
  },

  // Excluir Contrato no Supabase
  async deleteContractFromCloud(contractId) {
    await this.ensureClient();
    if (!this.client) return false;
    try {
      const { error } = await this.client.from("peregrino_contracts").delete().eq("id", contractId);
      if (error) throw error;
      console.log(`✓ Contrato ${contractId} excluído com sucesso do Supabase.`);
      return true;
    } catch (e) {
      console.warn("Falha ao excluir contrato no Supabase:", e);
      return false;
    }
  },

  // Persistir Contrato no Supabase
  async saveContractToCloud(contract) {
    await this.ensureClient();
    if (!this.client) return false;
    try {
      const record = {
        id: contract.id,
        user_id: contract.userId || null,
        name: contract.name,
        cpf: contract.cpf || null,
        email: contract.email,
        phone: contract.phone || null,
        city: contract.city || null,
        state: contract.state || null,
        institution: contract.institution || null,
        monthly_contribution: contract.monthlyContribution,
        months_committed: contract.monthsCommitted,
        total_invested: contract.totalInvested,
        weighted_value: contract.weightedValue,
        equity_share_percent: contract.equitySharePercent,
        contract_hash: contract.contractHash,
        signed_at: contract.signedAt || null,
        status: contract.status || "pendente",
        approved_at: contract.approvedAt || null,
        audit_notes: contract.notes || contract.auditNotes || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await this.client.from("peregrino_contracts").upsert(record, { onConflict: "id" });
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn("Falha ao salvar contrato no Supabase:", e);
      return false;
    }
  },

  // Persistir Reações de Foto (Curtida / Comentário) no Supabase
  async savePhotoReactionToCloud(photoUrl, reactionData) {
    if (!this.client || !this.isOnline) return false;
    try {
      const record = {
        photo_url: photoUrl,
        likes_count: reactionData.likes || 0,
        liked_by_users: reactionData.likedByUsers || [],
        comments: reactionData.comments || [],
        updated_at: new Date().toISOString()
      };

      const { error } = await this.client.from("peregrino_photo_reactions").upsert(record, { onConflict: "photo_url" });
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn("Falha ao salvar reações no Supabase:", e);
      return false;
    }
  }
};

// Auto-inicialização quando o DOM carregar
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    SupabaseBridge.init();
  });
}
