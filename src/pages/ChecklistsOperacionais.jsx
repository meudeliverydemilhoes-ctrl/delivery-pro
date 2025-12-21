import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Plus, Search, Filter, ClipboardCheck, Target, Trophy, BookOpen,
  AlertTriangle, CheckCircle2, Clock, TrendingUp, Award, Zap,
  MessageSquare, BarChart3, Users, Edit2, Trash2, Copy, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import ChecklistCard from "@/components/execucao/ChecklistCard";
import PlanoAcaoCard from "@/components/execucao/PlanoAcaoCard";
import SOPCard from "@/components/execucao/SOPCard";
import DashboardPerformance from "@/components/execucao/DashboardPerformance";
import ComunicadosFeed from "@/components/execucao/ComunicadosFeed";
import RankingMentorados from "@/components/execucao/RankingMentorados";

const pilarOptions = [
  { value: "processos", label: "🏆 Processos", color: "bg-blue-500" },
  { value: "desempenho", label: "📈 Desempenho", color: "bg-emerald-500" },
  { value: "tempo_potencia", label: "⚡ Tempo de Potência", color: "bg-amber-500" },
  { value: "norte_estrategico", label: "🎯 Norte Estratégico", color: "bg-violet-500" },
  { value: "presenca_magnetica", label: "✨ Presença Magnética", color: "bg-pink-500" },
  { value: "geral", label: "📋 Geral", color: "bg-gray-500" }
];

const categoriaOptions = [
  { value: "diario", label: "Diário" },
  { value: "semanal", label: "Semanal" },
  { value: "mensal", label: "Mensal" },
  { value: "pontual", label: "Pontual" }
];

// Checklists Prontos
const checklistsProntos = [
  {
    titulo: "Abertura de Loja",
    pilar: "processos",
    categoria: "diario",
    itens: [
      { texto: "Verificar temperatura dos equipamentos", requer_evidencia: true, tipo_evidencia: "foto" },
      { texto: "Limpar bancadas e superfícies", requer_evidencia: true, tipo_evidencia: "foto" },
      { texto: "Conferir validade dos produtos perecíveis", requer_evidencia: false },
      { texto: "Testar sistema de pedidos online", requer_evidencia: false },
      { texto: "Verificar caixa e troco inicial", requer_evidencia: false },
      { texto: "Uniformes da equipe limpos e adequados", requer_evidencia: true, tipo_evidencia: "foto" }
    ]
  },
  {
    titulo: "Controle de CMV Diário",
    pilar: "desempenho",
    categoria: "diario",
    itens: [
      { texto: "Registrar compras do dia", requer_evidencia: true, tipo_evidencia: "foto" },
      { texto: "Anotar vendas por categoria", requer_evidencia: false },
      { texto: "Identificar perdas e desperdícios", requer_evidencia: true, tipo_evidencia: "comentario" },
      { texto: "Calcular CMV atual", requer_evidencia: false },
      { texto: "Ajustar preços se necessário", requer_evidencia: false }
    ]
  },
  {
    titulo: "Rotina do Gestor Semanal",
    pilar: "tempo_potencia",
    categoria: "semanal",
    itens: [
      { texto: "Revisar metas da semana", requer_evidencia: false },
      { texto: "Reunião com a equipe (15min)", requer_evidencia: true, tipo_evidencia: "foto" },
      { texto: "Análise de relatórios financeiros", requer_evidencia: false },
      { texto: "Planejar cardápio da próxima semana", requer_evidencia: false },
      { texto: "Conferir estoque e fazer pedidos", requer_evidencia: false },
      { texto: "Validar checklists dos colaboradores", requer_evidencia: false }
    ]
  },
  {
    titulo: "Padronização de Montagem",
    pilar: "processos",
    categoria: "diario",
    itens: [
      { texto: "Seguir ficha técnica do produto", requer_evidencia: true, tipo_evidencia: "foto" },
      { texto: "Pesar ingredientes conforme padrão", requer_evidencia: true, tipo_evidencia: "foto" },
      { texto: "Utilizar embalagem correta", requer_evidencia: true, tipo_evidencia: "foto" },
      { texto: "Verificar temperatura de armazenamento", requer_evidencia: false },
      { texto: "Etiquetar com data de validade", requer_evidencia: true, tipo_evidencia: "foto" }
    ]
  },
  {
    titulo: "Atendimento ao Cliente",
    pilar: "presenca_magnetica",
    categoria: "diario",
    itens: [
      { texto: "Cumprimentar cliente com sorriso", requer_evidencia: false },
      { texto: "Oferecer cardápio e sugestões", requer_evidencia: false },
      { texto: "Confirmar pedido antes de enviar", requer_evidencia: false },
      { texto: "Agradecer e pedir feedback", requer_evidencia: false },
      { texto: "Responder avaliações online", requer_evidencia: true, tipo_evidencia: "comentario" }
    ]
  },
  {
    titulo: "Gestão Financeira Mensal",
    pilar: "desempenho",
    categoria: "mensal",
    itens: [
      { texto: "Fechar balanço do mês", requer_evidencia: true, tipo_evidencia: "foto" },
      { texto: "Calcular lucro líquido", requer_evidencia: false },
      { texto: "Revisar despesas fixas e variáveis", requer_evidencia: false },
      { texto: "Planejar investimentos do próximo mês", requer_evidencia: false },
      { texto: "Pagar fornecedores e colaboradores", requer_evidencia: false }
    ]
  },
  {
    titulo: "Marketing Semanal",
    pilar: "presenca_magnetica",
    categoria: "semanal",
    itens: [
      { texto: "Postar 3x nas redes sociais", requer_evidencia: true, tipo_evidencia: "foto" },
      { texto: "Responder mensagens e comentários", requer_evidencia: false },
      { texto: "Criar promoção semanal", requer_evidencia: true, tipo_evidencia: "foto" },
      { texto: "Analisar métricas de engajamento", requer_evidencia: false },
      { texto: "Planejar conteúdo da próxima semana", requer_evidencia: false }
    ]
  },
  {
    titulo: "Gestão de Equipe",
    pilar: "tempo_potencia",
    categoria: "semanal",
    itens: [
      { texto: "Fazer feedback individual", requer_evidencia: false },
      { texto: "Revisar escala de trabalho", requer_evidencia: false },
      { texto: "Treinar equipe em novo processo", requer_evidencia: true, tipo_evidencia: "video" },
      { texto: "Celebrar conquistas da semana", requer_evidencia: true, tipo_evidencia: "foto" },
      { texto: "Identificar necessidades de treinamento", requer_evidencia: false }
    ]
  }
];

// Planos de Ação Prontos
const planosAcaoProntos = [
  {
    titulo: "Redução de CMV Alto",
    pilar: "desempenho",
    problema: "CMV acima de 35%",
    acao: "Revisar fichas técnicas, negociar com fornecedores e reduzir desperdício",
    prioridade: "alta"
  },
  {
    titulo: "Aumentar Ticket Médio",
    pilar: "desempenho",
    problema: "Ticket médio abaixo da meta",
    acao: "Implementar upsell, criar combos e treinar equipe",
    prioridade: "media"
  },
  {
    titulo: "Organizar Rotina",
    pilar: "tempo_potencia",
    problema: "Gestor sem tempo para estratégia",
    acao: "Delegar tarefas operacionais e criar agenda semanal",
    prioridade: "alta"
  },
  {
    titulo: "Padronizar Processos",
    pilar: "processos",
    problema: "Produtos sem padrão de qualidade",
    acao: "Criar fichas técnicas e treinar equipe",
    prioridade: "critica"
  },
  {
    titulo: "Melhorar Presença Online",
    pilar: "presenca_magnetica",
    problema: "Poucas avaliações e engajamento baixo",
    acao: "Postar diariamente e pedir feedback dos clientes",
    prioridade: "media"
  }
];

// SOPs Prontos
const sopsProntos = [
  {
    titulo: "SOP - Atendimento ao Cliente",
    pilar: "presenca_magnetica",
    categoria: "atendimento",
    conteudo: `# Procedimento de Atendimento

## Objetivo
Garantir atendimento de excelência e fidelização do cliente.

## Passo a Passo
1. Cumprimentar com sorriso
2. Oferecer cardápio e sugestões
3. Anotar pedido com atenção
4. Repetir pedido para confirmar
5. Informar tempo de espera
6. Agradecer e pedir feedback`,
    passos: [
      { ordem: 1, titulo: "Cumprimentar", descricao: "Sorria e seja cordial" },
      { ordem: 2, titulo: "Oferecer Menu", descricao: "Apresente o cardápio" },
      { ordem: 3, titulo: "Anotar Pedido", descricao: "Confirme cada item" },
      { ordem: 4, titulo: "Agradecer", descricao: "Peça feedback" }
    ]
  },
  {
    titulo: "SOP - Controle de Estoque",
    pilar: "processos",
    categoria: "gestao",
    conteudo: `# Controle de Estoque

## Objetivo
Evitar desperdício e ruptura de produtos.

## Passo a Passo
1. Conferir estoque diariamente
2. Registrar entradas e saídas
3. Identificar produtos com validade próxima
4. Fazer pedidos semanais
5. Organizar por categoria e data`,
    passos: [
      { ordem: 1, titulo: "Conferência Diária", descricao: "Verifique quantidades" },
      { ordem: 2, titulo: "Registro", descricao: "Anote movimentações" },
      { ordem: 3, titulo: "Validade", descricao: "Identifique vencimentos" },
      { ordem: 4, titulo: "Pedidos", descricao: "Faça reposição" }
    ]
  },
  {
    titulo: "SOP - Abertura de Loja",
    pilar: "processos",
    categoria: "operacional",
    conteudo: `# Procedimento de Abertura

## Objetivo
Iniciar o dia com todos os processos funcionando.

## Checklist Completo
- Ligar equipamentos
- Verificar temperaturas
- Conferir validade de produtos
- Limpar superfícies
- Preparar caixa e troco
- Testar sistema de pedidos`,
    passos: [
      { ordem: 1, titulo: "Equipamentos", descricao: "Ligar e testar" },
      { ordem: 2, titulo: "Limpeza", descricao: "Higienizar tudo" },
      { ordem: 3, titulo: "Validades", descricao: "Conferir produtos" },
      { ordem: 4, titulo: "Sistema", descricao: "Testar pedidos" }
    ]
  }
];

export default function ChecklistsOperacionais() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("execucoes");
  const [search, setSearch] = useState("");
  const [filterPilar, setFilterPilar] = useState("todos");
  const [filterMentorado, setFilterMentorado] = useState("todos");

  // Dialogs
  const [checklistDialog, setChecklistDialog] = useState(false);
  const [sopDialog, setSopDialog] = useState(false);
  const [comunicadoDialog, setComunicadoDialog] = useState(false);
  const [atribuirDialog, setAtribuirDialog] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  // Forms
  const [checklistForm, setChecklistForm] = useState({
    titulo: "", descricao: "", pilar: "processos", categoria: "diario",
    itens: [{ texto: "", requer_evidencia: false }], pontos_conclusao: 10
  });

  const [sopForm, setSopForm] = useState({
    titulo: "", descricao: "", pilar: "processos", categoria: "operacional",
    conteudo: "", passos: [], video_url: ""
  });

  const [comunicadoForm, setComunicadoForm] = useState({
    titulo: "", mensagem: "", tipo: "aviso", pilar: "geral",
    mentorado_id: null, requer_confirmacao: false
  });

  // Queries
  const { data: mentorados = [] } = useQuery({
    queryKey: ["mentorados"],
    queryFn: () => base44.entities.Mentorado.filter({ status: "ativo" })
  });

  const { data: checklists = [] } = useQuery({
    queryKey: ["checklists"],
    queryFn: () => base44.entities.ChecklistInteligente.list("-created_date")
  });

  const { data: execucoes = [] } = useQuery({
    queryKey: ["execucoes"],
    queryFn: () => base44.entities.ExecucaoChecklist.list("-created_date")
  });

  const { data: planosAcao = [] } = useQuery({
    queryKey: ["planosAcao"],
    queryFn: () => base44.entities.PlanoAcaoInteligente.list("-created_date")
  });

  const { data: sops = [] } = useQuery({
    queryKey: ["sops"],
    queryFn: () => base44.entities.SOPPlaybook.list("-created_date")
  });

  const { data: comunicados = [] } = useQuery({
    queryKey: ["comunicados"],
    queryFn: () => base44.entities.ComunicadoMentoria.list("-created_date")
  });

  const { data: scores = [] } = useQuery({
    queryKey: ["scores"],
    queryFn: () => base44.entities.ScoreMentorado.list("-score_execucao")
  });

  // Mutations
  const createChecklistMutation = useMutation({
    mutationFn: (data) => base44.entities.ChecklistInteligente.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      setChecklistDialog(false);
      resetChecklistForm();
    }
  });

  const deleteChecklistMutation = useMutation({
    mutationFn: (id) => base44.entities.ChecklistInteligente.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["checklists"] })
  });

  const createSOPMutation = useMutation({
    mutationFn: (data) => base44.entities.SOPPlaybook.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setSopDialog(false);
      resetSOPForm();
    }
  });

  const createComunicadoMutation = useMutation({
    mutationFn: (data) => base44.entities.ComunicadoMentoria.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comunicados"] });
      setComunicadoDialog(false);
      resetComunicadoForm();
    }
  });

  const atribuirChecklistMutation = useMutation({
    mutationFn: async ({ checklist, mentorado_id, prazo }) => {
      const exec = await base44.entities.ExecucaoChecklist.create({
        mentorado_id,
        checklist_id: checklist.id,
        titulo: checklist.titulo,
        pilar: checklist.pilar,
        categoria: checklist.categoria,
        data_inicio: new Date().toISOString().split("T")[0],
        data_limite: prazo,
        itens: checklist.itens.map(i => ({ ...i, concluido: false })),
        status: "pendente",
        progresso: 0
      });

      // Criar comunicado
      await base44.entities.ComunicadoMentoria.create({
        titulo: `Novo Checklist: ${checklist.titulo}`,
        mensagem: `Você tem um novo checklist para executar. Prazo: ${new Date(prazo).toLocaleDateString("pt-BR")}`,
        tipo: "tarefa",
        pilar: checklist.pilar,
        mentorado_id,
        execucao_id: exec.id,
        requer_confirmacao: true
      });

      return exec;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["execucoes"] });
      queryClient.invalidateQueries({ queryKey: ["comunicados"] });
      setAtribuirDialog(false);
      setSelectedChecklist(null);
    }
  });

  const aplicarChecklistProntoMutation = useMutation({
    mutationFn: async (checklist) => {
      return base44.entities.ChecklistInteligente.create({
        titulo: checklist.titulo,
        pilar: checklist.pilar,
        categoria: checklist.categoria,
        itens: checklist.itens,
        pontos_conclusao: 10,
        ativo: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    }
  });

  const aplicarPlanoAcaoProntoMutation = useMutation({
    mutationFn: async ({ plano, mentorado_id }) => {
      return base44.entities.PlanoAcaoInteligente.create({
        mentorado_id,
        problema: plano.problema,
        acao_corretiva: plano.acao,
        pilar: plano.pilar,
        prioridade: plano.prioridade,
        prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "pendente"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planosAcao"] });
    }
  });

  const aplicarSOPProntoMutation = useMutation({
    mutationFn: async (sop) => {
      return base44.entities.SOPPlaybook.create({
        titulo: sop.titulo,
        descricao: sop.descricao,
        pilar: sop.pilar,
        categoria: sop.categoria,
        conteudo: sop.conteudo,
        passos: sop.passos,
        video_url: sop.video_url,
        versao: "1.0",
        ativo: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
    }
  });

  // Funções auxiliares
  const resetChecklistForm = () => {
    setChecklistForm({
      titulo: "", descricao: "", pilar: "processos", categoria: "diario",
      itens: [{ texto: "", requer_evidencia: false }], pontos_conclusao: 10
    });
  };

  const resetSOPForm = () => {
    setSopForm({
      titulo: "", descricao: "", pilar: "processos", categoria: "operacional",
      conteudo: "", passos: [], video_url: ""
    });
  };

  const resetComunicadoForm = () => {
    setComunicadoForm({
      titulo: "", mensagem: "", tipo: "aviso", pilar: "geral",
      mentorado_id: null, requer_confirmacao: false
    });
  };

  const handleAddItemChecklist = () => {
    setChecklistForm({
      ...checklistForm,
      itens: [...checklistForm.itens, { texto: "", requer_evidencia: false }]
    });
  };

  const handleRemoveItemChecklist = (idx) => {
    setChecklistForm({
      ...checklistForm,
      itens: checklistForm.itens.filter((_, i) => i !== idx)
    });
  };

  const handleCreateChecklist = () => {
    const validItens = checklistForm.itens.filter(i => i.texto.trim());
    if (!checklistForm.titulo || validItens.length === 0) return;
    
    createChecklistMutation.mutate({
      ...checklistForm,
      itens: validItens
    });
  };

  const handleCreateSOP = () => {
    if (!sopForm.titulo) return;
    createSOPMutation.mutate(sopForm);
  };

  const handleCreateComunicado = () => {
    if (!comunicadoForm.titulo || !comunicadoForm.mensagem) return;
    createComunicadoMutation.mutate(comunicadoForm);
  };

  const handleAtribuirChecklist = (mentorado_id, prazo) => {
    if (!selectedChecklist || !mentorado_id || !prazo) return;
    atribuirChecklistMutation.mutate({
      checklist: selectedChecklist,
      mentorado_id,
      prazo
    });
  };

  // Filtros
  const filteredExecucoes = execucoes.filter(e => {
    const matchSearch = e.titulo?.toLowerCase().includes(search.toLowerCase());
    const matchPilar = filterPilar === "todos" || e.pilar === filterPilar;
    const matchMentorado = filterMentorado === "todos" || e.mentorado_id === filterMentorado;
    return matchSearch && matchPilar && matchMentorado;
  });

  const filteredPlanos = planosAcao.filter(p => {
    const matchSearch = p.problema?.toLowerCase().includes(search.toLowerCase());
    const matchPilar = filterPilar === "todos" || p.pilar === filterPilar;
    const matchMentorado = filterMentorado === "todos" || p.mentorado_id === filterMentorado;
    return matchSearch && matchPilar && matchMentorado;
  });

  // Stats
  const totalExecucoes = execucoes.length;
  const execucoesConcluidas = execucoes.filter(e => e.status === "concluido").length;
  const execucoesPendentes = execucoes.filter(e => e.status !== "concluido").length;
  const planosPendentes = planosAcao.filter(p => p.status !== "concluido").length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">🧩 Checklists Operacionais</h1>
        <p className="text-white/50">Gestão completa de execução, SOPs e performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardCheck className="text-[#FF4D00]" size={24} />
            <span className="text-xs text-white/50">Execuções</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalExecucoes}</p>
          <p className="text-xs text-white/40">{execucoesConcluidas} concluídas</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-amber-400" size={24} />
            <span className="text-xs text-white/50">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-white">{execucoesPendentes}</p>
          <p className="text-xs text-white/40">Em andamento</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-blue-400" size={24} />
            <span className="text-xs text-white/50">Planos de Ação</span>
          </div>
          <p className="text-2xl font-bold text-white">{planosPendentes}</p>
          <p className="text-xs text-white/40">Aguardando</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-emerald-400" size={24} />
            <span className="text-xs text-white/50">Modelos</span>
          </div>
          <p className="text-2xl font-bold text-white">{checklists.length + sops.length}</p>
          <p className="text-xs text-white/40">Disponíveis</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="execucoes" className="data-[state=active]:bg-[#FF4D00]">
            <ClipboardCheck size={16} className="mr-2" />
            Execuções
          </TabsTrigger>
          <TabsTrigger value="modelos" className="data-[state=active]:bg-[#FF4D00]">
            <BookOpen size={16} className="mr-2" />
            Modelos
          </TabsTrigger>
          <TabsTrigger value="planos" className="data-[state=active]:bg-[#FF4D00]">
            <Target size={16} className="mr-2" />
            Planos de Ação
          </TabsTrigger>
          <TabsTrigger value="sops" className="data-[state=active]:bg-[#FF4D00]">
            <BookOpen size={16} className="mr-2" />
            SOPs
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-[#FF4D00]">
            <BarChart3 size={16} className="mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="comunicacao" className="data-[state=active]:bg-[#FF4D00]">
            <MessageSquare size={16} className="mr-2" />
            Comunicação
          </TabsTrigger>
        </TabsList>

        {/* TAB: Execuções */}
        <TabsContent value="execucoes">
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <Input
                  placeholder="Buscar execuções..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
              <Select value={filterPilar} onValueChange={setFilterPilar}>
                <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="todos">Todos Pilares</SelectItem>
                  {pilarOptions.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterMentorado} onValueChange={setFilterMentorado}>
                <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="todos">Todos Mentorados</SelectItem>
                  {mentorados.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lista de Execuções */}
            {filteredExecucoes.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl">
                <ClipboardCheck size={48} className="mx-auto mb-4 text-white/20" />
                <p className="text-white/50">Nenhuma execução encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExecucoes.map(exec => (
                  <ChecklistCard
                    key={exec.id}
                    execucao={exec}
                    onUpdate={() => queryClient.invalidateQueries({ queryKey: ["execucoes"] })}
                    onCreatePlanoAcao={(data) => {
                      return base44.entities.PlanoAcaoInteligente.create(data).then(() => {
                        queryClient.invalidateQueries({ queryKey: ["planosAcao"] });
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB: Modelos */}
        <TabsContent value="modelos">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Modelos de Checklist</h3>
              <Button
                onClick={() => setChecklistDialog(true)}
                className="bg-[#FF4D00] hover:bg-[#E64500]"
              >
                <Plus size={16} className="mr-2" />
                Novo Modelo
              </Button>
            </div>

            {/* Checklists Prontos */}
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-3">📦 Checklists Prontos para Usar</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checklistsProntos.map((ck, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h5 className="font-medium text-white mb-2">{ck.titulo}</h5>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                        {pilarOptions.find(p => p.value === ck.pilar)?.label}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                        {categoriaOptions.find(c => c.value === ck.categoria)?.label}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mb-3">{ck.itens.length} itens</p>
                    <Button
                      onClick={() => aplicarChecklistProntoMutation.mutate(ck)}
                      className="w-full bg-[#FF4D00] hover:bg-[#E64500] text-sm"
                    >
                      <Copy size={14} className="mr-2" />
                      Aplicar Este Modelo
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Meus Modelos */}
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-3">Meus Modelos Criados</h4>
              {checklists.length === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-xl">
                  <p className="text-white/40">Nenhum modelo criado ainda</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {checklists.map(ck => (
                    <div key={ck.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-white">{ck.titulo}</h5>
                        <button
                          onClick={() => deleteChecklistMutation.mutate(ck.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-white/40 mb-3">{ck.itens?.length || 0} itens</p>
                      <Button
                        onClick={() => {
                          setSelectedChecklist(ck);
                          setAtribuirDialog(true);
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-sm"
                      >
                        <Play size={14} className="mr-2" />
                        Atribuir a Mentorado
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB: Planos de Ação */}
        <TabsContent value="planos">
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white">Planos de Ação</h3>

            {/* Planos Prontos */}
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-3">📦 Planos de Ação Prontos</h4>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {planosAcaoProntos.map((plano, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h5 className="font-medium text-white mb-2">{plano.titulo}</h5>
                    <p className="text-sm text-white/60 mb-2">❌ {plano.problema}</p>
                    <p className="text-sm text-emerald-400 mb-3">✅ {plano.acao}</p>
                    <Select
                      onValueChange={(mentorado_id) => {
                        if (mentorado_id) {
                          aplicarPlanoAcaoProntoMutation.mutate({ plano, mentorado_id });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Aplicar para mentorado..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        {mentorados.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Planos Ativos */}
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-3">Planos Ativos</h4>
              {filteredPlanos.length === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-xl">
                  <Target size={48} className="mx-auto mb-4 text-white/20" />
                  <p className="text-white/50">Nenhum plano de ação ativo</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredPlanos.map(plano => (
                    <PlanoAcaoCard
                      key={plano.id}
                      plano={plano}
                      onUpdate={() => queryClient.invalidateQueries({ queryKey: ["planosAcao"] })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB: SOPs */}
        <TabsContent value="sops">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">SOPs e Playbooks</h3>
              <Button
                onClick={() => setSopDialog(true)}
                className="bg-[#FF4D00] hover:bg-[#E64500]"
              >
                <Plus size={16} className="mr-2" />
                Novo SOP
              </Button>
            </div>

            {/* SOPs Prontos */}
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-3">📦 SOPs Prontos</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sopsProntos.map((sop, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h5 className="font-medium text-white mb-2">{sop.titulo}</h5>
                    <p className="text-xs text-white/40 mb-3">{sop.passos.length} passos</p>
                    <Button
                      onClick={() => aplicarSOPProntoMutation.mutate(sop)}
                      className="w-full bg-[#FF4D00] hover:bg-[#E64500] text-sm"
                    >
                      <Copy size={14} className="mr-2" />
                      Aplicar Este SOP
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Meus SOPs */}
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-3">Meus SOPs</h4>
              {sops.length === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-xl">
                  <BookOpen size={48} className="mx-auto mb-4 text-white/20" />
                  <p className="text-white/50">Nenhum SOP criado ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sops.map(sop => (
                    <SOPCard
                      key={sop.id}
                      sop={sop}
                      onAplicar={(sopData) => {
                        // Criar checklist baseado no SOP
                        const checklistData = {
                          titulo: `Checklist: ${sopData.titulo}`,
                          pilar: sopData.pilar,
                          categoria: "pontual",
                          itens: sopData.passos.map(p => ({
                            texto: p.titulo,
                            requer_evidencia: false
                          })),
                          sop_vinculado: sopData.id,
                          pontos_conclusao: 15,
                          ativo: true
                        };
                        
                        return base44.entities.ChecklistInteligente.create(checklistData).then(() => {
                          queryClient.invalidateQueries({ queryKey: ["checklists"] });
                        });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB: Performance */}
        <TabsContent value="performance">
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white mb-4">Dashboard de Performance</h3>
            
            <DashboardPerformance
              execucoes={execucoes}
              planosAcao={planosAcao}
              scores={scores}
            />

            <RankingMentorados
              scores={scores}
              mentorados={mentorados}
            />
          </div>
        </TabsContent>

        {/* TAB: Comunicação */}
        <TabsContent value="comunicacao">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Comunicados e Feedback</h3>
              <Button
                onClick={() => setComunicadoDialog(true)}
                className="bg-[#FF4D00] hover:bg-[#E64500]"
              >
                <Plus size={16} className="mr-2" />
                Novo Comunicado
              </Button>
            </div>

            <ComunicadosFeed
              comunicados={comunicados}
              onUpdate={() => queryClient.invalidateQueries({ queryKey: ["comunicados"] })}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Criar Checklist */}
      <Dialog open={checklistDialog} onOpenChange={setChecklistDialog}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Modelo de Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={checklistForm.titulo}
                onChange={(e) => setChecklistForm({ ...checklistForm, titulo: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pilar</Label>
                <Select
                  value={checklistForm.pilar}
                  onValueChange={(v) => setChecklistForm({ ...checklistForm, pilar: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {pilarOptions.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select
                  value={checklistForm.categoria}
                  onValueChange={(v) => setChecklistForm({ ...checklistForm, categoria: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {categoriaOptions.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Itens do Checklist</Label>
              <div className="space-y-2 mt-2">
                {checklistForm.itens.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={item.texto}
                      onChange={(e) => {
                        const newItens = [...checklistForm.itens];
                        newItens[idx].texto = e.target.value;
                        setChecklistForm({ ...checklistForm, itens: newItens });
                      }}
                      placeholder="Item do checklist..."
                      className="bg-white/5 border-white/10 text-white flex-1"
                    />
                    <Button
                      onClick={() => handleRemoveItemChecklist(idx)}
                      className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={handleAddItemChecklist}
                  className="w-full bg-white/5 hover:bg-white/10 text-white"
                >
                  <Plus size={14} className="mr-2" />
                  Adicionar Item
                </Button>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setChecklistDialog(false)}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateChecklist}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                Criar Modelo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Atribuir Checklist */}
      <Dialog open={atribuirDialog} onOpenChange={setAtribuirDialog}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Atribuir Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Mentorado</Label>
              <Select
                onValueChange={(mentorado_id) => {
                  const prazo = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                  handleAtribuirChecklist(mentorado_id, prazo);
                }}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue placeholder="Selecione o mentorado..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {mentorados.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Criar SOP */}
      <Dialog open={sopDialog} onOpenChange={setSopDialog}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar SOP / Playbook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={sopForm.titulo}
                onChange={(e) => setSopForm({ ...sopForm, titulo: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={sopForm.descricao}
                onChange={(e) => setSopForm({ ...sopForm, descricao: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pilar</Label>
                <Select
                  value={sopForm.pilar}
                  onValueChange={(v) => setSopForm({ ...sopForm, pilar: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {pilarOptions.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select
                  value={sopForm.categoria}
                  onValueChange={(v) => setSopForm({ ...sopForm, categoria: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="atendimento">Atendimento</SelectItem>
                    <SelectItem value="producao">Produção</SelectItem>
                    <SelectItem value="gestao">Gestão</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="equipe">Equipe</SelectItem>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Conteúdo (Markdown)</Label>
              <Textarea
                value={sopForm.conteudo}
                onChange={(e) => setSopForm({ ...sopForm, conteudo: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1 min-h-[200px]"
                placeholder="# Título&#10;&#10;## Passo 1&#10;Descrição..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setSopDialog(false)}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateSOP}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                Criar SOP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Criar Comunicado */}
      <Dialog open={comunicadoDialog} onOpenChange={setComunicadoDialog}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Comunicado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={comunicadoForm.titulo}
                onChange={(e) => setComunicadoForm({ ...comunicadoForm, titulo: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label>Mensagem *</Label>
              <Textarea
                value={comunicadoForm.mensagem}
                onChange={(e) => setComunicadoForm({ ...comunicadoForm, mensagem: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select
                  value={comunicadoForm.tipo}
                  onValueChange={(v) => setComunicadoForm({ ...comunicadoForm, tipo: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="aviso">Aviso</SelectItem>
                    <SelectItem value="tarefa">Tarefa</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="novidade">Novidade</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="parabens">Parabéns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mentorado</Label>
                <Select
                  value={comunicadoForm.mentorado_id || "todos"}
                  onValueChange={(v) => setComunicadoForm({ ...comunicadoForm, mentorado_id: v === "todos" ? null : v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="todos">Todos</SelectItem>
                    {mentorados.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setComunicadoDialog(false)}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateComunicado}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                Enviar Comunicado
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}