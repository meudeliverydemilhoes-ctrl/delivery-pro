import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Headphones, ChefHat, Pizza, Package, Truck, Warehouse,
  ShoppingCart, DollarSign, Settings, Save, RotateCcw, 
  ChevronDown, ChevronRight
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
      { titulo: "EU ME PREPARO", itens: ["Colocar uniforme", "Lavar as mãos", "Verificar aparência pessoal"] },
      { titulo: "ABERTURA", itens: ["Abrir sistemas (PDV, WhatsApp, iFood)", "Conferir cardápio ativo e horários", "Verificar promoções do dia"] },
      { titulo: "ATENDIMENTO", itens: ["Seguir padrão de atendimento", "Confirmar endereço completo", "Confirmar forma de pagamento", "Oferecer adicionais"] },
      { titulo: "REGISTRO", itens: ["Registrar pedidos corretamente", "Estimar tempo de preparo", "Informar tempo ao cliente"] },
      { titulo: "ENCAMINHAMENTO", itens: ["Enviar para produção", "Imprimir comanda", "Confirmar recebimento"] },
      { titulo: "PÓS-VENDA", itens: ["Resolver dúvidas do cliente", "Registrar feedback", "Encaminhar reclamações"] }
    ]
  },
  {
    id: "cozinha",
    titulo: "SETOR 2 – COZINHA / PRODUÇÃO",
    icon: ChefHat,
    cor: "#10B981",
    colunasDefault: [
      { titulo: "EU ME PREPARO", itens: ["Colocar uniforme limpo", "Colocar touca/rede", "Lavar e higienizar as mãos"] },
      { titulo: "PRÉ-PREPARO", itens: ["Organizar espaço de trabalho", "Separar insumos do dia", "Pesagem conforme ficha técnica"] },
      { titulo: "PRODUÇÃO", itens: ["Preparação de massas", "Preparação de molhos", "Preparação de proteínas", "Controlar temperatura"] },
      { titulo: "CONSERVAÇÃO", itens: ["Armazenamento em potes datados", "Controle de temperatura", "Rotação de estoque (FEFO)"] },
      { titulo: "LIMPEZA", itens: ["Limpeza contínua da cozinha", "Higienização de utensílios", "Checklist de fechamento"] }
    ]
  },
  {
    id: "montagem",
    titulo: "SETOR 3 – MONTAGEM",
    icon: Pizza,
    cor: "#F59E0B",
    colunasDefault: [
      { titulo: "EU ME PREPARO", itens: ["Colocar uniforme", "Colocar touca/rede", "Lavar e higienizar as mãos"] },
      { titulo: "RECEBIMENTO", itens: ["Receber comanda", "Verificar tamanho solicitado", "Verificar sabores", "Conferir observações"] },
      { titulo: "MONTAGEM", itens: ["Pesagem da massa conforme tabela", "Divisão de sabores", "Aplicar ingredientes conforme ficha", "Respeitar gramaturas"] },
      { titulo: "CONFERÊNCIA", itens: ["Conferir sabores montados", "Verificar apresentação visual", "Validar montagem com comanda"] },
      { titulo: "FINALIZAÇÃO", itens: ["Passar pizza para o forno", "Acompanhar tempo de forno", "Entregar para expedição"] }
    ]
  },
  {
    id: "expedicao",
    titulo: "SETOR 4 – EXPEDIÇÃO",
    icon: Package,
    cor: "#8B5CF6",
    colunasDefault: [
      { titulo: "ORGANIZAÇÃO", itens: ["Organizar área de expedição", "Separar embalagens por tipo", "Verificar estoque de materiais"] },
      { titulo: "CONFERÊNCIA", itens: ["Conferir pedido completo", "Separar adicionais", "Incluir bebidas", "Adicionar talheres"] },
      { titulo: "AGRUPAMENTO", itens: ["Conferência de pagamento", "Organizar por rotas", "Priorizar pedidos antigos"] },
      { titulo: "LIBERAÇÃO", itens: ["Entregar pedidos aos motoboys", "Registrar saída no sistema", "Verificar devoluções/trocas"] }
    ]
  },
  {
    id: "entregadores",
    titulo: "SETOR 5 – ENTREGADORES",
    icon: Truck,
    cor: "#EC4899",
    colunasDefault: [
      { titulo: "CHEGADA", itens: ["Registrar presença", "Verificar moto/equipamento", "Conferir bag térmica"] },
      { titulo: "RETIRADA", itens: ["Conferir endereço do pedido", "Verificar forma de pagamento", "Verificar integridade da embalagem"] },
      { titulo: "ENTREGA", itens: ["Fazer entrega seguindo rota rápida", "Respeitar leis de trânsito", "Entregar com cordialidade"] },
      { titulo: "RETORNO", itens: ["Retornar para a loja", "Registrar entrega no sistema", "Entregar valores recebidos", "Reportar problemas"] }
    ]
  },
  {
    id: "estoque",
    titulo: "SETOR 6 – ESTOQUE / ALMOXARIFADO",
    icon: Warehouse,
    cor: "#06B6D4",
    colunasDefault: [
      { titulo: "RECEBIMENTO", itens: ["Acompanhar fornecedor", "Verificar nota fiscal", "Conferir data de validade"] },
      { titulo: "CONFERÊNCIA", itens: ["Pesar mercadoria", "Contar mercadoria", "Comparar com pedido", "Liberar fornecedor"] },
      { titulo: "ARMAZENAMENTO", itens: ["Guardar no estoque (FEFO)", "Organizar por categoria", "Identificar com data"] },
      { titulo: "CONTROLE", itens: ["Controlar validade", "Atualizar sistema", "Reportar rupturas"] }
    ]
  },
  {
    id: "compras",
    titulo: "SETOR 7 – COMPRAS",
    icon: ShoppingCart,
    cor: "#14B8A6",
    colunasDefault: [
      { titulo: "ANÁLISE", itens: ["Conferir estoque mínimo", "Verificar consumo semanal", "Identificar necessidades"] },
      { titulo: "COTAÇÃO", itens: ["Cotar com fornecedores", "Comparar preços", "Avaliar prazo de entrega"] },
      { titulo: "PEDIDO", itens: ["Gerar pedido de compra", "Confirmar com fornecedor", "Registrar no sistema"] },
      { titulo: "RECEBIMENTO", itens: ["Acompanhar entrega", "Conferir mercadoria", "Liberar pagamento"] },
      { titulo: "AJUSTES", itens: ["Ajustar quantidades futuras", "Enviar relatórios"] }
    ]
  },
  {
    id: "financeiro",
    titulo: "SETOR 8 – FINANCEIRO",
    icon: DollarSign,
    cor: "#22C55E",
    colunasDefault: [
      { titulo: "ABERTURA", itens: ["Abrir caixa", "Conferir troco inicial", "Verificar sistemas"] },
      { titulo: "REGISTRO", itens: ["Conferir recebimentos", "Registrar vendas", "Conciliar pagamentos online"] },
      { titulo: "PAGAMENTOS", itens: ["Registrar despesas", "Pagar fornecedores", "Organizar comprovantes"] },
      { titulo: "FECHAMENTO", itens: ["Fechar caixa", "Conferir valores", "Gerar relatórios diários"] }
    ]
  },
  {
    id: "gestao",
    titulo: "SETOR 9 – GESTÃO / OPERACIONAL",
    icon: Settings,
    cor: "#F97316",
    colunasDefault: [
      { titulo: "PLANEJAMENTO", itens: ["Reunião inicial", "Definir metas do dia", "Analisar indicadores"] },
      { titulo: "EXECUÇÃO", itens: ["Distribuição de tarefas", "Acompanhar abertura", "Apoiar setores"] },
      { titulo: "ACOMPANHAMENTO", itens: ["Auditoria dos setores", "Monitoramento de indicadores", "Treinamentos"] },
      { titulo: "FECHAMENTO", itens: ["Fechamento da operação", "Registrar ocorrências", "Relatório final"] }
    ]
  }
];

export default function FluxogramasMentorado({ mentoradoId }) {
  const queryClient = useQueryClient();
  const [expandedSetores, setExpandedSetores] = useState({ atendimento: true });
  const [fluxogramasData, setFluxogramasData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  useEffect(() => {
    if (briefing?.fluxogramas_data) {
      setFluxogramasData(briefing.fluxogramas_data);
    } else {
      const defaultData = {};
      setoresConfig.forEach(setor => {
        defaultData[setor.id] = setor.colunasDefault;
      });
      setFluxogramasData(defaultData);
    }
  }, [briefing]);

  const updateBriefingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Briefing.update(id, data),
    onSuccess: (updatedBriefing) => {
      queryClient.setQueryData(["briefing", mentoradoId], (old) => [updatedBriefing]);
      setHasChanges(false);
    }
  });

  const createBriefingMutation = useMutation({
    mutationFn: (data) => base44.entities.Briefing.create(data),
    onSuccess: (newBriefing) => {
      queryClient.setQueryData(["briefing", mentoradoId], (old) => [newBriefing]);
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
    if (briefing?.id) {
      updateBriefingMutation.mutate({ 
        id: briefing.id, 
        data: { ...briefing, fluxogramas_data: fluxogramasData }
      });
    } else {
      createBriefingMutation.mutate({ 
        mentorado_id: mentoradoId, 
        fluxogramas_data: fluxogramasData 
      });
    }
  };

  const handleReset = (setorId) => {
    const setor = setoresConfig.find(s => s.id === setorId);
    if (setor) {
      setFluxogramasData(prev => ({ ...prev, [setorId]: setor.colunasDefault }));
      setHasChanges(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">📊 Fluxogramas Operacionais</h2>
          <p className="text-sm text-white/50">Processos padronizados personalizados para este mentorado</p>
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

      {/* Setores */}
      <div className="space-y-3">
        {setoresConfig.map((setor) => {
          const Icon = setor.icon;
          const isExpanded = expandedSetores[setor.id];
          const colunas = fluxogramasData[setor.id] || setor.colunasDefault;

          return (
            <div 
              key={setor.id} 
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleSetor(setor.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${setor.cor}20` }}
                  >
                    <Icon size={20} style={{ color: setor.cor }} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-white text-sm">{setor.titulo}</h3>
                    <p className="text-xs text-white/40">{colunas.length} colunas • {colunas.reduce((acc, c) => acc + c.itens.length, 0)} etapas</p>
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
                      className="border-white/10 text-white/60 hover:text-white text-xs h-7"
                    >
                      <RotateCcw size={12} className="mr-1" />
                      Resetar
                    </Button>
                  )}
                  {isExpanded ? <ChevronDown size={18} className="text-white/50" /> : <ChevronRight size={18} className="text-white/50" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-3 pt-0 border-t border-white/10">
                  <div className="bg-black/20 rounded-lg p-3 mt-3">
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

      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleSave} 
            disabled={updateBriefingMutation.isPending || createBriefingMutation.isPending}
            size="lg" 
            className="bg-[#FF4D00] hover:bg-[#E64500] shadow-lg shadow-[#FF4D00]/30"
          >
            <Save size={18} className="mr-2" />
            Salvar
          </Button>
        </div>
      )}
    </div>
  );
}