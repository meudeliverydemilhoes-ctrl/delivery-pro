import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Plus,
  Search,
  BookOpen,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronRight,
  Layers,
  PlayCircle,
  FileText,
  X,
  Home
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function Cursos() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cursoDialogOpen, setCursoDialogOpen] = useState(false);
  const [moduloDialogOpen, setModuloDialogOpen] = useState(false);
  const [aulaDialogOpen, setAulaDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState(null);
  const [selectedCursoId, setSelectedCursoId] = useState(null);
  const [selectedModuloId, setSelectedModuloId] = useState(null);
  const [expandedCursos, setExpandedCursos] = useState({});

  const [cursoForm, setCursoForm] = useState({ nome: "", descricao: "", status: "ativo" });
  const [moduloForm, setModuloForm] = useState({ nome: "", descricao: "", ordem: 0 });
  const [aulaForm, setAulaForm] = useState({ titulo: "", descricao: "", video_url: "", duracao: "", ordem: 0 });

  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ["cursos"],
    queryFn: () => base44.entities.Curso.list()
  });

  const { data: modulos = [] } = useQuery({
    queryKey: ["modulos"],
    queryFn: () => base44.entities.Modulo.list()
  });

  const { data: aulas = [] } = useQuery({
    queryKey: ["aulas"],
    queryFn: () => base44.entities.Aula.list()
  });

  const createCursoMutation = useMutation({
    mutationFn: (data) => base44.entities.Curso.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cursos"] });
      setCursoDialogOpen(false);
      setCursoForm({ nome: "", descricao: "", status: "ativo" });
    }
  });

  const updateCursoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Curso.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cursos"] });
      setCursoDialogOpen(false);
      setEditingCurso(null);
      setCursoForm({ nome: "", descricao: "", status: "ativo" });
    }
  });

  const deleteCursoMutation = useMutation({
    mutationFn: (id) => base44.entities.Curso.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cursos"] })
  });

  const createModuloMutation = useMutation({
    mutationFn: (data) => base44.entities.Modulo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modulos"] });
      setModuloDialogOpen(false);
      setModuloForm({ nome: "", descricao: "", ordem: 0 });
    }
  });

  const deleteModuloMutation = useMutation({
    mutationFn: (id) => base44.entities.Modulo.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["modulos"] })
  });

  const createAulaMutation = useMutation({
    mutationFn: (data) => base44.entities.Aula.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aulas"] });
      setAulaDialogOpen(false);
      setAulaForm({ titulo: "", descricao: "", video_url: "", duracao: "", ordem: 0 });
    }
  });

  const deleteAulaMutation = useMutation({
    mutationFn: (id) => base44.entities.Aula.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["aulas"] })
  });

  const handleEditCurso = (curso) => {
    setEditingCurso(curso);
    setCursoForm({ nome: curso.nome, descricao: curso.descricao || "", status: curso.status || "ativo" });
    setCursoDialogOpen(true);
  };

  const handleSaveCurso = () => {
    if (editingCurso) {
      updateCursoMutation.mutate({ id: editingCurso.id, data: cursoForm });
    } else {
      createCursoMutation.mutate(cursoForm);
    }
  };

  const handleAddModulo = (cursoId) => {
    setSelectedCursoId(cursoId);
    setModuloDialogOpen(true);
  };

  const handleAddAula = (moduloId) => {
    setSelectedModuloId(moduloId);
    setAulaDialogOpen(true);
  };

  const toggleCurso = (cursoId) => {
    setExpandedCursos((prev) => ({ ...prev, [cursoId]: !prev[cursoId] }));
  };

  const filtered = cursos.filter((c) =>
    c.nome?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    ativo: "bg-emerald-500/20 text-emerald-400",
    rascunho: "bg-amber-500/20 text-amber-400",
    arquivado: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Meus Cursos</h1>
          <p className="text-white/50">{cursos.length} cursos cadastrados</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("Dashboard")}>
            <Button className="bg-[#FF4D00] hover:bg-[#E64500] text-white">
              <Home size={18} className="mr-2" /> Início
            </Button>
          </Link>
          <Button onClick={() => setCursoDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
            <Plus size={20} className="mr-2" /> Novo Curso
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <Input
          placeholder="Buscar cursos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
        />
      </div>

      {/* Cursos List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-1/3 mb-2" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <BookOpen size={48} className="mx-auto mb-4 text-white/20" />
          <p className="text-white/50">Nenhum curso encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((curso) => {
            const cursoModulos = modulos.filter((m) => m.curso_id === curso.id).sort((a, b) => a.ordem - b.ordem);
            const isExpanded = expandedCursos[curso.id];

            return (
              <Collapsible key={curso.id} open={isExpanded} onOpenChange={() => toggleCurso(curso.id)}>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <CollapsibleTrigger className="flex items-center gap-4 text-left flex-1">
                        <div className="w-12 h-12 bg-[#FF4D00]/20 rounded-xl flex items-center justify-center">
                          <BookOpen size={24} className="text-[#FF4D00]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg">{curso.nome}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[curso.status]}`}>
                              {curso.status}
                            </span>
                            <span className="text-sm text-white/40">
                              {cursoModulos.length} módulos
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          size={20}
                          className={`text-white/40 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </CollapsibleTrigger>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-white/10 rounded-lg ml-2">
                            <MoreVertical size={16} className="text-white/50" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-zinc-900 border-white/10">
                          <DropdownMenuItem onClick={() => handleEditCurso(curso)} className="text-white hover:bg-white/10">
                            <Edit2 size={14} className="mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddModulo(curso.id)} className="text-white hover:bg-white/10">
                            <Plus size={14} className="mr-2" /> Adicionar Módulo
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteCursoMutation.mutate(curso.id)} className="text-red-400 hover:bg-red-500/10">
                            <Trash2 size={14} className="mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="border-t border-white/10 px-6 py-4 bg-white/[0.02]">
                      {cursoModulos.length === 0 ? (
                        <p className="text-white/40 text-sm text-center py-4">Nenhum módulo cadastrado</p>
                      ) : (
                        <div className="space-y-3">
                          {cursoModulos.map((modulo) => {
                            const moduloAulas = aulas.filter((a) => a.modulo_id === modulo.id).sort((a, b) => a.ordem - b.ordem);
                            return (
                              <div key={modulo.id} className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Layers size={16} className="text-[#FF4D00]" />
                                    <h4 className="font-medium text-white">{modulo.nome}</h4>
                                    <span className="text-xs text-white/40">({moduloAulas.length} aulas)</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleAddAula(modulo.id)}
                                      className="text-[#FF4D00] hover:bg-[#FF4D00]/10 h-8"
                                    >
                                      <Plus size={14} className="mr-1" /> Aula
                                    </Button>
                                    <button
                                      onClick={() => deleteModuloMutation.mutate(modulo.id)}
                                      className="text-red-400 hover:text-red-300 p-1"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>

                                {moduloAulas.length > 0 && (
                                  <div className="space-y-2 ml-6">
                                    {moduloAulas.map((aula) => (
                                      <div
                                        key={aula.id}
                                        className="flex items-center justify-between p-2 bg-white/5 rounded-lg group"
                                      >
                                        <div className="flex items-center gap-2">
                                          <PlayCircle size={14} className="text-white/40" />
                                          <span className="text-sm text-white/80">{aula.titulo}</span>
                                          {aula.duracao && (
                                            <span className="text-xs text-white/40">{aula.duracao}</span>
                                          )}
                                        </div>
                                        <button
                                          onClick={() => deleteAulaMutation.mutate(aula.id)}
                                          className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddModulo(curso.id)}
                        className="w-full mt-4 border-dashed border-white/20 text-white/50 hover:bg-white/5 hover:text-white"
                      >
                        <Plus size={14} className="mr-2" /> Adicionar Módulo
                      </Button>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Dialog Curso */}
      <Dialog open={cursoDialogOpen} onOpenChange={(open) => {
        setCursoDialogOpen(open);
        if (!open) {
          setEditingCurso(null);
          setCursoForm({ nome: "", descricao: "", status: "ativo" });
        }
      }}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCurso ? "Editar Curso" : "Novo Curso"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/70">Nome do Curso *</Label>
              <Input
                value={cursoForm.nome}
                onChange={(e) => setCursoForm({ ...cursoForm, nome: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Descrição</Label>
              <Textarea
                value={cursoForm.descricao}
                onChange={(e) => setCursoForm({ ...cursoForm, descricao: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-white/70">Status</Label>
              <Select value={cursoForm.status} onValueChange={(v) => setCursoForm({ ...cursoForm, status: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="arquivado">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setCursoDialogOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={handleSaveCurso} disabled={!cursoForm.nome} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]">
                {editingCurso ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Módulo */}
      <Dialog open={moduloDialogOpen} onOpenChange={setModuloDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Módulo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/70">Nome do Módulo *</Label>
              <Input
                value={moduloForm.nome}
                onChange={(e) => setModuloForm({ ...moduloForm, nome: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Descrição</Label>
              <Textarea
                value={moduloForm.descricao}
                onChange={(e) => setModuloForm({ ...moduloForm, descricao: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-white/70">Ordem</Label>
              <Input
                type="number"
                value={moduloForm.ordem}
                onChange={(e) => setModuloForm({ ...moduloForm, ordem: Number(e.target.value) })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setModuloDialogOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button
                onClick={() => createModuloMutation.mutate({ ...moduloForm, curso_id: selectedCursoId })}
                disabled={!moduloForm.nome}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Aula */}
      <Dialog open={aulaDialogOpen} onOpenChange={setAulaDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Aula</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/70">Título *</Label>
              <Input
                value={aulaForm.titulo}
                onChange={(e) => setAulaForm({ ...aulaForm, titulo: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Descrição</Label>
              <Textarea
                value={aulaForm.descricao}
                onChange={(e) => setAulaForm({ ...aulaForm, descricao: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">URL do Vídeo</Label>
                <Input
                  value={aulaForm.video_url}
                  onChange={(e) => setAulaForm({ ...aulaForm, video_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Duração</Label>
                <Input
                  value={aulaForm.duracao}
                  onChange={(e) => setAulaForm({ ...aulaForm, duracao: e.target.value })}
                  placeholder="Ex: 15min"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setAulaDialogOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button
                onClick={() => createAulaMutation.mutate({ ...aulaForm, modulo_id: selectedModuloId })}
                disabled={!aulaForm.titulo}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}