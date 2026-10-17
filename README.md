# 🏛️ Peregrino — Sistema de Investidores & Governança Societária
> **Haja Luz Studio** • CNPJ: `61.511.844/0001-91` • Passo Fundo/RS  
> Plataforma SaaS de captação, auditoria de cotas (51% Criador / 49% Apoiadores), Fator Pioneiro (1.25x), devlog 3D e registro criptográfico com Hash SHA-256.

---

## 🚀 Guia de Deploy: Supabase ➔ GitHub ➔ Vercel

Siga o passo a passo abaixo para colocar o sistema no ar em produção.

---

### Passo 1: Configurar o Banco de Dados no Supabase

1. Acesse o **[Supabase](https://supabase.com/)** e crie uma conta gratuita (ou faça login).
2. Clique em **"New Project"**, defina o nome (ex: `sistema-peregrino`) e crie uma senha forte para o banco.
3. No menu lateral do projeto, clique em **SQL Editor** (ícone de terminal `>_`).
4. Clique em **"New Query"**, copie todo o conteúdo do arquivo [`supabase_schema.sql`](./supabase_schema.sql) e cole no editor.
5. Clique em **"Run"** (ou `Ctrl + Enter`).
   - O script criará automaticamente as tabelas:
     - `peregrino_users` (Superadmin e investidores)
     - `peregrino_contracts` (Contratos e termos com Hash SHA-256)
     - `peregrino_photo_reactions` (Curtidas e comentários no Devlog)
     - `peregrino_devlog` (Histórico de desenvolvimento Godot)
     - `peregrino_districts` & `peregrino_bases`
   - Aplicará as políticas de segurança RLS (*Row Level Security*).
   - Inserirá os dados iniciais do estúdio e apoiadores pioneiros.
6. No menu lateral, acesse **Project Settings** > **API**:
   - Copie a **Project URL** (ex: `https://xyzproject.supabase.co`)
   - Copie a **Project API Key (`anon` / `public`)**

---

### Passo 2: Subir o Projeto para o GitHub

1. Acesse o **[GitHub](https://github.com/)** e crie um novo repositório:
   - Nome sugerido: `sistema-peregrino`
   - Visibilidade: **Privado** (recomendado para projetos comerciais e de governança) ou **Público**.
   - **Não** marque a opção de inicializar com README (já temos o projeto pronto).
2. No seu terminal, dentro da pasta deste projeto, execute:

```bash
# 1. Adicionar o remote do seu repositório GitHub
git remote add origin https://github.com/SEU_USUARIO/sistema-peregrino.git

# 2. Renomear o branch principal para main (se necessário)
git branch -M main

# 3. Enviar todos os arquivos para o GitHub
git push -u origin main
```

---

### Passo 3: Deploy no Vercel

1. Acesse a **[Vercel](https://vercel.com/)** e faça login com sua conta do GitHub.
2. Clique em **"Add New..."** > **"Project"**.
3. Localize e importe o repositório `sistema-peregrino` que você acabou de subir.
4. Na tela de configuração do projeto:
   - **Framework Preset**: Deixe como `Other` (HTML/JS estático com `vercel.json`).
   - Expanda a seção **Environment Variables** e adicione as 2 chaves do seu Supabase:
     - `SUPABASE_URL`: Sua URL do Supabase (ex: `https://xyz.supabase.co`)
     - `SUPABASE_ANON_KEY`: Sua chave Anon do Supabase
5. Clique em **"Deploy"**.
6. Em menos de 1 minuto, a Vercel gerará o link oficial de produção com SSL/HTTPS gratuito (ex: `https://sistema-peregrino.vercel.app`).

---

### 🛡️ Resiliência Offline & Fallback Local

O sistema foi arquitetado com a ponte inteligente `SupabaseBridge`:
- Se as credenciais do Supabase estiverem configuradas, o sistema sincroniza em tempo real com o banco de dados PostgreSQL na nuvem.
- Se você acessar offline ou antes de configurar o Supabase, o sistema utiliza o motor de persistência local de alto desempenho (`localStorage`), garantindo que a aplicação **nunca quebre** e continue 100% funcional.

---

### 📂 Estrutura do Projeto

```
Sistema_ Peregrino/
├── assets/
│   ├── css/
│   │   └── style.css            # Estilos SaaS Mineral Bronze/Ouro
│   ├── js/
│   │   ├── app.js               # Lógica de interface, abas e navegação
│   │   ├── store.js             # Modelos de dados e fórmulas financeiras
│   │   ├── supabase.js          # Ponte de sincronização com o Supabase
│   │   ├── icons.js             # Biblioteca de ícones SVG vetorizados
│   │   └── qrcode.min.js        # Gerador dinâmico de QR Code PIX
│   └── img/                     # Logos oficiais, emblemas e capturas 3D
├── dossie_comercial.html        # Dossiê Comercial e Jurídico para Investidores
├── index.html                   # Aplicação SaaS Principal
├── package.json                 # Manifesto do projeto
├── supabase_schema.sql          # Script DDL SQL do Supabase
├── vercel.json                  # Regras de roteamento, cache e headers Vercel
└── README.md                    # Documentação e instruções de deploy
```

---

**Haja Luz Studio**  
*Desenvolvimento de Jogos Eletrônicos & Governança Cristã de Investimentos*
