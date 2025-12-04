import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ChevronDown, ChevronRight, BookOpen, MessageSquare, Target,
  AlertTriangle, Mic, Home, CheckCircle2, Save, Clock,
  Play, FileText, Lightbulb, Quote, Users, TrendingUp,
  Settings, Zap, Compass, Star, BarChart3, ShoppingBag,
  LayoutGrid, Timer, Crown, Navigation, Sparkles, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const aulasData = [
  {
    numero: 1,
    titulo: "Diagnóstico Inicial + Mapa da Operação",
    icon: Target,
    cor: "#3B82F6",
    abertura: "Hoje eu quero enxergar a sua operação como um todo. Sem clareza, não existe mudança.",
    conteudos: [
      {
        titulo: "Introdução aos 5 pilares",
        fala: "Tudo que vamos construir a partir de hoje está dentro desses 5 pilares. Cada pilar resolve um tipo de problema específico da sua operação."
      },
      {
        titulo: "Diagnóstico geral",
        fala: "Antes de melhorar, eu preciso saber onde está ruim. Sem diagnóstico, qualquer ação vira tentativa."
      },
      {
        titulo: "Análise de números",
        fala: "Número não mente. CMV, ticket médio e pedidos por dia contam a história do seu delivery melhor que qualquer opinião."
      },
      {
        titulo: "Auditoria inicial do cardápio",
        fala: "Seu cardápio é sua vitrine. Se ele estiver errado aqui, todo resto sofre."
      },
      {
        titulo: "Mapa dos setores",
        fala: "Eu preciso entender quem faz o quê. Se a função não tem dono, ela não acontece."
      }
    ],
    erroComum: "Tentar melhorar sem saber o que está errado.",
    roteiro: [
      "Eu não estou aqui para te julgar, estou aqui para te mostrar onde está o furo.",
      "Uma operação forte começa sabendo exatamente onde se perde dinheiro.",
      "Tudo que vem a seguir depende dessa clareza."
    ],
    temaCasa: [
      "Enviar números de 30 dias",
      "Cardápio e fotos de produtos",
      "Vídeos da operação",
      "Diagnóstico dos pilares"
    ],
    entregaEsperada: "Diagnóstico completo enviado.",
    fechamento: "Agora sabemos onde você está. A partir da próxima aula, começamos a arrumar a casa."
  },
  {
    numero: 2,
    titulo: "Processos: A Base da Operação",
    icon: Settings,
    cor: "#10B981",
    abertura: "Processo não é burocracia — é o que garante que sua loja funcione sem você.",
    conteudos: [
      {
        titulo: "O que são processos",
        fala: "Processo é um passo a passo que garante que tudo seja feito igual todos os dias. Sem processo, cada dia vira uma surpresa."
      },
      {
        titulo: "Checklists",
        fala: "Checklist não é enfeite. Ele garante que ninguém esqueça o básico — e o básico é o que sustenta sua operação."
      },
      {
        titulo: "Setorização",
        fala: "Se duas pessoas fazem a mesma função, ninguém é responsável. Setorização traz ordem."
      },
      {
        titulo: "Redução de erros",
        fala: "Quando o processo está claro, o erro fica visível. Quando não está claro, o erro vira rotina."
      }
    ],
    erroComum: "Ter processos no papel, mas não na prática.",
    roteiro: [
      "O time só erra porque não sabe o padrão.",
      "Sem rotina, cada dia funciona de um jeito.",
      "Processo é o que permite a loja crescer."
    ],
    temaCasa: [
      "Criar checklists de abertura/turno/fechamento",
      "Definir setores e responsáveis"
    ],
    entregaEsperada: "Checklists e setorização enviados.",
    fechamento: "Com processo, reduzimos o caos. Na próxima aula, vamos reduzir desperdício."
  },
  {
    numero: 3,
    titulo: "Fichas Técnicas + Balança",
    icon: FileText,
    cor: "#8B5CF6",
    abertura: "Hoje começa a parte que transforma lucro: consistência.",
    conteudos: [
      {
        titulo: "O que é ficha técnica",
        fala: "Ficha técnica é a receita oficial da sua empresa. Se não tem, cada colaborador cria uma nova."
      },
      {
        titulo: "Gramaturas e padrões",
        fala: "Padronizar não é frescura — é o que garante custo, sabor e velocidade."
      },
      {
        titulo: "Uso da balança",
        fala: "A balança não atrasa produção. Ela evita desperdício e inconsciência."
      },
      {
        titulo: "Controle de produção",
        fala: "Sem controle de produção, você não sabe onde perdeu, nem onde ganhou."
      }
    ],
    erroComum: "A equipe não seguir a ficha técnica.",
    roteiro: [
      "Quem cozinha no olho, tem CMV no escuro.",
      "Inconsistência mata o lucro.",
      "A balança padroniza."
    ],
    temaCasa: [
      "Criar 10 fichas técnicas",
      "Treinar equipe no uso da balança",
      "Registrar consumo real vs ficha"
    ],
    entregaEsperada: "10 fichas técnicas + relatório de consumo.",
    fechamento: "Agora controlamos o produto. Na próxima, controlaremos o caminho dele."
  },
  {
    numero: 4,
    titulo: "Fluxogramas Operacionais",
    icon: LayoutGrid,
    cor: "#F59E0B",
    abertura: "Eu quero que sua loja funcione no automático.",
    conteudos: [
      {
        titulo: "Fluxo da Montagem",
        fala: "Montagem não pode ser improvisada. Cada etapa precisa ser sempre igual para garantir padrão e velocidade."
      },
      {
        titulo: "Fluxo dos Molhos / Pré-preparo",
        fala: "O pré-preparo mal feito derruba a noite inteira. Ele é o alicerce da operação."
      },
      {
        titulo: "Fluxo da Cozinha",
        fala: "Cozinha organizada reduz 80% dos atrasos."
      },
      {
        titulo: "Expedição",
        fala: "Expedição é a porta final. É onde você garante que o cliente recebe o que comprou."
      },
      {
        titulo: "Treinamento acelerado",
        fala: "Com fluxograma, qualquer pessoa treina um novo colaborador em 2 dias."
      }
    ],
    erroComum: "Soltar funcionário na operação sem mapa.",
    roteiro: [
      "Fluxograma é a fotografia da sua operação.",
      "Com mapa, a equipe executa sem perguntar.",
      "Treinar funcionário falando, não mostrando — esse é o erro."
    ],
    temaCasa: [
      "Validar todos os fluxos com a equipe",
      "Ajustar funções conforme necessário"
    ],
    entregaEsperada: "Fluxos validados e documentados.",
    fechamento: "Com tudo organizado, agora vamos aumentar o lucro."
  },
  {
    numero: 5,
    titulo: "CMV, Markup e Lucro Real",
    icon: BarChart3,
    cor: "#EF4444",
    abertura: "Se você não controla os números, os números controlam você.",
    conteudos: [
      {
        titulo: "Markup",
        fala: "Markup errado destrói todo o trabalho da cozinha."
      },
      {
        titulo: "CMV",
        fala: "CMV alto é sintoma. A causa é sempre uma das quatro: preço, perda, compra errada ou porcionamento."
      },
      {
        titulo: "Perdas invisíveis",
        fala: "A maior parte do seu prejuízo não aparece no caixa — aparece no lixo."
      }
    ],
    erroComum: "Achar normal ter CMV alto.",
    roteiro: [
      "Preço errado é lucro jogado fora.",
      "CMV é sinal vital.",
      "CMV só sobe por 4 motivos: preço, perda, compra errada ou porcionamento."
    ],
    temaCasa: [
      "Revisar preços de todos os produtos",
      "Atualizar planilha de CMV"
    ],
    entregaEsperada: "Markup revisado e atualizado.",
    fechamento: "Agora que entendemos lucro, vamos buscar mais pedidos."
  },
  {
    numero: 6,
    titulo: "iFood: Jogo da Visibilidade",
    icon: ShoppingBag,
    cor: "#EC4899",
    abertura: "No iFood, quem aparece bem vende muito.",
    conteudos: [
      {
        titulo: "Algoritmo",
        fala: "O iFood te mostra para quem ele confia que você entrega bem."
      },
      {
        titulo: "Fotos",
        fala: "O cliente compra com os olhos antes de comprar com o bolso."
      },
      {
        titulo: "Descrições",
        fala: "Descrição não é poesia, é venda."
      },
      {
        titulo: "Combos",
        fala: "Combo bom não é barato — é inteligente."
      },
      {
        titulo: "Promoções",
        fala: "Promoção não é desespero. Promoção é estratégia."
      }
    ],
    erroComum: "Achar que basta estar no iFood.",
    roteiro: [
      "O cliente compra pela foto.",
      "Promoção é estratégia.",
      "Copiar o concorrente sem entender a lógica dele — esse é o erro."
    ],
    temaCasa: [
      "Criar 3 combos estratégicos",
      "Atualizar fotos e descrições do cardápio"
    ],
    entregaEsperada: "Cardápio otimizado no iFood.",
    fechamento: "Agora transformaremos seu cardápio em máquina de conversão."
  },
  {
    numero: 7,
    titulo: "Cardápio Digital: Máquina de Conversão",
    icon: BookOpen,
    cor: "#06B6D4",
    abertura: "Seu cardápio é sua vitrine — e vitrine ruim espanta cliente.",
    conteudos: [
      {
        titulo: "Organização por categorias",
        fala: "Categoria mal organizada confunde o cliente e mata vendas."
      },
      {
        titulo: "Produtos âncora e isca",
        fala: "Você escolhe o que o cliente vai comprar pela forma que organiza o cardápio."
      },
      {
        titulo: "Descrições",
        fala: "Descrição boa não enrola — ela faz o cliente clicar."
      },
      {
        titulo: "Fotos que convertem",
        fala: "Foto fraca derruba ticket médio."
      }
    ],
    erroComum: "Transformar o cardápio em lista de produtos.",
    roteiro: [
      "O cliente decide em 6 segundos.",
      "Se não ajuda a vender, atrapalha.",
      "Cardápio virar um catálogo de produtos — esse é o erro."
    ],
    temaCasa: [
      "Reorganizar categorias do cardápio",
      "Atualizar fotos e descrições"
    ],
    entregaEsperada: "Cardápio revisado e otimizado.",
    fechamento: "Agora que vende mais, vamos acelerar seu time."
  },
  {
    numero: 8,
    titulo: "Tempo de Potência",
    icon: Zap,
    cor: "#8B5CF6",
    abertura: "Sua loja não tem problema de gente — tem problema de fluxo.",
    conteudos: [
      {
        titulo: "Cronograma",
        fala: "A operação precisa ter ritmo. Sem ritmo, tudo trava."
      },
      {
        titulo: "Kanban",
        fala: "Quando tudo tem dono, nada fica parado."
      },
      {
        titulo: "Gargalos",
        fala: "Onde trava, perde dinheiro."
      }
    ],
    erroComum: "Achar que atraso é normal.",
    roteiro: [
      "Tempo é dinheiro.",
      "Equipe rápida erra menos.",
      "Querer contratar mais gente ao invés de organizar — esse é o erro."
    ],
    temaCasa: [
      "Criar quadro Kanban",
      "Criar cronograma semanal"
    ],
    entregaEsperada: "Kanban + cronograma implementados.",
    fechamento: "Agora vamos fortalecer seu time."
  },
  {
    numero: 9,
    titulo: "Liderança, Regras e Cultura",
    icon: Crown,
    cor: "#F59E0B",
    abertura: "Sem liderança, nenhum processo se sustenta.",
    conteudos: [
      {
        titulo: "Cultura organizacional",
        fala: "Cultura é o que sua equipe faz quando você não está vendo."
      },
      {
        titulo: "Regras internas",
        fala: "Regra não é rigidez. Regra é proteção."
      },
      {
        titulo: "Correção de erros",
        fala: "Corrigir é ensinar, não castigar."
      }
    ],
    erroComum: "Delegar sem ensinar.",
    roteiro: [
      "Funcionário não erra por mal, erra por falta de clareza.",
      "Cultura mantém tudo funcionando.",
      "Cobrar antes de ensinar — esse é o erro."
    ],
    temaCasa: [
      "Criar documento de regras internas",
      "Fazer reunião de alinhamento com equipe"
    ],
    entregaEsperada: "Documento de regras entregue.",
    fechamento: "Agora vamos dar direção à sua marca."
  },
  {
    numero: 10,
    titulo: "Norte Estratégico",
    icon: Compass,
    cor: "#10B981",
    abertura: "Uma empresa sem norte vive apagando incêndio.",
    conteudos: [
      {
        titulo: "Missão",
        fala: "A missão explica o porquê você existe."
      },
      {
        titulo: "Visão",
        fala: "A visão mostra onde você quer chegar."
      },
      {
        titulo: "Valores",
        fala: "Valores determinam o que você aceita e o que você não aceita."
      }
    ],
    erroComum: "Tomar decisões pelo urgente.",
    roteiro: [
      "Sua empresa precisa ter alma.",
      "O norte evita decisões emocionais.",
      "Ter valores, mas não praticar — esse é o erro."
    ],
    temaCasa: [
      "Criar missão, visão e valores",
      "Documentar e compartilhar com equipe"
    ],
    entregaEsperada: "Documento de MVV finalizado.",
    fechamento: "Agora vamos colocar sua marca no mundo."
  },
  {
    numero: 11,
    titulo: "Presença Magnética",
    icon: Sparkles,
    cor: "#EC4899",
    abertura: "O cliente precisa lembrar de você antes de sentir fome.",
    conteudos: [
      {
        titulo: "Identidade visual",
        fala: "Sua marca precisa ser reconhecida sem aparecer o nome."
      },
      {
        titulo: "Storytelling",
        fala: "Storytelling não é história — é conexão."
      },
      {
        titulo: "Conteúdo estratégico",
        fala: "Conteúdo é para chamar cliente, não para enfeitar Instagram."
      }
    ],
    erroComum: "Postar por postar.",
    roteiro: [
      "Sua marca é o que o cliente sente quando lembra de você.",
      "Conteúdo não é foto — é propósito.",
      "Postar sem estratégia — esse é o erro."
    ],
    temaCasa: [
      "Criar 7 conteúdos estratégicos",
      "Definir identidade visual"
    ],
    entregaEsperada: "Identidade visual organizada.",
    fechamento: "Agora vamos preparar seu crescimento."
  },
  {
    numero: 12,
    titulo: "Escala e Expansão",
    icon: Rocket,
    cor: "#3B82F6",
    abertura: "Crescer não é abrir outra loja — é estar pronto para multiplicar.",
    conteudos: [
      {
        titulo: "Revisão dos pilares",
        fala: "Nenhuma expansão sustenta aquilo que não foi arrumado na base."
      },
      {
        titulo: "Plano 30/60/90",
        fala: "Plano sem prazo é desejo. Plano com prazo é execução."
      },
      {
        titulo: "Indicadores de maturidade",
        fala: "Sua operação precisa andar sem você antes de se multiplicar."
      }
    ],
    erroComum: "Expandir antes de arrumar a casa.",
    roteiro: [
      "A segunda unidade só existe quando a primeira anda sozinha.",
      "Expansão é construída.",
      "Avaliar expansão pelo faturamento, não pela estrutura — esse é o erro."
    ],
    temaCasa: [
      "Criar plano 30/60/90",
      "Definir metas da nova fase"
    ],
    entregaEsperada: "Plano de expansão concluído.",
    fechamento: "Você agora tem método, direção e clareza. O resto é execução."
  }
];

const statusOptions = [
  { value: "pendente", label: "Pendente", cor: "bg-red-500", icon: "🔴" },
  { value: "em_andamento", label: "Em andamento", cor: "bg-amber-500", icon: "🟡" },
  { value: "concluida", label: "Concluída", cor: "bg-emerald-500", icon: "🟢" }
];

export default function AulasMentoria({ mentoradoId }) {
  const queryClient = useQueryClient();
  const [expandedAulas, setExpandedAulas] = useState({});
  const [aulasProgress, setAulasProgress] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  useEffect(() => {
    if (briefing?.aulas_mentoria) {
      setAulasProgress(briefing.aulas_mentoria);
    } else {
      const defaultProgress = {};
      aulasData.forEach(aula => {
        defaultProgress[aula.numero] = {
          status: "pendente",
          anotacoes: ""
        };
      });
      setAulasProgress(defaultProgress);
    }
  }, [briefing]);

  const updateBriefingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Briefing.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefing", mentoradoId] });
      setHasChanges(false);
    }
  });

  const createBriefingMutation = useMutation({
    mutationFn: (data) => base44.entities.Briefing.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefing", mentoradoId] });
      setHasChanges(false);
    }
  });

  const toggleAula = (numero) => {
    setExpandedAulas(prev => ({ ...prev, [numero]: !prev[numero] }));
  };

  const updateAulaField = (numero, field, value) => {
    setAulasProgress(prev => ({
      ...prev,
      [numero]: { ...prev[numero], [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (briefing?.id) {
      updateBriefingMutation.mutate({
        id: briefing.id,
        data: { ...briefing, aulas_mentoria: aulasProgress }
      });
    } else {
      createBriefingMutation.mutate({
        mentorado_id: mentoradoId,
        aulas_mentoria: aulasProgress
      });
    }
  };

  const calcularProgresso = () => {
    const concluidas = Object.values(aulasProgress).filter(a => a?.status === "concluida").length;
    return Math.round((concluidas / 12) * 100);
  };

  const progresso = calcularProgresso();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-[#FF4D00]" />
            Aulas da Mentoria Delivery
          </h2>
          <p className="text-white/50 text-sm mt-1">12 aulas completas com roteiros, conteúdos e entregas</p>
        </div>
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={updateBriefingMutation.isPending || createBriefingMutation.isPending}
            className="bg-[#FF4D00] hover:bg-[#E64500]"
          >
            <Save size={16} className="mr-2" />
            Salvar
          </Button>
        )}
      </div>

      {/* Progresso Geral */}
      <div className="bg-gradient-to-r from-[#FF4D00]/20 to-transparent border border-[#FF4D00]/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-[#FF4D00] rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{progresso}%</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Progresso das Aulas</h3>
              <p className="text-white/50 text-sm">
                {Object.values(aulasProgress).filter(a => a?.status === "concluida").length} de 12 aulas concluídas
              </p>
            </div>
          </div>
        </div>
        <Progress value={progresso} className="h-3 bg-white/10" />
      </div>

      {/* Lista de Aulas */}
      <div className="space-y-4">
        {aulasData.map((aula) => {
          const Icon = aula.icon;
          const isExpanded = expandedAulas[aula.numero];
          const aulaProgress = aulasProgress[aula.numero] || { status: "pendente", anotacoes: "" };
          const statusInfo = statusOptions.find(s => s.value === aulaProgress.status);

          return (
            <div
              key={aula.numero}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              {/* Header da Aula */}
              <button
                onClick={() => toggleAula(aula.numero)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: aula.cor }}
                  >
                    {aula.numero}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white">AULA {aula.numero} — {aula.titulo}</h3>
                    <p className="text-sm text-white/50 mt-1 line-clamp-1">"{aula.abertura}"</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${
                    statusInfo?.value === "concluida" ? "bg-emerald-500/20 text-emerald-400" :
                    statusInfo?.value === "em_andamento" ? "bg-amber-500/20 text-amber-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {statusInfo?.icon} {statusInfo?.label}
                  </span>
                  {isExpanded ? <ChevronDown className="text-white/50" /> : <ChevronRight className="text-white/50" />}
                </div>
              </button>

              {/* Conteúdo Expandido */}
              {isExpanded && (
                <div className="p-6 pt-0 border-t border-white/10 space-y-6">
                  
                  {/* Frase de Abertura */}
                  <div className="bg-gradient-to-r from-white/5 to-transparent rounded-xl p-4 border-l-4" style={{ borderColor: aula.cor }}>
                    <div className="flex items-center gap-2 text-white/60 mb-2">
                      <Quote size={16} />
                      <span className="text-xs font-medium uppercase">Frase de Abertura</span>
                    </div>
                    <p className="text-white text-lg italic">"{aula.abertura}"</p>
                  </div>

                  {/* Conteúdos */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen size={16} style={{ color: aula.cor }} />
                      <span className="font-medium text-white">Conteúdos da Aula</span>
                    </div>
                    <div className="space-y-3">
                      {aula.conteudos.map((conteudo, idx) => (
                        <div key={idx} className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ backgroundColor: aula.cor }}
                            >
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-white mb-2">{conteudo.titulo}</h4>
                              <div className="flex items-start gap-2 bg-black/20 rounded-lg p-3">
                                <Mic size={14} className="text-white/40 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-white/70 italic">"{conteudo.fala}"</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Erro Mais Comum */}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <AlertTriangle size={16} />
                      <span className="font-medium">Erro Mais Comum</span>
                    </div>
                    <p className="text-white/80">"{aula.erroComum}"</p>
                  </div>

                  {/* Roteiro de Fala */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Mic size={16} style={{ color: aula.cor }} />
                      <span className="font-medium text-white">Roteiro de Fala</span>
                    </div>
                    <div className="space-y-2">
                      {aula.roteiro.map((frase, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <span className="text-white/40">"</span>
                          <p className="text-white/80 italic">{frase}</p>
                          <span className="text-white/40">"</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tema de Casa */}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-400 mb-3">
                      <Home size={16} />
                      <span className="font-medium">Tema de Casa</span>
                    </div>
                    <ul className="space-y-2">
                      {aula.temaCasa.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-white/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Entrega Esperada */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <CheckCircle2 size={16} />
                      <span className="font-medium">Entrega Esperada</span>
                    </div>
                    <p className="text-white/80">{aula.entregaEsperada}</p>
                  </div>

                  {/* Frase de Fechamento */}
                  <div className="bg-gradient-to-r from-white/5 to-transparent rounded-xl p-4 border-l-4 border-emerald-500">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <Quote size={16} />
                      <span className="text-xs font-medium uppercase">Frase de Fechamento</span>
                    </div>
                    <p className="text-white text-lg italic">"{aula.fechamento}"</p>
                  </div>

                  {/* Status e Anotações */}
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <label className="text-xs text-white/50 mb-2 block">Status da Aula</label>
                      <Select
                        value={aulaProgress.status}
                        onValueChange={(v) => updateAulaField(aula.numero, "status", v)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          {statusOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.icon} {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-2 block flex items-center gap-1">
                        <MessageSquare size={12} />
                        Anotações do Mentorado
                      </label>
                      <Textarea
                        value={aulaProgress.anotacoes || ""}
                        onChange={(e) => updateAulaField(aula.numero, "anotacoes", e.target.value)}
                        placeholder="Anotações, dúvidas, observações..."
                        className="bg-white/5 border-white/10 text-white min-h-[80px] resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botão Salvar Fixo */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleSave}
            disabled={updateBriefingMutation.isPending || createBriefingMutation.isPending}
            size="lg"
            className="bg-[#FF4D00] hover:bg-[#E64500] shadow-lg shadow-[#FF4D00]/30"
          >
            <Save size={18} className="mr-2" />
            Salvar Progresso
          </Button>
        </div>
      )}
    </div>
  );
}