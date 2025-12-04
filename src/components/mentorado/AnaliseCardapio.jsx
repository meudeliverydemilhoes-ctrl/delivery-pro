import React, { useState, useEffect } from "react";
import {
  CheckCircle2, Circle, ChevronDown, ChevronRight, Lightbulb,
  Eye, Layout, Package, Camera, TrendingUp, ShoppingCart, Shield,
  Award, AlertTriangle, CheckCheck, XCircle, Sparkles, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const secoes = [
  {
    id: "primeira_impressao",
    titulo: "1) Primeira Impressão — Interface e Navegação",
    icon: Eye,
    cor: "bg-blue-500",
    corBorder: "border-blue-500/30",
    corBg: "bg-blue-500/10",
    checklist: [
      "Cardápio abre rápido e corretamente em dispositivos móveis?",
      "Design é profissional e visualmente agradável?",
      "Navegação é intuitiva e fácil de entender (categorias bem separadas)?",
      "Há contraste adequado entre fundo e texto?",
      "Botão de pedido/checkout é visível durante toda navegação?",
      "Imagens despertam desejo?",
      "Cliente consegue visualizar tudo com poucos cliques?"
    ],
    campos: [
      { key: "sugestoes_melhoria", label: "Sugestões de melhoria", auto: true }
    ]
  },
  {
    id: "organizacao_categorias",
    titulo: "2) Organização das Categorias",
    icon: Layout,
    cor: "bg-violet-500",
    corBorder: "border-violet-500/30",
    corBg: "bg-violet-500/10",
    checklist: [
      "Categorias bem organizadas (combos, principais, bebidas etc.)",
      "Ordem das categorias segue lógica estratégica (carro-chefe primeiro)",
      "Categorias sem repetição/confusão",
      "Itens fáceis de serem encontrados"
    ],
    campos: [
      { key: "reorganizar", label: "O que deve ser reorganizado" },
      { key: "sugestoes_estrategicas", label: "Sugestões estratégicas" }
    ]
  },
  {
    id: "apresentacao_produtos",
    titulo: "3) Apresentação dos Produtos",
    icon: Package,
    cor: "bg-emerald-500",
    corBorder: "border-emerald-500/30",
    corBg: "bg-emerald-500/10",
    checklist: [
      "Nome dos produtos está claro e correto",
      "Descrições curtas e atrativas (máx. 3 linhas)",
      "Destaques de diferenciais (ex: artesanal, Angus)",
      "Fotos reais e de boa qualidade",
      "Opções e variações bem apresentadas"
    ],
    campos: [
      { key: "produtos_ajustar", label: "Produtos que precisam ser ajustados" },
      { key: "sugestoes_descricao", label: "Sugestões de descrição mais atrativa" }
    ]
  },
  {
    id: "fotos_visual",
    titulo: "4) Fotos e Estímulo Visual",
    icon: Camera,
    cor: "bg-pink-500",
    corBorder: "border-pink-500/30",
    corBg: "bg-pink-500/10",
    checklist: [
      "Fotos profissionais (reais ou render)",
      "Fundo limpo e favorecendo o produto",
      "Sem filtros exagerados",
      "Cores vivas e brilho adequado",
      "Itens importantes possuem imagem?"
    ],
    campos: [
      { key: "itens_novas_fotos", label: "Itens que precisam de novas fotos" },
      { key: "melhorias_visuais", label: "Melhorias visuais recomendadas" }
    ]
  },
  {
    id: "estrategia_comercial",
    titulo: "5) Estratégia Comercial",
    icon: TrendingUp,
    cor: "bg-amber-500",
    corBorder: "border-amber-500/30",
    corBg: "bg-amber-500/10",
    checklist: [
      "Promoções em destaque",
      "Produtos com maior margem estão na melhor posição",
      "Cardápio incentiva upgrades e adicionais",
      "Há sugestões para aumentar o ticket médio?"
    ],
    campos: [
      { key: "oportunidades_faturamento", label: "Oportunidades de aumentar faturamento" },
      { key: "sugestoes_combos", label: "Sugestões de combos e adicionais estratégicos" }
    ]
  },
  {
    id: "checkout",
    titulo: "6) Experiência no Checkout",
    icon: ShoppingCart,
    cor: "bg-cyan-500",
    corBorder: "border-cyan-500/30",
    corBg: "bg-cyan-500/10",
    checklist: [
      "Botão de fazer pedido sempre visível",
      "Processo rápido (até 3 etapas)",
      "Cliente consegue adicionar/remover adicionais facilmente",
      "Valor final é claro e transparente",
      "Aceita os meios de pagamento principais"
    ],
    campos: [
      { key: "gargalos_checkout", label: "Gargalos identificados no checkout" },
      { key: "acoes_conversao", label: "Ações para melhorar conversão" }
    ]
  },
  {
    id: "identidade_confianca",
    titulo: "7) Identidade e Confiança",
    icon: Shield,
    cor: "bg-indigo-500",
    corBorder: "border-indigo-500/30",
    corBg: "bg-indigo-500/10",
    checklist: [
      "Cardápio transmite identidade da marca (cores, tom de voz, estilo visual)",
      "Passa segurança (sem erros, links quebrados)",
      "Navegação intuitiva e acolhedora",
      "Tom de comunicação convida à ação"
    ],
    campos: [
      { key: "ajustes_marca", label: "Ajustes necessários para fortalecer a marca" }
    ]
  }
];

const sugestoesAutomaticas = {
  primeira_impressao: {
    0: "⚠️ Otimize o carregamento: comprima imagens e revise o servidor/hospedagem.",
    1: "⚠️ Considere contratar um designer ou usar templates profissionais.",
    2: "⚠️ Reorganize as categorias de forma mais clara e lógica.",
    3: "⚠️ Ajuste cores de fundo e fonte para melhor legibilidade.",
    4: "⚠️ Fixe o botão de pedido no rodapé da tela.",
    5: "⚠️ Invista em fotos profissionais que despertem desejo.",
    6: "⚠️ Simplifique a navegação reduzindo cliques necessários."
  }
};

export default function AnaliseCardapio({ analiseData = {}, onUpdateAnalise }) {
  const [data, setData] = useState(analiseData);
  const [expandedSections, setExpandedSections] = useState({ primeira_impressao: true });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setData(analiseData);
  }, [analiseData]);

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCheckItem = (secaoId, itemIdx) => {
    const key = `${secaoId}_check_${itemIdx}`;
    const newData = { ...data, [key]: data[key] === "sim" ? "nao" : data[key] === "nao" ? null : "sim" };
    setData(newData);
    setHasChanges(true);
  };

  const getCheckValue = (secaoId, itemIdx) => {
    return data[`${secaoId}_check_${itemIdx}`] || null;
  };

  const updateCampo = (secaoId, campoKey, value) => {
    const key = `${secaoId}_${campoKey}`;
    const newData = { ...data, [key]: value };
    setData(newData);
    setHasChanges(true);
  };

  const getCampoValue = (secaoId, campoKey) => {
    return data[`${secaoId}_${campoKey}`] || "";
  };

  const handleSave = () => {
    onUpdateAnalise?.(data);
    setHasChanges(false);
  };

  const getSugestoesAuto = (secaoId) => {
    if (secaoId !== "primeira_impressao") return null;
    const sugestoes = [];
    secoes.find(s => s.id === secaoId)?.checklist.forEach((_, idx) => {
      if (getCheckValue(secaoId, idx) === "nao" && sugestoesAutomaticas[secaoId]?.[idx]) {
        sugestoes.push(sugestoesAutomaticas[secaoId][idx]);
      }
    });
    return sugestoes.length > 0 ? sugestoes : null;
  };

  const getSecaoProgress = (secaoId, secao) => {
    let total = secao.checklist.length;
    let sim = 0;
    let nao = 0;
    secao.checklist.forEach((_, idx) => {
      const val = getCheckValue(secaoId, idx);
      if (val === "sim") sim++;
      if (val === "nao") nao++;
    });
    return { total, sim, nao, respondidos: sim + nao };
  };

  const calcularNivelGeral = () => {
    let totalSim = 0;
    let totalNao = 0;
    let totalItens = 0;

    secoes.forEach(secao => {
      secao.checklist.forEach((_, idx) => {
        totalItens++;
        const val = getCheckValue(secao.id, idx);
        if (val === "sim") totalSim++;
        if (val === "nao") totalNao++;
      });
    });

    const respondidos = totalSim + totalNao;
    if (respondidos === 0) return null;

    const percentualSim = (totalSim / respondidos) * 100;

    if (percentualSim >= 85) return { nivel: "A", label: "Excelente", cor: "bg-emerald-500", desc: "Cardápio otimizado e pronto para converter!" };
    if (percentualSim >= 60) return { nivel: "B", label: "Bom, com melhorias", cor: "bg-amber-500", desc: "Bom fundamento, mas há pontos a ajustar." };
    return { nivel: "C", label: "Crítico", cor: "bg-red-500", desc: "Impacta diretamente na conversão. Ação urgente necessária!" };
  };

  const nivelGeral = calcularNivelGeral();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">🍽️ ANÁLISE DE CARDÁPIO</h2>
          <p className="text-white/60">Diagnóstico completo + ações de melhoria</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} className="bg-[#FF4D00] hover:bg-[#E64500]">
            <Save size={16} className="mr-2" />
            Salvar Análise
          </Button>
        )}
      </div>

      {/* Nível Geral */}
      {nivelGeral && (
        <div className={`${nivelGeral.cor}/10 border ${nivelGeral.cor === "bg-emerald-500" ? "border-emerald-500/30" : nivelGeral.cor === "bg-amber-500" ? "border-amber-500/30" : "border-red-500/30"} rounded-2xl p-6`}>
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 ${nivelGeral.cor} rounded-2xl flex items-center justify-center`}>
              <span className="text-4xl font-bold text-white">{nivelGeral.nivel}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Award size={20} className={nivelGeral.cor === "bg-emerald-500" ? "text-emerald-400" : nivelGeral.cor === "bg-amber-500" ? "text-amber-400" : "text-red-400"} />
                <span className="font-bold text-white text-lg">Nível {nivelGeral.nivel} — {nivelGeral.label}</span>
              </div>
              <p className="text-white/70">{nivelGeral.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Seções */}
      <div className="space-y-4">
        {secoes.map((secao) => {
          const Icon = secao.icon;
          const isExpanded = expandedSections[secao.id];
          const progress = getSecaoProgress(secao.id, secao);
          const sugestoesAuto = getSugestoesAuto(secao.id);

          return (
            <div key={secao.id} className={`border ${secao.corBorder} rounded-2xl overflow-hidden`}>
              {/* Header da Seção */}
              <button
                onClick={() => toggleSection(secao.id)}
                className={`w-full ${secao.corBg} p-4 flex items-center justify-between hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${secao.cor} rounded-xl flex items-center justify-center`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white">{secao.titulo}</h3>
                    <p className="text-xs text-white/60">
                      {progress.respondidos}/{progress.total} respondidos • 
                      <span className="text-emerald-400 ml-1">{progress.sim} ✓</span>
                      <span className="text-red-400 ml-1">{progress.nao} ✗</span>
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronDown className="text-white/50" /> : <ChevronRight className="text-white/50" />}
              </button>

              {/* Conteúdo */}
              {isExpanded && (
                <div className="p-4 bg-white/5 space-y-4">
                  {/* Checklist */}
                  <div className="space-y-2">
                    {secao.checklist.map((item, idx) => {
                      const value = getCheckValue(secao.id, idx);
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                            value === "sim" 
                              ? "bg-emerald-500/10 border border-emerald-500/30" 
                              : value === "nao"
                              ? "bg-red-500/10 border border-red-500/30"
                              : "bg-white/5 border border-transparent hover:border-white/10"
                          }`}
                        >
                          <span className="flex-1 text-sm text-white/90">{item}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const key = `${secao.id}_check_${idx}`;
                                const newData = { ...data, [key]: "sim" };
                                setData(newData);
                                setHasChanges(true);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                value === "sim"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-white/10 text-white/50 hover:bg-emerald-500/20 hover:text-emerald-400"
                              }`}
                            >
                              <CheckCheck size={14} className="inline mr-1" />
                              Sim
                            </button>
                            <button
                              onClick={() => {
                                const key = `${secao.id}_check_${idx}`;
                                const newData = { ...data, [key]: "nao" };
                                setData(newData);
                                setHasChanges(true);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                value === "nao"
                                  ? "bg-red-500 text-white"
                                  : "bg-white/10 text-white/50 hover:bg-red-500/20 hover:text-red-400"
                              }`}
                            >
                              <XCircle size={14} className="inline mr-1" />
                              Não
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sugestões Automáticas */}
                  {sugestoesAuto && sugestoesAuto.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-amber-400 mb-3">
                        <Sparkles size={18} />
                        <span className="font-medium">Sugestões de melhoria automáticas</span>
                      </div>
                      <div className="space-y-2">
                        {sugestoesAuto.map((sug, idx) => (
                          <p key={idx} className="text-sm text-white/80">{sug}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Campos de texto */}
                  {secao.campos.filter(c => !c.auto).map((campo) => (
                    <div key={campo.key} className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                        <Lightbulb size={14} className="text-[#FF4D00]" />
                        {campo.label}
                      </label>
                      <Textarea
                        value={getCampoValue(secao.id, campo.key)}
                        onChange={(e) => updateCampo(secao.id, campo.key, e.target.value)}
                        placeholder={`Digite ${campo.label.toLowerCase()}...`}
                        className="bg-white/5 border-white/10 text-white min-h-[80px] resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tabela de Níveis */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Award size={20} className="text-[#FF4D00]" />
          CHECKLIST FINAL — NÍVEL DO CARDÁPIO
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">A</span>
              </div>
              <div>
                <p className="font-bold text-emerald-400">Nível A — Excelente</p>
                <p className="text-xs text-white/50">85%+ de "Sim"</p>
              </div>
            </div>
            <p className="text-sm text-white/70">Cardápio otimizado, pronto para alta conversão. Apenas ajustes finos necessários.</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">B</span>
              </div>
              <div>
                <p className="font-bold text-amber-400">Nível B — Bom, com melhorias</p>
                <p className="text-xs text-white/50">60-84% de "Sim"</p>
              </div>
            </div>
            <p className="text-sm text-white/70">Bom fundamento, mas precisa de ajustes específicos para maximizar resultados.</p>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">C</span>
              </div>
              <div>
                <p className="font-bold text-red-400">Nível C — Crítico</p>
                <p className="text-xs text-white/50">Abaixo de 60%</p>
              </div>
            </div>
            <p className="text-sm text-white/70">Impacta diretamente na conversão. Requer ação urgente e revisão completa.</p>
          </div>
        </div>
      </div>

      {/* Botão Salvar fixo */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button onClick={handleSave} size="lg" className="bg-[#FF4D00] hover:bg-[#E64500] shadow-lg shadow-[#FF4D00]/30">
            <Save size={18} className="mr-2" />
            Salvar Análise
          </Button>
        </div>
      )}
    </div>
  );
}