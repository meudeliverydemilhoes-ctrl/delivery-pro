import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Search, Filter, Plus, X, MoreVertical, Mail, Phone,
  MapPin, Calendar, Edit2, Trash2, User, Building2,
  CheckCircle2, Clock, PauseCircle, XCircle, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PortalMentorados() {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterEtapa, setFilterEtapa] = useState("todos");
  const [showDialog, setShowDialog] = useState(false);
  const [editingMentorado, setEditingMentorado] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(async (userData) => {
      setUser(userData);
      if (userData.role === "user") {
        const mentorados = await base44.entities.Mentorado.filter({ email: userData.email });
        if (mentorados.length > 0) {
          window.location.href = createPageUrl(`MentoradoDetalhe?id=${mentorados[0].id}`);
        }
      }
    }).catch(() => setUser(null));
  }, []);
  const [formData, setFormData] = useState({
    nome: "",
    negocio: "",
    cidade: "",
    contato: "",
    email: "",
    status: "ativo",
    etapa: "diagnostico",
    data_entrada: new Date().toISOString().split("T")[0],
    observacoes: "",
    link_drive: ""
  });

  const { data: mentorados = [], isLoading } = useQuery({
    queryKey: ["portalMentorados"],
    queryFn: () => base44.entities.Mentorado.list("-created_date")
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Mentorado.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portalMentorados"] });
      queryClient.invalidateQueries({ queryKey: ["mentorados"] });
      setShowDialog(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Mentorado.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portalMentorados"] });
      queryClient.invalidateQueries({ queryKey: ["mentorados"] });
      setShowDialog(false);
      setEditingMentorado(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Mentorado.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portalMentorados"] });
      queryClient.invalidateQueries({ queryKey: ["mentorados"] });
    }
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      negocio: "",
      cidade: "",
      contato: "",
      email: "",
      status: "ativo",
      etapa: "diagnostico",
      data_entrada: new Date().toISOString().split("T")[0],
      observacoes: "",
      link_drive: ""
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
      data_entrada: mentorado.data_entrada || new Date().toISOString().split("T")[0],
      observacoes: mentorado.observacoes || "",
      link_drive: mentorado.link_drive || ""
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingMentorado) {
      updateMutation.mutate({ id: editingMentorado.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir este mentorado?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSendInvite = async (mentorado) => {
    if (!mentorado.email) {
      alert("Mentorado não possui email cadastrado");
      return;
    }
    
    try {
      await base44.integrations.Core.SendEmail({
        to: mentorado.email,
        subject: "Convite para acessar o Portal de Mentoria",
        body: `Olá ${mentorado.nome},\n\nVocê foi convidado para acessar o Portal de Mentoria.\n\nAcesse: ${window.location.origin}\n\nSeu login: ${mentorado.email}\n\nAté breve!`
      });
      alert("Convite enviado com sucesso!");
    } catch (error) {
      alert("Erro ao enviar convite");
    }
  };

  const filteredMentorados = mentorados.filter((m) => {
    const matchSearch = m.nome?.toLowerCase().includes(search.toLowerCase()) ||
                       m.negocio?.toLowerCase().includes(search.toLowerCase()) ||
                       m.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "todos" || m.status === filterStatus;
    const matchEtapa = filterEtapa === "todos" || m.etapa === filterEtapa;
    return matchSearch && matchStatus && matchEtapa;
  });

  const statusConfig = {
    ativo: { label: "Ativo", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
    pausado: { label: "Pausado", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: PauseCircle },
    concluido: { label: "Concluído", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle2 },
    desistente: { label: "Desistente", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle }
  };

  const etapaConfig = {
    diagnostico: { label: "Diagnóstico", color: "text-violet-400" },
    pilar1: { label: "Pilar 1", color: "text-blue-400" },
    pilar2: { label: "Pilar 2", color: "text-cyan-400" },
    pilar3: { label: "Pilar 3", color: "text-emerald-400" },
    pilar4: { label: "Pilar 4", color: "text-amber-400" },
    pilar5: { label: "Pilar 5", color: "text-orange-400" },
    acompanhamento: { label: "Acompanhamento", color: "text-pink-400" }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Portal de Mentorados</h1>
            <p className="text-white/50">Gestão completa de mentorados ({filteredMentorados.length})</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowDialog(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
              <Plus size={16} className="mr-2" /> Novo Mentorado
            </Button>
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                Dashboard Principal
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <Input
              placeholder="Buscar por nome, negócio ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="pausado">Pausado</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="desistente">Desistente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterEtapa} onValueChange={setFilterEtapa}>
            <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Etapa" />
            </SelectTrigger>
            <SelectContent>
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
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMentorados.map((mentorado) => {
          const StatusIcon = statusConfig[mentorado.status]?.icon || CheckCircle2;
          return (
            <div key={mentorado.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FF4D00]/20 rounded-xl flex items-center justify-center">
                    <User className="text-[#FF4D00]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{mentorado.nome}</h3>
                    <p className="text-sm text-white/50 flex items-center gap-1">
                      <Building2 size={14} /> {mentorado.negocio}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={18} className="text-white/50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                    <DropdownMenuItem onClick={() => handleEdit(mentorado)} className="text-white hover:bg-white/10">
                      <Edit2 size={14} className="mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSendInvite(mentorado)} className="text-white hover:bg-white/10">
                      <Mail size={14} className="mr-2" /> Enviar Convite
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(mentorado.id)} className="text-red-400 hover:bg-red-500/10">
                      <Trash2 size={14} className="mr-2" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 mb-4">
                {mentorado.cidade && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <MapPin size={14} /> {mentorado.cidade}
                  </div>
                )}
                {mentorado.contato && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Phone size={14} /> {mentorado.contato}
                  </div>
                )}
                {mentorado.email && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Mail size={14} /> {mentorado.email}
                  </div>
                )}
                {mentorado.data_entrada && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Calendar size={14} /> Entrada: {new Date(mentorado.data_entrada).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${statusConfig[mentorado.status]?.color || statusConfig.ativo.color}`}>
                  <StatusIcon size={12} />
                  {statusConfig[mentorado.status]?.label || mentorado.status}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 ${etapaConfig[mentorado.etapa]?.color || "text-white/70"}`}>
                  {etapaConfig[mentorado.etapa]?.label || mentorado.etapa}
                </span>
              </div>

              <div className="flex gap-2">
                <Link to={createPageUrl(`MentoradoDetalhe?id=${mentorado.id}`)} className="flex-1">
                  <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10" size="sm">
                    <ExternalLink size={14} className="mr-2" /> Ver Perfil
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMentorados.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="mx-auto mb-4 text-white/20" />
          <p className="text-white/40">Nenhum mentorado encontrado</p>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) {
          setEditingMentorado(null);
          resetForm();
        }
      }}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingMentorado ? "Editar Mentorado" : "Novo Mentorado"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Nome Completo *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Nome do Negócio *</Label>
                <Input
                  value={formData.negocio}
                  onChange={(e) => setFormData({ ...formData, negocio: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                <Label className="text-white/70">Data de Entrada</Label>
                <Input
                  type="date"
                  value={formData.data_entrada}
                  onChange={(e) => setFormData({ ...formData, data_entrada: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="desistente">Desistente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Etapa</Label>
                <Select value={formData.etapa} onValueChange={(value) => setFormData({ ...formData, etapa: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
              <Label className="text-white/70">Link Google Drive</Label>
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
                className="bg-white/5 border-white/10 text-white mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="border-white/10 text-white hover:bg-white/10">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.nome || !formData.negocio} className="bg-[#FF4D00] hover:bg-[#E64500]">
              {editingMentorado ? "Atualizar" : "Criar"} Mentorado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}