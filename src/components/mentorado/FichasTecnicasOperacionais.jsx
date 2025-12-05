import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Plus, Edit2, Trash2, Save, X, Copy, Upload, Image,
  ChefHat, FileText, AlertCircle, CheckCircle2, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FichasTecnicasOperacionais({ mentoradoId }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingFicha, setEditingFicha] = useState(null);
  const [viewingFicha, setViewingFicha] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    nome_produto: "",
    foto_url: "",
    ingredientes: [{ quantidade: "", unidade: "", produto: "" }],
    modo_preparo: [""],
    observacoes: ""
  });

  const { data: fichas = [], isLoading } = useQuery({
    queryKey: ["fichas-tecnicas", mentoradoId],
    queryFn: async () => {
      const briefing = await base44.entities.Briefing.filter({ mentorado_id: mentoradoId });
      return briefing[0]?.fichas_tecnicas || [];
    },
    enabled: !!mentoradoId
  });

  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  const saveMutation = useMutation({
    mutationFn: async (fichasAtualizadas) => {
      if (briefing?.id) {
        return base44.entities.Briefing.update(briefing.id, { 
          fichas_tecnicas: fichasAtualizadas 
        });
      } else {
        return base44.entities.Briefing.create({ 
          mentorado_id: mentoradoId, 
          fichas_tecnicas: fichasAtualizadas 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fichas-tecnicas", mentoradoId] });
      queryClient.invalidateQueries({ queryKey: ["briefing", mentoradoId] });
      handleCloseDialog();
    }
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFicha(null);
    setForm({
      nome_produto: "",
      foto_url: "",
      ingredientes: [{ quantidade: "", unidade: "", produto: "" }],
      modo_preparo: [""],
      observacoes: ""
    });
  };

  const handleEdit = (ficha, index) => {
    setEditingFicha(index);
    setForm({
      nome_produto: ficha.nome_produto || "",
      foto_url: ficha.foto_url || "",
      ingredientes: ficha.ingredientes?.length > 0 
        ? ficha.ingredientes 
        : [{ quantidade: "", unidade: "", produto: "" }],
      modo_preparo: ficha.modo_preparo?.length > 0 
        ? ficha.modo_preparo 
        : [""],
      observacoes: ficha.observacoes || ""
    });
    setDialogOpen(true);
  };

  const handleView = (ficha) => {
    setViewingFicha(ficha);
    setViewDialogOpen(true);
  };

  const handleDuplicate = (ficha) => {
    setEditingFicha(null);
    setForm({
      nome_produto: ficha.nome_produto + " (Cópia)",
      foto_url: ficha.foto_url || "",
      ingredientes: ficha.ingredientes?.length > 0 
        ? [...ficha.ingredientes] 
        : [{ quantidade: "", unidade: "", produto: "" }],
      modo_preparo: ficha.modo_preparo?.length > 0 
        ? [...ficha.modo_preparo] 
        : [""],
      observacoes: ficha.observacoes || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = (index) => {
    const novasFichas = fichas.filter((_, i) => i !== index);
    saveMutation.mutate(novasFichas);
  };

  const handleSave = () => {
    const novaFicha = { ...form, id: Date.now().toString() };
    let novasFichas;
    
    if (editingFicha !== null) {
      novasFichas = fichas.map((f, i) => i === editingFicha ? novaFicha : f);
    } else {
      novasFichas = [...fichas, novaFicha];
    }
    
    saveMutation.mutate(novasFichas);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm({ ...form, foto_url: file_url });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
    setIsUploading(false);
  };

  const addIngrediente = () => {
    setForm({
      ...form,
      ingredientes: [...form.ingredientes, { quantidade: "", unidade: "", produto: "" }]
    });
  };

  const updateIngrediente = (index, field, value) => {
    const novos = [...form.ingredientes];
    novos[index][field] = value;
    setForm({ ...form, ingredientes: novos });
  };

  const removeIngrediente = (index) => {
    if (form.ingredientes.length > 1) {
      setForm({
        ...form,
        ingredientes: form.ingredientes.filter((_, i) => i !== index)
      });
    }
  };

  const addPasso = () => {
    setForm({ ...form, modo_preparo: [...form.modo_preparo, ""] });
  };

  const updatePasso = (index, value) => {
    const novos = [...form.modo_preparo];
    novos[index] = value;
    setForm({ ...form, modo_preparo: novos });
  };

  const removePasso = (index) => {
    if (form.modo_preparo.length > 1) {
      setForm({
        ...form,
        modo_preparo: form.modo_preparo.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Explicação Inicial */}
      <Accordion type="single" collapsible defaultValue="explicacao">
        <AccordionItem value="explicacao" className="bg-gradient-to-br from-[#FF4D00]/10 to-transparent border border-[#FF4D00]/20 rounded-xl">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2 text-[#FF4D00]">
              <FileText size={18} />
              <span className="font-semibold">📌 COMO MONTAR UMA FICHA TÉCNICA OPERACIONAL</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              {/* Bloco 1 - Introdução */}
              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#FF4D00] rounded-full flex items-center justify-center text-xs">1</span>
                  O que é uma Ficha Técnica?
                </h4>
                <p className="text-white/70 text-sm">
                  A ficha técnica operacional serve para <strong className="text-white">padronizar o preparo</strong>, 
                  garantir qualidade, manter consistência de sabor e evitar erros na produção.
                </p>
              </div>

              {/* Bloco 2 - Componentes */}
              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#FF4D00] rounded-full flex items-center justify-center text-xs">2</span>
                  Componentes Obrigatórios
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { icon: "📷", text: "Foto do produto" },
                    { icon: "📝", text: "Título do produto" },
                    { icon: "📊", text: "Tabela de ingredientes" },
                    { icon: "📋", text: "Modo de preparo" },
                    { icon: "⚖️", text: "Quantidades exatas" },
                    { icon: "⚠️", text: "Observações críticas" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                      <span>{item.icon}</span>
                      <span className="text-white/70 text-xs">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloco 3 - Estrutura do Modelo */}
              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#FF4D00] rounded-full flex items-center justify-center text-xs">3</span>
                  Estrutura do Modelo
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                    <span className="text-blue-400 font-bold">BLOCO 1</span>
                    <span className="text-white/70">Foto do produto (20% esquerda)</span>
                  </div>
                  <div className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                    <span className="text-emerald-400 font-bold">BLOCO 2</span>
                    <span className="text-white/70">Título centralizado - "FICHA TÉCNICA OPERACIONAL"</span>
                  </div>
                  <div className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                    <span className="text-violet-400 font-bold">BLOCO 3</span>
                    <span className="text-white/70">Tabela: QUANT. | UNID. | PRODUTO</span>
                  </div>
                  <div className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                    <span className="text-amber-400 font-bold">BLOCO 4</span>
                    <span className="text-white/70">Receita / Modo de Preparo numerado</span>
                  </div>
                  <div className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                    <span className="text-pink-400 font-bold">BLOCO 5</span>
                    <span className="text-white/70">Observações e pontos críticos</span>
                  </div>
                </div>
              </div>

              {/* Bloco 4 - Regras Gerais */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Regras Gerais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "A equipe deve seguir a ficha exatamente como está escrita",
                    "Não alterar ingredientes, métodos ou quantidades",
                    "Qualquer mudança deve ser aprovada pela gestão",
                    "A ficha deve ser revisada antes do preparo"
                  ].map((regra, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={14} className="text-amber-400 flex-shrink-0" />
                      <span className="text-white/70">{regra}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Header com botão de criar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ChefHat className="text-[#FF4D00]" size={20} />
            Fichas Técnicas Cadastradas
          </h3>
          <p className="text-sm text-white/50">{fichas.length} fichas técnicas</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
          <Plus size={16} className="mr-2" /> Nova Ficha Técnica
        </Button>
      </div>

      {/* Lista de Fichas */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
              <div className="h-32 bg-white/10 rounded-lg mb-3" />
              <div className="h-5 bg-white/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : fichas.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
          <ChefHat size={48} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/50 mb-4">Nenhuma ficha técnica cadastrada</p>
          <Button onClick={() => setDialogOpen(true)} variant="outline" className="border-[#FF4D00]/50 text-[#FF4D00]">
            <Plus size={16} className="mr-2" /> Criar Primeira Ficha
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fichas.map((ficha, index) => (
            <div 
              key={ficha.id || index} 
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group hover:border-[#FF4D00]/30 transition-colors"
            >
              {/* Foto */}
              <div className="h-40 bg-black/20 flex items-center justify-center overflow-hidden">
                {ficha.foto_url ? (
                  <img 
                    src={ficha.foto_url} 
                    alt={ficha.nome_produto} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image size={40} className="text-white/20" />
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h4 className="font-semibold text-white mb-2 line-clamp-1">{ficha.nome_produto}</h4>
                <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
                  <span>{ficha.ingredientes?.length || 0} ingredientes</span>
                  <span>•</span>
                  <span>{ficha.modo_preparo?.length || 0} passos</span>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleView(ficha)}
                    className="flex-1 border-white/10 text-white/70 hover:text-white"
                  >
                    <Eye size={14} className="mr-1" /> Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(ficha, index)}
                    className="border-white/10 text-white/70 hover:text-white"
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDuplicate(ficha)}
                    className="border-white/10 text-white/70 hover:text-white"
                  >
                    <Copy size={14} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(index)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog de Visualização */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">FICHA TÉCNICA OPERACIONAL</DialogTitle>
          </DialogHeader>
          
          {viewingFicha && (
            <div className="space-y-6 mt-4">
              {/* Layout da Ficha */}
              <div className="flex gap-6">
                {/* Foto (20% esquerda) */}
                <div className="w-1/5 flex-shrink-0">
                  <div className="aspect-square bg-black/30 rounded-lg overflow-hidden border border-white/10">
                    {viewingFicha.foto_url ? (
                      <img 
                        src={viewingFicha.foto_url} 
                        alt={viewingFicha.nome_produto} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size={32} className="text-white/20" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Título (centro) */}
                <div className="flex-1 text-center">
                  <h2 className="text-xl font-bold text-[#FF4D00] mb-2">FICHA TÉCNICA OPERACIONAL</h2>
                  <p className="text-lg font-medium text-white border-b border-white/20 pb-2 inline-block px-8">
                    NOME DO PRODUTO: {viewingFicha.nome_produto}
                  </p>
                </div>
              </div>

              {/* Tabela de Ingredientes */}
              <div>
                <h3 className="font-semibold text-white mb-3 text-center">TABELA DE INGREDIENTES</h3>
                <div className="border border-white/20 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/10">
                        <th className="px-4 py-2 text-left text-sm font-semibold text-white/80 w-24">QUANT.</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-white/80 w-24">UNID.</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-white/80">PRODUTO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingFicha.ingredientes?.map((ing, idx) => (
                        <tr key={idx} className="border-t border-white/10">
                          <td className="px-4 py-2 text-white/70">{ing.quantidade}</td>
                          <td className="px-4 py-2 text-white/70">{ing.unidade}</td>
                          <td className="px-4 py-2 text-white">{ing.produto}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modo de Preparo */}
              <div>
                <h3 className="font-semibold text-white mb-3">RECEITA / MODO DE PREPARO:</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  {viewingFicha.modo_preparo?.map((passo, idx) => (
                    <p key={idx} className="text-white/80">
                      <span className="font-medium text-[#FF4D00]">{idx + 1}.</span> {passo}
                    </p>
                  ))}
                </div>
              </div>

              {/* Observações */}
              {viewingFicha.observacoes && (
                <div>
                  <h3 className="font-semibold text-white mb-3">OBSERVAÇÕES:</h3>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <p className="text-white/80 whitespace-pre-wrap">{viewingFicha.observacoes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Criação/Edição */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); else setDialogOpen(open); }}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFicha !== null ? "Editar Ficha Técnica" : "Nova Ficha Técnica"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Bloco 1 - Foto e Nome */}
            <div className="flex gap-6">
              {/* Upload de Foto */}
              <div className="w-1/4">
                <Label className="text-white/70 mb-2 block">Foto do Produto</Label>
                <div className="aspect-square bg-black/30 rounded-lg overflow-hidden border-2 border-dashed border-white/20 hover:border-[#FF4D00]/50 transition-colors relative">
                  {form.foto_url ? (
                    <>
                      <img 
                        src={form.foto_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setForm({ ...form, foto_url: "" })}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <Upload size={24} className="text-white/30 mb-2" />
                      <span className="text-xs text-white/40 text-center px-2">
                        {isUploading ? "Enviando..." : "Clique para upload"}
                      </span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Nome do Produto */}
              <div className="flex-1">
                <Label className="text-white/70 mb-2 block">Nome do Produto *</Label>
                <Input
                  value={form.nome_produto}
                  onChange={(e) => setForm({ ...form, nome_produto: e.target.value })}
                  placeholder="Ex: Cebola Caramelizada"
                  className="bg-white/5 border-white/10 text-white text-lg"
                />
              </div>
            </div>

            {/* Bloco 3 - Tabela de Ingredientes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-white/70">Tabela de Ingredientes</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addIngrediente}
                  className="border-[#FF4D00]/50 text-[#FF4D00]"
                >
                  <Plus size={14} className="mr-1" /> Ingrediente
                </Button>
              </div>
              
              <div className="border border-white/20 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-2 bg-white/10 px-3 py-2">
                  <div className="col-span-2 text-xs font-semibold text-white/80">QUANT.</div>
                  <div className="col-span-2 text-xs font-semibold text-white/80">UNID.</div>
                  <div className="col-span-7 text-xs font-semibold text-white/80">PRODUTO</div>
                  <div className="col-span-1"></div>
                </div>
                
                {form.ingredientes.map((ing, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-white/10">
                    <div className="col-span-2">
                      <Input
                        value={ing.quantidade}
                        onChange={(e) => updateIngrediente(idx, "quantidade", e.target.value)}
                        placeholder="1,000"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={ing.unidade}
                        onChange={(e) => updateIngrediente(idx, "unidade", e.target.value)}
                        placeholder="kg"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div className="col-span-7">
                      <Input
                        value={ing.produto}
                        onChange={(e) => updateIngrediente(idx, "produto", e.target.value)}
                        placeholder="Cebola branca"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      {form.ingredientes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngrediente(idx)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloco 4 - Modo de Preparo */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-white/70">Receita / Modo de Preparo</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addPasso}
                  className="border-[#FF4D00]/50 text-[#FF4D00]"
                >
                  <Plus size={14} className="mr-1" /> Passo
                </Button>
              </div>
              
              <div className="space-y-2">
                {form.modo_preparo.map((passo, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-8 h-10 flex items-center justify-center bg-[#FF4D00]/20 text-[#FF4D00] rounded font-medium text-sm">
                      {idx + 1}.
                    </span>
                    <Input
                      value={passo}
                      onChange={(e) => updatePasso(idx, e.target.value)}
                      placeholder="Descreva o passo..."
                      className="flex-1 bg-white/5 border-white/10 text-white"
                    />
                    {form.modo_preparo.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePasso(idx)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bloco 5 - Observações */}
            <div>
              <Label className="text-white/70 mb-2 block">Observações</Label>
              <Textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Pontos críticos, dicas importantes, alertas de processo..."
                className="bg-white/5 border-white/10 text-white min-h-[120px]"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={handleCloseDialog} 
                className="flex-1 border-white/10 text-white"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!form.nome_produto || saveMutation.isPending}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                <Save size={16} className="mr-2" />
                {saveMutation.isPending ? "Salvando..." : "Salvar Ficha"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}