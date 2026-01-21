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
    { 
      nome: "Pequena", 
      diametro: "25cm / 4 fatias", 
      max_sabores: 1,
      gramaturas_padrao: { molho: 80, mussarela: 100 },
      sabores: []
    },
    { 
      nome: "Média", 
      diametro: "30cm / 6 fatias", 
      max_sabores: 2,
      gramaturas_padrao: { molho: 100, mussarela: 150 },
      sabores: []
    },
    { 
      nome: "Grande", 
      diametro: "35cm / 8 fatias", 
      max_sabores: 3,
      gramaturas_padrao: { molho: 120, mussarela: 200 },
      sabores: []
    },
    { 
      nome: "Família", 
      diametro: "40cm / 12 fatias", 
      max_sabores: 4,
      gramaturas_padrao: { molho: 150, mussarela: 250 },
      sabores: []
    }
  ],
  observacoes: ""
};

export default function PadronizacaoPizzas({ mentoradoId }) {
  const queryClient = useQueryClient();
  const [expandedTamanhos, setExpandedTamanhos] = useState({});
  const [dadosLocal, setDadosLocal] = useState(dadosDefault);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingTamanho, setEditingTamanho] = useState(null);
  const [editingSabor, setEditingSabor] = useState({ tamanhoIdx: null, saborIdx: null });
  const [newTamanho, setNewTamanho] = useState({ nome: "", diametro: "", max_sabores: 1, gramaturas_padrao: {}, sabores: [] });
  const [newSabores, setNewSabores] = useState({});

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
    const tamanhoCompleto = {
      ...newTamanho,
      gramaturas_padrao: { molho: 0, mussarela: 0 },
      sabores: []
    };
    setDadosLocal({ ...dadosLocal, tamanhos: [...dadosLocal.tamanhos, tamanhoCompleto] });
    setNewTamanho({ nome: "", diametro: "", max_sabores: 1, gramaturas_padrao: {}, sabores: [] });
    setHasChanges(true);
  };

  const handleUpdateTamanho = (idx, data) => {
    const novosTamanhos = [...dadosLocal.tamanhos];
    novosTamanhos[idx] = data;
    setDadosLocal({ ...dadosLocal, tamanhos: novosTamanhos });
    setEditingTamanho(null);
    setHasChanges(true);
  };

  const handleDeleteTamanho = (idx) => {
    const novosTamanhos = dadosLocal.tamanhos.filter((_, i) => i !== idx);
    setDadosLocal({ ...dadosLocal, tamanhos: novosTamanhos });
    setHasChanges(true);
  };

  const handleUpdateGramaturaPadrao = (tamanhoIdx, campo, valor) => {
    const novosTamanhos = [...dadosLocal.tamanhos];
    novosTamanhos[tamanhoIdx].gramaturas_padrao[campo] = Number(valor) || 0;
    setDadosLocal({ ...dadosLocal, tamanhos: novosTamanhos });
    setHasChanges(true);
  };

  const handleAddSaborToTamanho = (tamanhoIdx) => {
    const saborData = newSabores[tamanhoIdx];
    if (!saborData?.nome.trim()) return;
    
    const novosTamanhos = [...dadosLocal.tamanhos];
    novosTamanhos[tamanhoIdx].sabores.push({
      nome: saborData.nome,
      gramaturas: saborData.gramaturas || {}
    });
    
    setDadosLocal({ ...dadosLocal, tamanhos: novosTamanhos });
    setNewSabores({ ...newSabores, [tamanhoIdx]: { nome: "", gramaturas: {} } });
    setHasChanges(true);
  };

  const handleUpdateSaborGramatura = (tamanhoIdx, saborIdx, campo, valor) => {
    const novosTamanhos = [...dadosLocal.tamanhos];
    if (!novosTamanhos[tamanhoIdx].sabores[saborIdx].gramaturas) {
      novosTamanhos[tamanhoIdx].sabores[saborIdx].gramaturas = {};
    }
    novosTamanhos[tamanhoIdx].sabores[saborIdx].gramaturas[campo] = Number(valor) || 0;
    setDadosLocal({ ...dadosLocal, tamanhos: novosTamanhos });
    setHasChanges(true);
  };

  const handleDeleteSaborFromTamanho = (tamanhoIdx, saborIdx) => {
    const novosTamanhos = [...dadosLocal.tamanhos];
    novosTamanhos[tamanhoIdx].sabores = novosTamanhos[tamanhoIdx].sabores.filter((_, i) => i !== saborIdx);
    setDadosLocal({ ...dadosLocal, tamanhos: novosTamanhos });
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
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Pizza size={20} className="text-[#FF4D00]" />
          <div>
            <h3 className="font-semibold text-white">Tamanhos de Pizza</h3>
            <p className="text-xs text-white/40">{dadosLocal.tamanhos.length} tamanhos cadastrados</p>
          </div>
        </div>

        {(
          <div className="space-y-4">
            {dadosLocal.tamanhos.map((tamanho, tamanhoIdx) => {
              const isExpanded = expandedTamanhos[tamanhoIdx];
              
              return (
                <div key={tamanhoIdx} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  {/* Header do Tamanho */}
                  <div className="p-4 group">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setExpandedTamanhos({ ...expandedTamanhos, [tamanhoIdx]: !isExpanded })}
                        className="flex items-center gap-3 flex-1"
                      >
                        {isExpanded ? <ChevronDown size={18} className="text-white/50" /> : <ChevronRight size={18} className="text-white/50" />}
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium text-white">{tamanho.nome}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF4D00]/20 text-[#FF4D00]">
                              Até {tamanho.max_sabores} sabor{tamanho.max_sabores > 1 ? 'es' : ''}
                            </span>
                            <span className="text-xs text-white/40">{tamanho.sabores?.length || 0} sabores</span>
                          </div>
                          <p className="text-sm text-white/50">{tamanho.diametro}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditingTamanho(tamanhoIdx)} className="h-8 w-8 p-0">
                          <Pencil size={14} className="text-blue-400" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteTamanho(tamanhoIdx)} className="h-8 w-8 p-0">
                          <Trash2 size={14} className="text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo Expandido */}
                  {isExpanded && (
                    <div className="border-t border-white/10">
                      {/* Gramaturas Padrão */}
                      <div className="p-4 bg-black/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Scale size={14} className="text-emerald-400" />
                          <span className="text-xs font-medium text-emerald-400">Gramaturas Padrão</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(tamanho.gramaturas_padrao || {}).map(([campo, valor]) => (
                            <div key={campo}>
                              <Label className="text-white/70 text-xs capitalize">{campo.replace('_', ' ')}</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  type="number"
                                  value={valor}
                                  onChange={(e) => handleUpdateGramaturaPadrao(tamanhoIdx, campo, e.target.value)}
                                  className="bg-white/10 border-white/10 text-white"
                                />
                                <span className="text-white/40 text-sm">g</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sabores do Tamanho */}
                      <div className="p-4 border-t border-white/10 bg-black/10">
                        <div className="flex items-center gap-2 mb-3">
                          <Pizza size={14} className="text-violet-400" />
                          <span className="text-xs font-medium text-violet-400">Sabores Específicos</span>
                        </div>

                        {/* Lista de Sabores */}
                        <div className="space-y-2 mb-3">
                          {(tamanho.sabores || []).map((sabor, saborIdx) => (
                            <div key={saborIdx} className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-white text-sm">{sabor.nome}</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleDeleteSaborFromTamanho(tamanhoIdx, saborIdx)} 
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 size={12} className="text-red-400" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {['molho', 'mussarela'].map(campo => (
                                  <div key={campo}>
                                    <Label className="text-white/60 text-xs capitalize">{campo}</Label>
                                    <div className="flex items-center gap-1 mt-1">
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={sabor.gramaturas?.[campo] || ''}
                                        onChange={(e) => handleUpdateSaborGramatura(tamanhoIdx, saborIdx, campo, e.target.value)}
                                        className="bg-white/10 border-white/10 text-white h-7 text-xs"
                                      />
                                      <span className="text-white/30 text-xs">g</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Adicionar Sabor */}
                        <div className="bg-white/5 rounded-lg p-3 border-2 border-dashed border-white/10">
                          <Input
                            placeholder="Nome do sabor (ex: Calabresa, Frango c/ Catupiry)"
                            value={newSabores[tamanhoIdx]?.nome || ''}
                            onChange={(e) => setNewSabores({ 
                              ...newSabores, 
                              [tamanhoIdx]: { ...newSabores[tamanhoIdx], nome: e.target.value, gramaturas: {} } 
                            })}
                            className="bg-white/5 border-white/10 text-white mb-2"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleAddSaborToTamanho(tamanhoIdx)}
                            disabled={!newSabores[tamanhoIdx]?.nome?.trim()}
                            className="bg-violet-500 hover:bg-violet-600 w-full"
                          >
                            <Plus size={14} className="mr-2" />
                            Adicionar Sabor
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Adicionar novo tamanho */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 border-2 border-dashed">
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

      {/* Seção 2: Observações Operacionais */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-amber-400" />
          <h3 className="font-semibold text-white">Observações Operacionais</h3>
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