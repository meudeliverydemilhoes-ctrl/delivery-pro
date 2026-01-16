import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
        CheckCircle2, Circle, ChevronDown, ChevronRight, Save,
        Calendar, MessageSquare, Upload, TrendingUp, AlertTriangle,
        Target, Sparkles, Settings, Clock, Zap, Compass, Star,
        FileText, Image, X, BookOpen, Plus, Video, FileDown, Link as LinkIcon
      } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
      import { format } from "date-fns";

const pilaresConfig = [
  {
    id: "processos",
    titulo: "PILAR 1 — PROCESSOS",
    icon: Settings,
    cor: "#3B82F6",
    itens: [
      "Padronização e setorização",
      "Padronização do atendimento",
      "Padronização da produção (massa, montagem, balança)",
      "Fichas técnicas completas",
      "Checklists operacionais (diário/turno/semanal)",
      "SOPs (procedimentos-padrão de todos os setores)",
      "Regulamento interno",
      "Cronograma operacional implantado",
      "Cultura operacional aplicada",
      "Fluxogramas operacionais",
      "Uso da balança implementado",
      "Padronização da comunicação interna",
      "Auditoria dos processos concluída"
    ]
  },
  {
    id: "desempenho",
    titulo: "PILAR 2 — DESEMPENHO",
    icon: TrendingUp,
    cor: "#10B981",
    itens: [
      "Análise financeira concluída",
      "Histórico de faturamento mapeado",
      "Gaps percentuais identificados",
      "Indicadores de desempenho criados",
      "Markup calculado corretamente",
      "Precificação ajustada",
      "Otimização do cardápio iFood",
      "Criação de combos estratégicos",
      "Remoção de produtos fracos",
      "Cupons/promoções ativados",
      "CMV monitorado",
      "Painéis de metas configurados",
      "Ticket médio ajustado",
      "Auditoria de cardápio finalizada"
    ]
  },
  {
    id: "tempo_potencia",
    titulo: "PILAR 3 — TEMPO DE POTÊNCIA",
    icon: Zap,
    cor: "#8B5CF6",
    itens: [
      "Agenda organizada",
      "Cronograma por unidade criado",
      "Tarefas definidas por responsável",
      "Sistema de Kanban implantado",
      "Gargalos identificados",
      "Prazos alinhados",
      "Produtividade do time monitorada",
      "Fluxo do pedido otimizado",
      "Redução de atrasos e retrabalho",
      "Rotinas aplicadas corretamente"
    ]
  },
  {
    id: "norte_estrategico",
    titulo: "PILAR 4 — NORTE ESTRATÉGICO",
    icon: Compass,
    cor: "#F59E0B",
    itens: [
      "Missão definida",
      "Visão definida",
      "Valores definidos",
      "Documento de cultura criado",
      "Governança e liderança estruturadas",
      "Propósito alinhado ao time",
      "Estratégia de expansão definida",
      "Reuniões estratégicas feitas",
      "Decisões validadas pelo Norte Estratégico"
    ]
  },
  {
    id: "presenca_magnetica",
    titulo: "PILAR 5 — PRESENÇA MAGNÉTICA",
    icon: Star,
    cor: "#EC4899",
    itens: [
      "Identidade visual ajustada",
      "Estratégia de comunicação no iFood",
      "Descrições e fotos otimizadas",
      "Storytelling da marca criado",
      "Padrão visual das lojas aplicado",
      "Plano de conteúdo criado",
      "Estratégia de campanhas definida",
      "Materiais visuais produzidos",
      "Padrão de experiência da marca implantado",
      "Revisão de imagens/vídeos realizada",
      "Presença digital fortalecida"
    ]
  }
];

const statusOptions = [
  { value: "pendente", label: "🔴 Pendente", cor: "bg-red-500" },
  { value: "em_andamento", label: "🟡 Em andamento", cor: "bg-amber-500" },
  { value: "concluido", label: "🟢 Concluído", cor: "bg-emerald-500" }
];

export default function PainelOrganizacao({ mentoradoId }) {
  const queryClient = useQueryClient();
  const [expandedPilares, setExpandedPilares] = useState({ processos: true });
  const [painelData, setPainelData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [materiaisDialogOpen, setMateriaisDialogOpen] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    aula: "",
    titulo: "",
    descricao: "",
    link: "",
    tipo: "video"
  });

  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  useEffect(() => {
    if (briefing?.painel_organizacao) {
      setPainelData(briefing.painel_organizacao);
    } else {
      // Inicializar dados default
      const defaultData = {
        pilares: {},
        resumo: {
          pontos_fortes: "",
          pontos_criticos: "",
          plano_proximas_semanas: "",
          observacoes_gerais: "",
          arquivos: [],
          ultima_atualizacao: null
        },
        materiais_aulas: []
      };
      pilaresConfig.forEach(pilar => {
        defaultData.pilares[pilar.id] = {
          checklist: {},
          observacoes: "",
          status: "pendente",
          data_inicio: "",
          data_conclusao: ""
        };
      });
      setPainelData(defaultData);
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

  const togglePilar = (pilarId) => {
    setExpandedPilares(prev => ({ ...prev, [pilarId]: !prev[pilarId] }));
  };

  const toggleCheckItem = (pilarId, itemIdx) => {
    setPainelData(prev => {
      const newData = { ...prev };
      if (!newData.pilares) newData.pilares = {};
      if (!newData.pilares[pilarId]) newData.pilares[pilarId] = { checklist: {} };
      if (!newData.pilares[pilarId].checklist) newData.pilares[pilarId].checklist = {};
      newData.pilares[pilarId].checklist[itemIdx] = !newData.pilares[pilarId].checklist[itemIdx];
      return newData;
    });
    setHasChanges(true);
  };

  const updatePilarField = (pilarId, field, value) => {
    setPainelData(prev => {
      const newData = { ...prev };
      if (!newData.pilares) newData.pilares = {};
      if (!newData.pilares[pilarId]) {
        newData.pilares[pilarId] = {
          checklist: {},
          observacoes: "",
          status: "pendente",
          data_inicio: "",
          data_conclusao: ""
        };
      }
      newData.pilares[pilarId][field] = value;
      return newData;
    });
    setHasChanges(true);
  };

  const updateResumoField = (field, value) => {
    setPainelData(prev => ({
      ...prev,
      resumo: { ...prev.resumo, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    const dataToSave = {
      ...painelData,
      resumo: {
        ...painelData.resumo,
        ultima_atualizacao: new Date().toISOString()
      }
    };
    
    if (briefing?.id) {
      updateBriefingMutation.mutate({ 
        id: briefing.id, 
        data: { ...briefing, painel_organizacao: dataToSave }
      });
    } else {
      createBriefingMutation.mutate({ 
        mentorado_id: mentoradoId, 
        painel_organizacao: dataToSave 
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPainelData(prev => ({
        ...prev,
        resumo: {
          ...prev.resumo,
          arquivos: [...(prev.resumo?.arquivos || []), { 
            url: file_url, 
            nome: file.name,
            data: new Date().toISOString()
          }]
        }
      }));
      setHasChanges(true);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
    setUploading(false);
  };

  const removeArquivo = (idx) => {
    setPainelData(prev => ({
      ...prev,
      resumo: {
        ...prev.resumo,
        arquivos: prev.resumo.arquivos.filter((_, i) => i !== idx)
      }
    }));
    setHasChanges(true);
  };

  const handleAddMaterial = () => {
    if (!materialForm.aula || !materialForm.titulo) return;
    setPainelData(prev => ({
      ...prev,
      materiais_aulas: [...(prev.materiais_aulas || []), { 
        ...materialForm, 
        id: Date.now().toString(),
        data_criacao: new Date().toISOString()
      }]
    }));
    setHasChanges(true);
    setMateriaisDialogOpen(false);
    setMaterialForm({ aula: "", titulo: "", descricao: "", link: "", tipo: "video" });
  };

  const handleDeleteMaterial = (id) => {
    setPainelData(prev => ({
      ...prev,
      materiais_aulas: (prev.materiais_aulas || []).filter(m => m.id !== id)
    }));
    setHasChanges(true);
  };

  const calcularProgressoPilar = (pilarId, pilar) => {
    const checklist = painelData.pilares?.[pilarId]?.checklist || {};
    const total = pilar.itens.length;
    const concluidos = Object.values(checklist).filter(v => v === true).length;
    return { total, concluidos, percent: total > 0 ? Math.round((concluidos / total) * 100) : 0 };
  };

  const calcularProgressoGeral = () => {
    let totalItens = 0;
    let totalConcluidos = 0;
    pilaresConfig.forEach(pilar => {
      const checklist = painelData.pilares?.[pilar.id]?.checklist || {};
      totalItens += pilar.itens.length;
      totalConcluidos += Object.values(checklist).filter(v => v === true).length;
    });
    return totalItens > 0 ? Math.round((totalConcluidos / totalItens) * 100) : 0;
  };

  const progressoGeral = calcularProgressoGeral();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="text-[#FF4D00]" />
            Painel de Organização – Mentoria Delivery
          </h2>
          <p className="text-white/50 text-sm mt-1">Acompanhamento completo dos 5 pilares da mentoria</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={updateBriefingMutation.isPending || createBriefingMutation.isPending}
          className="bg-[#FF4D00] hover:bg-[#E64500]"
        >
          <Save size={16} className="mr-2" />
          {updateBriefingMutation.isPending || createBriefingMutation.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {/* Progresso Geral */}
      <div className="bg-gradient-to-r from-[#FF4D00]/20 to-transparent border border-[#FF4D00]/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-[#FF4D00] rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{progressoGeral}%</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Progresso Geral da Mentoria</h3>
              <p className="text-white/50 text-sm">Baseado nos itens marcados como OK</p>
            </div>
          </div>
        </div>
        <Progress value={progressoGeral} className="h-3 bg-white/10" />
        <div className="flex justify-between mt-2 text-xs text-white/40">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Pilares */}
      <div className="space-y-4">
        {pilaresConfig.map((pilar) => {
          const Icon = pilar.icon;
          const isExpanded = expandedPilares[pilar.id];
          const pilarData = painelData.pilares?.[pilar.id] || {};
          const progresso = calcularProgressoPilar(pilar.id, pilar);
          const statusInfo = statusOptions.find(s => s.value === (pilarData.status || "pendente"));

          return (
            <div 
              key={pilar.id} 
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              {/* Header do Pilar */}
              <button
                onClick={() => togglePilar(pilar.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${pilar.cor}20` }}
                  >
                    <Icon size={24} style={{ color: pilar.cor }} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white">{pilar.titulo}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/50">{progresso.concluidos}/{progresso.total} itens</span>
                      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all"
                          style={{ width: `${progresso.percent}%`, backgroundColor: pilar.cor }}
                        />
                      </div>
                      <span className="text-xs font-medium" style={{ color: pilar.cor }}>{progresso.percent}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    statusInfo?.value === "concluido" ? "bg-emerald-500/20 text-emerald-400" :
                    statusInfo?.value === "em_andamento" ? "bg-amber-500/20 text-amber-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {statusInfo?.label}
                  </span>
                  {isExpanded ? <ChevronDown className="text-white/50" /> : <ChevronRight className="text-white/50" />}
                </div>
              </button>

              {/* Conteúdo do Pilar */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-white/10">
                  <div className="grid lg:grid-cols-3 gap-4 mt-4">
                    {/* Checklist */}
                    <div className="lg:col-span-2 space-y-2">
                      <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                        <CheckCircle2 size={14} style={{ color: pilar.cor }} />
                        Checklist de Entregas
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {pilar.itens.map((item, idx) => {
                          const isChecked = pilarData.checklist?.[idx] === true;
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleCheckItem(pilar.id, idx)}
                              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                isChecked 
                                  ? "bg-emerald-500/10 border border-emerald-500/30" 
                                  : "bg-white/5 border border-transparent hover:border-white/10"
                              }`}
                            >
                              {isChecked ? (
                                <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              ) : (
                                <div className="w-5 h-5 border-2 border-white/30 rounded flex-shrink-0" />
                              )}
                              <span className={`text-sm ${isChecked ? "text-white/50 line-through" : "text-white/80"}`}>
                                {item}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                      {/* Status */}
                      <div>
                        <label className="text-xs text-white/50 mb-2 block">Status do Pilar</label>
                        <Select 
                          value={pilarData.status || "pendente"}
                          onValueChange={(v) => updatePilarField(pilar.id, "status", v)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-white/10">
                            {statusOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Datas */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-white/50 mb-2 block">Data Início</label>
                          <Input
                            type="date"
                            value={pilarData.data_inicio || ""}
                            onChange={(e) => updatePilarField(pilar.id, "data_inicio", e.target.value)}
                            className="bg-white/5 border-white/10 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/50 mb-2 block">Data Conclusão</label>
                          <Input
                            type="date"
                            value={pilarData.data_conclusao || ""}
                            onChange={(e) => updatePilarField(pilar.id, "data_conclusao", e.target.value)}
                            className="bg-white/5 border-white/10 text-white text-sm"
                          />
                        </div>
                      </div>

                      {/* Observações */}
                      <div>
                        <label className="text-xs text-white/50 mb-2 block flex items-center gap-1">
                          <MessageSquare size={12} />
                          Observações do Pilar
                        </label>
                        <Textarea
                          value={pilarData.observacoes || ""}
                          onChange={(e) => updatePilarField(pilar.id, "observacoes", e.target.value)}
                          placeholder="Adicione observações importantes..."
                          className="bg-white/5 border-white/10 text-white min-h-[100px] text-sm resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Seção Resumo */}
      <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="text-[#FF4D00]" />
          Resumo do Mentorado
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pontos Fortes */}
          <div>
            <label className="text-sm font-medium text-emerald-400 mb-2 block flex items-center gap-2">
              <CheckCircle2 size={14} />
              Pontos Fortes
            </label>
            <Textarea
              value={painelData.resumo?.pontos_fortes || ""}
              onChange={(e) => updateResumoField("pontos_fortes", e.target.value)}
              placeholder="Liste os pontos fortes identificados..."
              className="bg-white/5 border-white/10 text-white min-h-[120px] resize-none"
            />
          </div>

          {/* Pontos Críticos */}
          <div>
            <label className="text-sm font-medium text-red-400 mb-2 block flex items-center gap-2">
              <AlertTriangle size={14} />
              Pontos Críticos
            </label>
            <Textarea
              value={painelData.resumo?.pontos_criticos || ""}
              onChange={(e) => updateResumoField("pontos_criticos", e.target.value)}
              placeholder="Liste os pontos que precisam de atenção..."
              className="bg-white/5 border-white/10 text-white min-h-[120px] resize-none"
            />
          </div>

          {/* Plano Próximas Semanas */}
          <div>
            <label className="text-sm font-medium text-amber-400 mb-2 block flex items-center gap-2">
              <Calendar size={14} />
              Plano das Próximas Semanas
            </label>
            <Textarea
              value={painelData.resumo?.plano_proximas_semanas || ""}
              onChange={(e) => updateResumoField("plano_proximas_semanas", e.target.value)}
              placeholder="Defina as próximas ações e metas..."
              className="bg-white/5 border-white/10 text-white min-h-[120px] resize-none"
            />
          </div>

          {/* Observações Gerais */}
          <div>
            <label className="text-sm font-medium text-blue-400 mb-2 block flex items-center gap-2">
              <MessageSquare size={14} />
              Observações Gerais
            </label>
            <Textarea
              value={painelData.resumo?.observacoes_gerais || ""}
              onChange={(e) => updateResumoField("observacoes_gerais", e.target.value)}
              placeholder="Outras observações importantes..."
              className="bg-white/5 border-white/10 text-white min-h-[120px] resize-none"
            />
          </div>
        </div>

        {/* Upload de Arquivos */}
        <div className="mt-6">
          <label className="text-sm font-medium text-white/70 mb-3 block flex items-center gap-2">
            <Upload size={14} />
            Arquivos Anexados
          </label>
          <div className="flex flex-wrap gap-3 mb-3">
            {painelData.resumo?.arquivos?.map((arq, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              >
                <FileText size={14} className="text-[#FF4D00]" />
                <a 
                  href={arq.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-white hover:text-[#FF4D00] truncate max-w-[150px]"
                >
                  {arq.nome}
                </a>
                <button
                  onClick={() => removeArquivo(idx)}
                  className="p-1 hover:bg-red-500/20 rounded"
                >
                  <X size={12} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
          <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-[#FF4D00]/50 transition-colors">
            <Upload size={18} className="text-white/50" />
            <span className="text-sm text-white/50">
              {uploading ? "Enviando..." : "Clique para fazer upload de arquivos"}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Última Atualização */}
        {painelData.resumo?.ultima_atualizacao && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-white/40">
            <Clock size={12} />
            Última atualização: {format(new Date(painelData.resumo.ultima_atualizacao), "dd/MM/yyyy 'às' HH:mm")}
          </div>
        )}
        </div>

        {/* Seção de Materiais por Aula */}
        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-[#FF4D00]" />
            Materiais por Aula
          </h3>
          <Button 
            onClick={() => setMateriaisDialogOpen(true)}
            className="bg-[#FF4D00] hover:bg-[#E64500]"
          >
            <Plus size={16} className="mr-2" />
            Adicionar Material
          </Button>
        </div>

        {(!painelData.materiais_aulas || painelData.materiais_aulas.length === 0) ? (
          <div className="text-center py-8 text-white/40">
            <BookOpen size={40} className="mx-auto mb-3 text-white/20" />
            <p>Nenhum material cadastrado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {painelData.materiais_aulas.map((material) => (
              <div 
                key={material.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 group hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    material.tipo === "video" ? "bg-red-500/20" :
                    material.tipo === "pdf" ? "bg-blue-500/20" :
                    material.tipo === "link" ? "bg-purple-500/20" :
                    "bg-emerald-500/20"
                  }`}>
                    {material.tipo === "video" ? <Video size={18} className="text-red-400" /> :
                     material.tipo === "pdf" ? <FileDown size={18} className="text-blue-400" /> :
                     material.tipo === "link" ? <LinkIcon size={18} className="text-purple-400" /> :
                     <FileText size={18} className="text-emerald-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-[#FF4D00]/20 text-[#FF4D00] rounded-full">
                        Aula {material.aula}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        material.tipo === "video" ? "bg-red-500/20 text-red-400" :
                        material.tipo === "pdf" ? "bg-blue-500/20 text-blue-400" :
                        material.tipo === "link" ? "bg-purple-500/20 text-purple-400" :
                        "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {material.tipo}
                      </span>
                    </div>
                    <h4 className="font-medium text-white">{material.titulo}</h4>
                    {material.descricao && (
                      <p className="text-sm text-white/50 mt-1">{material.descricao}</p>
                    )}
                    {material.link && (
                      <a 
                        href={material.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#FF4D00] hover:underline mt-2"
                      >
                        <LinkIcon size={12} />
                        Acessar material
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-lg"
                  >
                    <X size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

      {/* Dialog de Materiais */}
      <Dialog open={materiaisDialogOpen} onOpenChange={setMateriaisDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Material da Aula</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/70">Número da Aula</Label>
              <Input
                type="number"
                value={materialForm.aula}
                onChange={(e) => setMaterialForm({ ...materialForm, aula: e.target.value })}
                placeholder="Ex: 1, 2, 3..."
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Título do Material</Label>
              <Input
                value={materialForm.titulo}
                onChange={(e) => setMaterialForm({ ...materialForm, titulo: e.target.value })}
                placeholder="Ex: Introdução aos Processos"
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Tipo de Material</Label>
              <Select 
                value={materialForm.tipo} 
                onValueChange={(v) => setMaterialForm({ ...materialForm, tipo: v })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="documento">Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Descrição (opcional)</Label>
              <Textarea
                value={materialForm.descricao}
                onChange={(e) => setMaterialForm({ ...materialForm, descricao: e.target.value })}
                placeholder="Descreva o conteúdo do material..."
                className="bg-white/5 border-white/10 text-white mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-white/70">Link do Material</Label>
              <Input
                value={materialForm.link}
                onChange={(e) => setMaterialForm({ ...materialForm, link: e.target.value })}
                placeholder="https://..."
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => setMateriaisDialogOpen(false)} 
                className="flex-1 bg-white/10 hover:bg-white/20 text-white"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddMaterial} 
                disabled={!materialForm.aula || !materialForm.titulo}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
            Salvar Painel
          </Button>
        </div>
      )}
      </div>
      );
      }