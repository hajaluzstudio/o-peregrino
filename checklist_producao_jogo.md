# 🗺️ Checklist de Produção: Peregrino (Pitch para Investidores)

> **Ponto Eletrônico (Log de Alterações)**
> Todas as modificações feitas no projeto serão registradas aqui com data e hora.
> * [2026-09-23 19:50] 🎒 SISTEMA DE INVENTÁRIO BÍBLICO E UI DIEGÉTICA: Implantação de `res://data/itens_biblicos.json` (Pão de Cevada, Peixe Salgado, Frasco de Azeite e Pruta de Bronze), Singleton AutoLoad `inventory_manager.gd` com regras de stacking/consumo e interface diegética `inventario_ui.tscn` acionada pela tecla 'I' (`toggle_inventory`) em `main_world.tscn`. Testado e aprovado com 100% no Godot headless.
> * [2026-09-23 19:35] 🛡️ MOTOR DE DEFESA DE BASE E HUD INTEGRADOS: Atualização em `base_building_manager.gd`, `idle_manager.gd` e `hud.gd`. Suporte a `bases_ativas`, `base_sob_ataque_id`, conexão de defesa automática via `SpiritualGiftsManager.miracle_used`, dreno dinâmico no `IdleManager` (-2.0 Fé/s) e notificações/banners de alerta e vitória na HUD. Testado e validado com 100% no Godot headless.
> * [2026-09-23 18:58] ⛓️💥 FÍSICA DE MILAGRES DO TERREMOTO NA PRISÃO ROMANA: Criação de `res://scripts/prison_earthquake_event.gd` e emissão do sinal `miracle_used(pos)` em `spiritual_gifts_manager.gd`. Implementado destravamento dinâmico de portas celas (RigidBody3D impulse), emissão de partículas de poeira (CPUParticles3D), pacificação e conversão do Carcereiro Romano para Ouvinte (Cinza) e acionamento da missão de Paulo e Silas. Testado e aprovado com 100% no Godot headless.
> * [2026-09-23 18:43] ⚔️ SISTEMA GLOBAL DE MISSÕES, AMEAÇAS E ESCALONAMENTO COMPILADO: Implementação e teste automatizado (100% de aprovação, código de saída 0 no Godot 4.7.2 headless) dos módulos `mission_manager.gd`, `spawn_director.gd`, `spiritual_gifts_manager.gd`, `base_building_manager.gd` e `npc.gd`. Suporte a Eixos 1 e 2, estados Fariseu (Aura Vermelha) e Oprimido (Aura Escura/Fuga 1.5x/Dreno), Cerco Espiritual (-2.0 Fé/s) e Trava de Expansão de Paulo e Silas na Prisão Romana.
> * [2026-09-23 18:15] 📜 ARQUITETURA GLOBAL DE MISSÕES E ESCALONAMENTO DE DONS: Integração formal da arquitetura dos 4 Eixos de Missões (Fio de Ouro, Despertar dos Heróis com 14 Apóstolos, Sobrevivência Comunitária e Ameaças Espirituais/Cerco à Base) e Escalonamento dos Dons Espirituais (Curar, Discernimento e Operação de Milagres) no GDD e Checklist de Produção (Fase 4).
> * [2026-09-20 09:53] 🏗️ IN-GAME LEVEL DESIGNER COMPLETO (MODO ARQUITETO): Implantação de `in_game_editor.gd` com alternância 'B'/'F1', catálogo retrátil 'TAB' dos 7 distritos/vias/relevo, sistema modular de estradas de 4m x 4m ('R') com snap linear, manipulação vertical de morros/platôs (PgUp/PgDn), snap inteligente ao piso ('T') e persistência bidirecional JSON em `res://data/layout_cenario.json`.
> * [2026-09-20 09:32] 🎬 REGISTRO EM ROADMAP: Inclusão da especificação técnica do Sistema de Cutscenes In-Engine com Transição Suave (Seamless Camera Blend estilo GTA V) na seção de Sistemas Narrativos e Missões com status [PENDENTE / PLANEJADO].
> * [2026-09-17 07:40] 🛡️ PURGAÇÃO DE SOBREPOSIÇÃO DE DISTRITOS & FIM DO PAREDÃO FLUTUANTE: Diagnóstico revelou que o modelo `cliff_rock_wall.glb` possui 110.6 metros de largura nativa. Em `_generate_santuario_monte()`, 13 instâncias com escalas de 3.2 a 5.0 (gerando malhas de 350m a 550m de largura) estavam posicionadas em Z = -230, sobrepondo e invadindo diretamente a vila de Cafarnaum e a Colina da Sinagoga, flutuando no horizonte e travando a renderização na área de spawn. Os paredões artificiais do Monte e das Cavernas foram 100% expurgados (o relevo agora é naturalmente fornecido pelo Heightmap 2400m) e as 10 rochas do Oásis foram reduzidas para a escala realista prop (0.18 a 0.22), eliminando totalmente a sobreposição e estabilizando a taxa de quadros (FPS) na vila.
> * [2026-09-17 07:25] 🗺️ EXPANSÃO TERRITORIAL REGIONAL (2.400m x 2.400m) & RELOCAÇÃO DO OÁSIS: Expansão massiva do mapa-múndi no Godot 4. Altura regional re-assada em EXR 16-bit Float com resolução ultra 2049x2049 (4.198.401 vértices) e escala física de 2.400m x 2.400m. Máscara da vila inicial (Cafarnaum) totalmente desimpedida e plana em (0,0). Oásis Escondido (lago, cascata, emissores GPUParticles3D, 10 paredões rochosos e bosque de 15 tamareiras) transferido para X = -900.0, Z = -900.0 (~1.27km de distância). Malha física CSGPolygon3D da Trilha do Oásis temporariamente desativada (mantendo o Path3D invisível) prevenindo congelamentos de renderização. Registrado Distrito 7 (OÁSIS DISTANTE) e câmera de inspeção KEY_7.
> * [2026-09-16 19:10] Conclusão do Item 3 (Arquitetura e Colisão Trimesh AAA): Banimento total de colisores BoxShape3D simplistas em edificações. Implementada rotina recursiva de geração de colisores côncavos (create_trimesh_collision()) para 24 casas antigas, arcos monumentais, Sinagoga e paredões de rocha. Todos os corpos estáticos configurados estritamente na Layer 1 / Mask 1, ancoragem aprofundada (Y - 0.2m) e materiais PBR originais preservados.
> * [2026-09-16 12:28] 🚨 NOVO DIRECIONAMENTO DE ESTÚDIO (PRIORIDADE MÁXIMA): Transição da arquitetura de level design de matemática procedural pura (sin, cos, get_terreno_y) para ecossistema AAA nativo do Godot 4. Implantação de Heightmap estático com HeightMapShape3D, estradas orgânicas via Path3D/CSGPolygon3D, colisões trimesh precisas (create_trimesh_collision()) para interiores transitáveis de arquivos .glb, navegação por NavigationRegion3D e iluminação/névoa cinematográfica PBR.
> * [2026-09-13 18:42] Ponto de Parada & Continuação: Refinamento do Distrito 1 (Porto dos Pescadores & Orla do Mar da Galileia). Continuação focada no refinamento do cais, integração de todos os modelos 3D dos cais e ajuste estrutural do cais do porto.
> * [2026-09-13 12:05] Conclusão da Fase 3: Implementação de toda a Malha Viária Regional (Estrada do Peixe, Caravana, Ascensão, Desfiladeiro do Monte, Trilha dos Eremitas e Orla) diretamente na malha do solo com interpolação analítica e marcos de pedra com lamparinas nas 9 encruzilhadas principais.
> * [2026-09-13 11:55] Expansão Monumental para Escala Regional de 2.000m x 2.000m (4 km² - Padrão State of Decay). Inclusão do Distrito 5 (Santuário do Monte & Desfiladeiro a +45m de altitude) e Distrito 6 (Vale das Cavernas, Tendas Beduínas e Grande Cachoeira de 26m). Implementação do HUD District Banner de identificação territorial.
> * [2026-09-13 11:35] Aprovação do Plano Diretor de Escala Regional (Padrão State of Decay). Conclusão da Fase 1 (Bloqueio Topográfico) e Início da Fase 2 (Posicionamento dos Grandes Distritos Urbanos com Âncoras Espaçadas).
> * [2026-09-13 11:05] Inclusão dos NPCs Apoiadores Reais (Pastor Adriano, William e Felipe) no GDD e Checklist para integrar a comunidade, missões e atração de novos parceiros e investidores.
> * [2026-09-13 10:55] Conclusão do Passo 2 (Matrizes Anatômicas Femininas e Geração Modular no npc_spawner.gd) e Inclusão dos Personagens Históricos Criados no Mundo do Jogo.
> * [2026-09-12 09:40] Adição do Ciclo Dia/Noite, Clima Dinâmico e Sistema de Iluminação de Época (Fogo/Lua).
> * [2026-09-12 09:20] Integração das lógicas de Gestão de Comunidade (Estilo State of Decay) e Progressão de Mapas.
> * [2026-09-12 09:12] Atualização colossal de escopo: Discípulos, NPCs Vivos, Evangelismo, Deserto.
> * [2026-09-12 08:58] Criação do Documento de Game Design (GDD) e adição de Multiplayer e Infra.

---

## 🚨 PRIORIDADE ZERO: Transição Arquitetural para Ferramentas AAA do Godot (FOCO IMEDIATO)

> **Diretriz de Estúdio:** Interrupção imediata de cálculos procedurais matemáticos em tempo real (`sin`, `cos`, loops de `get_terreno_y`) para relevo e vias. Substituição por malhas estáticas ancoradas, curvas Bézier e nós nativos do Godot para garantia de estabilidade física, performance e fidelidade visual.

### 🏔️ 1. Terreno e Geografia (Fim da Matemática Cega)
- [x] **Infraestrutura de Heightmap Estático:** Implantação da ferramenta de bake de estúdio (`bake_heightmap_tool.gd`) e geração do arquivo EXR 16-bit float (`res://data/terrain/heightmap_regional.exr` - 513x513 vértices, 1.200m x 1.200m e amplitude de -8.0m a +75.0m). *(Concluído em 2026-09-16 12:43)*
- [x] **Colisão Física Ancorada (`HeightMapShape3D`):** Implementado `TerrainManager` instanciado no `main_world.tscn` com `HeightMapShape3D` estático de escala exata `(2.34375, 1.0, 2.34375)`, eliminando falhas de física e descompassos geométricos. *(Concluído em 2026-09-16 12:54)*
- [x] **Depreciação de `get_terreno_y` Matemático:** Migradas as consultas de elevação em `main_world.gd` e `gerador_cidade.gd` para `TerrainManager.obter_altura_mundo(x, z)` com leitura em $O(1)$ por amostragem bilinear, eliminando cálculos trigonométricos síncronos em runtime. *(Concluído em 2026-09-16 12:54)*

### 🛣️ 2. Sistema Viário Orgânico (Estradas em Curvas Bézier)
- [x] **Traçado com `Path3D` e `Curve3D`:** Implementado no `gerador_estradas.gd` nó `Path3D` e curvas Bézier contínuas interligando os 5 distritos e a orla (Estrada do Peixe, Caravana, Ascensão, Desfiladeiro, Eremitas e Orla), eliminando quinas de 90°. *(Concluído em 2026-09-16 18:40)*
- [x] **Geração de Malha com `CSGPolygon3D`:** Extrusão ao longo do `Path3D` (modo Path, `path_interval = 1.8m`, `path_continuous_u = true`) com perfil arqueado de 6.0m a 8.0m para trânsito fluido de pedestres e montaria. *(Concluído em 2026-09-16 18:40)*
- [x] **Conformação ao Relevo e Proteção Física:** Todos os pontos das curvas consultam `TerrainManager.obter_altura_mundo(x, z)` com elevação de segurança (+0.025m) e colisão desativada (`use_collision = false`), permitindo física limpa apoiada estritamente no `HeightMapShape3D`. *(Concluído em 2026-09-16 18:40)*

### 🌲 Vegetação Orgânica e MultiMesh (Ambientação Natural de Alto Desempenho)
- [x] **Instanciamento via `MultiMeshInstance3D` (`gerador_biomas.gd`):** Gerenciador de instâncias em massa para 5 espécies vegetais bíblicas reais (Ciprestes, Figueiras, Tamareiras, Oliveiras e Carvalhos/Terebintos) e campos agrícolas de trigo a 60 FPS com draw calls mínimas. *(Concluído em 2026-09-16 18:45)*
- [x] **Ancoragem Fiel ao Heightmap e Variação Orgânica:** Cada espécime ancorado com precisão milimétrica via `TerrainManager.obter_altura_mundo(x, z)`, com rotação Y (0° a 360°) e variação de escala sutil (0.85 a 1.20). *(Concluído em 2026-09-16 18:45)*
- [x] **Regras Geográficas e Narrativas dos Biomas:**
  * **Alameda Monumental de Ciprestes (38 árvores):** Ladeando ordenadamente o Caminho da Ascensão rumo à Sinagoga.
  * **Figueiras de Sombra (14 árvores):** Copas frondosas na Praça Central e recuos de quintais para acolhimento de NPCs Ouvintes (Cinza).
  * **Oásis de Tamareiras da Judeia (28 palmeiras):** Agrupadas na orla costeira do Mar da Galileia (Y < 2.0m) e na bacia da cascata do Vale das Cavernas.
  * **Olivais da Galileia (26 árvores) e Carvalhos de Basã (28 árvores):** Densamente distribuídos nas zonas de transição e colinas altas (Y > 4.0m).
  * **Campos de Trigo Dourado (314 tufos):** Ondulando no vale agrícola da Base Comunitária. *(Concluído em 2026-09-16 18:45)*

### 🏺 Detalhamento Urbano, Props e Base Building (Distritos 1, 2 e 4)
- [x] **Estrutura de Carregamento Flexível (`gerador_props.gd`):** Suporte nativo para modelos 3D (`.glb` e `.obj` com texturas PBR) com fallback automático para blocos substitutos temporários (`CSGBox3D` marrom rústico) sem quebra de cena. *(Concluído em 2026-09-16 18:48)*
- [x] **Distrito 1 (Porto dos Pescadores):** Barcos ancorados na margem do lago (faixa Y = -0.5 a 0.0), 4 varais de redes secando ao sol, 5 pilhas de redes de pesca dobradas, 14 ânforas de salga e cestos de peixes frescos na praia e cais, além da fogueira histórica (João 21:9) com luz dinâmica. *(Concluído em 2026-09-16 18:48)*
- [x] **Distrito 2 (Mercado Central):** Barracas históricas de comércio com toldos coloridos (terracota, azul anil e linho), balcões com mercadorias e pilhas de caixotes e ânforas nas margens das avenidas principais. *(Concluído em 2026-09-16 18:48)*
- [x] **Distrito 4 (Base da Comunidade - Slots de Base Building):** Platô leste estruturado com 3 fundações delimitadas (14m x 14m cada) com moldura de vigas e totens de identificação iluminados: "Lote Adriano" (Conselheiro Espiritual), "Lote William" (Gestão de Suprimentos) e "Lote Felipe" (Batedor e Patrulha), além da bancada de carpintaria e toras de madeira. *(Concluído em 2026-09-16 18:48)*
- [x] **Tendas Nível 1, Construção Nível 2 e Líderes NPC (`base_building_manager.gd`):**
  * **Tendas Básicas Nível 1:** Instanciadas e visíveis em cada um dos 3 lotes como estado inicial.
  * **Construção Nível 2:** Instanciada no mesmo ponto, inicialmente oculta (`visible = false`) com colisão desativada.
  * **Líderes Apoiadores Reais:** Pastor Adriano, William e Felipe posicionados em frente às suas tendas, dotados de `Area3D` (raio 2.5m) e prompt `[E] Falar / Evoluir Base`.
  * **Motor de Mesh Swap & Bônus Passivos:** `upgrade_lote(lote_id)` oculta a tenda, ativa a construção de pedra, emite partículas de poeira/luz dourada e desbloqueia os bônus comunitários (+25% Fé, +30% Stash, +20% Velocidade). *(Concluído em 2026-09-16 18:56)*

### 🏛️ 3. Arquitetura, Casas e Colisão Interativa (Casas Transitáveis)
- [x] **Padronização de Instanciação `.glb`:** Carregamento de ativos 3D realistas preservando a integridade das malhas originais e materiais PBR (calcário, basalto, madeira).
- [x] **Colisões Côncavas Precisas (`create_trimesh_collision()`):** Banimento definitivo de `BoxShape3D` e `CylinderShape3D` genéricos para edificações no `gerador_cidade.gd` e `gerador_props.gd`. Implementada função recursiva `_gerar_colisoes_trimesh` gerando colisores côncavos (`ConcavePolygonShape3D`) a partir das faces poligonais reais para 24 casas (`casa_antiga.glb`), Sinagoga (`sinagoga.obj`), 4 arcos monumentais (`arco_1.glb`, `arco_2.glb`) e paredões de rocha (`cliff_rock_wall.glb`), permitindo trânsito livre e desobstruído por portas, janelas e arcos. *(Concluído em 2026-09-16 19:10)*
- [x] **Configuração Estrita de Física:** Todos os 646 nós `StaticBody3D` gerados configurados com `collision_layer = 1` e `collision_mask = 1`, garantindo física responsiva com Jogador, NPCs e Jumento. *(Concluído em 2026-09-16 19:10)*
- [x] **Ancoragem Aprofundada no Heightmap:** Offset vertical de $Y_{terreno} - 0.2\text{m}$ em todas as construções e arcos para enterrar a soleira no terreno e eliminar vãos ou flutuação visual. *(Concluído em 2026-09-16 19:10)*

### 🧭 4. Inteligência Artificial e Navegação
- [ ] **Bake de `NavigationRegion3D` (NavMesh):** Assar a malha de navegação regional integrando o terreno de Heightmap, as estradas de `CSGPolygon3D` e as barreiras dos edifícios.
- [ ] **Agentes de Navegação nos NPCs (`NavigationAgent3D`):** Atualizar `npc.gd` e `jumento.gd` para utilizar agentes de navegação nativos do Godot, garantindo rotas suaves e desvio de obstáculos sem colidir contra o ambiente.

### 🌅 5. Polimento Visual e Materiais PBR
- [ ] **Preservação de Materiais PBR Originais:** Garantir que todos os modelos `.glb` importados retenham suas propriedades de Albedo, Roughness, Normal Map e Metallic sem sobreposição destrutiva.
- [ ] **WorldEnvironment & Atmosfera:** Configurar `WorldEnvironment` completo com `ProceduralSkyMaterial`, iluminação direcional (`DirectionalLight3D`) com sombras de alta fidelidade e névoa volumétrica/de distância (Fog) para fusão natural do horizonte.

---

## ✅ Fase 1: Fundação Tecnológica

- [x] **Backend & Persistência:** Servidor FastAPI operando rotas assíncronas para login, cadastro e autosave (`/save`).
* [x] **Anti-Cheat:** Timer de 15s no Quiz e bloqueio estrito de 60s por falha/timeout. *(Concluído em 2026-09-12 15:34)*
* [x] **Mundo & Topografia:** Geração de terreno sólido com lajes de basalto e areia.
* [x] **Core Gameplay:** Motor *Zero-Repeat* (perguntas não se repetem), e Árvore de Dons Espirituais. *(Concluído em 2026-09-12 15:36)*
* [x] **Inteligência Artificial (DDA Avançado):** Ajuste dinâmico de dificuldade com profiling de idade. *(Concluído em 2026-09-12 15:38)*
* [x] **Decaimento Orgânico:** Sistema que reduz o nível/status do jogador e da comunidade por inatividade. *(Concluído em 2026-09-12 15:40)*
* [x] **Sonoplastia Autônoma Base:** Áudio procedimental de eventos.

## 🟡 Fase 2: Polimento Visual, Mundo Vivo e Imersão (FOCO ATUAL)

### 👥 Status do Elenco Bíblico e Personagens 3D

#### ✅ Personagens 3D Criados e Já Inseridos no Jogo:
- [x] **O Peregrino (Protagonista / 13º Discípulo):** Modelo 3D com rig completo, texturas e animações (idle, walk, casual_walk, run, arise).
- [x] **Jesus Cristo (O Mestre):** Modelo 3D histórico com animações (idle, agree, walk, run, arise) e interação com o jogador.
- [x] **João Batista (O Precursor):** Modelo 3D (*The Outcast Prophet*) com conjunto completo de animações, posicionado na enseada/margens de Cafarnaum.
- [x] **André (Discípulo):** Modelo 3D (*The Humble Wanderer*) com animações, posicionado junto aos piers e barcos de pesca.
- [x] **João (Discípulo Amado):** Modelo 3D (*Outstretched Resolve*) com animações, situado no cais de pesca.
- [x] **Filipe (Discípulo):** Modelo 3D (*Biblical Man*) com animações, na esplanada da praça em direção a Betsaida.
- [x] **Judas Tadeu (Discípulo):** Modelo 3D (*Desert Wanderer*) com animações, no quarteirão oeste dos artesãos.
- [x] **Judas Iscariotes (Discípulo):** Modelo 3D (*Desert Sentinel*) com animações, na área de tendas do mercado.
- [x] **Maria Madalena (Matriz Anatômica Feminina):** Modelo 3D (*Desert Grace*) com animações, na esplanada da Sinagoga.
- [x] **Maria de Betânia (Matriz Anatômica Feminina):** Modelo 3D (*Outstretched Grace*) com animações, no setor residencial norte.
- [x] **Marta de Betânia (Matriz Anatômica Feminina):** Modelo 3D com animações ativas, no setor de acolhimento/hospitalidade.
- [x] **Maria (Mãe de Jesus):** Modelo 3D histórico integrado junto às casas de Cafarnaum.
- [x] **O Jumentinho (Montaria & Stash Móvel):** Modelo 3D quádruple (*Pack Donkey*) com animações de caminhada e alforjes, pronto na praça/porto.
- [x] **População Feminina Modular Procedural (Passo 2 Concluído):** Gerada proceduralmente via `npc_spawner.gd` a partir das 3 matrizes anatômicas (Madalena, Betânia, Marta), com variação matemática de altura/porte (`randf_range`), paleta histórica de túnicas via `Material Override`, dessincronização orgânica de caminhada e estados espirituais (Sombra, Cinza, Luz). *(Concluído em 2026-09-13 10:55)*

#### 🌟 Apoiadores Reais & Parceiros Oficiais (Mecenas do Projeto):
> *Estes personagens representam apoiadores financeiros reais que investem diretamente no desenvolvimento do jogo. Suas presenças no jogo servem como vitrine comercial para atração de novos investidores e parceiros, participando como membros influentes da comunidade e ofertando missões vitais.*
- [ ] **Pastor Adriano (Apoiador Real / Conselheiro Espiritual da Comunidade):** Criar modelo 3D dedicado, diálogos de liderança pastoral e missões de oração/santificação para contenção de crises na vila.
- [ ] **William (Apoiador Real / Pilar de Apoio da Comunidade):** Criar modelo 3D dedicado, diálogos de apoio e missões comunitárias de gestão de suprimentos e infraestrutura.
- [ ] **Felipe (Apoiador Real / Pilar de Apoio da Comunidade):** Criar modelo 3D dedicado, diálogos de batedor e missões de exploração, patrulha e acolhimento de novos membros.

#### ⏳ Discípulos que Faltam Criar o Modelo 3D e Adicionar no Jogo:
- [ ] **Pedro (Simão Pedro):** Líder dos apóstolos e pescador da Galileia.
- [ ] **Mateus (Levi):** Cobrador de impostos em Cafarnaum (posto da alfândega).
- [ ] **Tomé (Dídimo):** O apóstolo reflexivo.
- [ ] **Tiago Maior:** Filho de Zebedeu e irmão de João, pescador do Mar da Galileia.
- [ ] **Tiago Menor:** Filho de Alfeu.
- [ ] **Natanael (Bartolomeu):** O israelita sincero ("sob a figueira").
- [ ] **Simão (O Zelote):** Patriota e discípulo fervoroso.

---

### 🏛️ Marcos de Mundo e Infraestrutura (Plano Diretor Regional - Escala State of Decay)
- [x] **Modelagem de Matrizes Femininas (Passo 2):** Importação concluída e variação procedural ativa no `npc_spawner.gd`. *(Concluído em 2026-09-13 10:55)*
- [x] **O Precursor:** Malha e posicionamento de João Batista definidos nas margens do lago. *(Concluído em 2026-09-13 10:55)*
- [x] **Fase 1 (Plano Regional): Bloqueio Geográfico & Topografia Unificada:** Expansão da malha do terreno para 2.000m x 2.000m (4 km²) com suporte a 6 distritos e culling otimizado a 60 FPS. *(Concluído em 2026-09-13 11:35)*
- [x] **Fase 2 (Plano Regional): Posicionamento dos 6 Grandes Distritos e Notificação Territorial:**
  * Implementadas coordenadas-âncora no `gerador_cidade.gd`: Porto `(0, 0, 50)`, Mercado `(0, 0, -50)`, Sinagoga `(-150, 0, -200)`, Base da Comunidade `(200, 0, -100)`, Santuário do Monte `(-80, 45, -450)` e Vale das Cavernas `(380, 2, -250)`.
  * Distrito do Monte estruturado com cânion entre penhascos íngremes e cume a +45m de altitude com mirante panorâmico.
  * Distrito das Cavernas estruturado exclusivamente com tendas beduínas, paredões rochosos e a Grande Cachoeira animada de 26 metros (`cachoeira.gdshader`).
  * Sistema de Notificação Territorial cinemática no topo da tela (`DistrictBanner` no `hud.tscn` / `hud.gd` e monitoramento de perímetro no `district_manager.gd`). *(Concluído em 2026-09-13 11:55)*
- [x] **Fase 3 (Plano Regional): Traçado de Estradas e Biomas de Transição:**
  * **Malhas Físicas 3D de Estradas (`GeradorEstradas`):** Gerador procedural de tiras de estradas 3D (ribbons com coroamento central e elevação de 4-7cm) eliminando a dependência exclusiva de cores de vértices e garantindo visibilidade imediata de alto contraste em qualquer distância.
  * **Shader Dedicado de Estradas (`estrada_biblica.gdshader`):** Renderiza trilhas de pisoteio, bordas de cascalho escuro, ruído de seixos e transição procedural para lajes de calcário antigo (Caminho da Ascensão).
  * **Iluminação e Solo Rebalanceados (`environment_setup.tscn` e `main_world.gd`):** Correção do estouro de exposição branco; solo agora possui cor de areia dourada bíblica rica com normal maps orgânicos em triplanar; névoa ajustada para revelar montanhas e distritos sem lavar a tela.
  * **Marcos e Balizas Viárias:** Balizas de pedra a cada 15m nas margens das estradas e totens com lamparinas de fogo vivo em 9 cruzamentos estratégicos. *(Concluído em 2026-09-13 12:15)*
- [x] **Fase 4 (Plano Regional): Biomas, Micro-Cenografia e Montaria Ativa (Jumentinho):**
  * **Biomas em Massa (`GeradorBiomas`):** 750+ oliveiras mediterrâneas centenárias em vales férteis, 250+ tamareiras ao longo da orla do Mar da Galileia e na cascata, e 450+ tufos de campos de trigo dourados instanciados via `MultiMeshInstance3D` a 60 FPS lisos. *(Concluído em 2026-09-13 12:28)*
  * **Micro-Cenografia e Props de Época (`GeradorProps`):** Barracas de feira com toldos coloridos, pilhas de ânforas de cerâmica e caixotes no Mercado Central; píeres de madeira com mourões na água e varais com redes de pesca secando no Porto; grande fogueira acesa com luz dinâmica nas Cavernas; monólitos de pedra sagrada no Santuário do Monte; bancadas de carpintaria e toras na Base da Comunidade. *(Concluído em 2026-09-13 12:28)*
  * **Paredões de Cânion Monumentais:** 14 formações de rochas escarpadas (`cliff_rock_wall.glb`) ladeando a Trilha do Desfiladeiro até o cume a +45m e anfiteatro rochoso contínuo em ferradura circundando a Grande Cachoeira no Vale das Cavernas. *(Concluído em 2026-09-13 12:28)*
  * **Sistema de Montaria Ativa (`JumentoMontaria` / `jumento.tscn` / `jumento.gd`):** Jumento selado disponível no Mercado Central com prompt flutuante `[E] Montar no Jumento`, velocidade acelerada para 10.5 m/s, trote animado sincronizado com o movimento e câmera de 3ª pessoa adaptativa. Pressionar `E` desmonta a qualquer momento. *(Concluído em 2026-09-13 12:28)*
  * **Distribuição Temática de NPCs nos 6 Distritos:** Eremita orando nas Cavernas e Ancião no Santuário do Monte adicionados no `npc_spawner.gd`. *(Concluído em 2026-09-13 12:28)*

- [x] **Fase 5 (Geografia Orgânica & Level Design): Oásis Escondido, Cachoeira Acessível e Relevo Fractal AAA:**
  * **Topografia Fractal Orgânica (`bake_heightmap_tool.gd`):** Abandono de senos/cossenos duros; geração com `FastNoiseLite` (`TYPE_SIMPLEX_SMOOTH`, `FRACTAL_RIDGED`, 5 oitavas) gerando cordilheiras naturais de até +71m nas bordas Norte, Leste e Oeste com amplitude real `[-8.00m, 71.97m]`.
  * **Auto-Material por Inclinação (`terreno_pbr_slope.gdshader`):** Shader PBR que mapeia suavemente encostas planas ($0^\circ-15^\circ$) para terra/areia batida e escarpas rochosas ($>25^\circ$) para basalto vulcânico com triplanar vertical anti-distorção e detecção de leito subaquático.
  * **Oásis Escondido e Cascata Mansa (`gerador_cidade.gd`):** Reposicionamento da cachoeira da montanha para recesso na base da cordilheira (Noroeste: $X=-110, Z=-137$), com lago circular de água doce (`MeshInstance3D` com `stylized_water.gdshader`), cascata de ~9m e dois emissores `GPUParticles3D` (140 partículas de lâmina d'água caindo e 80 partículas de névoa/espuma na base).
  * **Cenografia de Camuflagem Natural:** Recesso circundado por 10 formações de penhascos de rocha com colisão Trimesh côncava (`cliff_rock_wall.glb`) e coroa densa de 15 tamareiras (`tamareira.obj`) escondendo o oásis da vista direta da vila.
  * **Trilha Orgânica e Caminhabilidade Garantida:** Traçado viário de terra batida úmida no `gerador_estradas.gd` (`TrilhaDoOasis` com `Path3D` + `CSGPolygon3D` e ruído celular com alpha nas bordas). Corredor escavado no Heightmap garantindo caminhabilidade contínua da praça até a cascata ($Y$ variando suavemente de $0.07\text{m}$ a $0.80\text{m}$, sem necessidade de pular ou escalar). *(Concluído em 2026-09-16 19:28)*
  * **Otimização Extrema de CPU & Geometria (Shape Sharing & CSG Light):** Shape sharing em cache (`ConcavePolygonShape3D`) implementado no `gerador_cidade.gd` para casas (`casa_antiga.glb`), arcos e rochas, reduzindo recálculo de física de 30x para 1x; subdivisões de malha do terreno com `SurfaceTool` limitadas a 128x128 quads ($\le 150$); estradas com `CSGPolygon3D` estritamente com `use_collision = false`, resolução de `Curve3D` reduzida (`bake_interval = 4.0`) e intervalo de extrusão ampliado de 1.6m para 3.2m cortando polígonos pela metade. *(Concluído em 2026-09-16 20:15)*
  * **Diretiva de Emergência: Máscara de Planície 250m & GPU PlaneMesh:** `bake_heightmap_tool.gd` atualizado com máscara absoluta de 250m de raio no centro (ruído zerado, Y = 0.0 cravado) e rebake do `heightmap_regional.exr`; substituição do SurfaceTool em runtime por `PlaneMesh` com Vertex Shader na GPU no `terrain_manager.gd` (zero travamento de thread de CPU); spawn de resgate do jogador movido para `Vector3(0, 5.0, 0)` em queda livre segura. *(Concluído em 2026-09-16 20:28)*
  * **Diretiva Crítica: Isolamento Remoto do Oásis & Prevenção de Duplicação Urbana:**
    - **Isolamento do Oásis:** Oásis movido para coordenadas remotas isoladas `X = -250.0, Z = -250.0` (a 355 metros do centro urbano da vila). As 10 formações de falésia (`cliff_rock_wall.glb`), o lago (`LagoOasis`), a cascata e as 15 tamareiras foram compactadas em um anfiteatro natural sem dispersão externa.
    - **Culling e Separação de Física Absoluta:** Distância mínima até a casa mais próxima elevada para mais de 51 metros (e mais de 350m da cidade central), eliminando 100% de qualquer possibilidade de contato ou sobreposição de colisões Trimesh (`ConcavePolygonShape3D`).
    - **Trava de Segurança Anti-Duplicação:** Flag booleana `_cidade_gerada` implementada no `gerador_cidade.gd` para barrar execuções duplicadas de `_ready()`; rotina `_limpar_elementos_duplicados()` e limpeza preventiva no início de `_generate_city()` adicionadas com `queue_free()` para purgar quaisquer nós residuais antes da geração.
    - **Trilha do Oásis Recalculada:** Traçado viário de terra batida `TrilhaDoOasis` no `gerador_estradas.gd` recalculado ligando a borda da vila `(-15, -56)` até a entrada do Oásis `(-250, -248)`. *(Concluído em 2026-09-16 20:45)*

---

### 🎯 Metodologia de Refinamento Cirúrgico: Distrito por Distrito (Padrão de Qualidade AAA)
- [x] **Câmera de Inspeção e Diagnóstico Fotográfico (Drone FreeCam):** `camera_inspector.gd` integrado no `main_world.tscn`. Tecla `[C]` ou `[F8]` ativa vôo livre noclip, teclas `[1]` a `[6]` teletransportam para vistas panorâmicas de cada distrito e tecla `[F12]` captura fotografias salvas em `res://screenshots/`. *(Concluído em 2026-09-13 12:40)*
- [🔄] **Marco 1 (EM ANDAMENTO): Refinamento Total do Distrito 1 - Porto dos Pescadores & Orla do Mar da Galileia:**
  * [x] **Expansão da terra firme da orla:** Água empurrada de z=35 para z=80 no `gerador_cidade.gd` e `main_world.gd`. 100% das casas dos pescadores assentadas sobre solo firme e seco com deck de tábuas na orla. *(Concluído em 2026-09-13 12:50)*
  * [x] **Limpeza e reposicionamento dos quebra-mares:** Removidas as pedras que obstruíam o centro da praia; rochas vulcânicas movidas estritamente para os promontórios externos laterais (x < -55 e x > 55), deixando a enseada e orla central amplas, limpas e navegáveis. *(Concluído em 2026-09-13 13:05)*
  * [x] **Barcos Bíblicos da Galileia (Texturas e Distribuição Náutica):** Textura original de madeira envelhecida vinculada ao `barco.obj` via `StandardMaterial3D`. 5 embarcações distribuídas cenograficamente: 2 no Píer Oeste (flanco e ponta), 2 no Píer Leste (flanco e bacia interna) e 1 barco inclinado na areia para calafetagem. *(Concluído em 2026-09-13 13:10)*
  * [x] **Tendas de Pescadores na Praia:** 4 tendas rústicas de lona texturizada (`tenda.obj` com `tenda_texture.png`) instaladas ao longo da praia e cais (entreposto de salga, oficina de reparo de redes, banca de venda de peixes e abrigo). *(Concluído em 2026-09-13 13:15)*
  * [x] **Micro-cenografia e Narrativa Bíblica (João 21:9):** Fogueira acesa com leito de brasas e luz dinâmica na praia (fogueira do peixe assado), cestos de vime trançado para pescados e talhas/ânforas de cerâmica de salmoura dispostas nos píeres e tendas. *(Concluído em 2026-09-13 13:20)*
  * [x] **Eliminação de Cápsulas Placeholder de NPCs:** Removida malha de cápsula genérica do `npc.tscn` e protegido o carregamento para exibir exclusivamente os modelos humanos 3D animados. *(Concluído em 2026-09-13 13:25)*
  * [x] **Ajuste de Presets da Câmera de Inspeção (1 a 6):** Presets de câmera apontando com enquadramento frontal perfeito para cada um dos distritos (tecla 1 agora enquadra a orla completa a partir do lago). *(Concluído em 2026-09-13 13:30)*
  * [x] **Estruturação das Pastas de Modelos 3D Externos:** Criadas pastas dedicadas com guias de uso em `client/assets/models/vegetacao/` e `client/assets/models/props/porto/` para recepção imediata dos novos assets criados pelo usuário. *(Concluído em 2026-09-13 13:39)*
  * [x] **Recepção e Extração Automatizada dos 14 Novos Modelos 3D do Usuário:** Extração, mapeamento de texturas PBR e padronização dos pacotes em `.obj` + `.png` para o cais, transição, 7 props portuários e 5 espécies arbóreas bíblicas. *(Concluído em 2026-09-13 14:49)*
  * [x] **Implantação do Cais de Basalto e Muretas 3D (Substituição de Píeres CSG):** Cais monumental de pedra instalado na linha d'água ($Z = 78$) com escadaria descendo para o mar e muretas laterais em declive conectando suavemente com a praia de areia. *(Concluído em 2026-09-13 15:04)*
  * [x] **Cenografia Completa do Porto com Props 3D Esculpidos:** Instalação do Telheiro/Abrigo de Palha, 3 Varais de Redes Drapeadas, Bancadas de Pescadores, Cestos de Peixes Frescos, Ânforas de Salga, Pilhas de Redes e Remos de Madeira espalhados pelo cais e orla. *(Concluído em 2026-09-13 15:04)*
  * [x] **Novo Bioma Arbóreo com 5 Espécies 3D Reais (`GeradorBiomas`):** Substituição completa das primitivas geométricas por malhas 3D detalhadas com texturas de alta definição via MultiMesh a 60 FPS: Olivais Centenários, Tamareiras Costeiras e de Oásis, Figueiras Bíblicas, Ciprestes de Colina e Terebintos de Encosta. *(Concluído em 2026-09-13 15:08)*
  * [🔄] **Refinamento Avançado do Cais & Ajustes Portuários (FOCO ATUAL):** Continuação da integração e refinamento de todos os modelos 3D dos cais, alinhamento estrutural, escadas, muretas e ajuste fino da área do cais do porto.
- [ ] **Marco 2 (A SEGUIR): Refinamento Total do Distrito 2 - Mercado Central:** Alinhamento de residências, praça comercial, toldos de feira e vias sem sobreposição.
- [ ] **Marco 3: Refinamento Total do Distrito 3 - Colina da Sinagoga e Bairro Romano:** Lajes de calcário, colunatas e esplanada elevada.
- [ ] **Marco 4: Refinamento Total do Distrito 4 - Base da Comunidade (Apoiadores Reais):** Layout da carpintaria, celeiros e área de base building.
- [ ] **Marco 5: Refinamento Total do Distrito 5 - Santuário do Monte & Cânion:** Garganta rochosa fechada, altar de oração e mirante panorâmico.
- [ ] **Marco 6: Refinamento Total do Distrito 6 - Vale das Cavernas, Tendas & Cachoeira:** Anfiteatro natural, tendas beduínas e bacia da cascata.
- [ ] **Fase 5 (Plano Regional): Base Building Comunitário:** Slots de construção para as bases e missões dos apoiadores reais (Pastor Adriano, William e Felipe).
- [ ] **Ciclo Dia/Noite e Clima:** Implementar o sistema de passagem de tempo (rotação do sol) e variação climática (chuva).
- [ ] **Iluminação de Época:** Configurar iluminação noturna baseada em Lua, estrelas e fogo (tochas/lamparinas para os NPCs).
- [ ] **NPCs Vivos e Funcionais:** Implementar rotinas de IA para os NPCs.
- [ ] **Áudio Espacial e Ambiental:** Implementar som de proximidade contínuo (mar, chuva, feira da vila).
- [ ] **Interface do Mapa Antigo:** Criar o mapa estilo pergaminho para gerenciar a vila.

## 🔴 Fase 3: Roteiro, Evangelismo, Gestão de Comunidade e Vocações

### 🎬 Sistemas Narrativos e Missões

- [ ] **[PENDENTE / PLANEJADO] Sistema de Cutscenes In-Engine com Transição Suave (Estilo GTA V)**
  * **Objetivo:** Permitir que o jogador entre em marcas de missão pelo mapa e transite diretamente para conversas cinematográficas com NPCs sem telas pretas de carregamento e sem arquivos de vídeo pré-renderizados (.mp4), devolvendo o controle da gameplay com fluidez.
  * **Arquitetura Técnica Prevista:**
    1. **Gatilhos de Missão e Hand-Off (`mission_trigger.gd`):**
       - Criação de nó `Area3D` com colisão em raio de aproximação.
       - Ao aceitar o diálogo, bloqueia os inputs do jogador (`set_physics_process(false)`).
       - Movimentação assistida (caminhada automática curta de 1 a 2 passos até alinhar a rotação do Peregrino de frente para o NPC).
    2. **Gerenciador de Câmera Cinematográfica (`cutscene_manager.gd`):**
       - Transição interpolada (Tween de `global_transform` ou integração com o addon *Phantom Camera*).
       - Saída da visão de 3ª pessoa padrão para enquadramentos de plano médio e close-up com profundidade de campo (DoF).
    3. **Sincronização de Cena (`AnimationPlayer` / Timeline):**
       - Execução de animações corporais, gesticulação e falas de áudio com legendas na UI.
       - Alternância de planos de câmera de acordo com o personagem que estiver falando.
    4. **Retorno Contínuo de Gameplay (Blend-Out):**
       - Interpolação suave da câmera cinemática de volta para o `CameraPivot` do Player (duração de ~1.2s).
       - Restauração automática do HUD de exploração e destravamento dos controles do personagem.

- [ ] **Transição de Protagonista:** Prólogo jogando com Jesus, seguido da transição para o Peregrino.
* [ ] **O Ciclo de Evangelismo e Batismo:** Sistema de diálogo persuasivo e conversão na água (shader de purificação).
* [ ] **Sistema de Crises da Comunidade:** Eventos dinâmicos onde a vila sofre crises (tentações, falta de recursos).
* [ ] **Progressão de Mapas:** Travar Samaria e Jerusalém até que a comunidade de Cafarnaum seja autossuficiente.
* [ ] **Multiplayer de Mentoria:** Convidar amigos para serem discipulados na sua comunidade.
* [ ] **Bioma Deserto:** Missões de isolamento e provação.
* [ ] **Sistema de Nomes Únicos:** Criar o `nomes_biblicos.json` e a lógica de sorteio sem reposição no backend.
* [ ] **Geração Modular Visual:** Configurar o `Material Override` de cores, variação de escala matemática e os *toggles* de acessórios nos modelos 3D dos NPCs.
* [ ] **Limite de Inventário:** Restringir o inventário do player a 3 slots e programar os alforjes do Jumentinho como baú móvel principal.
* [ ] **Atribuição de Vocações:** Script para designar função (Pescador, Médico, etc) ao NPC convertido.
* [ ] **Mentoria de IA:** Comando "Siga-me" para que o NPC convertido navegue acompanhando o player de forma autônoma.

## 🛡️ Fase 4: Missões, Dons e Expansão Apostólica

- [x] **Gerenciador Global de Missões e Diretor de Spawn:** Criados `mission_manager.gd` (rastreio de Eixos 1 e 2, trava de expansão e resolução de Paulo e Silas na Prisão Romana, destravando migração global) e `spawn_director.gd` (Timer de 60s, fórmula matemática de escalonamento populacional `limite_sombras_ativas = clamp(base_sombras + (total_discípulos * 1.2), min_sombras, max_engine_limit)` e injeção dinâmica de ameaças). *(Concluído em 2026-09-23 18:43)*
- [x] **Eventos de Ameaça (IA Inimiga):** Programada variação comportamental dos NPCs "Fariseus" (Aura Vermelha, bloqueio de diálogo e quiz, pacificação com Palavra de Sabedoria) e "Oprimidos" (Aura Escura, velocidade 1.5x em fuga, dreno contínuo de fé e libertação com Dons de Curar) em `npc.gd` e `npc_state_machine.gd`. *(Concluído em 2026-09-23 18:43)*
- [x] **Cerco à Base (Base Defense):** Implementado motor de cerco espiritual em `base_building_manager.gd` (`trigger_spiritual_siege`) com dreno global de -2.0 de Fé/s, nuvem de opressão visual e purificação através de Operação de Milagres com conversão de líderes invasores. *(Concluído em 2026-09-23 18:43)*
- [x] **Escalonamento de Dons:** Atualizado `spiritual_gifts_manager.gd` com níveis de autoridade (Iniciante, Discípulo e Mestre), expansão de raio até 15m para Cura, 18m para Sabedoria e 35m para Milagres, integrado com `IdleManager` e AutoLoads. *(Concluído em 2026-09-23 18:43)*
- [x] **Sistema Interativo de Coleta 3D (Item Pickup):** Criado `item_pickup.gd` (Area3D com efeito diegético de flutuação e rotação sutil, detecção de proximidade do Peregrino, avisos na HUD via `exibir_dica` / `ocultar_dica`), integrado à tecla [E] (`interact`) e ao `InventoryManager` (`adicionar_item`) com `queue_free()` após a coleta. Reutilizável via `item_pickup.tscn`. *(Concluído em 2026-09-23 21:28)*
- [ ] **Motor de Missões Procedurais:** Programar o gerador de missões de Sobrevivência e Escolta (Eixo 3) para movimentar NPCs entre a base e as zonas de coleta.

## 🚀 Fase 5: Build Comercial e Infraestrutura

- [ ] **Infraestrutura de Servidor e API:** VPS e deploy do FastAPI.
* [ ] **Integração PIX (FastAPI):** Rota de geração de QR Code e Webhook para liberar skins da Armadura de Deus via oferta voluntária.
* [ ] **Empacotamento:** Compilar `.exe` e `.apk`.
