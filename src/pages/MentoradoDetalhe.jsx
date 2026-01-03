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
  BookOpen,
  FolderOpen,
  ListTodo,
  StickyNote,
  Files,
  ClipboardCheck,
  UtensilsCrossed,
  GitBranch,
  LayoutDashboard,
  ChefHat,
  Stethoscope,
  Lightbulb,
  FileSpreadsheet
} from "lucide-react";
import PilarConteudoIncluido from "@/components/pilares/PilarConteudoIncluido";
import MinhasTarefas from "@/components/mentorado/MinhasTarefas";
import MinhasNotas from "@/components/mentorado/MinhasNotas";
import MeusArquivos from "@/components/mentorado/MeusArquivos";
import DiagnosticoNegocio from "@/components/mentorado/DiagnosticoNegocio";
import AnaliseCardapio from "@/components/mentorado/AnaliseCardapio";
import FluxogramasMentorado from "@/components/mentorado/FluxogramasMentorado.jsx";
import PainelOrganizacao from "@/components/mentorado/PainelOrganizacao";
import FichasTecnicasOperacionais from "@/components/mentorado/FichasTecnicasOperacionais";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const tabParam = urlParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabParam || "home");
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

  const { data: pilarCustomDataList = [] } = useQuery({
    queryKey: ["pilarCustomData", mentoradoId],
    queryFn: () => base44.entities.PilarCustomData.filter({ mentorado_id: mentoradoId }),
    enabled: !!mentoradoId
  });

  const [briefingForm, setBriefingForm] = useState({});
  const [customFields, setCustomFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState("");
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
      // Carregar campos customizados
      setCustomFields(briefing.custom_fields || []);
    }
  }, [briefing]);

  const handleAddCustomField = () => {
    if (newFieldName.trim()) {
      const newFields = [...customFields, { name: newFieldName, value: "" }];
      setCustomFields(newFields);
      setNewFieldName("");
    }
  };

  const handleUpdateCustomField = (index, value) => {
    const updated = [...customFields];
    updated[index].value = value;
    setCustomFields(updated);
  };

  const handleRemoveCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

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

  const updatePilarCustomDataMutation = useMutation({
    mutationFn: async ({ pilarKey, data }) => {
      const existing = pilarCustomDataList.find((p) => p.pilar === pilarKey);
      if (existing) {
        return base44.entities.PilarCustomData.update(existing.id, { data });
      } else {
        return base44.entities.PilarCustomData.create({
          mentorado_id: mentoradoId,
          pilar: pilarKey,
          data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilarCustomData", mentoradoId] });
    }
  });

  const handleSaveBriefing = () => {
    const dataToSave = { ...briefingForm, custom_fields: customFields };
    if (briefing?.id) {
      updateBriefingMutation.mutate({ id: briefing.id, data: dataToSave });
    } else {
      createBriefingMutation.mutate({ ...dataToSave, mentorado_id: mentoradoId });
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

  const getCustomDataForPilar = (pilarKey) => {
    const custom = pilarCustomDataList.find((p) => p.pilar === pilarKey);
    return custom?.data || null;
  };

  const handleUpdatePilarCustomData = (pilarKey, data) => {
    updatePilarCustomDataMutation.mutate({ pilarKey, data });
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
              {mentorado.link_drive && (
                <a
                  href={mentorado.link_drive}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#FF4D00] text-white rounded-xl hover:bg-[#E64500] transition-colors font-medium"
                >
                  <FolderOpen size={18} />
                  Abrir Pasta do Drive
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${activeTab === "home" ? "bg-[#FF4D00] border-[#FF4D00] text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
          <FileText size={24} />
          <span className="text-xs font-medium">Início</span>
        </button>
        <button onClick={() => setActiveTab("briefing")} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${activeTab === "briefing" ? "bg-[#FF4D00] border-[#FF4D00] text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
          <FileText size={24} />
          <span className="text-xs font-medium">Briefing</span>
        </button>
        <button onClick={() => setActiveTab("diagnostico")} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${activeTab === "diagnostico" ? "bg-[#FF4D00] border-[#FF4D00] text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
          <Stethoscope size={24} />
          <span className="text-xs font-medium">Diagnóstico</span>
        </button>
        <button onClick={() => setActiveTab("cardapio")} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${activeTab === "cardapio" ? "bg-[#FF4D00] border-[#FF4D00] text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
          <UtensilsCrossed size={24} />
          <span className="text-xs font-medium">Cardápio</span>
        </button>
        <button onClick={() => setActiveTab("fluxogramas")} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${activeTab === "fluxogramas" ? "bg-[#FF4D00] border-[#FF4D00] text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
          <GitBranch size={24} />
          <span className="text-xs font-medium">Fluxogramas</span>
        </button>
        <button onClick={() => setActiveTab("painel")} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${activeTab === "painel" ? "bg-[#FF4D00] border-[#FF4D00] text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
          <LayoutDashboard size={24} />
          <span className="text-xs font-medium">Painel</span>
        </button>
        <button onClick={() => setActiveTab("pilares")} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${activeTab === "pilares" ? "bg-[#FF4D00] border-[#FF4D00] text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
          <Lightbulb size={24} />
          <span className="text-xs font-medium">Pilares</span>
        </button>
        <button onClick={() => setActiveTab("tarefas")} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${activeTab === "tarefas" ? "bg-[#FF4D00] border-[#FF4D00] text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
          <ListTodo size={24} />
          <span className="text-xs font-medium">Tarefas</span>
        </button>
        <button onClick={() => setActiveTab("fichas_tecnicas")} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${activeTab === "fichas_tecnicas" ? "bg-[#FF4D00] border-[#FF4D00] text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
          <FileSpreadsheet size={24} />
          <span className="text-xs font-medium">Fichas</span>
        </button>
        <button onClick={() => setActiveTab("evolucao")} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${activeTab === "evolucao" ? "bg-[#FF4D00] border-[#FF4D00] text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
          <TrendingUp size={24} />
          <span className="text-xs font-medium">Evolução</span>
        </button>
        <button onClick={() => setActiveTab("notas")} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${activeTab === "notas" ? "bg-[#FF4D00] border-[#FF4D00] text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
          <StickyNote size={24} />
          <span className="text-xs font-medium">Notas</span>
        </button>
        <button onClick={() => setActiveTab("arquivos")} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${activeTab === "arquivos" ? "bg-[#FF4D00] border-[#FF4D00] text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
          <Files size={24} />
          <span className="text-xs font-medium">Arquivos</span>
        </button>
      </div>

      {/* Content */}
      <div>
        {/* Home - Grid de Módulos */}
        {activeTab === "home" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab("briefing")}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-all group"
            >
              <FileText size={32} className="text-white/60 group-hover:text-[#FF4D00]" />
              <span className="text-sm text-white/80 group-hover:text-white font-medium text-center">Briefing</span>
            </button>

            <button
              onClick={() => setActiveTab("diagnostico")}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-all group"
            >
              <Stethoscope size={32} className="text-white/60 group-hover:text-[#FF4D00]" />
              <span className="text-sm text-white/80 group-hover:text-white font-medium text-center">Diagnóstico</span>
            </button>

            <button
              onClick={() => setActiveTab("cardapio")}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-all group"
            >
              <UtensilsCrossed size={32} className="text-white/60 group-hover:text-[#FF4D00]" />
              <span className="text-sm text-white/80 group-hover:text-white font-medium text-center">Cardápio</span>
            </button>

            <button
              onClick={() => setActiveTab("fluxogramas")}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-all group"
            >
              <GitBranch size={32} className="text-white/60 group-hover:text-[#FF4D00]" />
              <span className="text-sm text-white/80 group-hover:text-white font-medium text-center">Fluxogramas</span>
            </button>

            <button
              onClick={() => setActiveTab("painel")}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-all group"
            >
              <LayoutDashboard size={32} className="text-white/60 group-hover:text-[#FF4D00]" />
              <span className="text-sm text-white/80 group-hover:text-white font-medium text-center">Painel</span>
            </button>

            <button
              onClick={() => setActiveTab("pilares")}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-all group"
            >
              <Lightbulb size={32} className="text-white/60 group-hover:text-[#FF4D00]" />
              <span className="text-sm text-white/80 group-hover:text-white font-medium text-center">Pilares</span>
            </button>

            <button
              onClick={() => setActiveTab("tarefas")}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-all group"
            >
              <ListTodo size={32} className="text-white/60 group-hover:text-[#FF4D00]" />
              <span className="text-sm text-white/80 group-hover:text-white font-medium text-center">Tarefas</span>
            </button>

            <button
              onClick={() => setActiveTab("fichas_tecnicas")}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-all group"
            >
              <FileSpreadsheet size={32} className="text-white/60 group-hover:text-[#FF4D00]" />
              <span className="text-sm text-white/80 group-hover:text-white font-medium text-center">Fichas</span>
            </button>

            <button
              onClick={() => setActiveTab("evolucao")}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-all group"
            >
              <TrendingUp size={32} className="text-white/60 group-hover:text-[#FF4D00]" />
              <span className="text-sm text-white/80 group-hover:text-white font-medium text-center">Evolução</span>
            </button>

            <button
              onClick={() => setActiveTab("notas")}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-all group"
            >
              <StickyNote size={32} className="text-white/60 group-hover:text-[#FF4D00]" />
              <span className="text-sm text-white/80 group-hover:text-white font-medium text-center">Notas</span>
            </button>

            <button
              onClick={() => setActiveTab("arquivos")}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-all group"
            >
              <Files size={32} className="text-white/60 group-hover:text-[#FF4D00]" />
              <span className="text-sm text-white/80 group-hover:text-white font-medium text-center">Arquivos</span>
            </button>
          </div>
        )}

        {/* Diagnóstico Tab */}
        {activeTab === "diagnostico" && (
          <>
            <button
              onClick={() => setActiveTab("home")}
              className="mb-6 inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <DiagnosticoNegocio 
              diagnosticoStatus={briefing?.diagnostico_status || {}}
              onUpdateStatus={(status) => {
                if (briefing?.id) {
                  updateBriefingMutation.mutate({ 
                    id: briefing.id, 
                    data: { ...briefing, diagnostico_status: status }
                  });
                } else {
                  createBriefingMutation.mutate({ 
                    mentorado_id: mentoradoId, 
                    diagnostico_status: status 
                  });
                }
              }}
            />
          </div>
          </>
        )}

        {/* Análise de Cardápio Tab */}
        {activeTab === "cardapio" && (
          <>
                    <button
                      onClick={() => setActiveTab("home")}
                      className="mb-6 inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                    >
                      <ArrowLeft size={20} />
                      Voltar
                    </button>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <AnaliseCardapio 
                        analiseData={briefing?.analise_cardapio || {}}
                        onUpdateAnalise={(analiseData) => {
                          if (briefing?.id) {
                            updateBriefingMutation.mutate({ 
                              id: briefing.id, 
                              data: { ...briefing, analise_cardapio: analiseData }
                            });
                          } else {
                            createBriefingMutation.mutate({ 
                              mentorado_id: mentoradoId, 
                              analise_cardapio: analiseData 
                            });
                          }
                        }}
                      />
                    </div>
          </>
        )}

        {/* Fluxogramas Tab */}
        {activeTab === "fluxogramas" && (
          <>
            <button
              onClick={() => setActiveTab("home")}
              className="mb-6 inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <FluxogramasMentorado mentoradoId={mentoradoId} />
          </>
        )}

        {/* Painel de Organização Tab */}
        {activeTab === "painel" && (
          <>
            <button
              onClick={() => setActiveTab("home")}
              className="mb-6 inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <PainelOrganizacao mentoradoId={mentoradoId} />
          </>
        )}

        {/* Briefing Tab */}
        {activeTab === "briefing" && (
          <>
            <button
              onClick={() => setActiveTab("home")}
              className="mb-6 inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Briefing do Negócio</h2>
              {isEditingBriefing ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setIsEditingBriefing(false)} className="bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap">
                    <X size={16} className="mr-1" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveBriefing} className="bg-[#FF4D00] hover:bg-[#E64500]">
                    <Save size={16} className="mr-1" /> Salvar
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => setIsEditingBriefing(true)} className="bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap">
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

                {/* Campos Personalizados */}
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-white/70">Perguntas Personalizadas</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder="Nome da pergunta..."
                        className="bg-white/5 border-white/10 text-white w-64"
                        onKeyDown={(e) => e.key === "Enter" && handleAddCustomField()}
                      />
                      <Button
                        onClick={handleAddCustomField}
                        disabled={!newFieldName.trim()}
                        size="sm"
                        className="bg-[#FF4D00] hover:bg-[#E64500]"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {customFields.map((field, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Label className="text-white/70 text-xs mb-1">{field.name}</Label>
                          <Textarea
                            value={field.value}
                            onChange={(e) => handleUpdateCustomField(index, e.target.value)}
                            placeholder="Resposta..."
                            className="bg-white/5 border-white/10 text-white"
                            rows={2}
                          />
                        </div>
                        <Button
                          onClick={() => handleRemoveCustomField(index)}
                          size="sm"
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 mt-6"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
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
                    {briefing.custom_fields && briefing.custom_fields.length > 0 && (
                      <div className="border-t border-white/10 pt-6">
                        <h4 className="text-sm font-medium text-white/60 mb-3">Perguntas Personalizadas</h4>
                        <div className="space-y-3">
                          {briefing.custom_fields.map((field, index) => (
                            <div key={index} className="bg-white/5 rounded-xl p-4">
                              <p className="text-xs text-white/40 mb-1">{field.name}</p>
                              <p className="text-white/80 whitespace-pre-wrap">{field.value || "-"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pilares Tab */}
        {activeTab === "pilares" && (
          <div className="space-y-6">
            {!selectedPilarConteudo && (
              <button
                onClick={() => setActiveTab("home")}
                className="mb-6 inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                Voltar
              </button>
            )}
            {/* Se tem um pilar selecionado, mostra só ele */}
            {selectedPilarConteudo ? (
              <>
                {(() => {
                  const pilar = pilaresConfig.find(p => p.key === selectedPilarConteudo);
                  const pilarItems = pilares.filter((p) => p.pilar === pilar.key);
                  const pilarProgressosFiltered = getProgressosForPilar(pilar.key);

                  return (
                    <div className="space-y-6">
                      {/* Header com botão voltar */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setSelectedPilarConteudo(null)}
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          <ArrowLeft size={20} className="text-white" />
                        </button>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{pilar.icon}</span>
                          <div>
                            <h2 className="text-2xl font-bold text-white">{pilar.label}</h2>
                            <span className="text-sm text-white/50">{pilarItems.length} materiais cadastrados</span>
                          </div>
                        </div>
                        <div className="ml-auto">
                          <Button onClick={() => setPilarDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
                            <Plus size={16} className="mr-2" /> Adicionar Conteúdo
                          </Button>
                        </div>
                      </div>

                      {/* Conteúdo do Pilar */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <PilarConteudoIncluido
                          pilarKey={pilar.key}
                          progressoItems={pilarProgressosFiltered}
                          onToggleItem={(tipo, texto) => handleToggleProgresso(pilar.key, tipo, texto)}
                          customData={getCustomDataForPilar(pilar.key)}
                          onUpdateCustomData={(data) => handleUpdatePilarCustomData(pilar.key, data)}
                        />
                      </div>

                      {/* Materiais do mentorado */}
                      {pilarItems.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Materiais Específicos</h3>
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
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            ) : (
              <>
                {/* Lista de Pilares em Grid */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Pilares da Mentoria</h2>
                  <Button onClick={() => setPilarDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
                    <Plus size={16} className="mr-2" /> Adicionar Conteúdo
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pilaresConfig.map((pilar) => {
                    const pilarItems = pilares.filter((p) => p.pilar === pilar.key);

                    return (
                      <button
                        key={pilar.key}
                        onClick={() => setSelectedPilarConteudo(pilar.key)}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 hover:border-[#FF4D00]/30 transition-all group"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">{pilar.icon}</span>
                          <div className={`w-2 h-2 rounded-full ${pilar.color}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-[#FF4D00] transition-colors">
                          {pilar.label}
                        </h3>
                        <p className="text-sm text-white/50 mt-1">{pilarItems.length} materiais</p>
                        <div className="mt-4 flex items-center gap-2 text-[#FF4D00] text-sm font-medium">
                          <span>Entrar</span>
                          <ArrowLeft size={16} className="rotate-180" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tarefas Tab */}
        {activeTab === "tarefas" && (
          <>
            <button
              onClick={() => setActiveTab("home")}
              className="mb-6 inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Minhas Tarefas</h2>
            <MinhasTarefas mentoradoId={mentoradoId} />
          </div>
          </>
        )}

        {/* Notas Tab */}
        {activeTab === "notas" && (
          <>
            <button
              onClick={() => setActiveTab("home")}
              className="mb-6 inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Minhas Notas</h2>
            <MinhasNotas mentoradoId={mentoradoId} />
          </div>
          </>
        )}

        {/* Arquivos Tab */}
        {activeTab === "arquivos" && (
          <>
            <button
              onClick={() => setActiveTab("home")}
              className="mb-6 inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Meus Arquivos</h2>
            <MeusArquivos mentoradoId={mentoradoId} />
          </div>
          </>
        )}

        {/* Evolução Tab */}
        {activeTab === "evolucao" && (
          <>
            <button
              onClick={() => setActiveTab("home")}
              className="mb-6 inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
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
          </>
        )}

        {/* Fichas Técnicas Tab */}
        {activeTab === "fichas_tecnicas" && (
          <>
            <button
              onClick={() => setActiveTab("home")}
              className="mb-6 inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <FichasTecnicasOperacionais mentoradoId={mentoradoId} />
          </div>
          </>
        )}
      </div>

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
              <Button onClick={() => setPilarDialogOpen(false)} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap">
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
              <Button onClick={() => setEvolucaoDialogOpen(false)} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap">
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