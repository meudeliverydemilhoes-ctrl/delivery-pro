import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ClipboardList, Target, AlertTriangle, Trophy, BookOpen, Bell,
  Plus, Search, Filter, Download, RefreshCw, Zap, Users, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import ChecklistCard from "@/components/execucao/ChecklistCard";
import PlanoAcaoCard from "@/components/execucao/PlanoAcaoCard";
import DashboardPerformance from "@/components/execucao/DashboardPerformance";
import SOPCard from "@/components/execucao/SOPCard";
import ComunicadosFeed from "@/components/execucao/ComunicadosFeed";
import RankingMentorados from "@/components/execucao/RankingMentorados";
import AssistenteIA from "@/components/execucao/AssistenteIA";

const pilarOptions = [
  { value: "processos", label: "🏆 Processos" },
  { value: "desempenho", label: "📈 Desempenho" },
  { value: "tempo_potencia", label: "⚡ Time de Potência" },
  { value: "norte_estrategico", label: "🎯 Norte Estratégico" },
  { value: "presenca_magnetica", label: "✨ Presença Magnética" },
  { value: "geral", label: "📋 Geral" }
];

const categoriaOptions = [
  { value: "diario", label: "Diário" },
  { value: "semanal", label: "Semanal" },
  { value: "mensal", label: "Mensal" },
  { value: "pontual", label: "Pontual" }
];

export default function ExecucaoInteligente() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("execucoes");
  const [search, setSearch] = useState("");
  const [pilarFilter, setPilarFilter] = useState("todos");
  const [mentoradoFilter, setMentoradoFilter] = useState("todos");
  
  // Dialogs
  const [checklistDialogOpen, setChecklistDialogOpen] = useState(false);
  const [atribuirDialogOpen, setAtribuirDialogOpen] = useState(false);
  const [sopDialogOpen, setSOPDialogOpen] = useState(false);
  const [comunicadoDialogOpen, setComunicadoDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  
  // Forms
  const [checklistForm, setChecklistForm] = useState({
    titulo: "", descricao: "", pilar: "processos", categoria: "diario", itens: [], pontos_conclusao: 10
  });
  const [novoItem, setNovoItem] = useState({ texto: "", obrigatorio: true, requer_evidencia: false, tipo_evidencia: "foto" });
  const [sopForm, setSOPForm] = useState({
    titulo: "", descricao: "", pilar: "processos", categoria: "operacional", conteudo: "", video_url: "", passos: []
  });
  const [comunicadoForm, setComunicadoForm] = useState({
    titulo: "", mensagem: "", tipo: "aviso", pilar: "geral", mentorado_id: "", requer_confirmacao: false
  });
  const [atribuirForm, setAtribuirForm] = useState({ mentorado_id: "", data_limite: "" });

  // Queries
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
    queryFn: () => base44.entities.SOPPlaybook.filter({ ativo: true }, "-created_date")
  });

  const { data: comunicados = [] } = useQuery({
    queryKey: ["comunicados"],
    queryFn: () => base44.entities.ComunicadoMentoria.list("-created_date")
  });

  const { data: mentorados = [] } = useQuery({
    queryKey: ["mentorados"],
    queryFn: () => base44.entities.Mentorado.filter({ status: "ativo" })
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
      setChecklistDialogOpen(false);
      setChecklistForm({ titulo: "", descricao: "", pilar: "processos", categoria: "diario", itens: [], pontos_conclusao: 10 });
    }
  });

  const createExecucaoMutation = useMutation({
    mutationFn: (data) => base44.entities.ExecucaoChecklist.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["execucoes"] });
      setAtribuirDialogOpen(false);
      setSelectedChecklist(null);
      setAtribuirForm({ mentorado_id: "", data_limite: "" });
    }
  });

  const createPlanoAcaoMutation = useMutation({
    mutationFn: (data) => base44.entities.PlanoAcaoInteligente.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planosAcao"] });
    }
  });

  const createSOPMutation = useMutation({
    mutationFn: (data) => base44.entities.SOPPlaybook.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setSOPDialogOpen(false);
      setSOPForm({ titulo: "", descricao: "", pilar: "processos", categoria: "operacional", conteudo: "", video_url: "", passos: [] });
    }
  });

  const createComunicadoMutation = useMutation({
    mutationFn: (data) => base44.entities.ComunicadoMentoria.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comunicados"] });
      setComunicadoDialogOpen(false);
      setComunicadoForm({ titulo: "", mensagem: "", tipo: "aviso", pilar: "geral", mentorado_id: "", requer_confirmacao: false });
    }
  });

  // Handlers
  const handleAddItem = () => {
    if (novoItem.texto.trim()) {
      setChecklistForm({
        ...checklistForm,
        itens: [...checklistForm.itens, { ...novoItem }]
      });
      setNovoItem({ texto: "", obrigatorio: true, requer_evidencia: false, tipo_evidencia: "foto" });
    }
  };

  const handleRemoveItem = (idx) => {
    setChecklistForm({
      ...checklistForm,
      itens: checklistForm.itens.filter((_, i) => i !== idx)
    });
  };

  const handleCreateChecklist = () => {
    if (checklistForm.titulo && checklistForm.itens.length > 0) {
      createChecklistMutation.mutate(checklistForm);
    }
  };

  const handleAtribuirChecklist = () => {
    if (selectedChecklist && atribuirForm.mentorado_id) {
      createExecucaoMutation.mutate({
        mentorado_id: atribuirForm.mentorado_id,
        checklist_id: selectedChecklist.id,
        titulo: selectedChecklist.titulo,
        pilar: selectedChecklist.pilar,
        categoria: selectedChecklist.categoria,
        data_inicio: new Date().toISOString().split("T")[0],
        data_limite: atribuirForm.data_limite || null,
        status: "pendente",
        itens: selectedChecklist.itens.map(item => ({
          texto: item.texto,
          concluido: false,
          requer_evidencia: item.requer_evidencia
        })),
        progresso: 0
      });
    }
  };

  const handleAplicarSOP = (sop) => {
    // Criar checklist baseado no SOP
    const checklistData = {
      titulo: `Checklist: ${sop.titulo}`,
      descricao: `Gerado automaticamente do SOP: ${sop.titulo}`,
      pilar: sop.pilar,
      categoria: "pontual",
      sop_vinculado: sop.id,
      itens: sop.passos?.map(p => ({
        texto: p.titulo,
        obrigatorio: true,
        requer_evidencia: false
      })) || [],
      pontos_conclusao: 15
    };
    createChecklistMutation.mutate(checklistData);
  };

  const handleCreatePlanoAcao = (data) => {
    createPlanoAcaoMutation.mutate({
      ...data,
      prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      prioridade: "media",
      status: "pendente"
    });
  };

  // Filtros
  const getMentoradoNome = (id) => mentorados.find(m => m.id === id)?.nome || "Desconhecido";

  const filteredExecucoes = execucoes.filter(e => {
    const matchSearch = e.titulo?.toLowerCase().includes(search.toLowerCase());
    const matchPilar = pilarFilter === "todos" || e.pilar === pilarFilter;
    const matchMentorado = mentoradoFilter === "todos" || e.mentorado_id === mentoradoFilter;
    return matchSearch && matchPilar && matchMentorado;
  });

  const filteredPlanos = planosAcao.filter(p => {
    const matchSearch = p.problema?.toLowerCase().includes(search.toLowerCase());
    const matchPilar = pilarFilter === "todos" || p.pilar === pilarFilter;
    const matchMentorado = mentoradoFilter === "todos" || p.mentorado_id === mentoradoFilter;
    return matchSearch && matchPilar && matchMentorado;
  });

  const pendentes = filteredExecucoes.filter(e => e.status !== "concluido");
  const concluidos = filteredExecucoes.filter(e => e.status === "concluido");

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Zap className="text-[#FF4D00]" />
            Execução Inteligente
          </h1>
          <p className="text-white/50">Checklists, planos de ação e acompanhamento de performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setComunicadoDialogOpen(true)} className="border-white/10 text-white">
            <Bell size={18} className="mr-2" /> Comunicado
          </Button>
          <Button variant="outline" onClick={() => setSOPDialogOpen(true)} className="border-white/10 text-white">
            <BookOpen size={18} className="mr-2" /> Novo SOP
          </Button>
          <Button onClick={() => setChecklistDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
            <Plus size={18} className="mr-2" /> Novo Checklist
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Select value={pilarFilter} onValueChange={setPilarFilter}>
          <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Pilar" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="todos">Todos os Pilares</SelectItem>
            {pilarOptions.map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={mentoradoFilter} onValueChange={setMentoradoFilter}>
          <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Mentorado" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="todos">Todos</SelectItem>
            {mentorados.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 p-1 mb-6">
          <TabsTrigger value="execucoes" className="data-[state=active]:bg-[#FF4D00]">
            <ClipboardList size={16} className="mr-2" /> Execuções
          </TabsTrigger>
          <TabsTrigger value="modelos" className="data-[state=active]:bg-[#FF4D00]">
            <FileText size={16} className="mr-2" /> Modelos
          </TabsTrigger>
          <TabsTrigger value="planos" className="data-[state=active]:bg-[#FF4D00]">
            <AlertTriangle size={16} className="mr-2" /> Planos de Ação
          </TabsTrigger>
          <TabsTrigger value="sops" className="data-[state=active]:bg-[#FF4D00]">
            <BookOpen size={16} className="mr-2" /> SOPs
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#FF4D00]">
            <Trophy size={16} className="mr-2" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="comunicados" className="data-[state=active]:bg-[#FF4D00]">
            <Bell size={16} className="mr-2" /> Comunicados
          </TabsTrigger>
        </TabsList>

        {/* Execuções */}
        <TabsContent value="execucoes">
          <div className="space-y-6">
            {pendentes.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Em Andamento ({pendentes.length})</h3>
                <div className="space-y-3">
                  {pendentes.map(exec => (
                    <ChecklistCard
                      key={exec.id}
                      execucao={exec}
                      onCreatePlanoAcao={handleCreatePlanoAcao}
                    />
                  ))}
                </div>
              </div>
            )}
            {concluidos.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white/60 mb-4">Concluídos ({concluidos.length})</h3>
                <div className="space-y-3 opacity-70">
                  {concluidos.slice(0, 5).map(exec => (
                    <ChecklistCard key={exec.id} execucao={exec} />
                  ))}
                </div>
              </div>
            )}
            {filteredExecucoes.length === 0 && (
              <div className="text-center py-12 bg-white/5 rounded-xl">
                <ClipboardList size={40} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/50">Nenhuma execução encontrada</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Modelos de Checklist */}
        <TabsContent value="modelos">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checklists.map(checklist => (
              <div key={checklist.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{pilarOptions.find(p => p.value === checklist.pilar)?.label?.charAt(0) || "📋"}</span>
                  <h4 className="font-medium text-white">{checklist.titulo}</h4>
                </div>
                <p className="text-sm text-white/50 mb-3">{checklist.descricao}</p>
                <div className="flex items-center justify-between text-xs text-white/40 mb-3">
                  <span>{checklist.itens?.length || 0} itens</span>
                  <span>{checklist.categoria}</span>
                </div>
                <Button
                  onClick={() => {
                    setSelectedChecklist(checklist);
                    setAtribuirDialogOpen(true);
                  }}
                  className="w-full bg-[#FF4D00] hover:bg-[#E64500]"
                  size="sm"
                >
                  Atribuir a Mentorado
                </Button>
              </div>
            ))}
            {checklists.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white/5 rounded-xl">
                <FileText size={40} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/50">Nenhum modelo criado</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Planos de Ação */}
        <TabsContent value="planos">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredPlanos.map(plano => (
              <PlanoAcaoCard key={plano.id} plano={plano} />
            ))}
            {filteredPlanos.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white/5 rounded-xl">
                <AlertTriangle size={40} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/50">Nenhum plano de ação</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* SOPs */}
        <TabsContent value="sops">
          <div className="space-y-4">
            {sops.map(sop => (
              <SOPCard key={sop.id} sop={sop} onAplicarChecklist={handleAplicarSOP} />
            ))}
            {sops.length === 0 && (
              <div className="text-center py-12 bg-white/5 rounded-xl">
                <BookOpen size={40} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/50">Nenhum SOP cadastrado</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Dashboard */}
        <TabsContent value="dashboard">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DashboardPerformance
                execucoes={execucoes}
                planosAcao={planosAcao}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Trophy className="text-[#FF4D00]" size={20} />
                Ranking
              </h3>
              <RankingMentorados scores={scores} mentorados={mentorados} />
            </div>
          </div>
        </TabsContent>

        {/* Comunicados */}
        <TabsContent value="comunicados">
          <ComunicadosFeed comunicados={comunicados} />
        </TabsContent>
      </Tabs>

      {/* Dialog: Criar Checklist */}
      <Dialog open={checklistDialogOpen} onOpenChange={setChecklistDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Modelo de Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Título *</Label>
                <Input
                  value={checklistForm.titulo}
                  onChange={(e) => setChecklistForm({ ...checklistForm, titulo: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Pilar</Label>
                <Select value={checklistForm.pilar} onValueChange={(v) => setChecklistForm({ ...checklistForm, pilar: v })}>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Categoria</Label>
                <Select value={checklistForm.categoria} onValueChange={(v) => setChecklistForm({ ...checklistForm, categoria: v })}>
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
              <div>
                <Label className="text-white/70">Pontos por Conclusão</Label>
                <Input
                  type="number"
                  value={checklistForm.pontos_conclusao}
                  onChange={(e) => setChecklistForm({ ...checklistForm, pontos_conclusao: Number(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-white/70">Descrição</Label>
              <Textarea
                value={checklistForm.descricao}
                onChange={(e) => setChecklistForm({ ...checklistForm, descricao: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>

            {/* Itens do checklist */}
            <div>
              <Label className="text-white/70 mb-2 block">Itens do Checklist *</Label>
              <div className="space-y-2 mb-3">
                {checklistForm.itens.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    <span className="flex-1 text-sm text-white">{item.texto}</span>
                    {item.requer_evidencia && <span className="text-xs text-amber-400">📷</span>}
                    <button onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-300">×</button>
                  </div>
                ))}
              </div>
              <div className="space-y-2 p-3 bg-white/5 rounded-lg">
                <Input
                  value={novoItem.texto}
                  onChange={(e) => setNovoItem({ ...novoItem, texto: e.target.value })}
                  placeholder="Texto do item..."
                  className="bg-white/5 border-white/10 text-white"
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-white/60">
                    <Checkbox
                      checked={novoItem.obrigatorio}
                      onCheckedChange={(c) => setNovoItem({ ...novoItem, obrigatorio: c })}
                    />
                    Obrigatório
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white/60">
                    <Checkbox
                      checked={novoItem.requer_evidencia}
                      onCheckedChange={(c) => setNovoItem({ ...novoItem, requer_evidencia: c })}
                    />
                    Requer Evidência
                  </label>
                </div>
                <Button onClick={handleAddItem} disabled={!novoItem.texto.trim()} size="sm" className="bg-[#FF4D00]">
                  <Plus size={14} className="mr-1" /> Adicionar Item
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setChecklistDialogOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={handleCreateChecklist} disabled={!checklistForm.titulo || checklistForm.itens.length === 0} className="flex-1 bg-[#FF4D00]">
                Criar Checklist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Atribuir Checklist */}
      <Dialog open={atribuirDialogOpen} onOpenChange={setAtribuirDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Atribuir Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-white/60">Atribuindo: <span className="text-white font-medium">{selectedChecklist?.titulo}</span></p>
            <div>
              <Label className="text-white/70">Mentorado *</Label>
              <Select value={atribuirForm.mentorado_id} onValueChange={(v) => setAtribuirForm({ ...atribuirForm, mentorado_id: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {mentorados.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nome} - {m.negocio}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Prazo (opcional)</Label>
              <Input
                type="date"
                value={atribuirForm.data_limite}
                onChange={(e) => setAtribuirForm({ ...atribuirForm, data_limite: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setAtribuirDialogOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={handleAtribuirChecklist} disabled={!atribuirForm.mentorado_id} className="flex-1 bg-[#FF4D00]">
                Atribuir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Criar SOP */}
      <Dialog open={sopDialogOpen} onOpenChange={setSOPDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar SOP / Playbook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Título *</Label>
                <Input
                  value={sopForm.titulo}
                  onChange={(e) => setSOPForm({ ...sopForm, titulo: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Pilar</Label>
                <Select value={sopForm.pilar} onValueChange={(v) => setSOPForm({ ...sopForm, pilar: v })}>
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
            </div>
            <div>
              <Label className="text-white/70">Descrição</Label>
              <Textarea
                value={sopForm.descricao}
                onChange={(e) => setSOPForm({ ...sopForm, descricao: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Conteúdo (Markdown)</Label>
              <Textarea
                value={sopForm.conteudo}
                onChange={(e) => setSOPForm({ ...sopForm, conteudo: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1 min-h-[150px]"
                placeholder="## Passo 1&#10;Descrição do passo..."
              />
            </div>
            <div>
              <Label className="text-white/70">URL do Vídeo (opcional)</Label>
              <Input
                value={sopForm.video_url}
                onChange={(e) => setSOPForm({ ...sopForm, video_url: e.target.value })}
                placeholder="https://youtube.com/..."
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setSOPDialogOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={() => createSOPMutation.mutate(sopForm)} disabled={!sopForm.titulo} className="flex-1 bg-[#FF4D00]">
                Criar SOP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Comunicado */}
      <Dialog open={comunicadoDialogOpen} onOpenChange={setComunicadoDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Comunicado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white/70">Título *</Label>
              <Input
                value={comunicadoForm.titulo}
                onChange={(e) => setComunicadoForm({ ...comunicadoForm, titulo: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Tipo</Label>
              <Select value={comunicadoForm.tipo} onValueChange={(v) => setComunicadoForm({ ...comunicadoForm, tipo: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="aviso">📢 Aviso</SelectItem>
                  <SelectItem value="tarefa">✅ Tarefa</SelectItem>
                  <SelectItem value="feedback">💬 Feedback</SelectItem>
                  <SelectItem value="novidade">⭐ Novidade</SelectItem>
                  <SelectItem value="urgente">🚨 Urgente</SelectItem>
                  <SelectItem value="parabens">🎉 Parabéns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Destinatário</Label>
              <Select value={comunicadoForm.mentorado_id} onValueChange={(v) => setComunicadoForm({ ...comunicadoForm, mentorado_id: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue placeholder="Todos os mentorados" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value={null}>Todos os mentorados</SelectItem>
                  {mentorados.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Mensagem *</Label>
              <Textarea
                value={comunicadoForm.mensagem}
                onChange={(e) => setComunicadoForm({ ...comunicadoForm, mensagem: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-white/60">
              <Checkbox
                checked={comunicadoForm.requer_confirmacao}
                onCheckedChange={(c) => setComunicadoForm({ ...comunicadoForm, requer_confirmacao: c })}
              />
              Requer confirmação de leitura
            </label>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setComunicadoDialogOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={() => createComunicadoMutation.mutate(comunicadoForm)} disabled={!comunicadoForm.titulo || !comunicadoForm.mensagem} className="flex-1 bg-[#FF4D00]">
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assistente IA */}
      <AssistenteIA 
        contexto={{
          execucoes: pendentes.length,
          planosAcao: filteredPlanos.filter(p => p.status === "pendente").length,
          mentorados: mentorados.length
        }}
      />
    </div>
  );
}