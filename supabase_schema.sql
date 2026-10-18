-- ==============================================================================
-- SCHEMA SUPABASE: SISTEMA PEREGRINO (INVESTIDORES & GOVERNANÇA)
-- Haja Luz Studio • CNPJ 61.511.844/0001-91
-- ==============================================================================
-- Execute este script completo no SQL Editor do seu projeto Supabase
-- (Supabase Dashboard > SQL Editor > New query > Run)
-- ==============================================================================

-- 1. TABELA DE USUÁRIOS DO SISTEMA (SUPERADMIN & INVESTIDORES)
CREATE TABLE IF NOT EXISTS public.peregrino_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    aliases TEXT[] DEFAULT '{}',
    password TEXT NOT NULL DEFAULT 'peregrino2026',
    name TEXT NOT NULL,
    legal_name TEXT,
    cnpj TEXT,
    cpf TEXT,
    phone TEXT,
    city TEXT DEFAULT 'Passo Fundo',
    state TEXT DEFAULT 'RS',
    role TEXT NOT NULL DEFAULT 'supporter', -- 'creator' (superadmin), 'supporter' (investidor), 'guest' (vip)
    title TEXT,
    institution TEXT DEFAULT 'Mecenas da Comunidade',
    avatar_letter TEXT DEFAULT 'P',
    join_date TEXT,
    monthly_contribution NUMERIC(10,2) DEFAULT 0,
    months_committed INTEGER DEFAULT 12,
    total_invested NUMERIC(12,2) DEFAULT 0,
    weighted_value NUMERIC(12,2) DEFAULT 0,
    equity_share_percent NUMERIC(5,2) DEFAULT 0,
    in_game_lot TEXT,
    contract_hash TEXT,
    can_edit_kanban BOOLEAN DEFAULT FALSE,
    can_sync_godot BOOLEAN DEFAULT FALSE,
    can_post_devlog BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE CONTRATOS & TERMOS DE ADESÃO SOCIETÁRIA
CREATE TABLE IF NOT EXISTS public.peregrino_contracts (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.peregrino_users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    cpf TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    state TEXT,
    institution TEXT,
    monthly_contribution NUMERIC(10,2) NOT NULL,
    months_committed INTEGER NOT NULL DEFAULT 12,
    total_invested NUMERIC(12,2) NOT NULL,
    weighted_value NUMERIC(12,2) NOT NULL,
    equity_share_percent NUMERIC(5,2) NOT NULL,
    contract_hash TEXT NOT NULL,
    signed_at TEXT,
    status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'aprovado', 'recusado'
    approved_at TEXT,
    audit_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE REAÇÕES NAS FOTOS DO DEVLOG (CURTIDAS & COMENTÁRIOS)
CREATE TABLE IF NOT EXISTS public.peregrino_photo_reactions (
    id BIGSERIAL PRIMARY KEY,
    photo_url TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    liked_by_users TEXT[] DEFAULT '{}',
    comments JSONB DEFAULT '[]'::jsonb, -- [{ id, author, authorRole, avatar, text, date, timestamp }]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(photo_url)
);

-- 4. TABELA DE POSTAGENS DO DEVLOG & PROGRESSO GODOT
CREATE TABLE IF NOT EXISTS public.peregrino_devlog (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    badge_type TEXT DEFAULT 'gameplay',
    date TEXT,
    author TEXT DEFAULT 'Haja Luz Studio (Dev Principal)',
    summary TEXT,
    media_type TEXT DEFAULT 'image',
    media_url TEXT,
    caption TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE DISTRITOS (7 DISTRITOS DO MAPA 2.4KM X 2.4KM)
CREATE TABLE IF NOT EXISTS public.peregrino_districts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    order_num INTEGER NOT NULL,
    biome TEXT,
    risk_level TEXT,
    status TEXT, -- 'concluido', 'em_andamento', 'bloqueado'
    progress INTEGER DEFAULT 0,
    area_sqm NUMERIC(10,2),
    budget_allocated NUMERIC(10,2),
    key_features TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE BASES (7 BASES ESTRATÉGICAS)
CREATE TABLE IF NOT EXISTS public.peregrino_bases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    order_num INTEGER NOT NULL,
    district_id TEXT,
    faith_bonus TEXT,
    capacity INTEGER,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS)
-- Permite leitura e gravação anônima via Anon Key para a aplicação SPA
-- ==============================================================================

ALTER TABLE public.peregrino_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peregrino_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peregrino_photo_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peregrino_devlog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peregrino_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peregrino_bases ENABLE ROW LEVEL SECURITY;

-- Políticas para peregrino_users
DROP POLICY IF EXISTS "Permitir select para anon" ON public.peregrino_users;
DROP POLICY IF EXISTS "Permitir insert para anon" ON public.peregrino_users;
DROP POLICY IF EXISTS "Permitir update para anon" ON public.peregrino_users;
DROP POLICY IF EXISTS "Permitir delete para anon" ON public.peregrino_users;
DROP POLICY IF EXISTS "Permitir all para anon peregrino_users" ON public.peregrino_users;
CREATE POLICY "Permitir all para anon peregrino_users" ON public.peregrino_users FOR ALL USING (true) WITH CHECK (true);

-- Políticas para peregrino_contracts
DROP POLICY IF EXISTS "Permitir select contratos" ON public.peregrino_contracts;
DROP POLICY IF EXISTS "Permitir insert contratos" ON public.peregrino_contracts;
DROP POLICY IF EXISTS "Permitir update contratos" ON public.peregrino_contracts;
DROP POLICY IF EXISTS "Permitir delete contratos" ON public.peregrino_contracts;
DROP POLICY IF EXISTS "Permitir all para anon peregrino_contracts" ON public.peregrino_contracts;
CREATE POLICY "Permitir all para anon peregrino_contracts" ON public.peregrino_contracts FOR ALL USING (true) WITH CHECK (true);

-- Políticas para peregrino_photo_reactions
DROP POLICY IF EXISTS "Permitir select reactions" ON public.peregrino_photo_reactions;
DROP POLICY IF EXISTS "Permitir upsert reactions" ON public.peregrino_photo_reactions;
DROP POLICY IF EXISTS "Permitir all para anon peregrino_photo_reactions" ON public.peregrino_photo_reactions;
CREATE POLICY "Permitir all para anon peregrino_photo_reactions" ON public.peregrino_photo_reactions FOR ALL USING (true) WITH CHECK (true);

-- Políticas para peregrino_devlog
DROP POLICY IF EXISTS "Permitir select devlog" ON public.peregrino_devlog;
DROP POLICY IF EXISTS "Permitir insert/update devlog" ON public.peregrino_devlog;
DROP POLICY IF EXISTS "Permitir all para anon peregrino_devlog" ON public.peregrino_devlog;
CREATE POLICY "Permitir all para anon peregrino_devlog" ON public.peregrino_devlog FOR ALL USING (true) WITH CHECK (true);

-- Políticas para peregrino_districts
DROP POLICY IF EXISTS "Permitir select distritos" ON public.peregrino_districts;
DROP POLICY IF EXISTS "Permitir all distritos" ON public.peregrino_districts;
DROP POLICY IF EXISTS "Permitir all para anon peregrino_districts" ON public.peregrino_districts;
CREATE POLICY "Permitir all para anon peregrino_districts" ON public.peregrino_districts FOR ALL USING (true) WITH CHECK (true);

-- Políticas para peregrino_bases
DROP POLICY IF EXISTS "Permitir select bases" ON public.peregrino_bases;
DROP POLICY IF EXISTS "Permitir all bases" ON public.peregrino_bases;
DROP POLICY IF EXISTS "Permitir all para anon peregrino_bases" ON public.peregrino_bases;
CREATE POLICY "Permitir all para anon peregrino_bases" ON public.peregrino_bases FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- DADOS INICIAIS (SEED DATA)
-- ==============================================================================

-- Superadmin e Investidores Oficiais
INSERT INTO public.peregrino_users (
    id, email, aliases, password, name, legal_name, cnpj, role, title, institution, avatar_letter, can_edit_kanban, can_sync_godot, can_post_devlog, total_invested, weighted_value, equity_share_percent
) VALUES
(
    'USR-001',
    'hajaluzstudio@gmail.com',
    ARRAY['diretoria@hajaluzstudio.com', 'admin@peregrino.org'],
    'sophia11052016',
    'Haja Luz Studio',
    'Andressa do Prado Costa Corá',
    '61.511.844/0001-91',
    'creator',
    'Diretoria & Criador Master (Superadmin)',
    'Haja Luz Studio • CNPJ 61.511.844/0001-91',
    'HL',
    true, true, true,
    14400.00, 18000.00, 6.00
),
(
    'INV-0701',
    'pastoradriano@peregrino.org',
    ARRAY['pastor.adriano@comunidade.org'],
    'adriano2026',
    'Pastor Adriano',
    'Adriano Pereira dos Santos',
    NULL,
    'supporter',
    'Conselheiro Espiritual & Investidor Pioneiro',
    'Comunidade Cristã da Família',
    'PA',
    false, false, false,
    6000.00, 7500.00, 2.50
),
(
    'INV-0702',
    'williamromani@peregrino.org',
    ARRAY['william@hajaluz.org'],
    'william2026',
    'William Romani',
    'William Romani',
    NULL,
    'supporter',
    'Gestor de Suprimentos & Investidor Pioneiro',
    'Mecenas da Comunidade',
    'WR',
    false, false, false,
    4800.00, 6000.00, 2.00
),
(
    'INV-0703',
    'felipe@peregrino.org',
    ARRAY['felipe@hajaluz.org'],
    'felipe2026',
    'Felipe',
    'Felipe Souza',
    NULL,
    'supporter',
    'Batedor e Patrulha & Investidor Pioneiro',
    'Mecenas da Comunidade',
    'F',
    false, false, false,
    3600.00, 4500.00, 1.50
)
ON CONFLICT (id) DO NOTHING;

-- Contrato Demonstrativo Inicial
INSERT INTO public.peregrino_contracts (
    id, user_id, name, cpf, email, phone, city, state, institution,
    monthly_contribution, months_committed, total_invested, weighted_value, equity_share_percent,
    contract_hash, signed_at, status, approved_at
) VALUES (
    'CTR-2026-001',
    'INV-0701',
    'Pastor Adriano',
    '123.456.789-00',
    'pastoradriano@peregrino.org',
    '(54) 99876-5432',
    'Passo Fundo',
    'RS',
    'Comunidade Cristã da Família',
    500.00,
    12,
    6000.00,
    7500.00,
    2.50,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    '15/01/2026 14:30:22',
    'aprovado',
    '16/01/2026 09:15:00'
)
ON CONFLICT (id) DO NOTHING;
