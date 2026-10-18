/* ==========================================================================
   CAMADA DE DADOS E LÓGICA DE NEGÓCIO: PEREGRINO
   Fórmula de Cotas (49% Pool / 51% Criador), Devlog em Tempo Real e Hash SHA-256
   ========================================================================== */

const Store = {
  // Configuração Institucional e Modelo Comercial
  config: {
    gameName: "Peregrino",
    studioName: "Haja Luz Studio",
    companyLegalName: "Andressa do Prado Costa Corá", // Razão Social / Contrato Social
    tradeName: "Haja Luz Studio", // Nome Fantasia
    cnpj: "61.511.844/0001-91",
    city: "Passo Fundo",
    state: "RS",
    creatorShare: 51, // % permanente do Criador / Estúdio
    supportersPool: 49, // % distribuída
    targetFundingDevPhase: 120000, // R$ teto da fase de desenvolvimento
    pioneerRiskFactor: 1.25, // Multiplicador de fase de alto risco (Fase 2 MVP)
    engine: "Godot 4.x + Shaders Cel-Shading Otimizados",
    targetFPS: "60 FPS Cravados",
    cullingTechniques: "Distance Culling (120m) + Simulation Culling + MultiMeshInstance3D",
    lastGodotSync: "10/10/2026 11:48:53 (UTC)",
    godotProjectPath: "D:/HAJA LUZ/Antigravity/Dados_IA/scratch/O Peregrino",
    godotEngineVersion: "Godot 4.7.2 Stable (win64)",
    realTasksTotal: 107,
    realTasksDone: 64,
    realTasksPending: 41,
    realOverallProgress: 60,
  },

  // Dados Oficiais de Pagamento e Oferta Missionária PIX
  pix: {
    keyFormatted: "61.511.844/0001-91",
    keyRaw: "61511844000191",
    keyType: "CNPJ",
    legalName: "Andressa do Prado Costa Corá",
    tradeName: "Haja Luz Studio",
    beneficiary: "Haja Luz Studio",
    city: "PASSO FUNDO",
    state: "RS",
    location: "Passo Fundo/RS",
    payload: "00020101021126360014br.gov.bcb.pix0114615118440001915204000053039865802BR5915HAJA LUZ STUDIO6011PASSO FUNDO62070503***63044D66"
  },

  // Usuários Oficiais Cadastrados no Sistema de Governança
  users: [
    {
      id: "USR-001",
      email: "hajaluzstudio@gmail.com",
      aliases: ["diretoria@hajaluzstudio.com", "admin@peregrino.org"],
      password: "sophia11052016",
      name: "Haja Luz Studio",
      legalName: "Andressa do Prado Costa Corá",
      cnpj: "61.511.844/0001-91",
      role: "creator", // Administrador & Criador Soberano (Superadmin)
      title: "Diretoria & Criador Master (Superadmin)",
      institution: "Haja Luz Studio • CNPJ 61.511.844/0001-91",
      avatarLetter: "HL",
      canEditKanban: true,
      canSyncGodot: true,
      canPostDevlog: true,
      totalRaised: 14400.0,
      allocatedPool: 6.00, // 6% distribuídos entre os apoiadores pioneiros
      availablePool: 43.00
    },
    {
      id: "INV-0702",
      email: "williamromani@peregrino.org",
      aliases: ["william@hajaluz.org"],
      password: "william2026",
      name: "William Romani",
      legalName: "William Romani",
      role: "creator", // Superadmin Criador
      title: "Superadmin & Gestão Haja Luz",
      institution: "Haja Luz Studio",
      avatarLetter: "WR",
      phone: "(11) 97654-3210",
      joinDate: "20/01/2026",
      monthlyContribution: 0,
      monthsCommitted: 12,
      totalInvested: 4800.0,
      weightedValue: 6000.0,
      equitySharePercent: 2.00,
      canEditKanban: true,
      canSyncGodot: true,
      canPostDevlog: true
    }
  ],

  // Sessão Ativa
  auth: {
    isLoggedIn: false,
    currentUser: null
  },

  // Perfil Ativo (Alternável entre Apoiador e Criador)
  currentRole: "supporter", // 'supporter' ou 'creator'

  // Investidor Padrão
  currentInvestor: null,

  // Contratos e Termos de Adesão de Apoiadores (Hash SHA-256 e Auditoria Cloud)
  contracts: [],

  // As 7 Bases Estratégicas de Sobrevivência e Gestão Comunitária (State of Decay)
  bases: [
    {
        "id": 1,
        "name": "Base Comunitária Principal (Platô Leste)",
        "column": "testing",
        "progress": 80,
        "capacity": "20 a 35 residentes",
        "role": "Sede Geral de Operações Comunitárias",
        "description": "Platô leste estruturado com os 3 lotes de base building dos patrocinadores pioneiros, carpintaria, bancadas e motor de defesa contra cercos espirituais.",
        "vocations": [
            "Carpinteiro",
            "Agricultor",
            "Guarda"
        ],
        "peacefulConversion": "Dons de Curas (raio 15m) e Defesa de Base",
        "status": "Ativa (Sede Operacional)",
        "checklist": [
            {
                "title": "Platô demarcado de 14m x 14m com vigas de ancoragem",
                "done": true
            },
            {
                "title": "Bancadas de carpintaria e toras de madeira funcionais",
                "done": true
            },
            {
                "title": "Integração do motor de dreno de fé (-2.0 Fé/s em cerco)",
                "done": true
            },
            {
                "title": "Notificações na HUD de alerta e vitória de defesa de base",
                "done": true
            },
            {
                "title": "Celeiro automatizado de trigo e alimentos coletados",
                "done": false
            }
        ]
    },
    {
        "id": 2,
        "name": "Lote Pr. Adriano (Conselheiro Espiritual)",
        "column": "in_progress",
        "progress": 67,
        "capacity": "Pilar de Fé da Vila",
        "role": "Tenda de Oração & Santificação",
        "description": "Lote oficial do Pastor Adriano na Base Comunitária. Concede o bônus comunitário de +25% de Fé global e desbloqueia diálogos pastorais de contenção de crises.",
        "vocations": [
            "Conselheiro",
            "Intercessor"
        ],
        "peacefulConversion": "Palavra de Sabedoria e Oração Intercessória",
        "status": "Tenda N1 e Mesh Swap N2 prontos",
        "checklist": [
            {
                "title": "Lote demarcado com totem iluminado 'Lote Adriano'",
                "done": true
            },
            {
                "title": "Tenda Nível 1 instanciada e visível",
                "done": true
            },
            {
                "title": "Construção de pedra Nível 2 e motor de upgrade com poeira dourada",
                "done": true
            },
            {
                "title": "Bônus passivo de +25% de Fé ativado via base_building_manager",
                "done": true
            },
            {
                "title": "Modelo 3D customizado dedicado do Pastor Adriano",
                "done": false
            },
            {
                "title": "Árvore de diálogos pastorais para pacificar NPCs rebeldes",
                "done": false
            }
        ]
    },
    {
        "id": 3,
        "name": "Lote William (Gestão de Suprimentos)",
        "column": "in_progress",
        "progress": 67,
        "capacity": "Armazém Central de Recursos",
        "role": "Pilar Logístico & Stash Comunitário",
        "description": "Lote oficial de William na Base Comunitária. Concede +30% de capacidade de Stash/estoque geral da comunidade e centraliza o fluxo de pães e peixes.",
        "vocations": [
            "Administrador",
            "Logístico"
        ],
        "peacefulConversion": "Gestão Eficiente e Distribuição Justa",
        "status": "Tenda N1 e Mesh Swap N2 prontos",
        "checklist": [
            {
                "title": "Lote demarcado com totem iluminado 'Lote William'",
                "done": true
            },
            {
                "title": "Tenda Nível 1 instanciada e visível",
                "done": true
            },
            {
                "title": "Construção de pedra Nível 2 e motor de upgrade funcional",
                "done": true
            },
            {
                "title": "Bônus passivo de +30% de capacidade de Stash ativado",
                "done": true
            },
            {
                "title": "Modelo 3D dedicado de William com avental de mercador",
                "done": false
            },
            {
                "title": "Missões de transporte de suprimentos entre os entrepostos",
                "done": false
            }
        ]
    },
    {
        "id": 4,
        "name": "Lote Felipe (Batedor e Patrulha)",
        "column": "in_progress",
        "progress": 67,
        "capacity": "Posto Avançado de Reconhecimento",
        "role": "Pilar de Exploração & Velocidade",
        "description": "Lote oficial de Felipe na Base Comunitária. Concede +20% de velocidade de movimento comunitária e radar antecipado de aproximação de ameaças espirituais.",
        "vocations": [
            "Batedor",
            "Rastreador"
        ],
        "peacefulConversion": "Discernimento de Trilhas Seguras",
        "status": "Tenda N1 e Mesh Swap N2 prontos",
        "checklist": [
            {
                "title": "Lote demarcado com totem iluminado 'Lote Felipe'",
                "done": true
            },
            {
                "title": "Tenda Nível 1 instanciada e visível",
                "done": true
            },
            {
                "title": "Construção de pedra Nível 2 e motor de upgrade funcional",
                "done": true
            },
            {
                "title": "Bônus passivo de +20% de velocidade de movimento ativado",
                "done": true
            },
            {
                "title": "Modelo 3D dedicado de Felipe com manto de explorador",
                "done": false
            },
            {
                "title": "Missões de patrulha das fronteiras contra Cerco Espiritual",
                "done": false
            }
        ]
    },
    {
        "id": 5,
        "name": "Entreposto dos Pescadores (Prainha de Simão)",
        "column": "testing",
        "progress": 80,
        "capacity": "15 residentes",
        "role": "Pólo Pesqueiro & Salga",
        "description": "Base costeira integrada ao cais de basalto com 5 barcos, tendas de salga e geração passiva de peixes salgados para o estoque da comunidade.",
        "vocations": [
            "Pescador",
            "Salgador de Peixes"
        ],
        "peacefulConversion": "Operação de Milagres no Mar",
        "status": "Cais de Basalto e Barcos Concluídos",
        "checklist": [
            {
                "title": "Atracadouro de pedra com escadaria e muretas em declive",
                "done": true
            },
            {
                "title": "Bancadas de limpeza e talhas de salga de peixes frescas",
                "done": true
            },
            {
                "title": "Geração periódica de alimento pelo IdleManager",
                "done": true
            },
            {
                "title": "Sistema de alforje de transporte com o Jumentinho montado",
                "done": true
            },
            {
                "title": "Minigame da Pesca Maravilhosa com rede lançada",
                "done": false
            }
        ]
    },
    {
        "id": 6,
        "name": "Refúgio do Cânion das Cavernas",
        "column": "in_progress",
        "progress": 60,
        "capacity": "25 residentes",
        "role": "Posto Médico & Ervas das Grutas",
        "description": "Base defensiva oculta nas grutas do cânion, com água abundante da cachoeira e abrigo imune a cercos de planície.",
        "vocations": [
            "Apoticário",
            "Curador"
        ],
        "peacefulConversion": "Dons de Curar em Massa",
        "status": "Tendas Beduínas e Fogueira Prontas",
        "checklist": [
            {
                "title": "Anfiteatro natural em ferradura com colisão côncava",
                "done": true
            },
            {
                "title": "Tendas beduínas e grande fogueira com iluminação de época",
                "done": true
            },
            {
                "title": "Presença do Eremita em intercessão contínua",
                "done": true
            },
            {
                "title": "Canteiros de ervas medicinais nas encostas úmidas",
                "done": false
            },
            {
                "title": "Enfermaria das grutas com leitos para convertidos feridos",
                "done": false
            }
        ]
    },
    {
        "id": 7,
        "name": "Cidadela do Monte (Santuário Final)",
        "column": "in_progress",
        "progress": 50,
        "capacity": "50+ residentes",
        "role": "Mega Base e Centro Apostólico Regional",
        "description": "Ponto culminante da gestão comunitária no cume a +45m de altitude, abrigando os 12 apóstolos e a congregação central da Galileia.",
        "vocations": [
            "Todas as 5 Vocações Bíblicas"
        ],
        "peacefulConversion": "Consolidação e Envio Apostólico Global",
        "status": "Topografia a +45m Concluída (Fase Final)",
        "checklist": [
            {
                "title": "Cume do monte a +45m esculpido no Heightmap 2.400m",
                "done": true
            },
            {
                "title": "Altar de pedras brutas e mirante panorâmico modelados",
                "done": true
            },
            {
                "title": "Terraços agrícolas de oliveiras e vinhas nas encostas",
                "done": false
            },
            {
                "title": "Complexo habitacional de alvenaria e santuário dos 12 apóstolos",
                "done": false
            }
        ]
    }
],

  // Os 7 Distritos da Cidade Fictícia Monumental (Estruturados em Kanban)
  districts: [
    {
        "id": 1,
        "name": "Porto dos Pescadores & Orla",
        "column": "testing",
        "progress": 89,
        "image": "assets/img/Distrito 01 (1).png",
        "imageFull": "assets/img/Distrito 01 (1).png",
        "gallery": [
            "assets/img/Distrito 01 (1).png",
            "assets/img/Distrito 01 (2).png",
            "assets/img/Distrito 01 (3).png",
            "assets/img/Distrito 01 (4).png",
            "assets/img/Distrito 01 (5).png",
            "assets/img/Distrito 01 (6).png",
            "assets/img/Distrito 01 (7).png",
            "assets/img/Distrito 01 (8).png"
        ],
        "architecture": "Cais de basalto 3D monumental, barcos bíblicos e muretas em declive",
        "description": "Orla do Mar da Galileia assentada em terra firme, cais de pedra com escadaria, barcos bíblicos (StandardMaterial3D madeira), 4 tendas rústicas, fogueira do peixe assado (João 21:9) e props portuários esculpidos.",
        "poi": "Cais de Basalto, Fogueira de João 21:9, Píeres Leste/Oeste, Enseada Livre",
        "status": "Refinamento Avançado do Cais (Foco Atual)",
        "drawCalls": "MultiMeshInstance3D a 60 FPS cravados",
        "checklist": [
            {
                "title": "Expansão da terra firme da orla (água empurrada para z=80)",
                "done": true
            },
            {
                "title": "Limpeza de quebra-mares (rochas restritas aos promontórios laterais)",
                "done": true
            },
            {
                "title": "5 Barcos Bíblicos da Galileia distribuídos (Píer Leste/Oeste e calafetagem)",
                "done": true
            },
            {
                "title": "4 Tendas rústicas de pescadores na praia (salga, reparo de redes, peixes)",
                "done": true
            },
            {
                "title": "Fogueira histórica de brasas com luz dinâmica (João 21:9) e ânforas",
                "done": true
            },
            {
                "title": "Eliminação de cápsulas placeholder e ativação dos modelos humanos 3D",
                "done": true
            },
            {
                "title": "Implantação do Cais de Basalto com escadaria e muretas 3D",
                "done": true
            },
            {
                "title": "Cenografia com 14 novos props 3D (telheiros, cestos, redes, remos)",
                "done": true
            },
            {
                "title": "Refinamento de alinhamento estrutural dos cais e transições finas",
                "done": false
            }
        ]
    },
    {
        "id": 2,
        "name": "Mercado Central",
        "column": "in_progress",
        "progress": 67,
        "image": "assets/img/Distrito 02 (1).png",
        "imageFull": "assets/img/Distrito 02 (1).png",
        "gallery": [
            "assets/img/Distrito 02 (1).png",
            "assets/img/Distrito 02 (2).png",
            "assets/img/Distrito 02 (3).png",
            "assets/img/Distrito 02 (4).png",
            "assets/img/Distrito 02 (5).png",
            "assets/img/Distrito 02 (6).png",
            "assets/img/Distrito 02 (7).png",
            "assets/img/Distrito 02 (8).png",
            "assets/img/Distrito 02 (9).png"
        ],
        "architecture": "Arcos de alvenaria transitáveis, toldos de feira e basalto",
        "description": "Núcleo urbano central de Cafarnaum (coordenada 0, 0, -50) com barracas de comércio (toldos terracota, anil e linho), poço comunitário, feira livre e ponto de montaria ativa do jumentinho.",
        "poi": "Poço Comunitário, Ponto de Montaria [E], Balcões de Oleiros, Toldos Têxteis",
        "status": "Marco 2: Em alinhamento de vias sem sobreposição",
        "drawCalls": "Colisões côncavas Trimesh compartilhadas",
        "checklist": [
            {
                "title": "Barracas históricas de comércio com toldos coloridos e balcões",
                "done": true
            },
            {
                "title": "Pilhas de caixotes e ânforas nas margens das avenidas principais",
                "done": true
            },
            {
                "title": "Sistema de Montaria Ativa do Jumentinho selado [E] a 10.5 m/s",
                "done": true
            },
            {
                "title": "Colisões côncavas precisas em 24 casas antigas (create_trimesh_collision)",
                "done": true
            },
            {
                "title": "Alinhamento de residências e vias comerciais sem sobreposição",
                "done": false
            },
            {
                "title": "LOD dinâmico para feirantes e clientes em horário de pico",
                "done": false
            }
        ]
    },
    {
        "id": 3,
        "name": "Colina da Sinagoga e Bairro Romano",
        "column": "in_progress",
        "progress": 67,
        "image": "assets/img/Distrito 03 (1).png",
        "imageFull": "assets/img/Distrito 03 (1).png",
        "gallery": [
            "assets/img/Distrito 03 (1).png",
            "assets/img/Distrito 03 (2).png",
            "assets/img/Distrito 03 (3).png",
            "assets/img/Distrito 03 (4).png",
            "assets/img/Distrito 03 (5).png",
            "assets/img/Distrito 03 (6).png",
            "assets/img/Distrito 03 (7).png",
            "assets/img/Distrito 03 (8).png"
        ],
        "architecture": "Calcário claro monumental, colunatas e esplanada elevada",
        "description": "Colina monumental em (-150, 0, -200) com Sinagoga em calcário claro, esplanada elevada com Maria Madalena e guarnição romana com sistema de cerco e prisão de Paulo e Silas.",
        "poi": "Sinagoga Histórica, Alameda Monumental de 38 Ciprestes, Prisão Romana",
        "status": "Marco 3: Modelagem de interiores e rolos sagrados",
        "drawCalls": "Física ancorada StaticBody3D Layer 1 / Mask 1",
        "checklist": [
            {
                "title": "Colisões Trimesh da Sinagoga e arcos monumentais",
                "done": true
            },
            {
                "title": "Alameda monumental de 38 Ciprestes pelo Caminho da Ascensão",
                "done": true
            },
            {
                "title": "Física de milagres do Terremoto na Prisão Romana (RigidBody3D e poeira)",
                "done": true
            },
            {
                "title": "Conversão do carcereiro romano para Ouvinte (Cinza)",
                "done": true
            },
            {
                "title": "Lajes de calcário antigo e colunatas da esplanada elevada",
                "done": false
            },
            {
                "title": "Interior da sala de rolos dos escribas e pergaminhos",
                "done": false
            }
        ]
    },
    {
        "id": 4,
        "name": "Base da Comunidade (Apoiadores Reais)",
        "column": "in_progress",
        "progress": 71,
        "image": "assets/img/distrito_4_base_web.jpg",
        "imageFull": "assets/img/distrito_4_base_comunidade_real.jpg",
        "architecture": "Platô leste 14x14m com totens iluminados e tendas de apoiadores",
        "description": "Platô leste em (200, 0, -100) com as fundações oficiais dos investidores pioneiros do Haja Luz Studio: Lote Adriano (Conselheiro), Lote William (Suprimentos) e Lote Felipe (Batedor), com motor de upgrade de tenda Nível 1 para pedra Nível 2.",
        "poi": "Lote Pr. Adriano, Lote William, Lote Felipe, Bancada de Carpintaria",
        "status": "Líderes NPCs e Slots Ativos (+25% Fé, +30% Stash)",
        "drawCalls": "Otimizado 60 FPS cravados",
        "checklist": [
            {
                "title": "3 Fundações demarcadas (14m x 14m) com moldura de vigas e totens",
                "done": true
            },
            {
                "title": "Tendas Nível 1 e construções Nível 2 (visible swap) implementadas",
                "done": true
            },
            {
                "title": "Líderes Apoiadores Reais posicionados com prompt [E] de interação",
                "done": true
            },
            {
                "title": "Motor de upgrade e bônus comunitários (+25% Fé, +30% Stash, +20% Vel)",
                "done": true
            },
            {
                "title": "Motor de Defesa de Base contra Cercos Espirituais (-2.0 Fé/s dreno)",
                "done": true
            },
            {
                "title": "Modelagem 3D personalizada exclusiva dos avatares dos apoiadores",
                "done": false
            },
            {
                "title": "Missões pastorais específicas de oração e contenção de crises",
                "done": false
            }
        ]
    },
    {
        "id": 5,
        "name": "Santuário do Monte & Cânion",
        "column": "in_progress",
        "progress": 67,
        "image": "assets/img/distrito_5_monte_web.jpg",
        "imageFull": "assets/img/distrito_5_santuario_monte_real.jpg",
        "architecture": "Cume panorâmico a +45m de altitude com cânion rochoso",
        "description": "Platô elevado em (-80, 45, -450) acessado pelo Desfiladeiro do Monte, cercado por 14 formações de rochas escarpadas, monólitos sagrados de oração e Ancião de oração.",
        "poi": "Altar de Pedras Brutas, Mirante Panorâmico a +45m, Desfiladeiro de Penhascos",
        "status": "Marco 5: Estrutura topográfica e cânion prontos",
        "drawCalls": "Heightmap 2.400m sem paredões artificiais flutuantes",
        "checklist": [
            {
                "title": "Topografia a +45m com cânion entre penhascos íngremes",
                "done": true
            },
            {
                "title": "Monólitos de pedra sagrada e Ancião em oração no cume",
                "done": true
            },
            {
                "title": "Eliminação de paredões flutuantes via Heightmap nativo",
                "done": true
            },
            {
                "title": "Trilha do Desfiladeiro com marcos de pedra e iluminação noturna",
                "done": true
            },
            {
                "title": "Shader de transição para altar de pedras brutas e mirante",
                "done": false
            },
            {
                "title": "Evento cinematográfico do Sermão da Montanha",
                "done": false
            }
        ]
    },
    {
        "id": 6,
        "name": "Vale das Cavernas, Tendas & Cachoeira",
        "column": "in_progress",
        "progress": 67,
        "image": "assets/img/distrito_6_cavernas_web.jpg",
        "imageFull": "assets/img/distrito_6_vale_cavernas_real.jpg",
        "architecture": "Anfiteatro rochoso natural, Grande Cachoeira de 26m e tendas beduínas",
        "description": "Vale rústico em (380, 2, -250) com anfiteatro natural em ferradura, tendas beduínas, Eremita orando, grande fogueira com luz dinâmica e Grande Cachoeira animada (cachoeira.gdshader).",
        "poi": "Grande Cachoeira 26m, Tendas Beduínas, Fogueira das Cavernas, Eremita",
        "status": "Marco 6: Cenografia e shader de água ativa",
        "drawCalls": "Cachoeira via GPU Shader + GPUParticles3D",
        "checklist": [
            {
                "title": "Grande Cachoeira de 26 metros animada com cachoeira.gdshader",
                "done": true
            },
            {
                "title": "Anfiteatro rochoso contínuo em ferradura com colisão Trimesh",
                "done": true
            },
            {
                "title": "Tendas beduínas e fogueira rústica com luz dinâmica",
                "done": true
            },
            {
                "title": "NPC Eremita em oração integrado ao npc_spawner",
                "done": true
            },
            {
                "title": "Sistema de coleta de ervas medicinais nas encostas úmidas",
                "done": false
            },
            {
                "title": "Interiores transitáveis de grutas para refúgio em crises",
                "done": false
            }
        ]
    },
    {
        "id": 7,
        "name": "Oásis Escondido Distante",
        "column": "in_progress",
        "progress": 71,
        "image": "assets/img/distrito_7_oasis_web.jpg",
        "imageFull": "assets/img/distrito_7_oasis_distante_real.jpg",
        "architecture": "Lago circular de água doce, cascata mansa e coroa de tamareiras",
        "description": "Distrito 7 localizado remotamente em X = -900.0, Z = -900.0 (escala 2.400m x 2.400m), isolado da vila por cânions naturais com cascata de 9m, partículas GPUParticles3D e 15 tamareiras da Judeia.",
        "poi": "Lago de Água Doce, Cascata Mansa 9m, Bosque de 15 Tamareiras, Câmera KEY_7",
        "status": "Topografia fractal 2.400m e isolamento sem sobreposição",
        "drawCalls": "Shape sharing em cache + SurfaceTool 128x128",
        "checklist": [
            {
                "title": "Expansão territorial regional para 2.400m x 2.400m (4.198.401 vértices)",
                "done": true
            },
            {
                "title": "Relocação remota do Oásis para X = -900, Z = -900 prevenindo sobreposição",
                "done": true
            },
            {
                "title": "Lago circular com stylized_water.gdshader e cascata de 9m",
                "done": true
            },
            {
                "title": "Dois emissores GPUParticles3D (lâmina d'água e névoa/espuma)",
                "done": true
            },
            {
                "title": "Coroa de 15 tamareiras camuflando o oásis da vista direta da vila",
                "done": true
            },
            {
                "title": "Reativação da malha física CSGPolygon3D da Trilha do Oásis",
                "done": false
            },
            {
                "title": "Posto avançado de descanso para caravanas distantes",
                "done": false
            }
        ]
    }
],

  // Feed do Devlog em Tempo Real com Fotos e Vídeos (Atualizações Oficiais)
  devlogPosts: [
    {
        "id": "DEV-205",
        "title": "Distrito 01: Porto dos Pescadores & Cais de Basalto (8 Novas Capturas 3D)",
        "category": "Level Design & Orla 3D",
        "badgeType": "engine",
        "date": "16/10/2026",
        "author": "Haja Luz Studio (Dev Principal)",
        "summary": "Atualização visual massiva do Distrito 01: o Cais de Basalto monumental recebeu novos ângulos de câmera, ancoradouros de barcos bíblicos da Galileia, tendas de salga de peixes e iluminação natural de orla.",
        "mediaType": "image",
        "mediaUrl": "assets/img/Distrito 01 (1).png",
        "caption": "Captura 3D Real (Distrito 01): Cais de Basalto monumental com barcos e praia dos pescadores.",
        "gallery": [
            "assets/img/Distrito 01 (1).png",
            "assets/img/Distrito 01 (2).png",
            "assets/img/Distrito 01 (3).png",
            "assets/img/Distrito 01 (4).png",
            "assets/img/Distrito 01 (5).png",
            "assets/img/Distrito 01 (6).png",
            "assets/img/Distrito 01 (7).png",
            "assets/img/Distrito 01 (8).png"
        ],
        "tags": [
            "Distrito 1",
            "Porto dos Pescadores",
            "Cais de Basalto",
            "Godot 4.7.2",
            "Galileia 3D"
        ]
    },
    {
        "id": "DEV-204",
        "title": "Distrito 02: Mercado Central de Cafarnaum — Arcos, Vielas e Comércio (9 Capturas)",
        "category": "Arquitetura Histórica & Comércio",
        "badgeType": "engine",
        "date": "16/10/2026",
        "author": "Haja Luz Studio (Dev Principal)",
        "summary": "Bateria de 9 novas capturas do Distrito 02 revelando o labirinto de ruas de Cafarnaum: pórticos de pedra maciça, barracas de feirantes com tecidos rústicos, praças de montaria de jumentos e rotas comerciais em terra batida.",
        "mediaType": "image",
        "mediaUrl": "assets/img/Distrito 02 (1).png",
        "caption": "Captura 3D Real (Distrito 02): Mercado Central de Cafarnaum com arcos de pedra e toldos têxteis.",
        "gallery": [
            "assets/img/Distrito 02 (1).png",
            "assets/img/Distrito 02 (2).png",
            "assets/img/Distrito 02 (3).png",
            "assets/img/Distrito 02 (4).png",
            "assets/img/Distrito 02 (5).png",
            "assets/img/Distrito 02 (6).png",
            "assets/img/Distrito 02 (7).png",
            "assets/img/Distrito 02 (8).png",
            "assets/img/Distrito 02 (9).png"
        ],
        "tags": [
            "Distrito 2",
            "Mercado Central",
            "Comércio Bíblico",
            "Godot 4.7.2",
            "Level Design"
        ]
    },
    {
        "id": "DEV-203",
        "title": "Distrito 03: Colina da Sinagoga — Calcário Monumental e Cidadela Elevada (8 Capturas)",
        "category": "Cenografia Monumental",
        "badgeType": "engine",
        "date": "16/10/2026",
        "author": "Haja Luz Studio (Dev Principal)",
        "summary": "Imersão completa no Distrito 03 com 8 capturas da Colina da Sinagoga: esplanada cerimonial em calcário branco, pátios de oração, colunatas antigas, postos de guarda romana e mirante panorâmico do Mar da Galileia.",
        "mediaType": "image",
        "mediaUrl": "assets/img/Distrito 03 (1).png",
        "caption": "Captura 3D Real (Distrito 03): Colina da Sinagoga monumental esculpida em calcário e esplanada.",
        "gallery": [
            "assets/img/Distrito 03 (1).png",
            "assets/img/Distrito 03 (2).png",
            "assets/img/Distrito 03 (3).png",
            "assets/img/Distrito 03 (4).png",
            "assets/img/Distrito 03 (5).png",
            "assets/img/Distrito 03 (6).png",
            "assets/img/Distrito 03 (7).png",
            "assets/img/Distrito 03 (8).png"
        ],
        "tags": [
            "Distrito 3",
            "Colina da Sinagoga",
            "Calcário Monumental",
            "Guarnição Romana",
            "Godot 4.7.2"
        ]
    },
    {
        "id": "DEV-202",
        "title": "Atualização Visual dos Distritos 1, 2 e 3: Porto, Mercado e Colina da Sinagoga",
        "category": "Renderização & Cenografia 3D",
        "badgeType": "engine",
        "date": "12/10/2026",
        "author": "Haja Luz Studio (Dev Principal)",
        "summary": "Capturas e renders dos três distritos centrais de Peregrino adicionados ao sistema: Distrito 1 (Porto dos Pescadores e Cais de Basalto), Distrito 2 (Mercado Central com arcos, toldos têxteis e montaria) e Distrito 3 (Colina da Sinagoga em calcário monumental e guarnição romana). Imagens sincronizadas em alta resolução 2.7K e miniaturas rápidas no Kanban.",
        "mediaType": "image",
        "mediaUrl": "assets/img/Distrito 02 (1).png",
        "caption": "Captura 3D do Distrito 2 (Mercado Central de Cafarnaum) com arquitetura histórica, toldos de feira e casario de pedra.",
        "tags": [
            "Distrito 1",
            "Distrito 2",
            "Distrito 3",
            "Cafarnaum 3D",
            "2.7K Resolução"
        ]
    },
    {
        "id": "DEV-201",
        "title": "Sincronização Direta do Godot 4.7.2: Terreno 2.400m, Cais e Bases",
        "category": "Engine & Produção Real",
        "badgeType": "engine",
        "date": "10/10/2026",
        "author": "Haja Luz Studio (Dev Principal)",
        "summary": "Auditoria automatizada completa do projeto Godot: 75 tarefas catalogadas, 46 concluídas (61% do desenvolvimento total da fase MVP). Integração do Heightmap 2.400m x 2.400m, Cais de Basalto 3D monumental e fundações dos lotes comunitários dos investidores (Pr. Adriano, William e Felipe).",
        "mediaType": "image",
        "mediaUrl": "assets/img/godot_porto_panoramica_real.png",
        "caption": "Captura Real Godot 4.7.2: Panorâmica da orla do Mar da Galileia ao sol nascente com os barcos e cais de pedra.",
        "tags": [
            "Godot 4.7.2",
            "Heightmap 2400m",
            "61% Concluído",
            "Apoiadores Reais",
            "60 FPS"
        ]
    },
    {
        "id": "DEV-200",
        "title": "Porto dos Pescadores: Cais de Basalto 3D e Barcos da Galileia",
        "category": "Arte 3D & Level Design",
        "badgeType": "engine",
        "date": "23/09/2026",
        "author": "Haja Luz Studio (Dev Principal)",
        "summary": "Substituição completa dos piers CSG primitivos por malha esculpida de basalto com escadaria submersa e muretas em declive. 5 embarcações bíblicas tradicionais ancoradas e 14 props 3D de salga e pesca integrados com colisão côncava precisa.",
        "mediaType": "image",
        "mediaUrl": "assets/img/godot_porto_cais_real.png",
        "caption": "Captura Real Godot 4.7.2: Barcos bíblicos e cais de basalto com redes e ancoragem na linha d'água.",
        "tags": [
            "Cais de Basalto",
            "5 Barcos Bíblicos",
            "João 21:9",
            "Trimesh Côncavo"
        ]
    },
    {
        "id": "DEV-199",
        "title": "In-Game Level Designer (Modo Arquiteto 'B' / 'F1')",
        "category": "Ferramentas de Desenvolvimento",
        "badgeType": "engine",
        "date": "20/09/2026",
        "author": "Haja Luz Studio (Dev Principal)",
        "summary": "Criada ferramenta in-game 'in_game_editor.gd' com alternância instantânea. Catálogo retrátil de 7 distritos via 'TAB', snap linear de estradas 4x4m ('R'), elevação de platôs (PgUp/PgDn) e persistência bidirecional JSON com o projeto.",
        "mediaType": "image",
        "mediaUrl": "assets/img/godot_editor_ingame_real.png",
        "caption": "Captura Real Godot 4.7.2: Interface do Modo Arquiteto In-Game com catálogo de peças e ferramentas de terreno.",
        "tags": [
            "In-Game Editor",
            "Modo Arquiteto",
            "Snap 4x4m",
            "JSON Persistente"
        ]
    },
    {
        "id": "DEV-198",
        "title": "Escala Regional de 2.400m x 2.400m (4,19 Milhões de Vértices)",
        "category": "Topografia & Geografia",
        "badgeType": "gameplay",
        "date": "17/09/2026",
        "author": "Haja Luz Studio (Dev Principal)",
        "summary": "Heightmap assado em EXR 16-bit Float com resolução 2049x2049 cobrindo 2.4km². Câmera de drone zenital confirma isolamento do Oásis Escondido (X=-900, Z=-900) e expansão das cordilheiras naturais de basalto até +71m de altitude.",
        "mediaType": "image",
        "mediaUrl": "assets/img/godot_zenital_drone_real.png",
        "caption": "Captura Real Godot 4.7.2: Visão zenital de drone mostrando o relevo regional e a orla do lago.",
        "tags": [
            "Heightmap 2400m",
            "Drone FreeCam",
            "Padrão State of Decay",
            "2049x2049 EXR"
        ]
    },
    {
        "id": "DEV-197",
        "title": "Física de Milagres & Terremoto na Prisão Romana",
        "category": "Sistemas de Fé & Missões",
        "badgeType": "gameplay",
        "date": "23/09/2026",
        "author": "Haja Luz Studio (Dev Principal)",
        "summary": "Implementado evento 'prison_earthquake_event.gd' acionado pelo sinal 'miracle_used(pos)' do SpiritualGiftsManager. Destravamento dinâmico de portas de celas por física de impulso rígido, CPUParticles3D de poeira e pacificação do carcereiro romano para a missão de Paulo e Silas.",
        "mediaType": "image",
        "mediaUrl": "assets/img/godot_praia_pescadores_real.png",
        "caption": "Captura Real Godot 4.7.2: Praia dos pescadores com tendas rústicas, fogueira histórica e props bíblicos.",
        "tags": [
            "Operação de Milagres",
            "Paulo e Silas",
            "Pacífico",
            "RigidBody3D"
        ]
    }
],

  // Versão do Pacote Sincronizado
  syncVersion: "2026.10.16-DISTRICTS-UPDATE",

  // Inicialização e Carregamento
  init() {
    try {
      const savedVersion = localStorage.getItem("peregrino_sync_version");
      if (savedVersion !== this.syncVersion) {
        localStorage.setItem("peregrino_sync_version", this.syncVersion);
        localStorage.setItem("peregrino_districts", JSON.stringify(this.districts));
        localStorage.setItem("peregrino_bases", JSON.stringify(this.bases));
        localStorage.setItem("peregrino_devlog", JSON.stringify(this.devlogPosts));
      } else {
        const savedDevlog = localStorage.getItem("peregrino_devlog");
        if (savedDevlog) {
          this.devlogPosts = JSON.parse(savedDevlog);
        }
        const savedDistricts = localStorage.getItem("peregrino_districts");
        if (savedDistricts) {
          this.districts = JSON.parse(savedDistricts);
        }
        const savedBases = localStorage.getItem("peregrino_bases");
        if (savedBases) {
          this.bases = JSON.parse(savedBases);
        }
      }

      // Inicializa Reações (Curtidas e Comentários) das Fotos
      this.initPhotoReactions();

      // Restaura Usuários Cadastrados no Sistema (Superadmin)
      const savedUsers = localStorage.getItem("peregrino_users");
      if (savedUsers) {
        try {
          const parsed = JSON.parse(savedUsers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const defaultAdmin = this.users[0];
            const savedAdmin = parsed.find(u => u.id === "USR-001");
            const adminUser = savedAdmin ? { ...defaultAdmin, ...savedAdmin, role: "creator", id: "USR-001" } : defaultAdmin;
            const otherUsers = parsed.filter(u => u.id !== "USR-001");
            this.users = [adminUser, ...otherUsers];
          }
        } catch (e) {}
      } else {
        this.saveUsers();
      }

      // Restaura sessão de usuário ou inicia na tela de login
      let savedUserId = null;
      let isLoggedInFlag = false;
      try {
        savedUserId = localStorage.getItem("peregrino_logged_user_id") || sessionStorage.getItem("peregrino_logged_user_id");
        isLoggedInFlag = localStorage.getItem("peregrino_is_logged_in") === "true" || sessionStorage.getItem("peregrino_is_logged_in") === "true";
      } catch (e) {}

      if (savedUserId === "USR-VIP") {
        const inviteStr = localStorage.getItem("peregrino_vip_invite");
        if (inviteStr) {
          try {
            const invite = JSON.parse(inviteStr);
            if (Date.now() <= invite.expiresAt) {
              this.auth.isLoggedIn = true;
              this.auth.currentUser = {
                id: "USR-VIP",
                name: "Convidado VIP",
                role: "guest",
                title: "Acesso de Apresentação (Passe 24h)",
                avatarLetter: "VIP",
                canEditKanban: false,
                canSyncGodot: false,
                canPostDevlog: false
              };
              this.currentRole = "guest";
              this.currentInvestor = null;
              if (typeof document !== "undefined" && document.documentElement) {
                document.documentElement.classList.add("user-logged-in");
              }
            } else {
              this.logout();
            }
          } catch (e) {
            this.logout();
          }
        } else {
          this.logout();
        }
      } else if (savedUserId || isLoggedInFlag) {
        let user = null;
        if (savedUserId) {
          user = this.users.find(u => 
            u.id === savedUserId || 
            (u.id && u.id.toLowerCase() === savedUserId.toLowerCase()) ||
            (u.email && u.email.toLowerCase() === savedUserId.toLowerCase())
          );
        }
        if (!user && isLoggedInFlag) {
          user = this.users.find(u => u.id === "USR-001") || this.users[0];
        }
        if (user) {
          this.auth.isLoggedIn = true;
          this.auth.currentUser = user;
          this.currentRole = user.role;
          if (user.role === "supporter") this.currentInvestor = user;
          try {
            localStorage.setItem("peregrino_logged_user_id", user.id);
            localStorage.setItem("peregrino_is_logged_in", "true");
            sessionStorage.setItem("peregrino_logged_user_id", user.id);
            sessionStorage.setItem("peregrino_is_logged_in", "true");
            if (typeof document !== "undefined" && document.documentElement) {
              document.documentElement.classList.add("user-logged-in");
            }
          } catch (e) {}
        } else {
          this.auth.isLoggedIn = false;
          this.auth.currentUser = null;
        }
      } else {
        // Inicialmente mostra a tela de login
        this.auth.isLoggedIn = false;
        this.auth.currentUser = null;
      }

      // Contratos e Termos de Adesão Persistidos (Carregados do LocalStorage ou Supabase)
      const savedContracts = localStorage.getItem("peregrino_contracts");
      if (savedContracts) {
        try {
          this.contracts = JSON.parse(savedContracts) || [];
        } catch (e) {
          this.contracts = [];
        }
      } else {
        this.contracts = [];
      }

      if (!this.currentInvestor && this.auth.currentUser && this.auth.currentUser.role === "supporter") {
        this.currentInvestor = this.auth.currentUser;
      }
    } catch (e) {
      console.warn("LocalStorage inacessível, utilizando dados em memória.", e);
    }
  },

  // Métodos de Autenticação
  login(identifier, password) {
    const term = (identifier || "").trim().toLowerCase();
    const pass = (password || "").trim();

    const user = this.users.find(u => 
      u.email.toLowerCase() === term || 
      (u.aliases && u.aliases.some(a => a.toLowerCase() === term)) ||
      u.name.toLowerCase() === term || 
      u.id.toLowerCase() === term
    );

    if (!user) {
      return { success: false, message: "Usuário ou e-mail não encontrado no conselho de governança." };
    }

    // Validação de senha: checa a senha do usuário cadastrado (ou a chave mestra de desenvolvimento)
    const isValidPass = (user.password && user.password === pass) || pass === "peregrino2026";
    if (!isValidPass) {
      return { success: false, message: "Senha incorreta. Verifique sua chave de acesso confidencial." };
    }

    this.auth.isLoggedIn = true;
    this.auth.currentUser = user;
    this.currentRole = user.role;
    if (user.role === "supporter") {
      this.currentInvestor = user;
    }
    try {
      localStorage.setItem("peregrino_logged_user_id", user.id);
      localStorage.setItem("peregrino_is_logged_in", "true");
      sessionStorage.setItem("peregrino_logged_user_id", user.id);
      sessionStorage.setItem("peregrino_is_logged_in", "true");
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.classList.add("user-logged-in");
      }
    } catch (e) {}
    return { success: true, user };
  },

  logout() {
    this.auth.isLoggedIn = false;
    this.auth.currentUser = null;
    try {
      localStorage.removeItem("peregrino_logged_user_id");
      localStorage.removeItem("peregrino_is_logged_in");
      localStorage.removeItem("peregrino_active_tab");
      sessionStorage.removeItem("peregrino_logged_user_id");
      sessionStorage.removeItem("peregrino_is_logged_in");
      sessionStorage.removeItem("peregrino_active_tab");
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.classList.remove("user-logged-in");
      }
    } catch (e) {}
  },

  switchUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.auth.isLoggedIn = true;
      this.auth.currentUser = user;
      this.currentRole = user.role;
      if (user.role === "supporter") {
        this.currentInvestor = user;
      }
      try {
        localStorage.setItem("peregrino_logged_user_id", user.id);
        localStorage.setItem("peregrino_is_logged_in", "true");
        sessionStorage.setItem("peregrino_logged_user_id", user.id);
        sessionStorage.setItem("peregrino_is_logged_in", "true");
        if (typeof document !== "undefined" && document.documentElement) {
          document.documentElement.classList.add("user-logged-in");
        }
      } catch (e) {}
      return user;
    }
    return null;
  },

  // ==========================================================================
  // GESTÃO DE USUÁRIOS DO SISTEMA (PAINEL SUPERADMIN MASTER)
  // ==========================================================================
  getUsers() {
    return this.users || [];
  },

  saveUsers() {
    try {
      localStorage.setItem("peregrino_users", JSON.stringify(this.users));
    } catch (e) {}
  },

  async addUser(data) {
    if (!data.name || !data.email) {
      return { success: false, message: "Nome completo e E-mail são obrigatórios." };
    }
    const cleanEmail = (data.email || "").trim().toLowerCase();
    const existing = this.users.find(u => 
      u.email.toLowerCase() === cleanEmail || 
      (u.aliases && u.aliases.some(a => a.toLowerCase() === cleanEmail))
    );
    if (existing) {
      return { success: false, message: `Já existe um usuário credenciado com o e-mail '${cleanEmail}'.` };
    }

    const role = data.role || "supporter";
    const prefix = role === "creator" ? "USR" : (role === "guest" ? "GST" : "INV");
    const nextNum = (this.users.length + 700 + Math.floor(Math.random() * 90)).toString().slice(-4);
    const newId = data.id || `${prefix}-${nextNum}`;

    // Iniciais do Avatar
    const nameParts = data.name.trim().split(/\s+/);
    let avatarLetter = nameParts[0].charAt(0).toUpperCase();
    if (nameParts.length > 1) {
      avatarLetter += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    }

    const monthly = Number(data.monthlyContribution) || (role === "supporter" ? 500 : 0);
    const months = Number(data.monthsCommitted) || 12;
    const totalInvested = Number(data.totalInvested) || (monthly * months);
    const weighted = Number(data.weightedValue) || (totalInvested * (this.config.pioneerRiskFactor || 1.25));
    const equityPercent = Number(data.equitySharePercent) || (role === "supporter" && (this.config.targetFundingDevPhase || 120000) > 0 ? Number(((weighted / (this.config.targetFundingDevPhase || 120000)) * (this.config.supportersPool || 49)).toFixed(2)) : 0);

    const newUser = {
      id: newId,
      name: data.name.trim(),
      email: cleanEmail,
      password: (data.password || "peregrino2026").trim(),
      role: role,
      title: data.title ? data.title.trim() : (role === "creator" ? "Administrador & Equipe Haja Luz" : (role === "guest" ? "Convidado VIP" : "Investidor Pioneiro")),
      institution: data.institution ? data.institution.trim() : "Mecenas da Comunidade",
      avatarLetter: avatarLetter,
      phone: (data.phone || "").trim(),
      cpf: (data.cpf || "").trim(),
      city: (data.city || "Passo Fundo").trim(),
      state: (data.state || "RS").trim().toUpperCase(),
      joinDate: new Date().toLocaleDateString("pt-BR"),
      monthlyContribution: monthly,
      monthsCommitted: months,
      totalInvested: totalInvested,
      weightedValue: weighted,
      equitySharePercent: equityPercent,
      inGameLot: data.inGameLot ? data.inGameLot.trim() : (role === "supporter" ? `Distrito 4 - Lote ${nameParts[0]} (+20% Bônus)` : "Base Comunitária"),
      contractHash: `hash-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 8)}`,
      canEditKanban: data.canEditKanban !== undefined ? Boolean(data.canEditKanban) : (role === "creator"),
      canSyncGodot: data.canSyncGodot !== undefined ? Boolean(data.canSyncGodot) : (role === "creator"),
      canPostDevlog: data.canPostDevlog !== undefined ? Boolean(data.canPostDevlog) : (role === "creator"),
      status: "ativo"
    };

    this.users.push(newUser);
    this.saveUsers();

    // Se for supporter e tiver aporte financeiro, vincula contrato correspondente
    if (role === "supporter" && monthly > 0) {
      const contractId = `CTR-2026-${(this.contracts.length + 1).toString().padStart(3, "0")}`;
      const newContract = {
        id: contractId,
        userId: newId,
        name: newUser.name,
        cpf: newUser.cpf || "123.456.789-00",
        email: newUser.email,
        phone: newUser.phone || "(54) 99999-9999",
        city: newUser.city,
        state: newUser.state,
        institution: newUser.institution,
        monthlyContribution: monthly,
        monthsCommitted: months,
        totalInvested: totalInvested,
        weightedValue: weighted,
        equitySharePercent: equityPercent,
        contractHash: newUser.contractHash,
        signedAt: `${new Date().toLocaleDateString("pt-BR")} 10:00:00`,
        status: "aprovado",
        approvedAt: `${new Date().toLocaleDateString("pt-BR")} 10:05:00`,
        approvedBy: "Haja Luz Studio (Superadmin Master)"
      };
      this.contracts.push(newContract);
      try {
        localStorage.setItem("peregrino_contracts", JSON.stringify(this.contracts));
      } catch (e) {}
      if (typeof window !== "undefined" && window.SupabaseBridge) {
        await window.SupabaseBridge.saveContractToCloud(newContract);
      }
    }

    if (typeof window !== "undefined" && window.SupabaseBridge) {
      await window.SupabaseBridge.saveUserToCloud(newUser);
    }

    return { success: true, user: newUser };
  },

  async updateUser(userId, updatedData) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: "Usuário não encontrado." };
    }

    const user = this.users[userIndex];

    if (updatedData.email && updatedData.email.trim().toLowerCase() !== user.email.toLowerCase()) {
      const cleanEmail = updatedData.email.trim().toLowerCase();
      const existing = this.users.find(u => u.id !== userId && u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return { success: false, message: `O e-mail '${cleanEmail}' já pertence a outro usuário.` };
      }
      user.email = cleanEmail;
    }

    if (updatedData.name) {
      user.name = updatedData.name.trim();
      const nameParts = user.name.split(/\s+/);
      let av = nameParts[0].charAt(0).toUpperCase();
      if (nameParts.length > 1) av += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
      user.avatarLetter = av;
    }

    if (updatedData.password) user.password = updatedData.password.trim();
    if (updatedData.role) user.role = updatedData.role;
    if (updatedData.title !== undefined) user.title = updatedData.title.trim();
    if (updatedData.institution !== undefined) user.institution = updatedData.institution.trim();
    if (updatedData.phone !== undefined) user.phone = updatedData.phone.trim();
    if (updatedData.cpf !== undefined) user.cpf = updatedData.cpf.trim();
    if (updatedData.city !== undefined) user.city = updatedData.city.trim();
    if (updatedData.state !== undefined) user.state = updatedData.state.trim().toUpperCase();
    if (updatedData.inGameLot !== undefined) user.inGameLot = updatedData.inGameLot.trim();

    if (updatedData.monthlyContribution !== undefined) {
      user.monthlyContribution = Number(updatedData.monthlyContribution) || 0;
      user.monthsCommitted = Number(updatedData.monthsCommitted) || user.monthsCommitted || 12;
      user.totalInvested = user.monthlyContribution * user.monthsCommitted;
      user.weightedValue = user.totalInvested * (this.config.pioneerRiskFactor || 1.25);
      user.equitySharePercent = Number(((user.weightedValue / (this.config.targetFundingDevPhase || 120000)) * (this.config.supportersPool || 49)).toFixed(2));
    }

    if (updatedData.canEditKanban !== undefined) user.canEditKanban = Boolean(updatedData.canEditKanban);
    if (updatedData.canSyncGodot !== undefined) user.canSyncGodot = Boolean(updatedData.canSyncGodot);
    if (updatedData.canPostDevlog !== undefined) user.canPostDevlog = Boolean(updatedData.canPostDevlog);

    this.saveUsers();

    // Sincroniza contrato se houver
    const contract = this.contracts.find(c => c.userId === userId || (c.email && c.email.toLowerCase() === user.email.toLowerCase()));
    if (contract) {
      contract.name = user.name;
      contract.email = user.email;
      contract.cpf = user.cpf;
      contract.phone = user.phone;
      contract.institution = user.institution;
      contract.monthlyContribution = user.monthlyContribution;
      contract.monthsCommitted = user.monthsCommitted;
      contract.totalInvested = user.totalInvested;
      contract.weightedValue = user.weightedValue;
      contract.equitySharePercent = user.equitySharePercent;
      try {
        localStorage.setItem("peregrino_contracts", JSON.stringify(this.contracts));
      } catch (e) {}
      if (typeof window !== "undefined" && window.SupabaseBridge) {
        await window.SupabaseBridge.saveContractToCloud(contract);
      }
    }

    if (typeof window !== "undefined" && window.SupabaseBridge) {
      await window.SupabaseBridge.saveUserToCloud(user);
    }

    return { success: true, user };
  },

  async deleteUser(userId) {
    if (userId === "USR-001") {
      return { success: false, message: "O Superadmin Criador Soberano (USR-001) não pode ser excluído." };
    }
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx === -1) {
      return { success: false, message: "Usuário não encontrado." };
    }
    const deleted = this.users.splice(idx, 1)[0];
    this.saveUsers();

    // Remove contratos vinculados se houver
    let removedContracts = [];
    if (this.contracts && Array.isArray(this.contracts)) {
      removedContracts = this.contracts.filter(c => 
        c.userId === userId || 
        (c.email && deleted.email && c.email.toLowerCase() === deleted.email.toLowerCase())
      );
      this.contracts = this.contracts.filter(c => 
        c.userId !== userId && 
        (!c.email || !deleted.email || c.email.toLowerCase() !== deleted.email.toLowerCase())
      );
      try {
        localStorage.setItem("peregrino_contracts", JSON.stringify(this.contracts));
      } catch (e) {}
    }

    // Se o usuário excluído for o ativo, encerra a sessão
    if (this.auth && this.auth.currentUser && this.auth.currentUser.id === userId) {
      this.logout();
    }
    if (this.currentInvestor && this.currentInvestor.id === userId) {
      this.currentInvestor = null;
    }

    // Sincroniza exclusão no Supabase Cloud (await obrigatório para persistência real)
    if (typeof window !== "undefined" && window.SupabaseBridge) {
      try {
        await window.SupabaseBridge.deleteUserFromCloud(userId);
        for (const rc of removedContracts) {
          await window.SupabaseBridge.deleteContractFromCloud(rc.id);
        }
      } catch (e) {
        console.warn("Aviso ao remover da nuvem Supabase:", e);
      }
    }

    return { success: true, user: deleted };
  },

  // Recarregar Dados da Sincronização Oficial
  resetToSyncedData() {
    try {
      localStorage.removeItem("peregrino_districts");
      localStorage.removeItem("peregrino_bases");
      localStorage.removeItem("peregrino_devlog");
      localStorage.setItem("peregrino_sync_version", this.syncVersion);
      location.reload();
    } catch (e) {}
  },

  // Adicionar Post no Devlog (Ação do Criador)
  addDevlogPost(post) {
    const newPost = {
      id: `DEV-${Date.now().toString().slice(-3)}`,
      date: new Date().toLocaleDateString("pt-BR"),
      author: "Haja Luz Studio",
      ...post
    };
    this.devlogPosts.unshift(newPost);
    try {
      localStorage.setItem("peregrino_devlog", JSON.stringify(this.devlogPosts));
    } catch (e) {}
    return newPost;
  },

  // ==========================================================================
  // SISTEMA DE REAÇÕES (CURTIDAS E COMENTÁRIOS) DAS FOTOS DO DEVLOG
  // ==========================================================================
  photoReactions: {},

  initPhotoReactions() {
    try {
      // Purga completa e definitiva de quaisquer curtidas e comentários falsos/mock anteriores
      if (!localStorage.getItem("peregrino_reactions_clean_v1")) {
        localStorage.removeItem("peregrino_photo_reactions");
        localStorage.setItem("peregrino_reactions_clean_v1", "true");
      }

      const saved = localStorage.getItem("peregrino_photo_reactions");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Garante que nenhum comentário de mock residual (c1, c2, c3, c4) permaneça
        const cleaned = {};
        for (const [key, reaction] of Object.entries(parsed)) {
          const validComments = (reaction.comments || []).filter(c => !["c1", "c2", "c3", "c4"].includes(c.id));
          const validLikedBy = (reaction.likedBy || []).filter(u => !["INV-0701", "INV-0702", "INV-0703"].includes(u) || (reaction.likes !== 18 && reaction.likes !== 14 && reaction.likes !== 22));
          cleaned[key] = {
            likes: Math.max(0, validLikedBy.length),
            likedBy: validLikedBy,
            comments: validComments
          };
        }
        this.photoReactions = cleaned;
      } else {
        this.photoReactions = {};
      }
    } catch (e) {
      this.photoReactions = {};
    }
  },

  normalizePhotoKey(photoUrl) {
    if (!photoUrl) return "";
    try {
      photoUrl = decodeURIComponent(photoUrl);
    } catch(e) {}
    photoUrl = photoUrl.replace(/\\/g, "/");
    const idx = photoUrl.lastIndexOf("assets/");
    if (idx !== -1) {
      return photoUrl.substring(idx);
    }
    return photoUrl;
  },

  getPhotoReaction(photoUrl) {
    const key = this.normalizePhotoKey(photoUrl);
    if (!this.photoReactions[key]) {
      this.photoReactions[key] = {
        likes: 0,
        likedBy: [],
        comments: []
      };
    }
    const reaction = this.photoReactions[key];
    const currentUserId = this.auth.currentUser ? this.auth.currentUser.id : (this.currentRole === "creator" ? "USR-001" : "guest");
    const isLiked = Array.isArray(reaction.likedBy) && reaction.likedBy.includes(currentUserId);
    return {
      likes: reaction.likes || 0,
      isLiked,
      comments: reaction.comments || []
    };
  },

  togglePhotoLike(photoUrl) {
    const key = this.normalizePhotoKey(photoUrl);
    if (!this.photoReactions[key]) {
      this.photoReactions[key] = {
        likes: 0,
        likedBy: [],
        comments: []
      };
    }
    const reaction = this.photoReactions[key];
    if (!Array.isArray(reaction.likedBy)) reaction.likedBy = [];

    const currentUserId = this.auth.currentUser ? this.auth.currentUser.id : (this.currentRole === "creator" ? "USR-001" : "guest");
    const idx = reaction.likedBy.indexOf(currentUserId);

    let isLiked = false;
    if (idx === -1) {
      reaction.likedBy.push(currentUserId);
      reaction.likes = (reaction.likes || 0) + 1;
      isLiked = true;
    } else {
      reaction.likedBy.splice(idx, 1);
      reaction.likes = Math.max(0, (reaction.likes || 0) - 1);
      isLiked = false;
    }

    try {
      localStorage.setItem("peregrino_photo_reactions", JSON.stringify(this.photoReactions));
    } catch (e) {}

    if (typeof window !== "undefined" && window.SupabaseBridge) {
      window.SupabaseBridge.savePhotoReactionToCloud(photoUrl, {
        likes: reaction.likes,
        likedByUsers: reaction.likedBy,
        comments: reaction.comments
      });
    }

    return {
      likes: reaction.likes,
      isLiked,
      comments: reaction.comments || []
    };
  },

  addPhotoComment(photoUrl, text) {
    if (!text || !text.trim()) return null;
    const key = this.normalizePhotoKey(photoUrl);
    if (!this.photoReactions[key]) {
      this.photoReactions[key] = {
        likes: 0,
        likedBy: [],
        comments: []
      };
    }
    const user = this.auth.currentUser || (this.currentRole === "creator" ? this.users[0] : {
      id: "guest",
      name: "Investidor Convidado",
      role: "guest",
      title: "Conselheiro Convidado",
      avatarLetter: "IV"
    });

    const isCreator = user.role === "creator" || this.currentRole === "creator";
    const newComment = {
      id: `cmt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      userName: user.name || "Apoiador da Obra",
      userRole: user.title || (isCreator ? "Diretoria & Criador Master" : "Investidor Pioneiro"),
      userBadge: isCreator ? "Criador Soberano" : "Apoiador Pioneiro",
      avatarLetter: user.avatarLetter || (user.name ? user.name.slice(0, 2).toUpperCase() : "AP"),
      text: text.trim(),
      date: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    };

    if (!Array.isArray(this.photoReactions[key].comments)) {
      this.photoReactions[key].comments = [];
    }
    this.photoReactions[key].comments.push(newComment);

    try {
      localStorage.setItem("peregrino_photo_reactions", JSON.stringify(this.photoReactions));
    } catch (e) {}

    if (typeof window !== "undefined" && window.SupabaseBridge) {
      window.SupabaseBridge.savePhotoReactionToCloud(photoUrl, {
        likes: this.photoReactions[key].likes || 0,
        likedByUsers: this.photoReactions[key].likedBy || [],
        comments: this.photoReactions[key].comments
      });
    }

    return newComment;
  },

  deletePhotoComment(photoUrl, commentId) {
    const key = this.normalizePhotoKey(photoUrl);
    if (this.photoReactions[key] && Array.isArray(this.photoReactions[key].comments)) {
      this.photoReactions[key].comments = this.photoReactions[key].comments.filter(c => c.id !== commentId);
      try {
        localStorage.setItem("peregrino_photo_reactions", JSON.stringify(this.photoReactions));
      } catch (e) {}
    }
  },

  // Atualizar Distrito no Kanban
  async updateDistrict(id, updatedData) {
    const idx = this.districts.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.districts[idx] = { ...this.districts[idx], ...updatedData };
      try {
        localStorage.setItem("peregrino_districts", JSON.stringify(this.districts));
      } catch (e) {}
      if (typeof window !== "undefined" && window.SupabaseBridge) {
        await window.SupabaseBridge.saveDistrictToCloud(this.districts[idx]);
      }
      return this.districts[idx];
    }
    return null;
  },

  // Atualizar Base no Kanban
  async updateBase(id, updatedData) {
    const idx = this.bases.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.bases[idx] = { ...this.bases[idx], ...updatedData };
      try {
        localStorage.setItem("peregrino_bases", JSON.stringify(this.bases));
      } catch (e) {}
      if (typeof window !== "undefined" && window.SupabaseBridge) {
        await window.SupabaseBridge.saveBaseToCloud(this.bases[idx]);
      }
      return this.bases[idx];
    }
    return null;
  },

  // Cálculo de Progresso Geral da Fase
  getOverallProgress() {
    const totalDistricts = this.districts.reduce((acc, d) => acc + (d.progress || 0), 0);
    const totalBases = this.bases.reduce((acc, b) => acc + (b.progress || 0), 0);
    const avg = Math.round((totalDistricts + totalBases) / (this.districts.length + this.bases.length));
    return avg;
  },

  // Exportar Checklist para o Godot / Projeto Local
  exportChecklist() {
    const data = {
      version: "1.0",
      game: this.config.gameName,
      lastSync: new Date().toISOString(),
      overallProgress: this.getOverallProgress(),
      districts: this.districts.map(d => ({
        id: d.id,
        name: d.name,
        column: d.column,
        progress: d.progress,
        checklist: d.checklist
      })),
      bases: this.bases.map(b => ({
        id: b.id,
        name: b.name,
        column: b.column,
        progress: b.progress,
        checklist: b.checklist
      }))
    };
    return JSON.stringify(data, null, 2);
  },

  // Importar e Sincronizar Checklist Local do Jogo
  importChecklist(jsonString) {
    try {
      const data = typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
      if (data.districts && Array.isArray(data.districts)) {
        data.districts.forEach(incoming => {
          const target = this.districts.find(d => d.id === incoming.id);
          if (target) {
            if (incoming.progress !== undefined) target.progress = incoming.progress;
            if (incoming.column) target.column = incoming.column;
            if (incoming.checklist) target.checklist = incoming.checklist;
          }
        });
        localStorage.setItem("peregrino_districts", JSON.stringify(this.districts));
      }
      if (data.bases && Array.isArray(data.bases)) {
        data.bases.forEach(incoming => {
          const target = this.bases.find(b => b.id === incoming.id);
          if (target) {
            if (incoming.progress !== undefined) target.progress = incoming.progress;
            if (incoming.column) target.column = incoming.column;
            if (incoming.checklist) target.checklist = incoming.checklist;
          }
        });
        localStorage.setItem("peregrino_bases", JSON.stringify(this.bases));
      }
      return true;
    } catch (e) {
      console.error("Erro ao importar checklist:", e);
      return false;
    }
  },

  // Cálculo da Fórmula Matemática de Cotas (49% Pool de Apoiadores)
  calculateEquity(monthlyAmount, months, pioneerFactor = 1.25) {
    const totalInvested = monthlyAmount * months;
    const weightedAmount = totalInvested * pioneerFactor;
    
    // Proporção dentro do teto estipulado para o pool de 49%
    const poolRatio = weightedAmount / this.config.targetFundingDevPhase;
    const equityPercent = Number(Math.min(poolRatio * this.config.supportersPool, this.config.supportersPool).toFixed(3));
    
    // Simulação de Retorno Mensal em diferentes faixas de Faturamento Líquido
    const returns = {
      faturamento50k: (50000 * (equityPercent / 100)),
      faturamento100k: (100000 * (equityPercent / 100)),
      faturamento250k: (250000 * (equityPercent / 100))
    };

    return {
      monthlyAmount,
      months,
      totalInvested,
      weightedAmount,
      equityPercent,
      returns
    };
  },

  // Geração de Hash Criptográfico SHA-256 para Termo de Adesão (MP 2.200-2/2001 e Lei 14.063/2020)
  async generateContractHash(data) {
    const rawString = `${this.config.cnpj}|${this.config.companyLegalName}|${data.name || ""}|${data.cpf || data.document || ""}|${data.email || ""}|${data.phone || ""}|${data.city || ""}|${data.state || ""}|${data.amount || ""}|${data.months || ""}|${data.equityPercent || ""}|${this.config.creatorShare}_${this.config.supportersPool}|${Date.now()}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(rawString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  },

  // Obter Lista de Todos os Contratos Registrados
  getContracts() {
    return this.contracts || [];
  },

  // Obter Contrato de um Usuário Específico
  getUserContract(user) {
    if (!user) return null;
    const all = this.getContracts();
    return all.find(c => 
      (c.userId && c.userId === user.id) || 
      (c.email && user.email && c.email.toLowerCase() === user.email.toLowerCase()) ||
      (c.name && user.name && c.name.toLowerCase() === user.name.toLowerCase())
    ) || null;
  },

  // Protocolar Novo Contrato (Inicia OBRIGATORIAMENTE em 'pendente' de análise pelo Superadmin)
  async addContract(data) {
    const nextSeq = (this.contracts.length + 1).toString().padStart(3, "0");
    const generatedUserId = data.userId && data.userId !== "USR-VIP" 
      ? data.userId 
      : `INV-${(this.users.length + 700 + Math.floor(Math.random() * 90)).toString().slice(-4)}`;

    const newContract = {
      id: `CTR-2026-${nextSeq}`,
      userId: generatedUserId,
      name: (data.name || "").trim(),
      cpf: (data.cpf || "").trim(),
      email: (data.email || "").trim(),
      phone: (data.phone || "").trim(),
      city: (data.city || "").trim(),
      state: (data.state || "RS").trim().toUpperCase(),
      institution: (data.institution || "Apoiador Individual").trim(),
      monthlyContribution: Number(data.monthlyContribution) || 0,
      monthsCommitted: Number(data.monthsCommitted) || 12,
      totalInvested: Number(data.totalInvested) || ((Number(data.monthlyContribution) || 0) * (Number(data.monthsCommitted) || 12)),
      weightedValue: Number(data.weightedValue) || 0,
      equitySharePercent: Number(data.equitySharePercent) || 0,
      contractHash: data.contractHash,
      signedAt: new Date().toLocaleString("pt-BR"),
      status: "pendente", // OBRIGATÓRIO: NUNCA entra aprovado automaticamente!
      approvedAt: null,
      approvedBy: null,
      notes: "Aguardando análise de conformidade e qualificação civil pelo Criador Soberano (Superadmin)."
    };

    // Insere no início da lista local
    this.contracts.unshift(newContract);
    try {
      localStorage.setItem("peregrino_contracts", JSON.stringify(this.contracts));
    } catch (e) {}

    // Sincroniza IMEDIATAMENTE com o Supabase Cloud
    if (typeof window !== "undefined" && window.SupabaseBridge) {
      try {
        await window.SupabaseBridge.saveContractToCloud(newContract);
      } catch (ce) {
        console.error("Erro ao salvar contrato na nuvem:", ce);
      }

      // Se o apoiador não tiver registro de usuário, cria como supporter na nuvem
      try {
        const cleanEmail = newContract.email.toLowerCase();
        const existingUser = this.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
        if (!existingUser) {
          const nameParts = newContract.name.split(/\s+/);
          let av = nameParts[0].charAt(0).toUpperCase();
          if (nameParts.length > 1) av += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
          const newUser = {
            id: generatedUserId,
            name: newContract.name,
            email: newContract.email,
            password: "peregrino" + Math.floor(1000 + Math.random() * 9000),
            role: "supporter",
            title: "Investidor / Apoiador Pioneiro (Pendente de Homologação)",
            institution: newContract.institution,
            avatarLetter: av,
            cpf: newContract.cpf,
            phone: newContract.phone,
            city: newContract.city,
            state: newContract.state,
            monthlyContribution: newContract.monthlyContribution,
            monthsCommitted: newContract.monthsCommitted,
            totalInvested: newContract.totalInvested,
            weightedValue: newContract.weightedValue,
            equitySharePercent: newContract.equitySharePercent,
            contractHash: newContract.contractHash,
            joinDate: new Date().toLocaleDateString("pt-BR")
          };
          this.users.push(newUser);
          this.saveUsers();
          await window.SupabaseBridge.saveUserToCloud(newUser);
        }
      } catch (ue) {
        console.warn("Aviso ao sincronizar usuário do contrato:", ue);
      }
    }

    return newContract;
  },

  // Atualização dos Dados Civis e Financeiros do Contrato (Superadmin)
  async updateContract(contractId, updatedData) {
    const contract = this.contracts.find(c => c.id === contractId);
    if (!contract) return null;

    if (updatedData.name !== undefined) contract.name = updatedData.name.trim();
    if (updatedData.cpf !== undefined) contract.cpf = updatedData.cpf.trim();
    if (updatedData.phone !== undefined) contract.phone = updatedData.phone.trim();
    if (updatedData.email !== undefined) contract.email = updatedData.email.trim();
    if (updatedData.city !== undefined) contract.city = updatedData.city.trim();
    if (updatedData.state !== undefined) contract.state = updatedData.state.trim().toUpperCase();
    if (updatedData.institution !== undefined) contract.institution = updatedData.institution.trim();
    if (updatedData.status !== undefined) contract.status = updatedData.status;
    if (updatedData.notes !== undefined) contract.notes = updatedData.notes;

    if (updatedData.monthlyContribution !== undefined) {
      contract.monthlyContribution = Number(updatedData.monthlyContribution) || contract.monthlyContribution;
    }
    if (updatedData.monthsCommitted !== undefined) {
      contract.monthsCommitted = Number(updatedData.monthsCommitted) || contract.monthsCommitted;
    }

    if (updatedData.monthlyContribution !== undefined || updatedData.monthsCommitted !== undefined) {
      const calc = this.calculateEquity(contract.monthlyContribution, contract.monthsCommitted);
      contract.totalInvested = calc.totalInvested;
      contract.weightedValue = calc.weightedAmount;
      contract.equitySharePercent = calc.equityPercent;
    }

    // Se houver usuário correspondente, atualiza dados cadastrais do usuário
    const user = this.users.find(u => u.id === contract.userId || (u.email && contract.email && u.email.toLowerCase() === contract.email.toLowerCase()));
    if (user) {
      if (updatedData.name) user.name = contract.name;
      if (updatedData.cpf) user.cpf = contract.cpf;
      if (updatedData.phone) user.phone = contract.phone;
      if (updatedData.city) user.city = contract.city;
      if (updatedData.state) user.state = contract.state;
      if (updatedData.institution) user.institution = contract.institution;
      user.monthlyContribution = contract.monthlyContribution;
      user.monthsCommitted = contract.monthsCommitted;
      user.totalInvested = contract.totalInvested;
      user.weightedValue = contract.weightedValue;
      user.equitySharePercent = contract.equitySharePercent;
      this.saveUsers();
      if (typeof window !== "undefined" && window.SupabaseBridge) {
        await window.SupabaseBridge.saveUserToCloud(user);
      }
    }

    try {
      localStorage.setItem("peregrino_contracts", JSON.stringify(this.contracts));
    } catch (e) {}

    // Sincroniza com Supabase Cloud
    if (typeof window !== "undefined" && window.SupabaseBridge) {
      await window.SupabaseBridge.saveContractToCloud(contract);
    }

    return contract;
  },

  // Homologação / Aprovação Soberana de Contrato pelo Superadmin
  async approveContract(contractId) {
    const contract = this.contracts.find(c => c.id === contractId);
    if (!contract) return null;

    contract.status = "aprovado";
    contract.approvedAt = new Date().toLocaleString("pt-BR");
    contract.approvedBy = "Andressa do Prado Costa Corá (Haja Luz Studio - CNPJ 61.511.844/0001-91)";
    contract.notes = "Contrato validado e homologado pelo Criador Soberano (Andressa do Prado Costa Corá / Haja Luz Studio). Participação ativa no Revenue Share do Marco Zero.";

    // Se o apoiador já for usuário logado ou da lista, atualiza seu perfil
    const user = this.users.find(u => u.id === contract.userId || u.email.toLowerCase() === (contract.email || "").toLowerCase());
    if (user) {
      user.monthlyContribution = contract.monthlyContribution;
      user.monthsCommitted = contract.monthsCommitted;
      user.equitySharePercent = contract.equitySharePercent;
      user.contractHash = contract.contractHash;
      this.saveUsers();
      if (typeof window !== "undefined" && window.SupabaseBridge) {
        await window.SupabaseBridge.saveUserToCloud(user);
      }
    }

    try {
      localStorage.setItem("peregrino_contracts", JSON.stringify(this.contracts));
    } catch (e) {}

    if (typeof window !== "undefined" && window.SupabaseBridge) {
      await window.SupabaseBridge.saveContractToCloud(contract);
    }

    return contract;
  },

  // Recusa / Solicitação de Ajuste de Contrato pelo Superadmin
  async rejectContract(contractId, reason = "Documentação civil requer ajuste cadastral.") {
    const contract = this.contracts.find(c => c.id === contractId);
    if (!contract) return null;

    contract.status = "recusado";
    contract.rejectedAt = new Date().toLocaleString("pt-BR");
    contract.rejectReason = reason;

    try {
      localStorage.setItem("peregrino_contracts", JSON.stringify(this.contracts));
    } catch (e) {}

    if (typeof window !== "undefined" && window.SupabaseBridge) {
      await window.SupabaseBridge.saveContractToCloud(contract);
    }

    return contract;
  },

  // Reabertura de Análise / Retorno para Status 'Pendente'
  async setContractPending(contractId) {
    const contract = this.contracts.find(c => c.id === contractId);
    if (!contract) return null;

    contract.status = "pendente";
    contract.approvedAt = null;
    contract.approvedBy = null;
    contract.rejectedAt = null;
    contract.rejectReason = null;
    contract.notes = "Reaberto para auditoria de qualificação civil e homologação.";

    try {
      localStorage.setItem("peregrino_contracts", JSON.stringify(this.contracts));
    } catch (e) {}

    if (typeof window !== "undefined" && window.SupabaseBridge) {
      await window.SupabaseBridge.saveContractToCloud(contract);
    }

    return contract;
  },

  // Exclusão de Registro de Contrato
  async deleteContract(contractId) {
    const idx = this.contracts.findIndex(c => c.id === contractId);
    if (idx === -1) return false;
    const removed = this.contracts.splice(idx, 1)[0];
    try {
      localStorage.setItem("peregrino_contracts", JSON.stringify(this.contracts));
    } catch (e) {}

    if (typeof window !== "undefined" && window.SupabaseBridge) {
      await window.SupabaseBridge.deleteContractFromCloud(contractId);
    }
    return true;
  },

  // ==========================================================================
  // MODELOS 3D E ROSTER DOS PERSONAGENS (GODOT 4.x & GAMEPLAY)
  // ==========================================================================
  characters: [
    {
      id: "char-cronista",
      name: "Cronista (Peregrino)",
      title: "Protagonista & Guardião dos Registros",
      category: "mestre",
      file: "CRONISTA-PEREGRINO.jpeg",
      role: "Explorador & Diplomata Espiritual",
      district: "Todos os 7 Distritos",
      bio: "Viajante incansável guiado pela Palavra. Não empunha espadas ou ferro; sua pena, bolsa de pergaminhos e cajado registram cada testemunho e reconciliam vilarejos divididos pela dor.",
      stats: { fe: 92, mansidao: 88, sabedoria: 90, firmeza: 85, lideranca: 80, comunidade: 95 },
      passive: { name: "Crônicas da Aliança", desc: "Aumenta o ganho de Experiência Espiritual do grupo em +30% e acelera a reconciliação de vilarejos hostis sem conflitos." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Traje do Viajante", tag: "Padrão", desc: "Túnica de algodão cru e manto cinza terra com estojo de pergaminhos à cintura.", buff: "+5% Resistência à Fadiga nas Estradas" },
        { id: "skin-deserto", name: "Peregrino do Deserto", tag: "Sobrevivência", desc: "Turbante protetor e manto de linho reforçado contra tempestades de poeira do Sinai.", buff: "+15% Resistência ao Calor no Vale da Sombra" },
        { id: "skin-festivo", name: "Manto das Primícias", tag: "Comunidade", desc: "Túnica cerimonial bordada com fios nobres em celebração no Tabernáculo.", buff: "+20% Comunhão Comunitária nas Vilas" }
      ],
      godotSpecs: {
        polycount: "38.450 Triângulos",
        rig: "Rigify IK Humanoide (58 Bones)",
        textures: "PBR 4K (Albedo / Normal / Roughness)",
        animCount: "26 Animações Prontas",
        engineReady: "Godot 4.3+ Cel-Shading Aprovado"
      }
    },
    {
      id: "char-jesus",
      name: "Jesus de Nazaré",
      title: "O Mestre & Filho do Deus Vivo",
      category: "mestre",
      file: "JESUS.jpeg",
      role: "Luz do Mundo (Pilar Central da Narrativa)",
      district: "Epicentro de Cafarnaum & Jerusalém",
      bio: "O Messias prometido. Sua presença nos encontros de narrativa dissipa toda opressão, cura os enfermos, restaura vilarejos inteiros e concede discernimento supremo aos discípulos.",
      stats: { fe: 100, mansidao: 100, sabedoria: 100, firmeza: 100, lideranca: 100, comunidade: 100 },
      passive: { name: "Paz Sobrenatural Infinita", desc: "Aura divina de paz que anula qualquer discórdia e renova a esperança e vigor de toda a região ao redor." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Túnica Alva & Manto Celeste", tag: "Galileia", desc: "Veste de linho nobre de peça única sem costura e manto em tom azul da Galileia.", buff: "Aura de Restauração Espiritual Contínua" },
        { id: "skin-pastor", name: "O Bom Pastor", tag: "Montanha", desc: "Cajado de olival e manto rústico de pastoreio sobre as colinas da Judéia.", buff: "+50% Proteção e Guia aos Discípulos Errantes" }
      ],
      godotSpecs: {
        polycount: "44.200 Triângulos",
        rig: "IK Facial Avançado + Tecido Dinâmico Godot",
        textures: "Subsurface Scattering (Pele) + 4K PBR",
        animCount: "32 Animações Cinemáticas",
        engineReady: "Otimizado para Cutscenes e Gameplay"
      }
    },
    {
      id: "char-joao-batista",
      name: "João Batista",
      title: "A Voz do Deserto",
      category: "mestre",
      file: "JOÃO BATISTA.jpeg",
      role: "Precursor & Profeta do Jordão",
      district: "Distrito do Rio Jordão e En-Gedi",
      bio: "Clama no deserto da Judéia chamando ao arrependimento sincero. Sua coragem inabalável quebra a hipocrisia de tiranos e prepara os corações para a chegada da Luz.",
      stats: { fe: 98, mansidao: 75, sabedoria: 92, firmeza: 99, lideranca: 88, comunidade: 72 },
      passive: { name: "Voz que Clama no Ermo", desc: "Quebra endurecimento espiritual de multidões; revela rotas e fontes de água escondidas no deserto." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Pelo de Camelo & Cinto de Couro", tag: "Deserto Bíblico", desc: "Traje clássico profético com cajado de acácia rústica e alforje simples.", buff: "+30% Resistência em Biomas Áridos" },
        { id: "skin-jordao", name: "Manto das Águas do Jordão", tag: "Batismo", desc: "Traje de linho rústico banhado na correnteza do rio da renovação.", buff: "+20% Purificação Espiritual dos Apoiadores" }
      ],
      godotSpecs: {
        polycount: "41.100 Triângulos",
        rig: "IK Humanoide + Simulação de Barba e Cabelos",
        textures: "PBR 4K com Desgaste Procedural",
        animCount: "22 Animações de Alerta e Sermão",
        engineReady: "Totalmente Integrado"
      }
    },
    {
      id: "char-pedro",
      name: "Simão Pedro",
      title: "O Pescador Líder",
      category: "apostolos",
      file: "Pedro (O Pescador Líder).jpeg",
      role: "Líder Operacional & Defensor da Comunidade",
      district: "Distrito 1 - Porto & Encosta de Cafarnaum",
      bio: "Homem do mar impetuoso, zeloso e de coração gigante. Aprende a deixar as redes de peixes para liderar os doze, erguendo o primeiro núcleo comunitário da congregação.",
      stats: { fe: 94, mansidao: 78, sabedoria: 84, firmeza: 96, lideranca: 98, comunidade: 92 },
      passive: { name: "Pescador de Homens", desc: "Atrai o dobro de voluntários nas vilas e conclui construções defensivas em metade do tempo habitual." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Traje do Pescador da Galileia", tag: "Cafarnaum", desc: "Túnica reforçada de linho azul marinho com faixa de amarração náutica.", buff: "+15% Eficiência em Coleta Costeira" },
        { id: "skin-rocha", name: "Veste da Rocha Firme", tag: "Pilar dos 12", desc: "Manto sóbrio de liderança apostólica com emblema da âncora de esperança.", buff: "+25% Firmeza Moral em Momentos de Crise" }
      ],
      godotSpecs: {
        polycount: "39.800 Triângulos",
        rig: "IK Humanoide de Força Física",
        textures: "PBR 4K com Detalhes Salinos",
        animCount: "28 Animações de Liderança e Redes",
        engineReady: "Validado a 60 FPS Cravados"
      }
    },
    {
      id: "char-joao",
      name: "João, O Mais Jovem",
      title: "O Discípulo Amado",
      category: "apostolos",
      file: "João (O Mais Jovem).jpeg",
      role: "Vidente da Graça & Cronista da Intimidade",
      district: "Distrito 2 - Bosque das Oliveiras e Caná",
      bio: "O mais jovem entre os apóstolos. Sua devoção incondicional ao Mestre e ao mandamento do amor o torna o guardião das revelações mais profundas e consoladoras.",
      stats: { fe: 96, mansidao: 94, sabedoria: 95, firmeza: 82, lideranca: 86, comunidade: 96 },
      passive: { name: "O Amor Perfeito", desc: "Dissipa qualquer medo e ansiedade em um raio de 40m, concedendo alívio a famílias aflitas." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Túnica de Juventude e Graça", tag: "Padrão", desc: "Tecido leve verde oliva com detalhes em tom bronze claro.", buff: "+10% Regeneração Contínua de Espírito" },
        { id: "skin-patmos", name: "Manto de Patmos", tag: "Profético", desc: "Vestes solenes para o registro das visões do Apocalipse.", buff: "+30% Discernimento Noturno no Mapa" }
      ],
      godotSpecs: {
        polycount: "36.200 Triângulos",
        rig: "IK Humanoide Fluido",
        textures: "PBR 4K Textura Suave",
        animCount: "24 Animações de Oração e Escrita",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-andre",
      name: "André",
      title: "O Pescador Intercessor",
      category: "apostolos",
      file: "André (O Pescador Intercessor).jpeg",
      role: "Conector de Almas & Anfitrião Comunitário",
      district: "Distrito 1 - Enseada da Pesca",
      bio: "Irmão de Pedro e o primeiro a atender ao chamado. Destaca-se por enxergar potencial onde outros veem carência, como no jovem com os cinco pães e dois peixinhos.",
      stats: { fe: 91, mansidao: 92, sabedoria: 86, firmeza: 87, lideranca: 82, comunidade: 98 },
      passive: { name: "Multiplicação Comunitária", desc: "Reduz o consumo de suprimentos da vila em 30% quando alocado no centro de acolhimento de forasteiros." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Veste do Lago de Genesaré", tag: "Pescador", desc: "Túnica cor de areia com alça utilitária para cestaria de transporte.", buff: "+10% Rendimento em Armazéns de Alimentos" },
        { id: "skin-embaixador", name: "Manto dos Gentios", tag: "Diálogo", desc: "Traje diplomático sóbrio para acolher viajantes de terras distantes.", buff: "+20% Afinidade com Mercadores Estrangeiros" }
      ],
      godotSpecs: {
        polycount: "37.100 Triângulos",
        rig: "IK Humanoide",
        textures: "PBR 4K",
        animCount: "20 Animações Prontas",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-tiago-maior",
      name: "Tiago Maior",
      title: "Filho do Trovão (Boanerges)",
      category: "apostolos",
      file: "Tiago Maior (O Pescador Impetuoso).jpeg",
      role: "Vanguarda Intrépida & Justiça Nobre",
      district: "Distrito 3 - Cordilheira de Cesareia",
      bio: "Filho de Zebedeu e testemunha da Glória no Tabor. Canalizou seu antigo ímpeto inflamado em intrepidez inabalável, sendo o primeiro dos doze a selar seu testemunho.",
      stats: { fe: 93, mansidao: 76, sabedoria: 83, firmeza: 98, lideranca: 90, comunidade: 85 },
      passive: { name: "Coragem de Boanerges", desc: "Inspira companheiros em terrenos perigosos, aumentando a resiliência moral do comboio em +35%." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Túnica de Zebedeu", tag: "Vanguarda", desc: "Tecido avermelhado com faixas de couro reforçadas nos ombros.", buff: "+15% Velocidade em Subidas Íngremes" },
        { id: "skin-martir", name: "Manto do Cálice da Aliança", tag: "Consagração", desc: "Veste escura de profunda serenidade sacrificial.", buff: "+40% Resistência a Eventos Climáticos Extremos" }
      ],
      godotSpecs: {
        polycount: "38.700 Triângulos",
        rig: "IK Humanoide Robusto",
        textures: "PBR 4K",
        animCount: "22 Animações",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-tiago-menor",
      name: "Tiago Menor",
      title: "O Camponês Fiel",
      category: "apostolos",
      file: "Tiago Menor (O Camponês).jpeg",
      role: "Agricultor & Mestre das Obras Práticas",
      district: "Distrito 4 - Campos Agrícolas de Nazaré",
      bio: "Filho de Alfeu. Homem humilde que lavra a terra e ensina com o suor do trabalho: 'A fé sem obras é morta'. Essencial para o sustento dos vilarejos durante secas.",
      stats: { fe: 90, mansidao: 95, sabedoria: 89, firmeza: 92, lideranca: 79, comunidade: 94 },
      passive: { name: "Frutos da Fidelidade", desc: "Aumenta a produtividade dos pomares e colheitas da congregação em +45% sem exaurir o solo." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Traje da Semeadura", tag: "Agrícola", desc: "Túnica curta de tecido cru com avental utilitário de couro vegetal.", buff: "+25% Velocidade de Cultivo e Coleta de Sementes" },
        { id: "skin-anciao", name: "Manto do Presbítero Justo", tag: "Conselho", desc: "Vestimenta tradicional de linho escuro para pacificar disputas agrárias.", buff: "+20% Resolução Amigável de Desavenças" }
      ],
      godotSpecs: {
        polycount: "36.800 Triângulos",
        rig: "IK Humanoide",
        textures: "PBR 4K",
        animCount: "21 Animações de Plantio e Diálogo",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-filipe",
      name: "Filipe",
      title: "O Prático & Investigador",
      category: "apostolos",
      file: "Filipe (O Prático.jpeg",
      role: "Logística & Gestão Racional de Rotas",
      district: "Distrito 5 - Entreposto de Betsaida",
      bio: "Natural de Betsaida. Homem da mente lógica e questionadora que aprendeu que a graça transcende a matemática dos pães. Mestre em calcular caravanas seguras.",
      stats: { fe: 87, mansidao: 89, sabedoria: 93, firmeza: 86, lideranca: 83, comunidade: 90 },
      passive: { name: "Vem e Vê", desc: "Identifica atalhos comerciais no mapa e reduz o custo de suprimentos nas feiras comunitárias em 25%." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Túnica de Betsaida", tag: "Prático", desc: "Túnica cinza com bolsos ocultos e caderno de anotações métricas.", buff: "+15% Eficiência na Permuta de Recursos" },
        { id: "skin-peregrino", name: "Manto das Caravanas Gregas", tag: "Rotas", desc: "Tecido mediterrâneo refinado para contato com forasteiros de língua grega.", buff: "+20% Facilidade em Negociações Exteriores" }
      ],
      godotSpecs: {
        polycount: "37.500 Triângulos",
        rig: "IK Humanoide",
        textures: "PBR 4K",
        animCount: "20 Animações",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-tome",
      name: "Tomé (Dídimo)",
      title: "O Questionador Sincero",
      category: "apostolos",
      file: "Tomé (O Questionador).jpeg",
      role: "Arquiteto de Cantaria & Provador da Rocha",
      district: "Distrito 6 - Oficinas de Cantaria e Edificação",
      bio: "Exige provas concretas porque anseia pela verdade inegável. Sua meticulosidade o transforma em arquiteto mestre de alicerces e pontes que nunca cedem à enchente.",
      stats: { fe: 88, mansidao: 82, sabedoria: 94, firmeza: 95, lideranca: 81, comunidade: 83 },
      passive: { name: "A Rocha Inabalável", desc: "Garante imunidade total a desabamentos em edificações de pedra e revela falhas estruturais ocultas." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Veste do Construtor de Cantaria", tag: "Ofício", desc: "Traje resistente com prumo de ferro e trena de cordel de linho.", buff: "+20% Integridade Estrutural das Construções" },
        { id: "skin-oriente", name: "Manto das Rotas do Oriente", tag: "Pioneiro", desc: "Tecido resistente para a travessia das montanhas em direção à Índia.", buff: "+30% Tolerância em Terrenos Pedregosos" }
      ],
      godotSpecs: {
        polycount: "38.100 Triângulos",
        rig: "IK Humanoide",
        textures: "PBR 4K",
        animCount: "22 Animações",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-mateus",
      name: "Mateus (Levi)",
      title: "O Ex-Publicano & Registrador",
      category: "apostolos",
      file: "Mateus (O Ex-Publicano).jpeg",
      role: "Contabilidade Sagrada & Genealogia",
      district: "Distrito 1 - Mesa da Coletoria de Cafarnaum",
      bio: "Deixou para trás os livros de impostos de Roma ao ouvir a voz de Jesus. Usa sua caligrafia refinada e domínio numérico para auditar os mantimentos da congregação.",
      stats: { fe: 92, mansidao: 88, sabedoria: 96, firmeza: 88, lideranca: 85, comunidade: 91 },
      passive: { name: "Livro das Bem-Aventuranças", desc: "Elimina qualquer desvio ou desperdício de dízimos e bens da vila, mantendo o tesouro 100% auditado." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Túnica do Escriba Arrependido", tag: "Escriba", desc: "Veste elegante com faixas sóbrias e estojo de cálamos à cintura.", buff: "+10% Bônus de Transparência nas Vilas" },
        { id: "skin-evangelista", name: "Manto do Evangelista Real", tag: "Sagrado", desc: "Manto dourado escuro com insígnia da linhagem de Davi.", buff: "+25% Compreensão Rápida de Manuscritos" }
      ],
      godotSpecs: {
        polycount: "37.900 Triângulos",
        rig: "IK Humanoide",
        textures: "PBR 4K",
        animCount: "23 Animações",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-judas-iscariotes",
      name: "Judas Iscariotes",
      title: "O Tesoureiro da Caravana",
      category: "apostolos",
      file: "Judas Iscariotes (O Tesoureiro).jpeg",
      role: "Administrador Financeiro & Dilema Moral",
      district: "Distrito de Kerioth e Jerusalém",
      bio: "Carregador da bolsa comum. Figura dramática do evangelho que lembra ao jogador os perigos da cobiça e a urgência de manter o coração puro diante do dinheiro.",
      stats: { fe: 70, mansidao: 68, sabedoria: 86, firmeza: 75, lideranca: 84, comunidade: 71 },
      passive: { name: "Bolsa de Prata", desc: "Concede 15% de desconto na aquisição inicial de mantimentos, mas requer constante supervisão pastoral." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Traje do Administrador de Kerioth", tag: "Bolsa", desc: "Capa escura e bolsa lateral de couro com moedas de Tiro.", buff: "+15% Capacidade de Moedas da Caravana" },
        { id: "skin-sombras", name: "Manto das Sombras da Noite", tag: "Noite", desc: "Capa pesada que oculta a fisionomia nas vielas de Jerusalém.", buff: "+10% Furtividade Noturna em Cidades" }
      ],
      godotSpecs: {
        polycount: "38.600 Triângulos",
        rig: "IK Humanoide",
        textures: "PBR 4K",
        animCount: "21 Animações",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-judas-tadeu",
      name: "Judas Tadeu",
      title: "O Fiel & Consolador",
      category: "apostolos",
      file: "Judas Tadeu (O Fiel).jpeg",
      role: "Pastor dos Esquecidos & Guardião da Fé",
      district: "Distrito 7 - Platô Leste e Vilarejos Remotos",
      bio: "Autor da contundente exortação sobre perseverar na fé. Não desiste de vilarejos desamparados e viaja até as famílias mais distantes para levar alento e cura.",
      stats: { fe: 95, mansidao: 91, sabedoria: 89, firmeza: 94, lideranca: 82, comunidade: 96 },
      passive: { name: "Consolo dos Desamparados", desc: "Cura o desânimo espiritual em povoados isolados e ergue refúgios comunitários a custo reduzido." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Túnica de Tadeu", tag: "Consolo", desc: "Manto de linho verde musgo e medalhão de bronze em reverência ao Mestre.", buff: "+15% Regeneração de Esperança Comunitária" },
        { id: "skin-missao", name: "Manto da Mesopotâmia", tag: "Missão", desc: "Vestimentas de viagem reforçadas para os planaltos de Edessa e Pérsia.", buff: "+25% Resistência ao Frio e Ventanias" }
      ],
      godotSpecs: {
        polycount: "37.200 Triângulos",
        rig: "IK Humanoide",
        textures: "PBR 4K",
        animCount: "20 Animações",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-simao-zelote",
      name: "Simão, o Zelote",
      title: "O Ex-Revolucionário da Paz",
      category: "apostolos",
      file: "Simão, o Zelote (O Ex-Revolucionário).jpeg",
      role: "Estrategista Tático & Defensor Desarmado",
      district: "Distrito 3 - Colinas da Resistência de Gamala",
      bio: "Ex-rebelde que abandonou o punhal de ferro ao descobrir que o Reino de Deus triunfa pelo amor aos inimigos. Excelente vigia tático de rotas contra salteadores.",
      stats: { fe: 92, mansidao: 80, sabedoria: 87, firmeza: 98, lideranca: 91, comunidade: 88 },
      passive: { name: "Zelo da Verdadeira Justiça", desc: "Desarma pacificamente bandoleiros e salteadores de estradas sem recorrer a combate corporal." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Capa do Vigilante da Galileia", tag: "Vigilante", desc: "Capa cor de terra avermelhada com protetores de couro de búfalo nos punhos.", buff: "+20% Alerta Antecipado de Emboscadas" },
        { id: "skin-paz", name: "Manto Branco da Reconciliação", tag: "Pacificador", desc: "Túnica alva cerimonial consagrada ao diálogo pacífico com povos hostis.", buff: "+35% Taxa de Reconciliação com Rivais" }
      ],
      godotSpecs: {
        polycount: "39.400 Triângulos",
        rig: "IK Humanoide de Combate Defensivo",
        textures: "PBR 4K",
        animCount: "24 Animações",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-natanael-bartolomeu",
      name: "Natanael (Bartolomeu)",
      title: "O Homem sem Dolo",
      category: "apostolos",
      file: "Natanael  Bartolomeu (O Sábio).jpeg",
      role: "Estudioso das Profecias & Discernidor",
      district: "Distrito 2 - Pomares de Caná da Galileia",
      bio: "Visto sob a figueira antes de qualquer palavra. Mente pura e refinada que examina as escrituras com clareza cristalina, desvendando o sentido dos oráculos antigos.",
      stats: { fe: 93, mansidao: 90, sabedoria: 97, firmeza: 89, lideranca: 80, comunidade: 90 },
      passive: { name: "À Sombra da Figueira", desc: "Decifra manuscritos antigos instantaneamente e revela tesouros espirituais nos altares das vilas." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Veste do Erudito de Caná", tag: "Sábio", desc: "Túnica alva com estojo de linho para pergaminhos de Isaías.", buff: "+15% Velocidade de Decodificação Bíblica" },
        { id: "skin-armenia", name: "Manto das Terras da Armênia", tag: "Missão Real", desc: "Roupagem nobre bordada com motivos clássicos da oliveira e da videira.", buff: "+30% Conexão Espiritual com Governadores" }
      ],
      godotSpecs: {
        polycount: "37.600 Triângulos",
        rig: "IK Humanoide",
        textures: "PBR 4K",
        animCount: "20 Animações",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-maria-mae",
      name: "Maria de Nazaré",
      title: "Mãe do Messias & Serva Fiel",
      category: "mulheres",
      file: "Maria, Mãe de Jesus.jpeg",
      role: "Pilar de Mansidão & Guardiã das Memórias",
      district: "Distrito de Nazaré e Lar de Cafarnaum",
      bio: "'Eis aqui a serva do Senhor'. Sua presença maternal dissipa desavenças familiares e inspira uma dedicação sincera aos princípios de hospitalidade da congregação.",
      stats: { fe: 100, mansidao: 99, sabedoria: 98, firmeza: 95, lideranca: 92, comunidade: 99 },
      passive: { name: "Guardar no Coração", desc: "Cura dores emocionais e traumas de moradores das vilas; acelera a integração de órfãos e viúvas." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Manto Azul de Nazaré", tag: "Nobreza Simples", desc: "Véu de linho puro azul celestial e túnica terracota tecida à mão.", buff: "+25% Harmonia e Vigor Comunitário nas Vilas" },
        { id: "skin-bodas", name: "Veste das Bodas de Caná", tag: "Celebração", desc: "Vestimentas de celebração com bordados em fio de bronze discreto.", buff: "+40% Abundância nas Festas Comunitárias" }
      ],
      godotSpecs: {
        polycount: "40.500 Triângulos",
        rig: "IK Humanoide + Simulação de Véu Dinâmico",
        textures: "PBR 4K com Tecido de Linho Realista",
        animCount: "26 Animações",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-maria-madalena",
      name: "Maria Madalena",
      title: "A Matriz Expressiva & Patrona",
      category: "mulheres",
      file: "Maria Madalena (A Matriz Expressiva).jpeg",
      role: "Primeira Mensageira da Ressurreição & Financiadora",
      district: "Distrito de Magdala e Porto das Águas",
      bio: "Liberta de profunda angústia pelo Salvador. Líder generosa que usou seus recursos e determinação inquebrantável para financiar a jornada dos discípulos.",
      stats: { fe: 97, mansidao: 88, sabedoria: 93, firmeza: 98, lideranca: 93, comunidade: 95 },
      passive: { name: "Primeira Testemunha", desc: "Capta doações generosas para os comboios e dissipa imediatamente a desesperança em situações de cerco." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Manto Púrpura de Magdala", tag: "Patrona", desc: "Veste nobre com faixas de seda e frasco de alabastro perfumado.", buff: "+20% Arrecadação de Doações para a Caravana" },
        { id: "skin-jardim", name: "Túnica do Alvorecer do Jardim", tag: "Ressurreição", desc: "Vestimenta branca imaculada da alvorada do domingo da Ressurreição.", buff: "+50% Superação de Qualquer Desânimo Moral" }
      ],
      godotSpecs: {
        polycount: "39.200 Triângulos",
        rig: "IK Humanoide Fluido",
        textures: "PBR 4K",
        animCount: "24 Animações",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-marta",
      name: "Marta de Betânia",
      title: "A Matriz Trabalhadora & Líder Operacional",
      category: "mulheres",
      file: "Marta de Betânia (A Matriz Trabalhadora).jpeg",
      role: "Gestora da Casa & Hospitalidade Máxima",
      district: "Distrito de Betânia - Refúgio da Caravana",
      bio: "Mente executiva e coração acolhedor. Garante que nenhuma comitiva passe sede ou frio. Ensinou que a logística bem feita é uma forma sublime de honrar a Deus.",
      stats: { fe: 93, mansidao: 84, sabedoria: 91, firmeza: 97, lideranca: 94, comunidade: 98 },
      passive: { name: "Serviço Incansável", desc: "Prepara ceias comunitárias instantâneas, revigorando a energia de todos os artesãos e construtores da vila." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Avental de Linho de Betânia", tag: "Hospitalidade", desc: "Túnica resistente para cozinha e acolhimento com avental duplo.", buff: "+30% Velocidade de Preparo de Alimentos nos Refeitórios" },
        { id: "skin-declaracao", name: "Veste da Fé da Ressurreição", tag: "Convicção", desc: "Manto solene de linho escuro da célebre declaração: 'Eu creio que Tu és o Cristo'.", buff: "+25% Força Espiritual em Momentos de Luto" }
      ],
      godotSpecs: {
        polycount: "38.900 Triângulos",
        rig: "IK Humanoide",
        textures: "PBR 4K",
        animCount: "22 Animações",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-maria-betania",
      name: "Maria de Betânia",
      title: "A Matriz Contemplativa & Adoradora",
      category: "mulheres",
      file: "Maria de Betânia (A Matriz Contemplativa).jpeg",
      role: "A Que Escolheu a Boa Parte",
      district: "Distrito de Betânia - Sala da Intimidade",
      bio: "Senta-se aos pés de Jesus para reter cada gota da sabedoria eterna. Quebrou o vaso de alabastro de nardo puro e caríssimo, ensinando a beleza da adoração sacrificial.",
      stats: { fe: 98, mansidao: 97, sabedoria: 96, firmeza: 88, lideranca: 80, comunidade: 94 },
      passive: { name: "Perfume do Nardo Puro", desc: "Inunda o vilarejo com perfume que traz paz instantânea a corações aflitos e atrai chuva de bênçãos." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Túnica de Oração e Nardo", tag: "Contemplação", desc: "Veste de linho fino com o precioso vaso de nardo genuíno.", buff: "+35% Intimidade e Revelação Espiritual" },
        { id: "skin-melhor-parte", name: "Manto da Paz Serena", tag: "Adoração", desc: "Manto suave em tom terracota claro que emana reverência.", buff: "+20% Resistência a Ansiedades Coletivas" }
      ],
      godotSpecs: {
        polycount: "37.800 Triângulos",
        rig: "IK Humanoide",
        textures: "PBR 4K",
        animCount: "20 Animações",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-jumento",
      name: "Jumento Fiel",
      title: "A Montaria Real da Profecia",
      category: "montarias",
      file: "JUMENTO.jpeg",
      role: "Transporte de Cargas & Entrada Triunfal",
      district: "Monte das Oliveiras e Caminhos da Judéia",
      bio: "O humilde quadrúpede sobre o qual o Rei da Glória entrou em Jerusalém. Dócil, resistente a subidas pedregosas e indispensável para transportar alforjes e feridos.",
      stats: { fe: 85, mansidao: 98, sabedoria: 80, firmeza: 100, lideranca: 60, comunidade: 95 },
      passive: { name: "Montaria da Profecia", desc: "Aumenta a capacidade de carga da caravana em +500kg e nunca tem velocidade reduzida em ladeiras íngremes." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Albarda de Carga Rústica", tag: "Caravana", desc: "Cilhas de couro e alforjes de palha trançada para mantimentos e ânforas de azeite.", buff: "+300kg Capacidade Adicional de Carga" },
        { id: "skin-ramos", name: "Manto das Palmas da Entrada Real", tag: "Hosana", desc: "Guarnições com ramos verdes de palmeiras e mantos vermelhos dos peregrinos.", buff: "+25% Velocidade Triunfal e Moral das Vilas" }
      ],
      godotSpecs: {
        polycount: "29.400 Triângulos (Quadrúpede)",
        rig: "IK Quadrúpede com Simulação de Orelhas e Cauda",
        textures: "Pelagem PBR Otimizada para Godot 4.3",
        animCount: "18 Animações de Galope e Descanso",
        engineReady: "Aprovado Godot 4.3"
      }
    },
    {
      id: "char-npc-pastor-adriano",
      name: "Pastor Adriano",
      title: "Investidor Pioneiro & Conselheiro Espiritual (VIP NPC)",
      category: "apoiadores",
      file: "npc pastor adriano.jpeg",
      role: "Patrono da Vila & Guardião da Fé",
      district: "Distrito 4 - Lote Adriano (+25% Fé)",
      bio: "Representação tridimensional fiel do Investidor Pioneiro Pastor Adriano. No jogo, é o mentor do centro de discipulado do Distrito 4, orando pelos necessitados e acolhendo famílias.",
      stats: { fe: 97, mansidao: 92, sabedoria: 95, firmeza: 93, lideranca: 94, comunidade: 96 },
      passive: { name: "Conselho Pastoral do Pioneiro", desc: "Concede +25% de Fé permanente a todas as famílias abrigadas no Distrito 4 e garante retorno seguro de exploradores." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Traje Clássico do Conselheiro", tag: "In-Game NPC", desc: "Túnica nobre com colete de linho e medalhão comissionado do Haja Luz Studio.", buff: "+25% Bônus de Fé Permanente no Distrito 4" },
        { id: "skin-cerimonial", name: "Manto do Púlpito Comunitário", tag: "Solenidade", desc: "Manto solene para ordenação e bênção dos novos líderes de vilas.", buff: "+30% Formação Acelerada de Trabalhadores" }
      ],
      godotSpecs: {
        polycount: "41.800 Triângulos (Face Scan Detalhado)",
        rig: "IK Humanoide de Alta Fidelidade",
        textures: "PBR 4K com Tons Fidedignos de Pele",
        animCount: "22 Animações de Bênção e Diálogo",
        engineReady: "Totalmente Importado no Godot"
      }
    },
    {
      id: "char-npc-william",
      name: "William",
      title: "Investidor Pioneiro & Gestor de Suprimentos (VIP NPC)",
      category: "apoiadores",
      file: "npc william.jpeg",
      role: "Auditor de Reservas & Logística das Vilas",
      district: "Distrito 2 - Armazém William (+20% Recursos)",
      bio: "Representação tridimensional fiel do Investidor Pioneiro William. No jogo, comanda os armazéns e celeiros de Cafarnaum, assegurando que jamais falte trigo nas secas.",
      stats: { fe: 93, mansidao: 90, sabedoria: 94, firmeza: 95, lideranca: 91, comunidade: 95 },
      passive: { name: "Armazém da Fidelidade", desc: "Garante +20% de Recursos perenes em Cafarnaum e elimina perdas por pragas nos celeiros da região." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Traje de Gestão de Suprimentos", tag: "In-Game NPC", desc: "Camisa de linho com cinto utilitário e cadernos de controle de estoque.", buff: "+20% Capacidade de Armazenamento Geral" },
        { id: "skin-auditor", name: "Manto do Tesouro das Vilas", tag: "Auditoria", desc: "Veste de linho fino com selo garantindo integridade das reservas.", buff: "+25% Eficiência nas Feiras Intermunicipais" }
      ],
      godotSpecs: {
        polycount: "40.900 Triângulos (Face Scan Detalhado)",
        rig: "IK Humanoide",
        textures: "PBR 4K",
        animCount: "21 Animações de Conferência e Diálogo",
        engineReady: "Totalmente Importado no Godot"
      }
    },
    {
      id: "char-npc-felipie",
      name: "Felipe",
      title: "Investidor Pioneiro & Emissário Estratégico (VIP NPC)",
      category: "apoiadores",
      file: "npc felipie.jpeg",
      role: "Vanguarda das Rotas & Emissário das Fronteiras",
      district: "Distrito 1 - Posto Avançado Felipe (+15% Comunicação)",
      bio: "Representação tridimensional fiel do Investidor Pioneiro Felipe. No jogo, vigia as rotas de comunicação e postos de fronteira, alertando a comunidade sobre caravanas chegantes.",
      stats: { fe: 94, mansidao: 89, sabedoria: 92, firmeza: 96, lideranca: 92, comunidade: 93 },
      passive: { name: "Vigília das Fronteiras", desc: "Aumenta a velocidade de envio de mensagens entre os 7 distritos em +50% e previne surpresas nas estradas." },
      selectedSkin: 0,
      skins: [
        { id: "skin-default", name: "Traje do Emissário de Rotas", tag: "In-Game NPC", desc: "Jaqueta de couro leve e botas preparadas para jornadas longas.", buff: "+15% Comunicação e Agilidade de Caravana" },
        { id: "skin-diplomata", name: "Manto das Alianças Regionais", tag: "Diplomacia", desc: "Vestes de embaixador da paz para negociações com governadores.", buff: "+30% Sucesso em Acordos de Paz" }
      ],
      godotSpecs: {
        polycount: "41.200 Triângulos (Face Scan Detalhado)",
        rig: "IK Humanoide",
        textures: "PBR 4K",
        animCount: "23 Animações de Exploração e Acenos",
        engineReady: "Totalmente Importado no Godot"
      }
    }
  ],

  getCharacter(id) {
    return this.characters.find(c => c.id === id) || this.characters[0];
  },

  selectCharacterSkin(charId, skinIndex) {
    const char = this.getCharacter(charId);
    if (char && char.skins[skinIndex]) {
      char.selectedSkin = skinIndex;
      return true;
    }
    return false;
  }
};

if (typeof window !== "undefined") {
  window.Store = Store;
}

if (typeof Store !== "undefined" && typeof Store.init === "function") {
  Store.init();
}
