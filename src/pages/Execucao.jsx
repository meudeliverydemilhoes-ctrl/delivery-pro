import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Plus,
  Search,
  ClipboardList,
  FileCheck,
  AlertTriangle,
  BookOpen,
  BarChart3,
  Filter,
  Play,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import ChecklistModeloForm from "@/components/execucao/ChecklistModeloForm";
import ChecklistExecucaoCard from "@/components/execucao/ChecklistExecucaoCard";
import PlanoAcaoCard from "@/components/execucao/PlanoAcaoCard";
import PainelDesempenho from "@/components/execucao/PainelDesempenho";

export default function Execucao() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("modelos");
  const [search, setSearch] = useState("");
  const [pilarFilter, setPilarFilter] = useState("todos");
  const [mentoradoFilter, setMentoradoFilter] = useState("todos");

  const [modeloDialogOpen, setModeloDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState(null);
  const [planoDialogOpen, setPlanoDialogOpen] = useState(false);
  const [planoForm, setPlanoForm] = useState({
    mentorado_id: "",
    problema: "",
    acao: "",
    responsavel: "",
    prazo: "",
    pilar: "geral",
    prioridade: "media"
  });
  const [atribuirDialogOpen, setAtribuirDialogOpen] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState(null);
  const [selectedMentoradoAtribuir, setSelectedMentoradoAtribuir] = useState("");

  const { data: modelos = [] } = useQuery({
    queryKey: ["checklistModelos"],
    queryFn: () => base44.entities.ChecklistModelo.list()
  });

  const { data: execucoes = [] } = useQuery({
    queryKey: ["checklistExecucoes"],
    queryFn: () => base44.entities.ChecklistExecucao.list("-created_date")
  });

  const { data: planosAcao = [] } = useQuery({
    queryKey: ["planosAcao"],
    queryFn: () => base44.entities.PlanoAcao.list("-created_date")
  });

  const { data: mentorados = [] } = useQuery({
    queryKey: ["mentorados"],
    queryFn: () => base44.entities.Mentorado.list()
  });

  const { data: pontuacoes = [] } = useQuery({
    queryKey: ["pontuacoes"],
    queryFn: () => base44.entities.Pontuacao.list("-created_date")
  });

  const { data: sops = [] } = useQuery({
    queryKey: ["sops"],
    queryFn: () => base44.entities.SOP.list()
  });

  const createModeloMutation = useMutation({
    mutationFn: (data) => base44.entities.ChecklistModelo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklistModelos"] });
      setModeloDialogOpen(false);
      setEditingModelo(null);
    }
  });

  const updateModeloMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ChecklistModelo.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklistModelos"] });
      setModeloDialogOpen(false);
      setEditingModelo(null);
    }
  });

  const createExecucaoMutation = useMutation({
    mutationFn: (data) => base44.entities.ChecklistExecucao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklistExecucoes"] });
      setAtribuirDialogOpen(false);
      setSelectedModelo(null);
      setSelectedMentoradoAtribuir("");
    }
  });

  const updateExecucaoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ChecklistExecucao.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["checklistExecucoes"] });
      // Adicionar pontos se concluiu
      if (variables.data.status === "concluido") {
        const exec = execucoes.find(e => e.id === variables.id);
        if (exec) {
          base44.entities.Pontuacao.create({
            mentorado_id: exec.mentorado_id,
            tipo: "checklist_completo",
            pontos: 10,
            descricao: `Checklist "${exec.titulo}" concluído`,
            referencia_id: exec.id
          });
          queryClient.invalidateQueries({ queryKey: ["pontuacoes"] });
        }
      }
    }
  });

  const createPlanoMutation = useMutation({
    mutationFn: (data) => base44.entities.PlanoAcao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planosAcao"] });
      setPlanoDialogOpen(false);
      setPlanoForm({
        mentorado_id: "",
        problema: "",
        acao: "",
        responsavel: "",
        prazo: "",
        pilar: "geral",
        prioridade: "media"
      });
    }
  });

  const updatePlanoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PlanoAcao.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["planosAcao"] });
      if (variables.data.status === "concluido") {
        const plano = planosAcao.find(p => p.id === variables.id);
        if (plano) {
          base44.entities.Pontuacao.create({
            mentorado_id: plano.mentorado_id,
            tipo: "plano_acao_resolvido",
            pontos: 15,
            descricao: `Plano de ação resolvido: ${plano.problema.substring(0, 50)}`,
            referencia_id: plano.id
          });
          queryClient.invalidateQueries({ queryKey: ["pontuacoes"] });
        }
      }
    }
  });

  const handleAtribuirChecklist = () => {
    if (!selectedModelo || !selectedMentoradoAtribuir) return;
    createExecucaoMutation.mutate({
      mentorado_id: selectedMentoradoAtribuir,
      modelo_id: selectedModelo.id,
      titulo: selectedModelo.titulo,
      pilar: selectedModelo.pilar,
      data_execucao: format(new Date(), "yyyy-MM-dd"),
      status: "pendente",
      itens: selectedModelo.itens.map(item => ({
        ...item,
        concluido: false
      })),
      progresso: 0
    });
  };

  const pilarLabels = {
    processos: "🏆 Processos",
    desempenho: "📈 Desempenho",
    tempo_potencia: "⚡ Tempo de Potência",
    norte_estrategico: "🎯 Norte Estratégico",
    presenca_magnetica: "✨ Presença Magnética",
    geral: "📋 Geral"
  };

  const filteredModelos = modelos.filter(m => {
    const matchSearch = m.titulo?.toLowerCase().includes(search.toLowerCase());
    const matchPilar = pilarFilter === "todos" || m.pilar === pilarFilter;
    return matchSearch && matchPilar;
  });

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

  const getMentoradoName = (id) => mentorados.find(m => m.id === id)?.nome || "Desconhecido";

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">🧩 Execução & Checklists</h1>
          <p className="text-white/50">Gerencie checklists, planos de ação e acompanhe a evolução</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setPlanoDialogOpen(true)} variant="outline" className="border-white/10 text-white hover:bg-white/10">
            <AlertTriangle size={16} className="mr-2" /> Novo Plano de Ação
          </Button>
          <Button onClick={() => setModeloDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
            <Plus size={16} className="mr-2" /> Novo Modelo
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 h-auto flex-wrap">
          <TabsTrigger value="modelos" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white">
            <ClipboardList size={16} className="mr-2" /> Modelos
          </TabsTrigger>
          <TabsTrigger value="execucoes" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white">
            <FileCheck size={16} className="mr-2" /> Execuções
          </TabsTrigger>
          <TabsTrigger value="planos" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white">
            <AlertTriangle size={16} className="mr-2" /> Planos de Ação
          </TabsTrigger>
          <TabsTrigger value="sops" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white">
            <BookOpen size={16} className="mr-2" /> SOPs
          </TabsTrigger>
          <TabsTrigger value="desempenho" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white">
            <BarChart3 size={16} className="mr-2" /> Desempenho
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <Select value={pilarFilter} onValueChange={setPilarFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Pilar" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              <SelectItem value="todos">Todos os Pilares</SelectItem>
              {Object.entries(pilarLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(activeTab === "execucoes" || activeTab === "planos" || activeTab === "desempenho") && (
            <Select value={mentoradoFilter} onValueChange={setMentoradoFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Mentorado" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="todos">Todos Mentorados</SelectItem>
                {mentorados.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Modelos Tab */}
        <TabsContent value="modelos">
          {filteredModelos.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <ClipboardList size={48} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/50">Nenhum modelo de checklist encontrado</p>
              <Button onClick={() => setModeloDialogOpen(true)} className="mt-4 bg-[#FF4D00] hover:bg-[#E64500]">
                <Plus size={16} className="mr-2" /> Criar Primeiro Modelo
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModelos.map(modelo => (
                <div key={modelo.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{pilarLabels[modelo.pilar]?.split(" ")[0]}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                      {modelo.categoria}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{modelo.titulo}</h3>
                  <p className="text-sm text-white/50 mb-4">{modelo.itens?.length || 0} itens</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedModelo(modelo);
                        setAtribuirDialogOpen(true);
                      }}
                      className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
                    >
                      <Play size={14} className="mr-1" /> Atribuir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingModelo(modelo);
                        setModeloDialogOpen(true);
                      }}
                      className="border-white/10 text-white hover:bg-white/10"
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Execuções Tab */}
        <TabsContent value="execucoes">
          {filteredExecucoes.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <FileCheck size={48} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/50">Nenhuma execução encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExecucoes.map(execucao => (
                <div key={execucao.id}>
                  <p className="text-xs text-white/40 mb-2">{getMentoradoName(execucao.mentorado_id)}</p>
                  <ChecklistExecucaoCard
                    execucao={execucao}
                    onUpdate={(data) => updateExecucaoMutation.mutate({ id: execucao.id, data })}
                    onCreatePlanoAcao={(data) => {
                      setPlanoForm({ ...planoForm, ...data, mentorado_id: execucao.mentorado_id });
                      setPlanoDialogOpen(true);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Planos de Ação Tab */}
        <TabsContent value="planos">
          {filteredPlanos.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <AlertTriangle size={48} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/50">Nenhum plano de ação encontrado</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredPlanos.map(plano => (
                <div key={plano.id}>
                  <p className="text-xs text-white/40 mb-2">{getMentoradoName(plano.mentorado_id)}</p>
                  <PlanoAcaoCard
                    plano={plano}
                    onUpdate={(data) => updatePlanoMutation.mutate({ id: plano.id, data })}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SOPs Tab */}
        <TabsContent value="sops">
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <BookOpen size={48} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/50 mb-2">Biblioteca de SOPs e Playbooks</p>
            <p className="text-xs text-white/30">Em breve: Crie SOPs interativos com vídeos e gere checklists automaticamente</p>
          </div>
        </TabsContent>

        {/* Desempenho Tab */}
        <TabsContent value="desempenho">
          <div className="grid lg:grid-cols-2 gap-6">
            <PainelDesempenho
              checklists={mentoradoFilter !== "todos" ? 
                filteredExecucoes.filter(e => e.mentorado_id === mentoradoFilter) : 
                filteredExecucoes}
              planosAcao={mentoradoFilter !== "todos" ? 
                filteredPlanos.filter(p => p.mentorado_id === mentoradoFilter) : 
                filteredPlanos}
              pontuacoes={mentoradoFilter !== "todos" ? 
                pontuacoes.filter(p => p.mentorado_id === mentoradoFilter) : 
                pontuacoes}
            />
            
            {/* Ranking */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🏆 Ranking de Execução</h3>
              <div className="space-y-3">
                {mentorados
                  .map(m => {
                    const pts = pontuacoes.filter(p => p.mentorado_id === m.id).reduce((a, p) => a + (p.pontos || 0), 0);
                    return { ...m, pontos: pts };
                  })
                  .sort((a, b) => b.pontos - a.pontos)
                  .slice(0, 10)
                  .map((m, idx) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <span className="text-lg w-8 text-center">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}º`}
                      </span>
                      <div className="w-10 h-10 bg-[#FF4D00]/20 rounded-full flex items-center justify-center">
                        <span className="text-[#FF4D00] font-bold">{m.nome?.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{m.nome}</p>
                        <p className="text-xs text-white/40">{m.negocio}</p>
                      </div>
                      <p className="font-bold text-white">{m.pontos} pts</p>
                    </div>
                  ))}
                {mentorados.length === 0 && (
                  <p className="text-white/40 text-center py-4">Nenhum mentorado cadastrado</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Modelo */}
      <Dialog open={modeloDialogOpen} onOpenChange={(open) => {
        setModeloDialogOpen(open);
        if (!open) setEditingModelo(null);
      }}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingModelo ? "Editar Modelo" : "Novo Modelo de Checklist"}</DialogTitle>
          </DialogHeader>
          <ChecklistModeloForm
            modelo={editingModelo}
            onSave={(data) => {
              if (editingModelo) {
                updateModeloMutation.mutate({ id: editingModelo.id, data });
              } else {
                createModeloMutation.mutate(data);
              }
            }}
            onCancel={() => {
              setModeloDialogOpen(false);
              setEditingModelo(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Atribuir Checklist */}
      <Dialog open={atribuirDialogOpen} onOpenChange={setAtribuirDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Atribuir Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-white/70">Atribuir "{selectedModelo?.titulo}" para:</p>
            <Select value={selectedMentoradoAtribuir} onValueChange={setSelectedMentoradoAtribuir}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Selecione o mentorado" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {mentorados.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.nome} - {m.negocio}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setAtribuirDialogOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button
                onClick={handleAtribuirChecklist}
                disabled={!selectedMentoradoAtribuir}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                Atribuir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Plano de Ação */}
      <Dialog open={planoDialogOpen} onOpenChange={setPlanoDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Plano de Ação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/70">Mentorado *</Label>
              <Select value={planoForm.mentorado_id} onValueChange={(v) => setPlanoForm({ ...planoForm, mentorado_id: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {mentorados.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Problema Identificado *</Label>
              <Textarea
                value={planoForm.problema}
                onChange={(e) => setPlanoForm({ ...planoForm, problema: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-white/70">Ação Corretiva *</Label>
              <Textarea
                value={planoForm.acao}
                onChange={(e) => setPlanoForm({ ...planoForm, acao: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Responsável</Label>
                <Input
                  value={planoForm.responsavel}
                  onChange={(e) => setPlanoForm({ ...planoForm, responsavel: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Prazo</Label>
                <Input
                  type="date"
                  value={planoForm.prazo}
                  onChange={(e) => setPlanoForm({ ...planoForm, prazo: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Pilar</Label>
                <Select value={planoForm.pilar} onValueChange={(v) => setPlanoForm({ ...planoForm, pilar: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {Object.entries(pilarLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Prioridade</Label>
                <Select value={planoForm.prioridade} onValueChange={(v) => setPlanoForm({ ...planoForm, prioridade: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setPlanoDialogOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button
                onClick={() => createPlanoMutation.mutate(planoForm)}
                disabled={!planoForm.mentorado_id || !planoForm.problema || !planoForm.acao}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                Criar Plano
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}