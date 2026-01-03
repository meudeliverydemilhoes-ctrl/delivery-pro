import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus,
  Search,
  Filter,
  Users,
  MapPin,
  Phone,
  ArrowRight,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  Home,
  FileText,
  Stethoscope,
  UtensilsCrossed,
  GitBranch,
  LayoutGrid,
  Lightbulb,
  CheckSquare,
  FileSpreadsheet,
  TrendingUp,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function Mentorados() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [etapaFilter, setEtapaFilter] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMentorado, setEditingMentorado] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    negocio: "",
    cidade: "",
    contato: "",
    email: "",
    status: "ativo",
    etapa: "diagnostico",
    data_entrada: format(new Date(), "yyyy-MM-dd"),
    observacoes: "",
    link_drive: "",
  });

  const { data: mentorados = [], isLoading } = useQuery({
    queryKey: ["mentorados"],
    queryFn: () => base44.entities.Mentorado.list("-created_date")
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Mentorado.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentorados"] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Mentorado.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentorados"] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Mentorado.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentorados"] });
    }
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMentorado(null);
    setFormData({
      nome: "",
      negocio: "",
      cidade: "",
      contato: "",
      email: "",
      status: "ativo",
      etapa: "diagnostico",
      data_entrada: format(new Date(), "yyyy-MM-dd"),
      observacoes: "",
      link_drive: "",
    });
  };

  const handleEdit = (mentorado) => {
    setEditingMentorado(mentorado);
    setFormData({
      nome: mentorado.nome || "",
      negocio: mentorado.negocio || "",
      cidade: mentorado.cidade || "",
      contato: mentorado.contato || "",
      email: mentorado.email || "",
      status: mentorado.status || "ativo",
      etapa: mentorado.etapa || "diagnostico",
      data_entrada: mentorado.data_entrada || format(new Date(), "yyyy-MM-dd"),
      observacoes: mentorado.observacoes || "",
      link_drive: mentorado.link_drive || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingMentorado) {
      updateMutation.mutate({ id: editingMentorado.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filtered = mentorados.filter((m) => {
    const matchSearch =
      m.nome?.toLowerCase().includes(search.toLowerCase()) ||
      m.negocio?.toLowerCase().includes(search.toLowerCase()) ||
      m.cidade?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || m.status === statusFilter;
    const matchEtapa = etapaFilter === "todos" || m.etapa === etapaFilter;
    return matchSearch && matchStatus && matchEtapa;
  });

  const statusColors = {
    ativo: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    pausado: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    concluido: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    desistente: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const etapaLabels = {
    diagnostico: "Diagnóstico",
    pilar1: "Pilar 1 - Processos",
    pilar2: "Pilar 2 - Desempenho",
    pilar3: "Pilar 3 - Tempo de Potência",
    pilar4: "Pilar 4 - Norte Estratégico",
    pilar5: "Pilar 5 - Presença Magnética",
    acompanhamento: "Acompanhamento",
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mentorados</h1>
          <p className="text-white/50">{mentorados.length} mentorados cadastrados</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("Dashboard")}>
            <Button className="bg-[#FF4D00] hover:bg-[#E64500] text-white">
              <Home size={18} className="mr-2" /> Início
            </Button>
          </Link>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-[#FF4D00] hover:bg-[#E64500] text-white"
          >
            <Plus size={20} className="mr-2" />
            Novo Mentorado
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Buscar por nome, negócio ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="pausado">Pausado</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="desistente">Desistente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={etapaFilter} onValueChange={setEtapaFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Etapa" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="todos">Todas Etapas</SelectItem>
            <SelectItem value="diagnostico">Diagnóstico</SelectItem>
            <SelectItem value="pilar1">Pilar 1</SelectItem>
            <SelectItem value="pilar2">Pilar 2</SelectItem>
            <SelectItem value="pilar3">Pilar 3</SelectItem>
            <SelectItem value="pilar4">Pilar 4</SelectItem>
            <SelectItem value="pilar5">Pilar 5</SelectItem>
            <SelectItem value="acompanhamento">Acompanhamento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 bg-white/10 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
                    <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                      <Users size={48} className="mx-auto mb-4 text-white/20" />
                      <p className="text-white/50">Nenhum mentorado encontrado</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FF4D00]/20 rounded-full flex items-center justify-center">
                    <span className="text-[#FF4D00] font-bold text-lg">
                      {m.nome?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{m.nome}</h3>
                    <p className="text-sm text-white/50">{m.negocio}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={16} className="text-white/50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-white/10">
                    <DropdownMenuItem onClick={() => handleEdit(m)} className="text-white hover:bg-white/10">
                      <Edit2 size={14} className="mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteMutation.mutate(m.id)}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={14} className="mr-2" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 mb-4">
                {m.cidade && (
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <MapPin size={14} />
                    <span>{m.cidade}</span>
                  </div>
                )}
                {m.contato && (
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Phone size={14} />
                    <span>{m.contato}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[m.status]}`}>
                  {m.status}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                  {etapaLabels[m.etapa] || m.etapa}
                </span>
              </div>

              {/* Módulos Clicáveis */}
              <div className="grid grid-cols-3 gap-2">
                <Link
                  to={createPageUrl(`MentoradoDetalhe?id=${m.id}&tab=briefing`)}
                  className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-lg hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-colors group"
                >
                  <FileText size={20} className="text-white/60 group-hover:text-[#FF4D00]" />
                  <span className="text-xs text-white/60 group-hover:text-white text-center whitespace-nowrap">Briefing</span>
                </Link>

                <Link
                  to={createPageUrl(`MentoradoDetalhe?id=${m.id}&tab=diagnostico`)}
                  className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-lg hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-colors group"
                >
                  <Stethoscope size={20} className="text-white/60 group-hover:text-[#FF4D00]" />
                  <span className="text-xs text-white/60 group-hover:text-white text-center whitespace-nowrap">Diagnóstico</span>
                </Link>

                <Link
                  to={createPageUrl(`MentoradoDetalhe?id=${m.id}&tab=cardapio`)}
                  className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-lg hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-colors group"
                >
                  <UtensilsCrossed size={20} className="text-white/60 group-hover:text-[#FF4D00]" />
                  <span className="text-xs text-white/60 group-hover:text-white text-center whitespace-nowrap">Cardápio</span>
                </Link>

                <Link
                  to={createPageUrl(`MentoradoDetalhe?id=${m.id}&tab=fluxogramas`)}
                  className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-lg hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-colors group"
                >
                  <GitBranch size={20} className="text-white/60 group-hover:text-[#FF4D00]" />
                  <span className="text-xs text-white/60 group-hover:text-white text-center whitespace-nowrap">Fluxogramas</span>
                </Link>

                <Link
                  to={createPageUrl(`MentoradoDetalhe?id=${m.id}&tab=painel`)}
                  className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-lg hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-colors group"
                >
                  <LayoutGrid size={20} className="text-white/60 group-hover:text-[#FF4D00]" />
                  <span className="text-xs text-white/60 group-hover:text-white text-center whitespace-nowrap">Painel</span>
                </Link>

                <Link
                  to={createPageUrl(`MentoradoDetalhe?id=${m.id}&tab=pilares`)}
                  className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-lg hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-colors group"
                >
                  <Lightbulb size={20} className="text-white/60 group-hover:text-[#FF4D00]" />
                  <span className="text-xs text-white/60 group-hover:text-white text-center whitespace-nowrap">Pilares</span>
                </Link>

                <Link
                  to={createPageUrl(`MentoradoDetalhe?id=${m.id}&tab=tarefas`)}
                  className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-lg hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-colors group"
                >
                  <CheckSquare size={20} className="text-white/60 group-hover:text-[#FF4D00]" />
                  <span className="text-xs text-white/60 group-hover:text-white text-center whitespace-nowrap">Tarefas</span>
                </Link>

                <Link
                  to={createPageUrl(`MentoradoDetalhe?id=${m.id}&tab=fichas_tecnicas`)}
                  className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-lg hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-colors group"
                >
                  <FileSpreadsheet size={20} className="text-white/60 group-hover:text-[#FF4D00]" />
                  <span className="text-xs text-white/60 group-hover:text-white text-center whitespace-nowrap">Fichas</span>
                </Link>

                <Link
                  to={createPageUrl(`MentoradoDetalhe?id=${m.id}&tab=evolucao`)}
                  className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-lg hover:bg-[#FF4D00]/10 hover:border-[#FF4D00]/30 border border-white/10 transition-colors group"
                >
                  <TrendingUp size={20} className="text-white/60 group-hover:text-[#FF4D00]" />
                  <span className="text-xs text-white/60 group-hover:text-white text-center whitespace-nowrap">Evolução</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMentorado ? "Editar Mentorado" : "Novo Mentorado"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Nome *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Negócio *</Label>
                <Input
                  value={formData.negocio}
                  onChange={(e) => setFormData({ ...formData, negocio: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Cidade</Label>
                <Input
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Contato</Label>
                <Input
                  value={formData.contato}
                  onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-white/70">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="desistente">Desistente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Etapa</Label>
                <Select value={formData.etapa} onValueChange={(v) => setFormData({ ...formData, etapa: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                    <SelectItem value="pilar1">Pilar 1</SelectItem>
                    <SelectItem value="pilar2">Pilar 2</SelectItem>
                    <SelectItem value="pilar3">Pilar 3</SelectItem>
                    <SelectItem value="pilar4">Pilar 4</SelectItem>
                    <SelectItem value="pilar5">Pilar 5</SelectItem>
                    <SelectItem value="acompanhamento">Acompanhamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-white/70">Data de Entrada</Label>
              <Input
                type="date"
                value={formData.data_entrada}
                onChange={(e) => setFormData({ ...formData, data_entrada: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Link do Google Drive</Label>
              <Input
                value={formData.link_drive}
                onChange={(e) => setFormData({ ...formData, link_drive: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1 min-h-[100px]"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleCloseDialog} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.nome || !formData.negocio}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white"
              >
                {editingMentorado ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}