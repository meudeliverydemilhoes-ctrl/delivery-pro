import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Headphones, ChefHat, Pizza, Package, Truck, Warehouse,
  ShoppingCart, DollarSign, Settings, Save, RotateCcw, 
  ChevronDown, ChevronRight, Download, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FluxogramaSetor from "@/components/fluxogramas/FluxogramaSetor";

const setoresConfig = [
  {
    id: "atendimento",
    titulo: "SETOR 1 – ATENDIMENTO / FRENTE DE LOJA",
    icon: Headphones,
    cor: "#3B82F6",
    colunasDefault: [
      {
        titulo: "EU ME PREPARO",
        itens: ["Colocar uniforme", "Lavar as mãos", "Verificar aparência pessoal"]
      },
      {
        titulo: "ABERTURA",
        itens: [
          "Abrir sistemas (PDV, WhatsApp, iFood, InstaDelivery)",
          "Conferir cardápio ativo e horários",
          "Verificar promoções do dia",
          "Testar equipamentos"
        ]
      },
      {
        titulo: "ATENDIMENTO",
        itens: [
          "Seguir padrão de atendimento",
          "Cumprimentar cliente cordialmente",
          "Confirmar endereço completo",
          "Confirmar forma de pagamento",
          "Oferecer adicionais e combos"
        ]
      },
      {
        titulo: "REGISTRO",
        itens: [
          "Registrar pedidos corretamente",
          "Estimar tempo de preparo",
          "Informar tempo ao cliente",
          "Confirmar dados do pedido"
        ]
      },
      {
        titulo: "ENCAMINHAMENTO",
        itens: [
          "Enviar para produção",
          "Imprimir comanda",
          "Confirmar recebimento da cozinha"
        ]
      },
      {
        titulo: "PÓS-VENDA",
        itens: [
          "Resolver dúvidas do cliente",
          "Realizar pós-venda quando necessário",
          "Registrar feedback",
          "Encaminhar reclamações"
        ]
      }
    ]
  },
  {
    id: "cozinha",
    titulo: "SETOR 2 – COZINHA / PRODUÇÃO",
    icon: ChefHat,
    cor: "#10B981",
    colunasDefault: [
      {
        titulo: "EU ME PREPARO",
        itens: [
          "Colocar uniforme limpo",
          "Colocar touca/rede",
          "Lavar e higienizar as mãos",
          "Verificar EPIs"
        ]
      },
      {
        titulo: "PRÉ-PREPARO",
        itens: [
          "Organizar espaço de trabalho",
          "Separar insumos do dia",
          "Verificar validade dos produtos",
          "Pesagem conforme ficha técnica",
          "Higienizar vegetais"
        ]
      },
      {
        titulo: "PRODUÇÃO",
        itens: [
          "Preparação de massas",
          "Preparação de molhos",
          "Preparação de proteínas",
          "Seguir fichas técnicas",
          "Controlar temperatura"
        ]
      },
      {
        titulo: "CONSERVAÇÃO",
        itens: [
          "Armazenamento em potes datados",
          "Controle de temperatura",
          "Rotação de estoque (FEFO)",
          "Identificação de produtos"
        ]
      },
      {
        titulo: "LIMPEZA",
        itens: [
          "Limpeza contínua da cozinha",
          "Higienização de utensílios",
          "Descarte correto de resíduos",
          "Checklist de fechamento"
        ]
      }
    ]
  },
  {
    id: "montagem",
    titulo: "SETOR 3 – MONTAGEM",
    icon: Pizza,
    cor: "#F59E0B",
    colunasDefault: [
      {
        titulo: "EU ME PREPARO",
        itens: [
          "Colocar uniforme",
          "Colocar touca/rede",
          "Lavar e higienizar as mãos",
          "Organizar praça de trabalho"
        ]
      },
      {
        titulo: "RECEBIMENTO",
        itens: [
          "Receber comanda",
          "Verificar tamanho solicitado",
          "Verificar sabores",
          "Verificar se é doce ou salgada",
          "Conferir observações especiais"
        ]
      },
      {
        titulo: "MONTAGEM",
        itens: [
          "Pesagem da massa conforme tabela",
          "Abrir massa no tamanho correto",
          "Divisão de sabores",
          "Aplicar ingredientes conforme ficha",
          "Respeitar gramaturas",
          "Distribuir ingredientes uniformemente"
        ]
      },
      {
        titulo: "CONFERÊNCIA",
        itens: [
          "Conferir sabores montados",
          "Conferir quantidade de ingredientes",
          "Verificar apresentação visual",
          "Validar montagem com comanda"
        ]
      },
      {
        titulo: "FINALIZAÇÃO",
        itens: [
          "Passar pizza para o forno",
          "Acompanhar tempo de forno",
          "Entregar comanda para expedição",
          "Registrar saída"
        ]
      }
    ]
  },
  {
    id: "expedicao",
    titulo: "SETOR 4 – EXPEDIÇÃO",
    icon: Package,
    cor: "#8B5CF6",
    colunasDefault: [
      {
        titulo: "ORGANIZAÇÃO",
        itens: [
          "Organizar área de expedição",
          "Separar embalagens por tipo",
          "Verificar estoque de materiais",
          "Preparar sacolas e caixas"
        ]
      },
      {
        titulo: "CONFERÊNCIA",
        itens: [
          "Conferir pedido completo",
          "Verificar todos os itens",
          "Separar adicionais",
          "Incluir bebidas",
          "Adicionar talheres e guardanapos"
        ]
      },
      {
        titulo: "AGRUPAMENTO",
        itens: [
          "Conferência de pagamento",
          "Organizar por rotas",
          "Agrupar pedidos do mesmo bairro",
          "Priorizar pedidos antigos"
        ]
      },
      {
        titulo: "LIBERAÇÃO",
        itens: [
          "Entregar pedidos aos motoboys",
          "Registrar saída no sistema",
          "Informar endereço e observações",
          "Verificar devoluções/trocas"
        ]
      }
    ]
  },
  {
    id: "entregadores",
    titulo: "SETOR 5 – ENTREGADORES",
    icon: Truck,
    cor: "#EC4899",
    colunasDefault: [
      {
        titulo: "CHEGADA",
        itens: [
          "Registrar presença",
          "Verificar moto/equipamento",
          "Conferir bag térmica",
          "Verificar combustível"
        ]
      },
      {
        titulo: "RETIRADA",
        itens: [
          "Conferir endereço do pedido",
          "Verificar forma de pagamento",
          "Conferir valor se for dinheiro",
          "Verificar integridade da embalagem",
          "Acomodar na bag corretamente"
        ]
      },
      {
        titulo: "ENTREGA",
        itens: [
          "Fazer entrega seguindo rota rápida",
          "Usar GPS/Waze",
          "Respeitar leis de trânsito",
          "Entregar com cordialidade",
          "Cobrar corretamente"
        ]
      },
      {
        titulo: "RETORNO",
        itens: [
          "Retornar para a loja",
          "Registrar entrega no sistema",
          "Entregar valores recebidos",
          "Reportar problemas",
          "Aguardar próximo pedido"
        ]
      }
    ]
  },
  {
    id: "estoque",
    titulo: "SETOR 6 – ESTOQUE / ALMOXARIFADO",
    icon: Warehouse,
    cor: "#06B6D4",
    colunasDefault: [
      {
        titulo: "RECEBIMENTO",
        itens: [
          "Acompanhar fornecedor",
          "Verificar nota fiscal",
          "Conferir data de validade",
          "Verificar temperatura (se necessário)"
        ]
      },
      {
        titulo: "CONFERÊNCIA",
        itens: [
          "Pesar mercadoria",
          "Contar mercadoria",
          "Conferir especificações",
          "Comparar com pedido",
          "Liberar fornecedor"
        ]
      },
      {
        titulo: "ARMAZENAMENTO",
        itens: [
          "Guardar no estoque (FEFO)",
          "Organizar por categoria",
          "Identificar com data",
          "Respeitar temperatura"
        ]
      },
      {
        titulo: "CONTROLE",
        itens: [
          "Controlar validade",
          "Atualizar sistema",
          "Reportar rupturas",
          "Fazer inventário periódico",
          "Gerar relatórios"
        ]
      }
    ]
  },
  {
    id: "compras",
    titulo: "SETOR 7 – COMPRAS",
    icon: ShoppingCart,
    cor: "#14B8A6",
    colunasDefault: [
      {
        titulo: "ANÁLISE",
        itens: [
          "Conferir estoque mínimo",
          "Verificar consumo semanal",
          "Analisar histórico de vendas",
          "Identificar necessidades"
        ]
      },
      {
        titulo: "COTAÇÃO",
        itens: [
          "Cotar com fornecedores",
          "Comparar preços",
          "Verificar condições de pagamento",
          "Avaliar prazo de entrega"
        ]
      },
      {
        titulo: "PEDIDO",
        itens: [
          "Gerar pedido de compra",
          "Confirmar com fornecedor",
          "Registrar no sistema",
          "Definir data de entrega"
        ]
      },
      {
        titulo: "RECEBIMENTO",
        itens: [
          "Acompanhar entrega",
          "Conferir mercadoria",
          "Validar nota fiscal",
          "Liberar pagamento"
        ]
      },
      {
        titulo: "AJUSTES",
        itens: [
          "Ajustar quantidades futuras",
          "Registrar divergências",
          "Enviar relatórios",
          "Atualizar cadastro de fornecedores"
        ]
      }
    ]
  },
  {
    id: "financeiro",
    titulo: "SETOR 8 – FINANCEIRO",
    icon: DollarSign,
    cor: "#22C55E",
    colunasDefault: [
      {
        titulo: "ABERTURA",
        itens: [
          "Abrir caixa",
          "Conferir troco inicial",
          "Verificar sistemas",
          "Conferir pendências do dia anterior"
        ]
      },
      {
        titulo: "REGISTRO",
        itens: [
          "Conferir recebimentos",
          "Registrar vendas",
          "Lançar entradas",
          "Conciliar pagamentos online"
        ]
      },
      {
        titulo: "PAGAMENTOS",
        itens: [
          "Registrar despesas",
          "Pagar fornecedores",
          "Controlar vencimentos",
          "Organizar comprovantes"
        ]
      },
      {
        titulo: "FECHAMENTO",
        itens: [
          "Fechar caixa",
          "Conferir valores",
          "Gerar relatórios diários",
          "Gerar relatórios semanais",
          "Depositar valores"
        ]
      }
    ]
  },
  {
    id: "gestao",
    titulo: "SETOR 9 – GESTÃO / OPERACIONAL",
    icon: Settings,
    cor: "#F97316",
    colunasDefault: [
      {
        titulo: "PLANEJAMENTO",
        itens: [
          "Reunião inicial",
          "Definir metas do dia",
          "Verificar agenda",
          "Analisar indicadores"
        ]
      },
      {
        titulo: "EXECUÇÃO",
        itens: [
          "Distribuição de tarefas",
          "Acompanhar abertura",
          "Resolver pendências",
          "Apoiar setores"
        ]
      },
      {
        titulo: "ACOMPANHAMENTO",
        itens: [
          "Auditoria dos setores",
          "Monitoramento de indicadores",
          "Treinamentos",
          "Feedback para equipe"
        ]
      },
      {
        titulo: "FECHAMENTO",
        itens: [
          "Fechamento da operação",
          "Conferir checklists",
          "Registrar ocorrências",
          "Relatório final",
          "Planejar próximo dia"
        ]
      }
    ]
  }
];

export default function FluxogramasOperacionais() {
  const queryClient = useQueryClient();
  const [expandedSetores, setExpandedSetores] = useState({ atendimento: true });
  const [fluxogramasData, setFluxogramasData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Buscar dados salvos
  const { data: savedData } = useQuery({
    queryKey: ["fluxogramas_operacionais"],
    queryFn: async () => {
      const result = await base44.entities.SOPPlaybook.filter({ 
        titulo: "FLUXOGRAMAS_OPERACIONAIS_DATA" 
      });
      return result[0]?.conteudo ? JSON.parse(result[0].conteudo) : null;
    }
  });

  useEffect(() => {
    if (savedData) {
      setFluxogramasData(savedData);
    } else {
      // Inicializar com dados default
      const defaultData = {};
      setoresConfig.forEach(setor => {
        defaultData[setor.id] = setor.colunasDefault;
      });
      setFluxogramasData(defaultData);
    }
  }, [savedData]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const existing = await base44.entities.SOPPlaybook.filter({ 
        titulo: "FLUXOGRAMAS_OPERACIONAIS_DATA" 
      });
      if (existing[0]) {
        return base44.entities.SOPPlaybook.update(existing[0].id, {
          conteudo: JSON.stringify(data)
        });
      } else {
        return base44.entities.SOPPlaybook.create({
          titulo: "FLUXOGRAMAS_OPERACIONAIS_DATA",
          pilar: "processos",
          conteudo: JSON.stringify(data)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fluxogramas_operacionais"] });
      setHasChanges(false);
    }
  });

  const toggleSetor = (setorId) => {
    setExpandedSetores(prev => ({ ...prev, [setorId]: !prev[setorId] }));
  };

  const handleUpdateColunas = (setorId, newColunas) => {
    setFluxogramasData(prev => ({ ...prev, [setorId]: newColunas }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(fluxogramasData);
  };

  const handleReset = (setorId) => {
    const setor = setoresConfig.find(s => s.id === setorId);
    if (setor) {
      setFluxogramasData(prev => ({ ...prev, [setorId]: setor.colunasDefault }));
      setHasChanges(true);
    }
  };

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">📊 Fluxogramas Operacionais</h1>
          <p className="text-white/50">Processos padronizados de todos os setores do delivery</p>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending}
              className="bg-[#FF4D00] hover:bg-[#E64500]"
            >
              <Save size={16} className="mr-2" />
              {saveMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          )}
        </div>
      </div>

      {/* Setores */}
      <div className="space-y-4">
        {setoresConfig.map((setor) => {
          const Icon = setor.icon;
          const isExpanded = expandedSetores[setor.id];
          const colunas = fluxogramasData[setor.id] || setor.colunasDefault;

          return (
            <div 
              key={setor.id} 
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              {/* Header do Setor */}
              <button
                onClick={() => toggleSetor(setor.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${setor.cor}20` }}
                  >
                    <Icon size={24} style={{ color: setor.cor }} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white">{setor.titulo}</h3>
                    <p className="text-xs text-white/50">{colunas.length} colunas • {colunas.reduce((acc, c) => acc + c.itens.length, 0)} etapas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isExpanded && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset(setor.id);
                      }}
                      className="border-white/10 text-white/60 hover:text-white text-xs"
                    >
                      <RotateCcw size={12} className="mr-1" />
                      Resetar
                    </Button>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="text-white/50" />
                  ) : (
                    <ChevronRight className="text-white/50" />
                  )}
                </div>
              </button>

              {/* Conteúdo do Fluxograma */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-white/10">
                  <div className="bg-black/20 rounded-xl p-4 mt-4">
                    <FluxogramaSetor
                      setor={setor}
                      colunas={colunas}
                      onUpdateColunas={(newColunas) => handleUpdateColunas(setor.id, newColunas)}
                      corPrimaria={setor.cor}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botão Salvar Fixo */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleSave} 
            disabled={saveMutation.isPending}
            size="lg" 
            className="bg-[#FF4D00] hover:bg-[#E64500] shadow-lg shadow-[#FF4D00]/30"
          >
            <Save size={18} className="mr-2" />
            {saveMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      )}
    </div>
  );
}