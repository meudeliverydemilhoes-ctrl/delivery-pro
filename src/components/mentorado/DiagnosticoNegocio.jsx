import React, { useState } from "react";
import { 
  CheckCircle2, Circle, ChevronDown, ChevronRight, 
  Megaphone, Building2, Settings, Package
} from "lucide-react";

const diagnosticoData = {
  marketing: {
    titulo: "MARKETING",
    icon: Megaphone,
    cor: "bg-pink-500",
    corBorder: "border-pink-500/30",
    corBg: "bg-pink-500/10",
    categorias: [
      {
        nome: "ROTINAS DO MARKETING",
        itens: [
          "PLANEJAMENTO ESTRATÉGICO - BRANDING MARCA",
          "PLANEJAMENTO ANUAL - CAMPANHAS SAZONAIS",
          "GESTÃO DAS REDES SOCIAIS - CONTEÚDO",
          "GESTÃO DO TRÁFEGO PAGO",
          "PROSPECÇÃO ATIVA DE PARCERIAS",
          "GERENCIAMENTO DE CRISE",
          "GESTÃO PÓS VENDA"
        ]
      }
    ]
  },
  administrativo: {
    titulo: "ADMINISTRATIVO",
    icon: Building2,
    cor: "bg-blue-500",
    corBorder: "border-blue-500/30",
    corBg: "bg-blue-500/10",
    categorias: [
      {
        nome: "GESTÃO ESTRATÉGICA",
        itens: [
          "DEFINIÇÃO DE VALORES",
          "DEFINIÇÃO DE CENÁRIOS FUTUROS",
          "DEFINIÇÃO DE PROPÓSITO E DIFERENCIAL",
          "ELABORAÇÃO DAS METAS ANUAIS",
          "ELABORAÇÃO DAS METAS TRIMESTRAIS (ROCKS)",
          "QUADRO DE RESPONSABILIDADES",
          "DEFINIÇÃO DO ORÇAMENTO ANUAL"
        ]
      },
      {
        nome: "GESTÃO DE RECURSOS HUMANOS",
        itens: [
          "RECRUTAMENTO E SELEÇÃO",
          "PROCESSO ADMISSIONAL",
          "TREINAMENTO INTRODUTÓRIO",
          "GESTÃO DE DESEMPENHO",
          "GESTÃO DA FOLHA E BENEFÍCIOS",
          "PROCESSO DEMISSIONAL",
          "CASOS RECORRENTES"
        ]
      },
      {
        nome: "GESTÃO FINANCEIRA",
        itens: [
          "ENTRADA DE NOTA DE COMPRA",
          "ENTRADA BOLETO DE PAGAMENTO",
          "CONTAS A PAGAR",
          "CONTAS A RECEBER",
          "GESTÃO DFC (FLUXO DE CAIXA)",
          "CONCILIAÇÃO BANCÁRIA",
          "PAINEL DE CONTROLE SEMANAL",
          "GESTÃO SALDO DE CAIXA",
          "GESTÃO DA DRE"
        ]
      },
      {
        nome: "GESTÃO PATRIMONIAL, TERCEIROS E CONTRATOS",
        itens: [
          "GESTÃO PATRIMONIAL",
          "MANUTENÇÃO PREVENTIVA",
          "MANUTENÇÃO CORRETIVA",
          "GESTÃO DE CONTRATOS",
          "SERVIÇOS CONTÁBEIS",
          "SERVIÇOS JURÍDICOS",
          "GESTÃO DE TI E SISTEMAS"
        ]
      },
      {
        nome: "GESTÃO DO CMV",
        itens: [
          "ESPECIFICAÇÃO DE PRODUTOS",
          "CONSTRUÇÃO DAS FICHAS TÉCNICAS",
          "ORGANIZAÇÃO DO ESTOQUE",
          "CONTAGEM DE ESTOQUE",
          "ROTINAS DE COMPRAS",
          "PROCESSO DE RECEBIMENTO",
          "ESTOCAGEM",
          "COMPUTAÇÃO DO CMV",
          "GESTÃO DO GAP"
        ]
      }
    ]
  },
  operacional: {
    titulo: "OPERACIONAL",
    icon: Settings,
    cor: "bg-emerald-500",
    corBorder: "border-emerald-500/30",
    corBg: "bg-emerald-500/10",
    categorias: [
      {
        nome: "ROTINAS GERENCIAIS DA OPERAÇÃO",
        itens: [
          "GESTÃO DA ESCALA DOS FUNCIONÁRIOS",
          "ROTINAS DE REUNIÕES",
          "ROTINAS DE CONTROLE (AVALIAR)",
          "CONTROLE DE VENDAS",
          "CONTROLE DE ESTOQUE",
          "CONTROLE DE QUALIDADE"
        ]
      },
      {
        nome: "ROTINAS OPERACIONAIS DA COZINHA",
        itens: [
          "RECEITUÁRIO",
          "FICHA TÉCNICA DE PROCESSADOS",
          "PLANILHA DE PRODUÇÃO",
          "MISE EN PLACE DAS PRAÇAS",
          "ROTINAS DE ABERTURA",
          "ROTINAS DE FECHAMENTO"
        ]
      },
      {
        nome: "ROTINAS DE ATENDIMENTO PRESENCIAL",
        itens: [
          "GESTÃO DE RESERVAS",
          "GESTÃO DA LISTA DE ESPERA",
          "ATENDIMENTO NO BALCÃO",
          "ATENDIMENTO NA MESA",
          "PREPARO E CONFERÊNCIA DO PEDIDO",
          "DESPACHO DOS PEDIDOS PARA O GARÇOM",
          "ENTREGA DO PEDIDO NA MESA DO CLIENTE",
          "ROTINAS DE LIMPEZA",
          "FICHA DE FINALIZAÇÃO"
        ]
      },
      {
        nome: "ROTINAS DE DELIVERY",
        itens: [
          "ATENDIMENTO VIA DELIVERY (WHATSAPP)",
          "ATENDIMENTO VIA DELIVERY (SITE PRÓPRIO)",
          "ATENDIMENTO VIA DELIVERY (IFOOD/MARKET PLACE)",
          "PREPARO E CONFERÊNCIA DO PEDIDO",
          "DESPACHO DOS PEDIDOS PARA O MOTOBOY",
          "ENTREGA DO PEDIDO NA RESIDÊNCIA DO CLIENTE",
          "GESTÃO DE CRISES"
        ]
      }
    ]
  },
  produto: {
    titulo: "PRODUTO/SERVIÇO",
    icon: Package,
    cor: "bg-amber-500",
    corBorder: "border-amber-500/30",
    corBg: "bg-amber-500/10",
    categorias: [
      {
        nome: "GESTÃO DOS PRODUTOS",
        itens: [
          "ANÁLISE DO MIX DE PRODUTOS",
          "ROTINA DE PRECIFICAÇÃO",
          "MATRIZ BCG (POPULARIDADE X MARGENS)",
          "PROCESSO DE INTRODUÇÃO DE ITENS NO CARDÁPIO",
          "GESTÃO DO CARDÁPIO",
          "PRODUTOS NOVOS"
        ]
      }
    ]
  }
};

export default function DiagnosticoNegocio({ diagnosticoStatus = {}, onUpdateStatus }) {
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (areaKey, catIdx) => {
    const key = `${areaKey}_${catIdx}`;
    setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleItem = (areaKey, catIdx, itemIdx) => {
    const key = `${areaKey}_${catIdx}_${itemIdx}`;
    const newStatus = { ...diagnosticoStatus, [key]: !diagnosticoStatus[key] };
    onUpdateStatus?.(newStatus);
  };

  const getAreaProgress = (areaKey, area) => {
    let total = 0;
    let completed = 0;
    area.categorias.forEach((cat, catIdx) => {
      cat.itens.forEach((_, itemIdx) => {
        total++;
        if (diagnosticoStatus[`${areaKey}_${catIdx}_${itemIdx}`]) {
          completed++;
        }
      });
    });
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getCategoryProgress = (areaKey, catIdx, cat) => {
    let completed = 0;
    cat.itens.forEach((_, itemIdx) => {
      if (diagnosticoStatus[`${areaKey}_${catIdx}_${itemIdx}`]) {
        completed++;
      }
    });
    return { completed, total: cat.itens.length };
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">📊 DIAGNÓSTICO DO SEU NEGÓCIO</h2>
        <p className="text-white/60">Avalie cada área do seu negócio e identifique pontos de melhoria</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {Object.entries(diagnosticoData).map(([areaKey, area]) => {
          const Icon = area.icon;
          const progress = getAreaProgress(areaKey, area);

          return (
            <div 
              key={areaKey} 
              className={`border ${area.corBorder} rounded-2xl overflow-hidden`}
            >
              {/* Header da Área */}
              <div className={`${area.corBg} p-4 border-b ${area.corBorder}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${area.cor} rounded-xl flex items-center justify-center`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{area.titulo}</h3>
                      <p className="text-xs text-white/60">{area.categorias.length} categorias</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{progress.percent}%</p>
                    <p className="text-xs text-white/50">{progress.completed}/{progress.total}</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${area.cor} transition-all duration-300`}
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>

              {/* Categorias */}
              <div className="p-4 space-y-3 bg-white/5">
                {area.categorias.map((cat, catIdx) => {
                  const isExpanded = expandedCategories[`${areaKey}_${catIdx}`];
                  const catProgress = getCategoryProgress(areaKey, catIdx, cat);

                  return (
                    <div key={catIdx} className="bg-white/5 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleCategory(areaKey, catIdx)}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown size={16} className="text-white/50" />
                          ) : (
                            <ChevronRight size={16} className="text-white/50" />
                          )}
                          <span className="text-sm font-medium text-white">{cat.nome}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          catProgress.completed === catProgress.total 
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/10 text-white/60"
                        }`}>
                          {catProgress.completed}/{catProgress.total}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-1">
                          {cat.itens.map((item, itemIdx) => {
                            const isChecked = diagnosticoStatus[`${areaKey}_${catIdx}_${itemIdx}`];
                            return (
                              <div
                                key={itemIdx}
                                onClick={() => toggleItem(areaKey, catIdx, itemIdx)}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                  isChecked 
                                    ? "bg-emerald-500/10 border border-emerald-500/30" 
                                    : "hover:bg-white/5 border border-transparent"
                                }`}
                              >
                                {isChecked ? (
                                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                                ) : (
                                  <Circle size={16} className="text-white/30 flex-shrink-0" />
                                )}
                                <span className={`text-xs ${isChecked ? "text-white/50 line-through" : "text-white/80"}`}>
                                  {item}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo Geral */}
      <div className="bg-gradient-to-r from-[#FF4D00]/10 to-transparent border border-[#FF4D00]/20 rounded-2xl p-6">
        <h4 className="font-semibold text-white mb-4">📈 Resumo do Diagnóstico</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(diagnosticoData).map(([areaKey, area]) => {
            const progress = getAreaProgress(areaKey, area);
            return (
              <div key={areaKey} className="text-center">
                <div className={`w-16 h-16 ${area.cor} rounded-2xl flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-2xl font-bold text-white">{progress.percent}%</span>
                </div>
                <p className="text-xs text-white/60">{area.titulo}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}