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
  Users,
  FileStack
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

  const [user, setUser] = React.useState(null);
  const [hasPermission, setHasPermission] = React.useState(true);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: mentorado, isLoading } = useQuery({
    queryKey: ["mentorado", mentoradoId],
    queryFn: () => base44.entities.Mentorado.filter({ id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  React.useEffect(() => {
    if (user && mentorado) {
      // Admin pode ver tudo
      if (user.role === "admin") {
        setHasPermission(true);
      } else {
        // Mentorado só pode ver seus próprios dados
        setHasPermission(user.email === mentorado.email);
      }
    }
  }, [user, mentorado]);

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

  if (!hasPermission) {
    return (
      <div className="max-w-6xl mx-auto text-center py-16">
        <p className="text-white/50">Você não tem permissão para acessar esta página</p>
        <Link to={createPageUrl("AreaMentorado")} className="text-[#FF4D00] hover:underline mt-4 inline-block">
          Voltar para Minha Área
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
          className="inline-flex items-center gap-2 text-[#FF4D00] hover:text-white mb-4"
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
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#FF4D00]/10 text-[#FF4D00] rounded-xl hover:bg-[#FF4D00]/20 transition-colors font-medium"
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

      {/* Links para páginas dedicadas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <Link to={createPageUrl(`Fornecedores?id=${mentoradoId}`)} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
          <Users size={20} className="text-white/50 group-hover:text-[#FF4D00]" />
          <span className="text-white group-hover:text-[#FF4D00] font-medium">Fornecedores</span>
        </Link>
        <Link to={createPageUrl(`MentoradoBriefing?id=${mentoradoId}`)} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
          <FileText size={20} className="text-white/50 group-hover:text-[#FF4D00]" />
          <span className="text-white group-hover:text-[#FF4D00] font-medium">Briefing</span>
        </Link>
        <Link to={createPageUrl(`MentoradoDiagnostico?id=${mentoradoId}`)} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
          <ClipboardCheck size={20} className="text-white/50 group-hover:text-[#FF4D00]" />
          <span className="text-white group-hover:text-[#FF4D00] font-medium">Diagnóstico</span>
        </Link>
        <Link to={createPageUrl(`MentoradoCardapio?id=${mentoradoId}`)} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
          <UtensilsCrossed size={20} className="text-white/50 group-hover:text-[#FF4D00]" />
          <span className="text-white group-hover:text-[#FF4D00] font-medium">Cardápio</span>
        </Link>
        <Link to={createPageUrl(`MentoradoFluxogramas?id=${mentoradoId}`)} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
          <GitBranch size={20} className="text-white/50 group-hover:text-[#FF4D00]" />
          <span className="text-white group-hover:text-[#FF4D00] font-medium">Fluxogramas</span>
        </Link>
        <Link to={createPageUrl(`MentoradoPainel?id=${mentoradoId}`)} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
          <LayoutDashboard size={20} className="text-white/50 group-hover:text-[#FF4D00]" />
          <span className="text-white group-hover:text-[#FF4D00] font-medium">Painel</span>
        </Link>
        <Link to={createPageUrl(`MentoradoPilares?id=${mentoradoId}`)} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
          <Target size={20} className="text-white/50 group-hover:text-[#FF4D00]" />
          <span className="text-white group-hover:text-[#FF4D00] font-medium">Pilares</span>
        </Link>
        <Link to={createPageUrl(`MentoradoTarefas?id=${mentoradoId}`)} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
          <ListTodo size={20} className="text-white/50 group-hover:text-[#FF4D00]" />
          <span className="text-white group-hover:text-[#FF4D00] font-medium">Tarefas</span>
        </Link>
        <Link to={createPageUrl(`MentoradoNotas?id=${mentoradoId}`)} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
          <StickyNote size={20} className="text-white/50 group-hover:text-[#FF4D00]" />
          <span className="text-white group-hover:text-[#FF4D00] font-medium">Notas</span>
        </Link>
        {mentorado?.link_drive ? (
          <a href={mentorado.link_drive} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
            <Files size={20} className="text-white/50 group-hover:text-[#FF4D00]" />
            <span className="text-white group-hover:text-[#FF4D00] font-medium">Arquivos (Drive)</span>
          </a>
        ) : (
          <Link to={createPageUrl(`MentoradoArquivos?id=${mentoradoId}`)} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
            <Files size={20} className="text-white/50 group-hover:text-[#FF4D00]" />
            <span className="text-white group-hover:text-[#FF4D00] font-medium">Arquivos</span>
          </Link>
        )}
        <Link to={createPageUrl(`MentoradoFichasTecnicas?id=${mentoradoId}`)} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
          <ChefHat size={20} className="text-white/50 group-hover:text-[#FF4D00]" />
          <span className="text-white group-hover:text-[#FF4D00] font-medium">Fichas Técnicas</span>
        </Link>
        <Link to={createPageUrl(`MentoradoEvolucao?id=${mentoradoId}`)} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
          <TrendingUp size={20} className="text-white/50 group-hover:text-[#FF4D00]" />
          <span className="text-white group-hover:text-[#FF4D00] font-medium">Evolução</span>
        </Link>
        <Link to={createPageUrl(`GestaoFinanceira?id=${mentoradoId}`)} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
          <FileStack size={20} className="text-white/50 group-hover:text-[#FF4D00]" />
          <span className="text-white group-hover:text-[#FF4D00] font-medium">Processos</span>
        </Link>
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