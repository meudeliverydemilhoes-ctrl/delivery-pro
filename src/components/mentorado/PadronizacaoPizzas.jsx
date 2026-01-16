import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Pizza, Plus, Pencil, Trash2, Save, X, ChevronDown, ChevronRight,
  Check, FileText, Scale, Users, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const dadosDefault = {
  tamanhos: [
    { nome: "Pequena", diametro: "25cm / 4 fatias", max_sabores: 1 },
    { nome: "Média", diametro: "30cm / 6 fatias", max_sabores: 2 },
    { nome: "Grande", diametro: "35cm / 8 fatias", max_sabores: 3 },
    { nome: "Família", diametro: "40cm / 12 fatias", max_sabores: 4 }
  ],
  gramaturas: {
    "Pequena": { molho: 80, mussarela: 100, proteina: 80, complementares: 30, borda: 50, finalizacao: 10 },
    "Média": { molho: 100, mussarela: 150, proteina: 100, complementares: 40, borda: 70, finalizacao: 15 },
    "Grande": { molho: 120, mussarela: 200, proteina: 120, complementares: 50, borda: 90, finalizacao: 20 },
    "Família": { molho: 150, mussarela: 250, proteina: 150, complementares: 60, borda: 110, finalizacao: 25 }
  },
  sabores: [],
  observacoes: ""
};

export default function PadronizacaoPizzas({ mentoradoId }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState({ tamanhos: true, gramaturas: false, sabores: false });
  const [dadosLocal, setDadosLocal] = useState(dadosDefault);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingTamanho, setEditingTamanho] = useState(null);
  const [editingGramatura, setEditingGramatura] = useState(null);
  const [editingSabor, setEditingSabor] = useState(null);
  const [newTamanho, setNewTamanho] = useState({ nome: "", diametro: "", max_sabores: 1 });
  const [newSabor, setNewSabor] = useState({ nome: "", ingredientes: "" });

  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  useEffect(() => {
    if (briefing?.padronizacao_pizzas) {
      setDadosLocal(briefing.padronizacao_pizzas);
    } else {
      setDadosLocal(dadosDefault);
    }
  }, [briefing]);

  const updateBriefingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Briefing.update(id, data),
    onSuccess: (updatedBriefing) => {
      queryClient.setQueryData(["briefing", mentoradoId], [updatedBriefing]);
      setHasChanges(false);
    }
  });

  const createBriefingMutation = useMutation({
    mutationFn: (data) => base44.entities.Briefing.create(data),
    onSuccess: (newBriefing) => {
      queryClient.setQueryData(["briefing", mentoradoId], [newBriefing]);
      setHasChanges(false);
    }
  });

  const handleSave = () => {
    if (briefing?.id) {
      updateBriefingMutation.mutate({ 
        id: briefing.id, 
        data: { ...briefing, padronizacao_pizzas: dadosLocal }
      });
    } else {
      createBriefingMutation.mutate({ 
        mentorado_id: mentoradoId, 
        padronizacao_pizzas: dadosLocal 
      });
    }
  };

  const handleAddTamanho = () => {
    if (!newTamanho.nome.trim()) return;
    const novosTamanhos = [...dadosLocal.tamanhos, newTamanho];
    const novasGramaturas = { ...dadosLocal.gramaturas, [newTamanho.nome]: { molho: 0, mussarela: 0, proteina: 0, complementares: 0, borda: 0, finalizacao: 0 } };
    setDadosLocal({ ...dadosLocal, tamanhos: novosTamanhos, gramaturas: novasGramaturas });
    setNewTamanho({ nome: "", diametro: "", max_sabores: 1 });
    setHasChanges(true);
  };

  const handleUpdateTamanho = (idx, data) => {
    const novosTamanhos = [...dadosLocal.tamanhos];
    const nomeAntigo = novosTamanhos[idx].nome;
    novosTamanhos[idx] = data;
    
    const novasGramaturas = { ...dadosLocal.gramaturas };
    if (nomeAntigo !== data.nome) {
      novasGramaturas[data.nome] = novasGramaturas[nomeAntigo];
      delete novasGramaturas[nomeAntigo];
    }
    
    setDadosLocal({ ...dadosLocal, tamanhos: novosTamanhos, gramaturas: novasGramaturas });
    setEditingTamanho(null);
    setHasChanges(true);
  };

  const handleDeleteTamanho = (idx) => {
    const tamanho = dadosLocal.tamanhos[idx];
    const novosTamanhos = dadosLocal.tamanhos.filter((_, i) => i !== idx);
    const novasGramaturas = { ...dadosLocal.gramaturas };
    delete novasGramaturas[tamanho.nome];
    setDadosLocal({ ...dadosLocal, tamanhos: novosTamanhos, gramaturas: novasGramaturas });
    setHasChanges(true);
  };

  const handleUpdateGramatura = (tamanho, campo, valor) => {
    const novasGramaturas = {
      ...dadosLocal.gramaturas,
      [tamanho]: { ...dadosLocal.gramaturas[tamanho], [campo]: Number(valor) || 0 }
    };
    setDadosLocal({ ...dadosLocal, gramaturas: novasGramaturas });
    setHasChanges(true);
  };

  const handleAddSabor = () => {
    if (!newSabor.nome.trim()) return;
    setDadosLocal({ ...dadosLocal, sabores: [...dadosLocal.sabores, newSabor] });
    setNewSabor({ nome: "", ingredientes: "" });
    setHasChanges(true);
  };

  const handleUpdateSabor = (idx, data) => {
    const novosSabores = [...dadosLocal.sabores];
    novosSabores[idx] = data;
    setDadosLocal({ ...dadosLocal, sabores: novosSabores });
    setEditingSabor(null);
    setHasChanges(true);
  };

  const handleDeleteSabor = (idx) => {
    setDadosLocal({ ...dadosLocal, sabores: dadosLocal.sabores.filter((_, i) => i !== idx) });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FF4D00]/20 rounded-xl flex items-center justify-center">
            <Pizza size={24} className="text-[#FF4D00]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Padronização de Pizzas</h2>
            <p className="text-sm text-white/50">Controle, padrão e lucratividade do delivery</p>
          </div>
        </div>
        {hasChanges && (
          <Button 
            onClick={handleSave} 
            disabled={updateBriefingMutation.isPending || createBriefingMutation.isPending}
            className="bg-[#FF4D00] hover:bg-[#E64500]"
          >
            <Save size={16} className="mr-2" />
            Salvar
          </Button>
        )}
      </div>

      {/* Cards de Benefícios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-4">
          <Scale size={18} className="text-blue-400 mb-2" />
          <p className="text-sm font-medium text-white">Padrão de Produção</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-4">
          <TrendingUp size={18} className="text-emerald-400 mb-2" />
          <p className="text-sm font-medium text-white">Controle de Custos</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 rounded-xl p-4">
          <Check size={18} className="text-violet-400 mb-2" />
          <p className="text-sm font-medium text-white">Qualidade Constante</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-4">
          <Users size={18} className="text-amber-400 mb-2" />
          <p className="text-sm font-medium text-white">Treinamento Fácil</p>
        </div>
      </div>

      {/* Seção 1: Tamanhos de Pizza e Gramaturas */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpanded({ ...expanded, tamanhos: !expanded.tamanhos })}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Pizza size={20} className="text-[#FF4D00]" />
            <div className="text-left">
              <h3 className="font-semibold text-white">1. Tamanhos de Pizza e Gramaturas</h3>
              <p className="text-xs text-white/40">{dadosLocal.tamanhos.length} tamanhos cadastrados</p>
            </div>
          </div>
          {expanded.tamanhos ? <ChevronDown className="text-white/50" /> : <ChevronRight className="text-white/50" />}
        </button>

        {expanded.tamanhos && (
          <div className="p-4 border-t border-white/10 space-y-4">
            {dadosLocal.tamanhos.map((tamanho, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg overflow-hidden">
                <div className="p-4 group">
                  {editingTamanho === idx ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-white/70 text-xs">Nome</Label>
                          <Input
                            value={tamanho.nome}
                            onChange={(e) => {
                              const novosTamanhos = [...dadosLocal.tamanhos];
                              novosTamanhos[idx].nome = e.target.value;
                              setDadosLocal({ ...dadosLocal, tamanhos: novosTamanhos });
                            }}
                            className="bg-white/5 border-white/10 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white/70 text-xs">Diâmetro/Fatias</Label>
                          <Input
                            value={tamanho.diametro}
                            onChange={(e) => {
                              const novosTamanhos = [...dadosLocal.tamanhos];
                              novosTamanhos[idx].diametro = e.target.value;
                              setDadosLocal({ ...dadosLocal, tamanhos: novosTamanhos });
                            }}
                            className="bg-white/5 border-white/10 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white/70 text-xs">Máx. Sabores</Label>
                          <Input
                            type="number"
                            value={tamanho.max_sabores}
                            onChange={(e) => {
                              const novosTamanhos = [...dadosLocal.tamanhos];
                              novosTamanhos[idx].max_sabores = Number(e.target.value);
                              setDadosLocal({ ...dadosLocal, tamanhos: novosTamanhos });
                            }}
                            className="bg-white/5 border-white/10 text-white mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdateTamanho(idx, tamanho)} className="bg-emerald-500 hover:bg-emerald-600">
                          <Check size={14} className="mr-1" />
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingTamanho(null)} className="border-white/10">
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-white">{tamanho.nome}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF4D00]/20 text-[#FF4D00]">
                            Até {tamanho.max_sabores} sabor{tamanho.max_sabores > 1 ? 'es' : ''}
                          </span>
                        </div>
                        <p className="text-sm text-white/50">{tamanho.diametro}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" onClick={() => setEditingTamanho(idx)} className="h-8 w-8 p-0">
                          <Pencil size={14} className="text-blue-400" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteTamanho(idx)} className="h-8 w-8 p-0">
                          <Trash2 size={14} className="text-red-400" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gramaturas do Tamanho */}
                <div className="px-4 pb-4 border-t border-white/10 pt-3 bg-black/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Scale size={14} className="text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">Gramaturas Padrão</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(dadosLocal.gramaturas[tamanho.nome] || {}).map(([campo, valor]) => (
                      <div key={campo}>
                        <Label className="text-white/70 text-xs capitalize">{campo.replace('_', ' ')}</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={valor}
                            onChange={(e) => handleUpdateGramatura(tamanho.nome, campo, e.target.value)}
                            className="bg-white/10 border-white/10 text-white"
                          />
                          <span className="text-white/40 text-sm">g</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white/5 rounded-lg p-4 border-2 border-dashed border-white/10">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Input
                  placeholder="Nome (ex: Gigante)"
                  value={newTamanho.nome}
                  onChange={(e) => setNewTamanho({ ...newTamanho, nome: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
                <Input
                  placeholder="45cm / 16 fatias"
                  value={newTamanho.diametro}
                  onChange={(e) => setNewTamanho({ ...newTamanho, diametro: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
                <Input
                  type="number"
                  placeholder="Máx. sabores"
                  value={newTamanho.max_sabores}
                  onChange={(e) => setNewTamanho({ ...newTamanho, max_sabores: Number(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <Button 
                size="sm" 
                onClick={handleAddTamanho}
                disabled={!newTamanho.nome.trim()}
                className="bg-[#FF4D00] hover:bg-[#E64500] w-full"
              >
                <Plus size={14} className="mr-2" />
                Adicionar Tamanho
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Seção 2: Sabores Específicos */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpanded({ ...expanded, sabores: !expanded.sabores })}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-violet-400" />
            <div className="text-left">
              <h3 className="font-semibold text-white">2. Sabores Específicos (Opcional)</h3>
              <p className="text-xs text-white/40">{dadosLocal.sabores.length} sabores cadastrados</p>
            </div>
          </div>
          {expanded.sabores ? <ChevronDown className="text-white/50" /> : <ChevronRight className="text-white/50" />}
        </button>

        {expanded.sabores && (
          <div className="p-4 border-t border-white/10 space-y-3">
            {dadosLocal.sabores.map((sabor, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-4 group">
                {editingSabor === idx ? (
                  <div className="space-y-3">
                    <Input
                      value={sabor.nome}
                      onChange={(e) => {
                        const novosSabores = [...dadosLocal.sabores];
                        novosSabores[idx].nome = e.target.value;
                        setDadosLocal({ ...dadosLocal, sabores: novosSabores });
                      }}
                      placeholder="Nome do sabor"
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Textarea
                      value={sabor.ingredientes}
                      onChange={(e) => {
                        const novosSabores = [...dadosLocal.sabores];
                        novosSabores[idx].ingredientes = e.target.value;
                        setDadosLocal({ ...dadosLocal, sabores: novosSabores });
                      }}
                      placeholder="Ingredientes e gramaturas específicas"
                      className="bg-white/5 border-white/10 text-white"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdateSabor(idx, sabor)} className="bg-emerald-500 hover:bg-emerald-600">
                        <Check size={14} className="mr-1" />
                        Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingSabor(null)} className="border-white/10">
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{sabor.nome}</h4>
                      <p className="text-sm text-white/50 whitespace-pre-wrap">{sabor.ingredientes}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => setEditingSabor(idx)} className="h-8 w-8 p-0">
                        <Pencil size={14} className="text-blue-400" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteSabor(idx)} className="h-8 w-8 p-0">
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="bg-white/5 rounded-lg p-4 border-2 border-dashed border-white/10 space-y-3">
              <Input
                placeholder="Nome do sabor (ex: Calabresa Especial)"
                value={newSabor.nome}
                onChange={(e) => setNewSabor({ ...newSabor, nome: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Textarea
                placeholder="Ingredientes e gramaturas específicas..."
                value={newSabor.ingredientes}
                onChange={(e) => setNewSabor({ ...newSabor, ingredientes: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                rows={2}
              />
              <Button 
                size="sm" 
                onClick={handleAddSabor}
                disabled={!newSabor.nome.trim()}
                className="bg-[#FF4D00] hover:bg-[#E64500] w-full"
              >
                <Plus size={14} className="mr-2" />
                Adicionar Sabor
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Seção 3: Observações Operacionais */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-amber-400" />
          <h3 className="font-semibold text-white">3. Observações Operacionais</h3>
        </div>
        <Textarea
          value={dadosLocal.observacoes}
          onChange={(e) => {
            setDadosLocal({ ...dadosLocal, observacoes: e.target.value });
            setHasChanges(true);
          }}
          placeholder="Ex: Substituições permitidas, ajustes em promoções, padrões especiais de montagem..."
          className="bg-white/5 border-white/10 text-white min-h-[100px]"
        />
      </div>

      {/* Botão fixo de salvar */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleSave} 
            disabled={updateBriefingMutation.isPending || createBriefingMutation.isPending}
            size="lg" 
            className="bg-[#FF4D00] hover:bg-[#E64500] shadow-lg shadow-[#FF4D00]/30"
          >
            <Save size={18} className="mr-2" />
            Salvar Alterações
          </Button>
        </div>
      )}
    </div>
  );
}