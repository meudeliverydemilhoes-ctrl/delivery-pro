import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft,
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  Target,
  TrendingUp,
  Plus,
  Edit2,
  Save,
  X,
  ExternalLink,
  CheckCircle2,
  Circle,
  Trash2,
  BookOpen
} from "lucide-react";
import PilarConteudoIncluido from "@/components/pilares/PilarConteudoIncluido";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MentoradoDetalhe() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const mentoradoId = urlParams.get("id");

  const [activeTab, setActiveTab] = useState("briefing");
  const [isEditingBriefing, setIsEditingBriefing] = useState(false);
  const [pilarDialogOpen, setPilarDialogOpen] = useState(false);
  const [evolucaoDialogOpen, setEvolucaoDialogOpen] = useState(false);
  const [selectedPilar, setSelectedPilar] = useState(null);

  const { data: mentorado, isLoading } = useQuery({
    queryKey: ["mentorado", mentoradoId],
    queryFn: () => base44.entities.Mentorado.filter({ id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  const { data: pilares = [] } = useQuery({
    queryKey: ["pilares", mentoradoId],
    queryFn: () => base44.entities.PilarConteudo.filter({ mentorado_id: mentoradoId }),
    enabled: !!mentoradoId
  });

  const { data: evolucoes = [] } = useQuery({
    queryKey: ["evolucoes", mentoradoId],
    queryFn: () => base44.entities.Evolucao.filter({ mentorado_id: mentoradoId }, "-data"),
    enabled: !!mentoradoId
  });

  const { data: pilarProgressos = [] } = useQuery({
    queryKey: ["pilarProgressos", mentoradoId],
    queryFn: () => base44.entities.PilarProgresso.filter({ mentorado_id: mentoradoId }),
    enabled: !!mentoradoId
  });

  const [briefingForm, setBriefingForm] = useState({});
  const [pilarForm, setPilarForm] = useState({
    pilar: "processos",
    titulo: "",
    tipo: "aula",
    descricao: "",
    conteudo: "",
    link_externo: "",
    concluido: false
  });
  const [evolucaoForm, setEvolucaoForm] = useState({
    titulo: "",
    tipo: "feito",
    pilar: "geral",
    descricao: "",
    data: format(new Date(), "yyyy-MM-dd"),
    concluido: false
  });

  React.useEffect(() => {
    if (briefing) {
      setBriefingForm(briefing);
    }
  }, [briefing]);

  const createBriefingMutation = useMutation({
    mutationFn: (data) => base44.entities.Briefing.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefing", mentoradoId] });
      setIsEditingBriefing(false);
    }
  });

  const updateBriefingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Briefing.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefing", mentoradoId] });
      setIsEditingBriefing(false);
    }
  });

  const createPilarMutation = useMutation({
    mutationFn: (data) => base44.entities.PilarConteudo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilares", mentoradoId] });
      setPilarDialogOpen(false);
      setPilarForm({
        pilar: "processos",
        titulo: "",
        tipo: "aula",
        descricao: "",
        conteudo: "",
        link_externo: "",
        concluido: false
      });
    }
  });

  const updatePilarMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PilarConteudo.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilares", mentoradoId] });
    }
  });

  const deletePilarMutation = useMutation({
    mutationFn: (id) => base44.entities.PilarConteudo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilares", mentoradoId] });
    }
  });

  const createEvolucaoMutation = useMutation({
    mutationFn: (data) => base44.entities.Evolucao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evolucoes", mentoradoId] });
      setEvolucaoDialogOpen(false);
      setEvolucaoForm({
        titulo: "",
        tipo: "feito",
        pilar: "geral",
        descricao: "",
        data: format(new Date(), "yyyy-MM-dd"),
        concluido: false
      });
    }
  });

  const updateEvolucaoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Evolucao.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evolucoes", mentoradoId] });
    }
  });

  const deleteEvolucaoMutation = useMutation({
    mutationFn: (id) => base44.entities.Evolucao.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evolucoes", mentoradoId] });
    }
  });

  const toggleProgressoMutation = useMutation({
    mutationFn: async ({ pilar, tipo, texto }) => {
      const existing = pilarProgressos.find(
        (p) => p.pilar === pilar && p.tipo === tipo && p.texto === texto
      );
      if (existing) {
        return base44.entities.PilarProgresso.update(existing.id, {
          concluido: !existing.concluido,
          data_conclusao: !existing.concluido ? new Date().toISOString().split("T")[0] : null
        });
      } else {
        return base44.entities.PilarProgresso.create({
          mentorado_id: mentoradoId,
          pilar,
          tipo,
          texto,
          concluido: true,
          data_conclusao: new Date().toISOString().split("T")[0]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilarProgressos", mentoradoId] });
    }
  });

  const handleSaveBriefing = () => {
    if (briefing?.id) {
      updateBriefingMutation.mutate({ id: briefing.id, data: briefingForm });
    } else {
      createBriefingMutation.mutate({ ...briefingForm, mentorado_id: mentoradoId });
    }
  };

  const handleAddPilar = () => {
    createPilarMutation.mutate({ ...pilarForm, mentorado_id: mentoradoId });
  };

  const handleAddEvolucao = () => {
    createEvolucaoMutation.mutate({ ...evolucaoForm, mentorado_id: mentoradoId });
  };

  const pilaresConfig = [
    { key: "processos", label: "Pilar 1 - Processos", color: "bg-blue-500", icon: "🏆" },
    { key: "desempenho", label: "Pilar 2 - Desempenho", color: "bg-emerald-500", icon: "📈" },
    { key: "tempo_potencia", label: "Pilar 3 - Tempo de Potência", color: "bg-violet-500", icon: "⚡" },
    { key: "norte_estrategico", label: "Pilar 4 - Norte Estratégico", color: "bg-amber-500", icon: "🎯" },
    { key: "presenca_magnetica", label: "Pilar 5 - Presença Magnética", color: "bg-pink-500", icon: "✨" },
  ];

  const [selectedPilarConteudo, setSelectedPilarConteudo] = useState(null);

  const getProgressosForPilar = (pilarKey) => {
    return pilarProgressos.filter((p) => p.pilar === pilarKey);
  };

  const handleToggleProgresso = (pilarKey, tipo, texto) => {
    toggleProgressoMutation.mutate({ pilar: pilarKey, tipo, texto });
  };

  const tipoColors = {
    aula: "bg-blue-500/20 text-blue-400",
    pdf: "bg-red-500/20 text-red-400",
    checklist: "bg-emerald-500/20 text-emerald-400",
    exercicio: "bg-violet-500/20 text-violet-400",
    modelo: "bg-amber-500/20 text-amber-400",
    anotacao: "bg-gray-500/20 text-gray-400",
  };

  const evolucaoColors = {
    feito: "bg-emerald-500/20 text-emerald-400",
    pendencia: "bg-amber-500/20 text-amber-400",
    resultado: "bg-blue-500/20 text-blue-400",
    proximo_passo: "bg-violet-500/20 text-violet-400",
    observacao: "bg-gray-500/20 text-gray-400",
  };

  const statusColors = {
    ativo: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    pausado: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    concluido: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    desistente: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-48" />
          <div className="h-32 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!mentorado) {
    return (
      <div className="max-w-6xl mx-auto text-center py-16">
        <p className="text-white/50">Mentorado não encontrado</p>
        <Link to={createPageUrl("Mentorados")} className="text-[#FF4D00] hover:underline mt-4 inline-block">
          Voltar para Mentorados
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={createPageUrl("Mentorados")}
          className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-4"
        >
          <ArrowLeft size={20} />
          Voltar para Mentorados
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 bg-[#FF4D00]/20 rounded-2xl flex items-center justify-center">
              <span className="text-[#FF4D00] font-bold text-3xl">
                {mentorado.nome?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{mentorado.nome}</h1>
                <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[mentorado.status]}`}>
                  {mentorado.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <Building2 size={14} /> {mentorado.negocio}
                </span>
                {mentorado.cidade && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {mentorado.cidade}
                  </span>
                )}
                {mentorado.contato && (
                  <span className="flex items-center gap-1">
                    <Phone size={14} /> {mentorado.contato}
                  </span>
                )}
                {mentorado.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={14} /> {mentorado.email}
                  </span>
                )}
                {mentorado.data_entrada && (
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> Entrada: {format(new Date(mentorado.data_entrada), "dd/MM/yyyy")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 h-auto flex-wrap">
          <TabsTrigger value="briefing" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white">
            <FileText size={16} className="mr-2" /> Briefing
          </TabsTrigger>
          <TabsTrigger value="pilares" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white">
            <Target size={16} className="mr-2" /> Pilares
          </TabsTrigger>
          <TabsTrigger value="evolucao" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white">
            <TrendingUp size={16} className="mr-2" /> Evolução
          </TabsTrigger>
        </TabsList>

        {/* Briefing Tab */}
        <TabsContent value="briefing">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Briefing do Negócio</h2>
              {isEditingBriefing ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditingBriefing(false)} className="border-white/10 text-white">
                    <X size={16} className="mr-1" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveBriefing} className="bg-[#FF4D00] hover:bg-[#E64500]">
                    <Save size={16} className="mr-1" /> Salvar
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditingBriefing(true)} className="border-white/10 text-white hover:bg-white/10">
                  <Edit2 size={16} className="mr-1" /> Editar
                </Button>
              )}
            </div>

            {isEditingBriefing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-white/70">Raio de Entrega</Label>
                    <Input
                      value={briefingForm.raio_entrega || ""}
                      onChange={(e) => setBriefingForm({ ...briefingForm, raio_entrega: e.target.value })}
                      placeholder="Ex: 5km"
                      className="bg-white/5 border-white/10 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70">Média Pedidos/Dia</Label>
                    <Input
                      type="number"
                      value={briefingForm.media_pedidos_dia || ""}
                      onChange={(e) => setBriefingForm({ ...briefingForm, media_pedidos_dia: Number(e.target.value) })}
                      className="bg-white/5 border-white/10 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70">CMV (%)</Label>
                    <Input
                      type="number"
                      value={briefingForm.cmv || ""}
                      onChange={(e) => setBriefingForm({ ...briefingForm, cmv: Number(e.target.value) })}
                      className="bg-white/5 border-white/10 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70">Ticket Médio (R$)</Label>
                    <Input
                      type="number"
                      value={briefingForm.ticket_medio || ""}
                      onChange={(e) => setBriefingForm({ ...briefingForm, ticket_medio: Number(e.target.value) })}
                      className="bg-white/5 border-white/10 text-white mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white/70">Faturamento Mensal (R$)</Label>
                  <Input
                    type="number"
                    value={briefingForm.faturamento_mensal || ""}
                    onChange={(e) => setBriefingForm({ ...briefingForm, faturamento_mensal: Number(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white/70">Estrutura da Equipe</Label>
                  <Textarea
                    value={briefingForm.estrutura_equipe || ""}
                    onChange={(e) => setBriefingForm({ ...briefingForm, estrutura_equipe: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-white/70">Problemas Identificados</Label>
                  <Textarea
                    value={briefingForm.problemas_identificados || ""}
                    onChange={(e) => setBriefingForm({ ...briefingForm, problemas_identificados: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-white/70">Objetivos</Label>
                  <Textarea
                    value={briefingForm.objetivos || ""}
                    onChange={(e) => setBriefingForm({ ...briefingForm, objetivos: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-white/70">Diagnóstico Inicial</Label>
                  <Textarea
                    value={briefingForm.diagnostico_inicial || ""}
                    onChange={(e) => setBriefingForm({ ...briefingForm, diagnostico_inicial: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-1"
                    rows={4}
                  />
                </div>
                <div>
                  <Label className="text-white/70 mb-3 block">Checklist de Maturidade</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: "cardapio_otimizado", label: "Cardápio Otimizado" },
                      { key: "processos_definidos", label: "Processos Definidos" },
                      { key: "financeiro_organizado", label: "Financeiro Organizado" },
                      { key: "marketing_ativo", label: "Marketing Ativo" },
                      { key: "equipe_treinada", label: "Equipe Treinada" },
                      { key: "delivery_eficiente", label: "Delivery Eficiente" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center gap-2">
                        <Checkbox
                          checked={briefingForm.checklist_maturidade?.[item.key] || false}
                          onCheckedChange={(checked) =>
                            setBriefingForm({
                              ...briefingForm,
                              checklist_maturidade: {
                                ...briefingForm.checklist_maturidade,
                                [item.key]: checked
                              }
                            })
                          }
                        />
                        <label className="text-sm text-white/70">{item.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-white/70">Anotações</Label>
                  <Textarea
                    value={briefingForm.anotacoes || ""}
                    onChange={(e) => setBriefingForm({ ...briefingForm, anotacoes: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-1"
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {!briefing ? (
                  <p className="text-white/40 text-center py-8">Nenhum briefing cadastrado. Clique em Editar para começar.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-white/40 mb-1">Raio de Entrega</p>
                        <p className="text-lg font-semibold text-white">{briefing.raio_entrega || "-"}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-white/40 mb-1">Pedidos/Dia</p>
                        <p className="text-lg font-semibold text-white">{briefing.media_pedidos_dia || "-"}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-white/40 mb-1">CMV</p>
                        <p className="text-lg font-semibold text-white">{briefing.cmv ? `${briefing.cmv}%` : "-"}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-white/40 mb-1">Ticket Médio</p>
                        <p className="text-lg font-semibold text-white">{briefing.ticket_medio ? `R$ ${briefing.ticket_medio}` : "-"}</p>
                      </div>
                    </div>
                    {briefing.estrutura_equipe && (
                      <div>
                        <h4 className="text-sm font-medium text-white/60 mb-2">Estrutura da Equipe</h4>
                        <p className="text-white/80 whitespace-pre-wrap">{briefing.estrutura_equipe}</p>
                      </div>
                    )}
                    {briefing.problemas_identificados && (
                      <div>
                        <h4 className="text-sm font-medium text-white/60 mb-2">Problemas Identificados</h4>
                        <p className="text-white/80 whitespace-pre-wrap">{briefing.problemas_identificados}</p>
                      </div>
                    )}
                    {briefing.objetivos && (
                      <div>
                        <h4 className="text-sm font-medium text-white/60 mb-2">Objetivos</h4>
                        <p className="text-white/80 whitespace-pre-wrap">{briefing.objetivos}</p>
                      </div>
                    )}
                    {briefing.diagnostico_inicial && (
                      <div>
                        <h4 className="text-sm font-medium text-white/60 mb-2">Diagnóstico Inicial</h4>
                        <p className="text-white/80 whitespace-pre-wrap">{briefing.diagnostico_inicial}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Pilares Tab */}
        <TabsContent value="pilares">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Pilares da Mentoria</h2>
              <Button onClick={() => setPilarDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
                <Plus size={16} className="mr-2" /> Adicionar Conteúdo
              </Button>
            </div>

            {pilaresConfig.map((pilar) => {
              const pilarItems = pilares.filter((p) => p.pilar === pilar.key);
              const pilarProgressosFiltered = getProgressosForPilar(pilar.key);
              const isConteudoOpen = selectedPilarConteudo === pilar.key;

              return (
                <div key={pilar.key} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{pilar.icon}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{pilar.label}</h3>
                          <span className="text-sm text-white/40">({pilarItems.length} materiais)</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedPilarConteudo(isConteudoOpen ? null : pilar.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                          isConteudoOpen
                            ? "bg-[#FF4D00] text-white"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                      >
                        <BookOpen size={16} />
                        <span className="text-sm font-medium">Conteúdo Incluído</span>
                      </button>
                    </div>

                    {/* Conteúdo Incluído expandido */}
                    {isConteudoOpen && (
                      <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/10">
                        <PilarConteudoIncluido
                          pilarKey={pilar.key}
                          progressoItems={pilarProgressosFiltered}
                          onToggleItem={(tipo, texto) => handleToggleProgresso(pilar.key, tipo, texto)}
                        />
                      </div>
                    )}

                    {/* Materiais do mentorado */}
                    {pilarItems.length === 0 ? (
                      <p className="text-white/40 text-sm">Nenhum material específico cadastrado</p>
                    ) : (
                      <div className="space-y-2">
                        {pilarItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl group"
                          >
                            <button
                              onClick={() => updatePilarMutation.mutate({ id: item.id, data: { concluido: !item.concluido } })}
                              className="flex-shrink-0"
                            >
                              {item.concluido ? (
                                <CheckCircle2 size={20} className="text-emerald-400" />
                              ) : (
                                <Circle size={20} className="text-white/30" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium ${item.concluido ? "text-white/40 line-through" : "text-white"}`}>
                                {item.titulo}
                              </p>
                              {item.descricao && (
                                <p className="text-xs text-white/40 truncate">{item.descricao}</p>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${tipoColors[item.tipo]}`}>
                              {item.tipo}
                            </span>
                            {item.link_externo && (
                              <a
                                href={item.link_externo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#FF4D00] hover:text-[#FF4D00]/80"
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                            <button
                              onClick={() => deletePilarMutation.mutate(item.id)}
                              className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Evolução Tab */}
        <TabsContent value="evolucao">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Evolução do Mentorado</h2>
              <Button onClick={() => setEvolucaoDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
                <Plus size={16} className="mr-2" /> Adicionar Registro
              </Button>
            </div>

            {evolucoes.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <TrendingUp size={40} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/40">Nenhum registro de evolução</p>
              </div>
            ) : (
              <div className="space-y-3">
                {evolucoes.map((evo) => (
                  <div
                    key={evo.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 group"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => updateEvolucaoMutation.mutate({ id: evo.id, data: { concluido: !evo.concluido } })}
                        className="flex-shrink-0 mt-1"
                      >
                        {evo.concluido ? (
                          <CheckCircle2 size={20} className="text-emerald-400" />
                        ) : (
                          <Circle size={20} className="text-white/30" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-medium ${evo.concluido ? "text-white/40 line-through" : "text-white"}`}>
                            {evo.titulo}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${evolucaoColors[evo.tipo]}`}>
                            {evo.tipo?.replace("_", " ")}
                          </span>
                        </div>
                        {evo.descricao && (
                          <p className="text-sm text-white/60">{evo.descricao}</p>
                        )}
                        <p className="text-xs text-white/40 mt-2">
                          {evo.data && format(new Date(evo.data), "dd/MM/yyyy")}
                          {evo.pilar && evo.pilar !== "geral" && ` • ${evo.pilar.replace("_", " ")}`}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteEvolucaoMutation.mutate(evo.id)}
                        className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Pilar */}
      <Dialog open={pilarDialogOpen} onOpenChange={setPilarDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Conteúdo ao Pilar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/70">Pilar</Label>
              <Select value={pilarForm.pilar} onValueChange={(v) => setPilarForm({ ...pilarForm, pilar: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {pilaresConfig.map((p) => (
                    <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Título</Label>
              <Input
                value={pilarForm.titulo}
                onChange={(e) => setPilarForm({ ...pilarForm, titulo: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Tipo</Label>
              <Select value={pilarForm.tipo} onValueChange={(v) => setPilarForm({ ...pilarForm, tipo: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="aula">Aula</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="checklist">Checklist</SelectItem>
                  <SelectItem value="exercicio">Exercício</SelectItem>
                  <SelectItem value="modelo">Modelo</SelectItem>
                  <SelectItem value="anotacao">Anotação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Descrição</Label>
              <Textarea
                value={pilarForm.descricao}
                onChange={(e) => setPilarForm({ ...pilarForm, descricao: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Link Externo</Label>
              <Input
                value={pilarForm.link_externo}
                onChange={(e) => setPilarForm({ ...pilarForm, link_externo: e.target.value })}
                placeholder="https://..."
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setPilarDialogOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={handleAddPilar} disabled={!pilarForm.titulo} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]">
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Evolução */}
      <Dialog open={evolucaoDialogOpen} onOpenChange={setEvolucaoDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Registro de Evolução</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/70">Título</Label>
              <Input
                value={evolucaoForm.titulo}
                onChange={(e) => setEvolucaoForm({ ...evolucaoForm, titulo: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Tipo</Label>
                <Select value={evolucaoForm.tipo} onValueChange={(v) => setEvolucaoForm({ ...evolucaoForm, tipo: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="feito">Feito</SelectItem>
                    <SelectItem value="pendencia">Pendência</SelectItem>
                    <SelectItem value="resultado">Resultado</SelectItem>
                    <SelectItem value="proximo_passo">Próximo Passo</SelectItem>
                    <SelectItem value="observacao">Observação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Pilar</Label>
                <Select value={evolucaoForm.pilar} onValueChange={(v) => setEvolucaoForm({ ...evolucaoForm, pilar: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="geral">Geral</SelectItem>
                    {pilaresConfig.map((p) => (
                      <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-white/70">Data</Label>
              <Input
                type="date"
                value={evolucaoForm.data}
                onChange={(e) => setEvolucaoForm({ ...evolucaoForm, data: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Descrição</Label>
              <Textarea
                value={evolucaoForm.descricao}
                onChange={(e) => setEvolucaoForm({ ...evolucaoForm, descricao: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setEvolucaoDialogOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={handleAddEvolucao} disabled={!evolucaoForm.titulo} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]">
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}