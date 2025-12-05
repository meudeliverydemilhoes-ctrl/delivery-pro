import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home, ChevronDown, ChevronRight, CheckCircle2, Circle,
  FileText, CreditCard, Calendar, Wallet, ArrowDownCircle,
  ArrowUpCircle, BarChart3, Building2, PiggyBank, Receipt,
  AlertTriangle, CheckSquare, Package, ClipboardList, Warehouse,
  Calculator, ShoppingCart, Truck, BoxSelect, TrendingDown,
  Users, UserPlus, GraduationCap, Target, BadgeCheck, DollarSign,
  UserMinus, Heart, Compass, Flag, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const processosFinanceiros = [
  {
    id: "1.1",
    titulo: "ENTRADA DE NOTA DE COMPRA",
    icon: FileText,
    cor: "bg-blue-500",
    blocos: [
      {
        titulo: "BLOCO 1 — RECEBIMENTO E ORGANIZAÇÃO DA NOTA",
        etapas: [
          {
            numero: 1,
            titulo: "Receber a nota fiscal (NF)",
            itens: [
              "Conferir se veio em formato PDF ou XML",
              "Validar se a NF corresponde ao pedido realizado"
            ]
          },
          {
            numero: 2,
            titulo: "Nomear e armazenar corretamente o arquivo",
            itens: [
              "Padrão: ANO_MÊS_DIA – Fornecedor – Número da NF",
              "Salvar na pasta: Financeiro > Notas de Compra"
            ]
          },
          {
            numero: 3,
            titulo: "Verificar informações essenciais na NF",
            itens: [
              "CNPJ do fornecedor",
              "Descrição dos itens",
              "Quantidade",
              "Unidade de medida",
              "Número da NF",
              "Data de emissão",
              "CFOP / natureza da operação"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — CONFERÊNCIA DA COMPRA COM O ESTOQUE E SETORES",
        etapas: [
          {
            numero: 4,
            titulo: "Comparar a NF com o pedido realizado",
            itens: [
              "Conferir se todos os itens entregues estão presentes",
              "Verificar divergências de unidade (ex: KG x UN)",
              "Validar se a quantidade corresponde ao pedido"
            ]
          },
          {
            numero: 5,
            titulo: "Validar os itens com o setor responsável (Cozinha / Estoque)",
            itens: [
              "O setor deve confirmar se recebeu todos os itens",
              "Verificar se a qualidade está adequada",
              "Confirmar se não houve substituições indevidas"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — LANÇAMENTO NO SISTEMA / PLANILHA",
        etapas: [
          {
            numero: 6,
            titulo: "Abrir o sistema financeiro ou planilha oficial",
            itens: [
              "Ex.: Sistema interno, ERP, Base44 ou planilha padrão"
            ]
          },
          {
            numero: 7,
            titulo: "Preencher os dados da NF no sistema",
            itens: [
              "Fornecedor",
              "Número da nota",
              "Data da emissão",
              "Data do lançamento",
              "Categoria: Compra de Insumos / Mercadorias"
            ]
          },
          {
            numero: 8,
            titulo: "Inserir cada item da nota fiscal",
            itens: [
              "Descrição completa",
              "Quantidade",
              "Unidade",
              "Código interno (se houver)",
              "Alocar item ao setor correto (Cozinha, Estoque, Bebidas etc.)"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — VALIDAÇÕES FINAIS",
        etapas: [
          {
            numero: 9,
            titulo: "Validar se o lançamento está correto",
            checklist: [
              "Todos os itens foram lançados?",
              "Quantidades iguais à NF?",
              "Unidade de medida correta?",
              "Fornecedor correto?",
              "Data correta?"
            ]
          },
          {
            numero: 10,
            titulo: "A nota fiscal está correta?",
            decisao: {
              seNao: [
                "Corrigir divergências",
                "Retornar ao fornecedor se necessário",
                "Solicitar carta de correção ou nota complementar"
              ],
              seSim: [
                "Avançar para o fechamento do lançamento"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO DO PROCESSO",
        etapas: [
          {
            numero: 11,
            titulo: "Anexar a NF no sistema",
            itens: [
              "Upload da NF PDF/XML no cadastro da compra"
            ]
          },
          {
            numero: 12,
            titulo: "Enviar para o financeiro realizar o fluxo de pagamento",
            itens: [
              "A NF agora segue para o processo 'Entrada de Boleto de Pagamento'",
              "O responsável confirma visualmente a conclusão"
            ]
          },
          {
            numero: 13,
            titulo: "Registrar comprovante de conferência",
            itens: [
              "Check final do financeiro",
              "A NF entra na fila de contas a pagar"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "1.2",
    titulo: "ENTRADA DE BOLETO DE PAGAMENTO",
    icon: Receipt,
    cor: "bg-emerald-500",
    blocos: [
      {
        titulo: "BLOCO 1 — RECEBIMENTO DO BOLETO",
        etapas: [
          {
            numero: 1,
            titulo: "Receber o boleto enviado pelo fornecedor",
            itens: [
              "Via e-mail",
              "Via WhatsApp",
              "Via sistema do fornecedor"
            ]
          },
          {
            numero: 2,
            titulo: "Verificar informações do boleto",
            itens: [
              "Nome do cedente (fornecedor)",
              "CNPJ do cedente",
              "Data de vencimento",
              "Linha digitável",
              "Código de barras legível"
            ]
          },
          {
            numero: 3,
            titulo: "Nomear e salvar o arquivo",
            itens: [
              "Padrão: ANO_MÊS_DIA – Fornecedor – Vencimento – Nº NF",
              "Salvar na pasta: Financeiro > Boletos"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — VINCULAÇÃO COM A NOTA FISCAL",
        etapas: [
          {
            numero: 4,
            titulo: "Localizar a NF correspondente no sistema",
            itens: [
              "Buscar pelo número da nota",
              "Buscar pelo fornecedor",
              "Buscar pela data de emissão"
            ]
          },
          {
            numero: 5,
            titulo: "Vincular o boleto à NF",
            itens: [
              "Anexar boleto no registro da NF",
              "Confirmar valor do boleto x valor da NF"
            ]
          },
          {
            numero: 6,
            titulo: "O valor do boleto confere com a NF?",
            decisao: {
              seNao: [
                "Verificar se há juros, multas ou diferenças",
                "Solicitar esclarecimento ao fornecedor",
                "Registrar justificativa no sistema"
              ],
              seSim: [
                "Avançar para o lançamento"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 3 — LANÇAMENTO NO CONTAS A PAGAR",
        etapas: [
          {
            numero: 7,
            titulo: "Abrir o módulo de Contas a Pagar",
            itens: [
              "Sistema financeiro ou planilha oficial"
            ]
          },
          {
            numero: 8,
            titulo: "Criar novo título a pagar",
            itens: [
              "Fornecedor",
              "Número da NF vinculada",
              "Data de vencimento",
              "Forma de pagamento: Boleto",
              "Categoria de despesa"
            ]
          },
          {
            numero: 9,
            titulo: "Anexar boleto ao título",
            itens: [
              "Upload do PDF do boleto",
              "Verificar se linha digitável está correta"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — VALIDAÇÃO DO LANÇAMENTO",
        etapas: [
          {
            numero: 10,
            titulo: "Conferir lançamento completo",
            checklist: [
              "Fornecedor correto?",
              "Data de vencimento correta?",
              "NF vinculada?",
              "Boleto anexado?",
              "Categoria correta?"
            ]
          },
          {
            numero: 11,
            titulo: "O lançamento está correto?",
            decisao: {
              seNao: [
                "Corrigir informações",
                "Verificar dados com o setor de compras"
              ],
              seSim: [
                "Confirmar lançamento"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 12,
            titulo: "Marcar título como 'Aguardando Pagamento'",
            itens: [
              "Status: Pendente",
              "Prioridade definida conforme vencimento"
            ]
          },
          {
            numero: 13,
            titulo: "Incluir na programação de pagamentos",
            itens: [
              "O título entra automaticamente na fila de pagamentos",
              "Será processado conforme o Processo 3"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "1.3",
    titulo: "PROGRAMAÇÃO DE PAGAMENTOS",
    icon: Calendar,
    cor: "bg-violet-500",
    blocos: [
      {
        titulo: "BLOCO 1 — ORGANIZAÇÃO DOS TÍTULOS",
        etapas: [
          {
            numero: 1,
            titulo: "Levantar todos os títulos a pagar do período",
            itens: [
              "Buscar no sistema os boletos lançados",
              "Separar por data de vencimento",
              "Agrupar por fornecedor quando necessário"
            ]
          },
          {
            numero: 2,
            titulo: "Verificar pendências de recebimento de boletos",
            itens: [
              "Algum boleto ainda não foi enviado pelo fornecedor?",
              "Se sim, solicitar imediatamente"
            ]
          },
          {
            numero: 3,
            titulo: "Classificar prioridade dos pagamentos",
            itens: [
              "Vencendo hoje",
              "Vencendo nos próximos 3 dias",
              "Pagamentos programáveis"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ANÁLISE DO FLUXO DE CAIXA",
        etapas: [
          {
            numero: 4,
            titulo: "Conferir saldo disponível",
            itens: [
              "Acessar extrato bancário",
              "Conferir saldo físico da empresa"
            ]
          },
          {
            numero: 5,
            titulo: "Projetar fluxo até a data dos pagamentos",
            itens: [
              "Entradas previstas",
              "Saídas obrigatórias"
            ]
          },
          {
            numero: 6,
            titulo: "Há risco de caixa negativo?",
            decisao: {
              seNao: [
                "Avançar para montagem da programação"
              ],
              seSim: [
                "Reorganizar pagamentos",
                "Solicitar autorização da direção",
                "Priorizar fornecedores essenciais"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 3 — MONTAGEM DA PROGRAMAÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Criar lista oficial da semana",
            itens: [
              "Em ordem de vencimento",
              "Com identificação de fornecedor",
              "Com descrição do título (NF vinculada)"
            ]
          },
          {
            numero: 8,
            titulo: "Anexar boletos e comprovantes correspondentes",
            itens: [
              "Garantir que todos os documentos relacionados estão anexados"
            ]
          },
          {
            numero: 9,
            titulo: "Revisar lista antes do envio",
            checklist: [
              "Datas corretas",
              "Títulos completos",
              "Boletos anexados",
              "Responsáveis informados"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — APROVAÇÃO",
        etapas: [
          {
            numero: 10,
            titulo: "Enviar programação para a diretoria/gestor",
            itens: [
              "Via WhatsApp",
              "Via painel interno",
              "Via e-mail"
            ]
          },
          {
            numero: 11,
            titulo: "Receber retorno da aprovação",
            decisao: {
              seNao: [
                "Realizar ajustes solicitados",
                "Reenviar para validação"
              ],
              seSim: [
                "Encaminhar para execução no Contas a Pagar"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 12,
            titulo: "Registrar programação aprovada no painel",
            itens: []
          },
          {
            numero: 13,
            titulo: "Comunicar o setor financeiro do cronograma oficial",
            itens: []
          },
          {
            numero: 14,
            titulo: "Arquivar programação da semana",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "1.4",
    titulo: "CONTAS A PAGAR",
    icon: ArrowUpCircle,
    cor: "bg-red-500",
    blocos: [
      {
        titulo: "BLOCO 1 — IDENTIFICAÇÃO DOS TÍTULOS A PAGAR",
        etapas: [
          {
            numero: 1,
            titulo: "Abrir a agenda de pagamentos do dia",
            itens: [
              "Conferir lista aprovada na Programação de Pagamentos"
            ]
          },
          {
            numero: 2,
            titulo: "Separar pagamentos por método",
            itens: [
              "PIX",
              "TED / Transferência",
              "Boleto bancário"
            ]
          },
          {
            numero: 3,
            titulo: "Validar se todos os documentos estão anexados",
            itens: [
              "NF",
              "Boleto",
              "Programação aprovada"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — CONFERÊNCIA DO TÍTULO",
        etapas: [
          {
            numero: 4,
            titulo: "Conferir informações antes de pagar",
            itens: [
              "Fornecedor",
              "Data de vencimento",
              "Descrição do título",
              "Dados bancários"
            ]
          },
          {
            numero: 5,
            titulo: "O título está correto?",
            decisao: {
              seNao: [
                "Corrigir no sistema",
                "Notificar compras ou setor responsável"
              ],
              seSim: [
                "Continuar para o pagamento"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 3 — EXECUÇÃO DO PAGAMENTO",
        etapas: [
          {
            numero: 6,
            titulo: "Acessar conta bancária",
            itens: [
              "Usar aplicativo corporativo autorizado"
            ]
          },
          {
            numero: 7,
            titulo: "Efetuar pagamento conforme método",
            itens: [
              "PIX: copiar chave",
              "Transferência: confirmar dados bancários",
              "Boleto: inserir linha digitável"
            ]
          },
          {
            numero: 8,
            titulo: "Salvar comprovante de pagamento",
            itens: [
              "Nomear: ANO_MÊS_DIA – Fornecedor – Nº NF – Comprovante"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — BAIXA DO TÍTULO NO SISTEMA",
        etapas: [
          {
            numero: 9,
            titulo: "Registrar pagamento efetuado",
            itens: [
              "Inserir data de pagamento",
              "Anexar comprovante",
              "Alterar status para 'Pago'"
            ]
          },
          {
            numero: 10,
            titulo: "Conferir se o título saiu corretamente do Contas a Pagar",
            checklist: [
              "Título baixado",
              "Comprovante anexado",
              "Painel atualizado"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 11,
            titulo: "Atualizar o fluxo de caixa",
            itens: []
          },
          {
            numero: 12,
            titulo: "Informar setor solicitante (quando necessário)",
            itens: []
          },
          {
            numero: 13,
            titulo: "Arquivar comprovantes em pastas mensais",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "1.5",
    titulo: "CONTAS A RECEBER",
    icon: ArrowDownCircle,
    cor: "bg-emerald-500",
    blocos: [
      {
        titulo: "BLOCO 1 — IDENTIFICAÇÃO E COLETA DOS RECEBIMENTOS",
        etapas: [
          {
            numero: 1,
            titulo: "Levantar todas as entradas previstas do dia",
            itens: [
              "Site próprio",
              "WhatsApp / PDV",
              "iFood (ou outras plataformas)",
              "Cartões (crédito e débito)",
              "Dinheiro / PIX"
            ]
          },
          {
            numero: 2,
            titulo: "Abrir relatórios de vendas",
            itens: [
              "Painel do site",
              "Relatório do iFood",
              "Sistema interno (PDV)"
            ]
          },
          {
            numero: 3,
            titulo: "Identificar valores a receber",
            itens: [
              "Entradas previstas para o dia",
              "Entradas previstas dos próximos 7 dias (para projeção)"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — CONFERÊNCIA DOS RECEBIMENTOS",
        etapas: [
          {
            numero: 4,
            titulo: "Comparar valores previstos x valores recebidos",
            itens: [
              "Conferir relatório bancário",
              "Conferir extrato das maquininhas",
              "Conferir extrato do iFood"
            ]
          },
          {
            numero: 5,
            titulo: "Existem divergências entre valores recebidos e previstos?",
            decisao: {
              seSim: [
                "Identificar qual plataforma não pagou o valor",
                "Abrir chamado na plataforma (iFood, maquininha, site)",
                "Registrar divergência no painel"
              ],
              seNao: [
                "Avançar para o registro"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 3 — REGISTRO NO SISTEMA / PLANILHA",
        etapas: [
          {
            numero: 6,
            titulo: "Lançar recebimentos no sistema financeiro",
            itens: [
              "Inserir data do recebimento",
              "Origem da venda (iFood / Site / Salão)",
              "Formato de pagamento (PIX / Cartão / Dinheiro)",
              "Identificação do pedido (número, ID, ou código interno)"
            ]
          },
          {
            numero: 7,
            titulo: "Categorizar corretamente o recebimento",
            itens: [
              "Vendas — Delivery",
              "Vendas — Salão",
              "Vendas — Retirada",
              "Correções / Ajustes (quando houver)"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — BAIXA DOS TÍTULOS A RECEBER",
        etapas: [
          {
            numero: 8,
            titulo: "Abrir a aba de Contas a Receber no sistema",
            itens: [
              "Identificar valores previstos anteriormente"
            ]
          },
          {
            numero: 9,
            titulo: "Baixar todos os recebimentos que já foram pagos",
            itens: [
              "Marcar como 'Recebido'",
              "Anexar comprovantes (quando necessário)"
            ]
          },
          {
            numero: 10,
            titulo: "Conferir se não ficou nenhum valor em aberto indevido",
            checklist: [
              "Todos os pedidos recebidos no banco foram baixados?",
              "Não existe valor duplicado?",
              "Não existe valor pendente sem motivo?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO DO PROCESSO",
        etapas: [
          {
            numero: 11,
            titulo: "Atualizar o painel financeiro do dia",
            itens: [
              "Informar total recebido",
              "Atualizar gráficos de acompanhamento"
            ]
          },
          {
            numero: 12,
            titulo: "Reportar divergências pendentes",
            itens: [
              "Informar à gestão quais valores ainda não foram pagos pelas plataformas"
            ]
          },
          {
            numero: 13,
            titulo: "Encerrar o processo diário no checklist financeiro",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "1.6",
    titulo: "GESTÃO DO FLUXO DE CAIXA",
    icon: Wallet,
    cor: "bg-amber-500",
    blocos: [
      {
        titulo: "BLOCO 1 — LEVANTAMENTO E ORGANIZAÇÃO DIÁRIA",
        etapas: [
          {
            numero: 1,
            titulo: "Abrir o documento oficial de fluxo de caixa",
            itens: [
              "Planilha operacional, Base44 ou sistema interno"
            ]
          },
          {
            numero: 2,
            titulo: "Registrar todas as ENTRADAS do dia",
            itens: [
              "Vendas recebidas",
              "PIX",
              "Cartões",
              "Transferências",
              "Pagamentos de plataformas (iFood, site, etc.)"
            ]
          },
          {
            numero: 3,
            titulo: "Registrar todas as SAÍDAS do dia",
            itens: [
              "Pagamentos confirmados no banco",
              "Pagamentos realizados em espécie",
              "Saídas autorizadas (reembolsos, trocos, cofres)"
            ]
          },
          {
            numero: 4,
            titulo: "Conferir saldo inicial e confrontar com extrato bancário",
            itens: [
              "Verificar se o saldo do início do dia está correto",
              "Ajustar caso exista diferença (com justificativa)"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ANÁLISE DIÁRIA DO FLUXO",
        etapas: [
          {
            numero: 5,
            titulo: "Calcular saldo final operacional do dia",
            itens: [
              "Saldo final = Saldo inicial + Entradas – Saídas"
            ]
          },
          {
            numero: 6,
            titulo: "Identificar se existe risco de caixa negativo para os próximos dias",
            itens: [
              "Avaliar pagamentos programados",
              "Analisar saldo projetado"
            ]
          },
          {
            numero: 7,
            titulo: "Há risco de caixa negativo?",
            decisao: {
              seSim: [
                "Priorizar pagamentos essenciais",
                "Pausar pagamentos não urgentes",
                "Notificar diretor/gestor financeiro",
                "Avaliar necessidade de reorganização da programação"
              ],
              seNao: [
                "Manter operação programada normalmente"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 3 — PROJEÇÃO DE FLUXO FUTURO",
        etapas: [
          {
            numero: 8,
            titulo: "Projetar entradas dos próximos 7 dias",
            itens: [
              "Valores previstos de plataformas",
              "Previsão de vendas",
              "Depósitos programados"
            ]
          },
          {
            numero: 9,
            titulo: "Projetar saídas dos próximos 7 dias",
            itens: [
              "Contas a pagar",
              "Compromissos financeiros",
              "Folha de pagamento (se for período)"
            ]
          },
          {
            numero: 10,
            titulo: "Calcular saldo projetado",
            itens: [
              "Determinar se a empresa conseguirá honrar compromissos futuros"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — VALIDAÇÕES E AJUSTES",
        etapas: [
          {
            numero: 11,
            titulo: "Verificar coerência das informações registradas",
            checklist: [
              "Entradas registradas corretamente?",
              "Saídas reais conferem com o extrato?",
              "Não há pagamentos duplicados?",
              "Entradas das plataformas estão alinhadas com relatórios?"
            ]
          },
          {
            numero: 12,
            titulo: "Encontrou inconsistências?",
            decisao: {
              seSim: [
                "Ajustar lançamento",
                "Registrar justificativa",
                "Informar responsável da área"
              ],
              seNao: [
                "Avançar para fechamento"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FECHAMENTO DO FLUXO DE CAIXA",
        etapas: [
          {
            numero: 13,
            titulo: "Registrar saldo final do dia",
            itens: [
              "Informar no painel financeiro diário"
            ]
          },
          {
            numero: 14,
            titulo: "Atualizar o status do fluxo semanal",
            itens: [
              "Preencher gráfico / dashboard",
              "Revisar metas de caixa"
            ]
          },
          {
            numero: 15,
            titulo: "Arquivar o fechamento do dia",
            itens: [
              "Planilhas",
              "Prints",
              "Extratos (quando necessário)"
            ]
          },
          {
            numero: 16,
            titulo: "Comunicar a direção sobre o status do caixa",
            itens: [
              "Informar alertas, riscos ou estabilidade"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "1.7",
    titulo: "CONCILIAÇÃO BANCÁRIA",
    icon: Building2,
    cor: "bg-cyan-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO PARA A CONCILIAÇÃO",
        etapas: [
          {
            numero: 1,
            titulo: "Abrir o extrato bancário do período a ser conciliado",
            itens: [
              "Extrato completo do dia ou da semana",
              "Conferir se o extrato está atualizado"
            ]
          },
          {
            numero: 2,
            titulo: "Abrir o sistema financeiro ou planilha de controle",
            itens: [
              "Contas a Pagar",
              "Contas a Receber",
              "Fluxo de Caixa"
            ]
          },
          {
            numero: 3,
            titulo: "Organizar os documentos de apoio",
            itens: [
              "Comprovantes de pagamentos",
              "Relatórios de vendas",
              "Lançamentos internos"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — COMPARAÇÃO DAS ENTRADAS",
        etapas: [
          {
            numero: 4,
            titulo: "Comparar as entradas do extrato bancário com as entradas do sistema",
            itens: [
              "Vendas recebidas via cartão",
              "PIX recebidos",
              "Transferências e depósitos",
              "Entradas das plataformas (iFood, site, etc.)"
            ]
          },
          {
            numero: 5,
            titulo: "Existe diferença entre os valores recebidos e os valores registrados?",
            decisao: {
              seSim: [
                "Identificar qual lançamento está incorreto",
                "Ajustar no sistema o valor correto",
                "Registrar motivo da divergência",
                "Se for plataforma, abrir contestação (quando necessário)"
              ],
              seNao: [
                "Avançar para conferência das saídas"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 3 — COMPARAÇÃO DAS SAÍDAS",
        etapas: [
          {
            numero: 6,
            titulo: "Conferir cada pagamento realizado no extrato",
            itens: [
              "PIX realizados",
              "Boletos pagos",
              "Transferências",
              "Tarifas bancárias",
              "Débitos automáticos (máquinas, bancos, etc.)"
            ]
          },
          {
            numero: 7,
            titulo: "Verificar se todos os pagamentos constam no sistema",
            itens: [
              "Conferir valores",
              "Conferir data",
              "Conferir fornecedor"
            ]
          },
          {
            numero: 8,
            titulo: "Encontrou alguma saída no extrato que não consta no sistema?",
            decisao: {
              seSim: [
                "Registrar nova saída no sistema",
                "Anexar comprovante e descrição",
                "Ajustar fluxo de caixa"
              ],
              seNao: [
                "Avançar para validação geral"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — VALIDAÇÃO FINAL DA CONCILIAÇÃO",
        etapas: [
          {
            numero: 9,
            titulo: "Validar que a soma das entradas e saídas do sistema bate com o extrato",
            itens: [
              "Não deve haver diferenças entre caixa interno e banco",
              "Valores futuros também devem estar conciliados"
            ]
          },
          {
            numero: 10,
            titulo: "O saldo final do sistema confere com o saldo do banco?",
            decisao: {
              seNao: [
                "Repetir conferência das datas",
                "Verificar lançamentos duplicados",
                "Verificar lançamentos faltantes",
                "Revisar estornos ou cobranças indevidas"
              ],
              seSim: [
                "Registrar conciliação como concluída"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 5 — RELATÓRIO E ARQUIVAMENTO",
        etapas: [
          {
            numero: 11,
            titulo: "Gerar relatório da conciliação",
            itens: [
              "Data do período conciliado",
              "Entradas totais",
              "Saídas totais",
              "Ajustes feitos",
              "Pendências ou chamados abertos"
            ]
          },
          {
            numero: 12,
            titulo: "Anexar todos os documentos no sistema ou pasta do mês",
            itens: [
              "Extratos",
              "Prints de plataformas",
              "Comprovantes ajustados"
            ]
          },
          {
            numero: 13,
            titulo: "Atualizar painel financeiro",
            itens: [
              "Marcar conciliação como finalizada",
              "Notificar a direção sobre irregularidades (se houver)"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "1.8",
    titulo: "PAINEL DE INDICADORES",
    icon: BarChart3,
    cor: "bg-purple-500",
    blocos: [
      {
        titulo: "BLOCO 1 — COLETA DE DADOS",
        etapas: [
          {
            numero: 1,
            titulo: "Reunir todas as informações financeiras do período",
            itens: [
              "Faturamento total (Delivery, Salão, Retirada)",
              "Recebimentos confirmados",
              "CMV (Custo de Mercadoria Vendida)",
              "Gastos Fixos",
              "Gastos Variáveis",
              "Resultados por plataforma (iFood, site, WhatsApp)"
            ]
          },
          {
            numero: 2,
            titulo: "Abrir os relatórios necessários",
            itens: [
              "Relatório de vendas do PDV",
              "Relatório de plataformas",
              "Planilhas internas",
              "Relatórios do sistema financeiro"
            ]
          },
          {
            numero: 3,
            titulo: "Validar se todos os dados do período foram fechados",
            itens: [
              "Conferir se não existem notas pendentes",
              "Conferir fechamento de caixa do dia anterior",
              "Conferir se todos os pagamentos previstos foram registrados"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ATUALIZAÇÃO DOS INDICADORES",
        etapas: [
          {
            numero: 4,
            titulo: "Atualizar os indicadores principais no painel",
            itens: [
              "Faturamento do dia / semana / mês",
              "Ticket médio",
              "Total de pedidos",
              "CMV (%)",
              "Despesas operacionais",
              "Lucro operacional",
              "Margem de contribuição",
              "Evolução semanal e mensal"
            ]
          },
          {
            numero: 5,
            titulo: "Preencher indicadores complementares (quando houver)",
            itens: [
              "Participação de cada canal de venda",
              "Indicadores de inadimplência",
              "Giro de estoque",
              "Índice de quebra / desperdício"
            ]
          },
          {
            numero: 6,
            titulo: "Verificar se todos os indicadores foram atualizados corretamente",
            checklist: [
              "Dados financeiros inseridos?",
              "Dados de vendas atualizados?",
              "CMV e custos revisados?",
              "Nenhum campo ficou vazio?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — ANÁLISE DOS RESULTADOS",
        etapas: [
          {
            numero: 7,
            titulo: "Comparar os indicadores com metas e histórico",
            itens: [
              "Meta semanal e mensal",
              "Histórico dos últimos meses",
              "Crescimento ou queda"
            ]
          },
          {
            numero: 8,
            titulo: "Identificar variações relevantes",
            itens: [
              "Aumento de despesas",
              "Queda no ticket médio",
              "Alta no CMV",
              "Redução no lucro"
            ]
          },
          {
            numero: 9,
            titulo: "Há algum indicador crítico identificado?",
            decisao: {
              seSim: [
                "Registrar alerta no painel",
                "Criar ação corretiva",
                "Informar direção ou gerência"
              ],
              seNao: [
                "Marcar como 'Dentro do padrão'"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — INTERPRETAÇÃO E ENCAMINHAMENTO",
        etapas: [
          {
            numero: 10,
            titulo: "Transformar dados em informações acionáveis",
            itens: [
              "O que precisa ser ajustado?",
              "Quais setores precisam de atenção?",
              "Quais metas precisam de revisão?"
            ]
          },
          {
            numero: 11,
            titulo: "Preparar resumo executivo",
            itens: [
              "Destaques positivos",
              "Pontos de alerta",
              "Recomendações"
            ]
          },
          {
            numero: 12,
            titulo: "Enviar relatório diário/semanal/mensal para a diretoria",
            itens: [
              "WhatsApp, e-mail ou painel digital"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO DO PROCESSO",
        etapas: [
          {
            numero: 13,
            titulo: "Salvar o painel atualizado em pasta específica",
            itens: [
              "Financeiro > Indicadores > Ano > Mês"
            ]
          },
          {
            numero: 14,
            titulo: "Registrar conclusão no checklist financeiro",
            itens: [
              "Indicadores do período oficialmente atualizados"
            ]
          },
          {
            numero: 15,
            titulo: "Programar data da próxima atualização",
            itens: [
              "Diário, semanal ou mensal, conforme rotina definida"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "1.9",
    titulo: "GESTÃO DO SALDO DE CAIXA",
    icon: PiggyBank,
    cor: "bg-pink-500",
    blocos: [
      {
        titulo: "BLOCO 1 — COLETA E VERIFICAÇÃO DO SALDO",
        etapas: [
          {
            numero: 1,
            titulo: "Abrir o sistema financeiro e o extrato bancário",
            itens: [
              "Conferir saldo disponível no banco",
              "Conferir saldo do caixa físico (se houver)"
            ]
          },
          {
            numero: 2,
            titulo: "Levantar todas as entradas do dia",
            itens: [
              "Vendas recebidas",
              "PIX",
              "Transferências",
              "Pagamentos das plataformas"
            ]
          },
          {
            numero: 3,
            titulo: "Levantar todas as saídas do dia",
            itens: [
              "Pagamentos realizados (boletos, PIX, transferências)",
              "Saídas de caixa autorizadas",
              "Tarifas bancárias"
            ]
          },
          {
            numero: 4,
            titulo: "Registrar saldo inicial, entradas e saídas",
            itens: [
              "Preencher no fluxo diário",
              "Registrar divergências caso existam"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — CONFERÊNCIA DO SALDO REAL VS. SALDO REGISTRADO",
        etapas: [
          {
            numero: 5,
            titulo: "Comparar o saldo real (banco + caixa físico) com o saldo do sistema",
            itens: []
          },
          {
            numero: 6,
            titulo: "Existe diferença entre saldo real e saldo registrado?",
            decisao: {
              seSim: [
                "Verificar lançamentos duplicados",
                "Identificar saídas não registradas",
                "Conferir entradas pendentes",
                "Ajustar o sistema com justificativa"
              ],
              seNao: [
                "Avançar para a análise de segurança"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 3 — ANÁLISE DE SAÚDE FINANCEIRA",
        etapas: [
          {
            numero: 7,
            titulo: "Avaliar se o saldo atual cobre os pagamentos previstos",
            itens: [
              "Consultar programação de pagamentos",
              "Verificar projeção de caixa da semana"
            ]
          },
          {
            numero: 8,
            titulo: "Identificar possível risco de falta de caixa",
            itens: [
              "Baixo saldo + alta demanda de pagamentos",
              "Entradas atrasadas de plataformas"
            ]
          },
          {
            numero: 9,
            titulo: "Há risco de insuficiência de caixa nos próximos 7 dias?",
            decisao: {
              seSim: [
                "Priorizar pagamentos essenciais",
                "Reorganizar prazos com fornecedores",
                "Acionar direção para tomada de decisão",
                "Ajustar programação de pagamentos"
              ],
              seNao: [
                "Manter operação normal"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — AJUSTES E VALIDAÇÕES",
        etapas: [
          {
            numero: 10,
            titulo: "Conferir se todos os lançamentos do dia foram feitos",
            checklist: [
              "Entradas registradas?",
              "Saídas registradas?",
              "Conciliação do caixa físico feita?",
              "Tarifas bancárias identificadas?",
              "Não existe saída sem descrição?"
            ]
          },
          {
            numero: 11,
            titulo: "Ajustar lançamentos necessários",
            itens: [
              "Corrigir valores",
              "Corrigir categorias",
              "Inserir comprovantes faltantes"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FECHAMENTO DO SALDO",
        etapas: [
          {
            numero: 12,
            titulo: "Registrar saldo final do dia",
            itens: [
              "Definir saldo disponível real",
              "Atualizar no painel de indicadores"
            ]
          },
          {
            numero: 13,
            titulo: "Arquivar documentação do dia",
            itens: [
              "Extratos",
              "Prints do banco",
              "Registros de caixa físico"
            ]
          },
          {
            numero: 14,
            titulo: "Comunicar status do caixa",
            itens: [
              "Enviar resumo diário para gestor/direção",
              "Informar riscos, alertas ou estabilidade"
            ]
          },
          {
            numero: 15,
            titulo: "Encerrar o processo no checklist financeiro",
            itens: [
              "Confirmar que o Saldo de Caixa está 100% atualizado"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "1.10",
    titulo: "FECHAMENTO FINANCEIRO MENSAL",
    icon: CheckSquare,
    cor: "bg-indigo-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO DO FECHAMENTO",
        etapas: [
          {
            numero: 1,
            titulo: "Confirmar que todos os processos do mês foram finalizados",
            itens: [
              "Todas as NFs lançadas",
              "Todos os boletos registrados",
              "Todos os pagamentos baixados",
              "Todos os recebimentos conferidos"
            ]
          },
          {
            numero: 2,
            titulo: "Realizar conciliação bancária final do mês",
            itens: [
              "Confrontar extrato com sistema",
              "Ajustar divergências encontradas"
            ]
          },
          {
            numero: 3,
            titulo: "Verificar pendências em aberto",
            itens: [
              "Contas a pagar atrasadas",
              "Contas a receber pendentes",
              "Divergências não resolvidas"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — CONSOLIDAÇÃO DOS DADOS",
        etapas: [
          {
            numero: 4,
            titulo: "Consolidar todas as entradas do mês",
            itens: [
              "Total de vendas por canal",
              "Total de recebimentos por forma de pagamento",
              "Total de outras receitas"
            ]
          },
          {
            numero: 5,
            titulo: "Consolidar todas as saídas do mês",
            itens: [
              "Total de compras (CMV)",
              "Total de despesas fixas",
              "Total de despesas variáveis",
              "Total de impostos e taxas"
            ]
          },
          {
            numero: 6,
            titulo: "Calcular resultado do mês",
            itens: [
              "Receita Total - Despesas Totais = Resultado",
              "Registrar lucro ou prejuízo operacional"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — ANÁLISE E COMPARATIVOS",
        etapas: [
          {
            numero: 7,
            titulo: "Comparar resultado com mês anterior",
            itens: [
              "Variação percentual de faturamento",
              "Variação percentual de despesas",
              "Variação do CMV"
            ]
          },
          {
            numero: 8,
            titulo: "Comparar resultado com meta do mês",
            itens: [
              "Meta atingida?",
              "Qual foi a diferença?"
            ]
          },
          {
            numero: 9,
            titulo: "O resultado está dentro do esperado?",
            decisao: {
              seNao: [
                "Identificar principais causas da variação",
                "Criar plano de ação para o próximo mês",
                "Apresentar análise à direção"
              ],
              seSim: [
                "Registrar como mês positivo",
                "Identificar pontos de melhoria contínua"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — RELATÓRIO GERENCIAL",
        etapas: [
          {
            numero: 10,
            titulo: "Elaborar relatório financeiro mensal",
            itens: [
              "Resumo executivo",
              "Principais indicadores",
              "Gráficos de evolução",
              "Comparativo com períodos anteriores"
            ]
          },
          {
            numero: 11,
            titulo: "Incluir análises específicas",
            itens: [
              "Análise do CMV",
              "Análise de despesas por categoria",
              "Performance por canal de venda"
            ]
          },
          {
            numero: 12,
            titulo: "Apresentar recomendações",
            itens: [
              "Ações para redução de custos",
              "Oportunidades de aumento de receita",
              "Ajustes operacionais necessários"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO E ARQUIVAMENTO",
        etapas: [
          {
            numero: 13,
            titulo: "Enviar relatório para a diretoria",
            itens: [
              "Agendar reunião de apresentação (se necessário)",
              "Disponibilizar relatório no painel"
            ]
          },
          {
            numero: 14,
            titulo: "Arquivar todos os documentos do mês",
            itens: [
              "Relatórios",
              "Extratos",
              "Comprovantes",
              "Notas fiscais"
            ]
          },
          {
            numero: 15,
            titulo: "Preparar estrutura para o próximo mês",
            itens: [
              "Abrir novas pastas",
              "Zerar contadores",
              "Atualizar metas"
            ]
          },
          {
            numero: 16,
            titulo: "Marcar fechamento como concluído",
            itens: [
              "Registrar no sistema",
              "Comunicar equipe financeira"
            ]
          }
        ]
      }
    ]
  },
  // GRUPO 2 - CMV E CONTROLE DE ESTOQUE
  {
    id: "2.1",
    titulo: "ESPECIFICAÇÃO DE PRODUTOS",
    icon: Package,
    cor: "bg-orange-500",
    blocos: [
      {
        titulo: "BLOCO 1 — DEFINIÇÃO E PADRONIZAÇÃO",
        etapas: [
          {
            numero: 1,
            titulo: "Listar todos os produtos que compõem o cardápio",
            itens: [
              "Sabores, massas, toppings, bebidas, embalagens"
            ]
          },
          {
            numero: 2,
            titulo: "Identificar insumos necessários para cada produto",
            itens: [
              "Ingredientes",
              "Quantidades",
              "Embalagens"
            ]
          },
          {
            numero: 3,
            titulo: "Definir padrão de apresentação e composição",
            itens: [
              "Gramaturas",
              "Tamanho final",
              "Aspecto visual"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — DOCUMENTAÇÃO DA ESPECIFICAÇÃO",
        etapas: [
          {
            numero: 4,
            titulo: "Criar ficha de especificação por produto",
            itens: [
              "Nome do produto",
              "Categoria",
              "Insumos utilizados",
              "Quantidade de cada insumo",
              "Características obrigatórias"
            ]
          },
          {
            numero: 5,
            titulo: "Registrar fornecedores principais do insumo",
            itens: [
              "Fornecedores aprovados",
              "Embalagem padrão do insumo",
              "Unidade de medida utilizada"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — VALIDAÇÃO DE PADRÃO",
        etapas: [
          {
            numero: 6,
            titulo: "Conferir se o produto está padronizado",
            checklist: [
              "Gramatura definida?",
              "Insumos definidos?",
              "Padrão visual claro?",
              "Fornecedor adequado?"
            ]
          },
          {
            numero: 7,
            titulo: "O produto está 100% padronizado?",
            decisao: {
              seNao: [
                "Ajustar gramaturas",
                "Revisar insumos",
                "Confirmar fornecedores"
              ],
              seSim: [
                "Avançar para implementação"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — IMPLEMENTAÇÃO NA OPERAÇÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Enviar ficha de especificação para Cozinha e Estoque",
            itens: [
              "Garantir que todos saibam o padrão aprovado"
            ]
          },
          {
            numero: 9,
            titulo: "Treinar equipe operacional nos padrões",
            itens: [
              "Demonstrar modelo correto",
              "Validar compreensão dos colaboradores"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 10,
            titulo: "Arquivar documento de especificação",
            itens: [
              "Pasta: CMV > Especificações > Produto"
            ]
          },
          {
            numero: 11,
            titulo: "Programar revisão a cada 90 dias",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "2.2",
    titulo: "CONSTRUÇÃO DAS FICHAS TÉCNICAS",
    icon: ClipboardList,
    cor: "bg-teal-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO",
        etapas: [
          {
            numero: 1,
            titulo: "Levantar todos os produtos ativos no cardápio",
            itens: []
          },
          {
            numero: 2,
            titulo: "Separar insumos que fazem parte do produto",
            itens: []
          },
          {
            numero: 3,
            titulo: "Definir unidade de medida correta (g / ml / un)",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ESTRUTURAÇÃO DA FICHA TÉCNICA",
        etapas: [
          {
            numero: 4,
            titulo: "Criar estrutura da ficha",
            itens: [
              "Nome do produto",
              "Categoria",
              "Peso final desejado",
              "Gramatura de cada item",
              "Etapas de montagem",
              "Ponto de atenção"
            ]
          },
          {
            numero: 5,
            titulo: "Registrar gramatura exata de cada insumo",
            itens: [
              "Definir quantidade fixa",
              "Evitar faixas variáveis"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — TESTE E VALIDAÇÃO",
        etapas: [
          {
            numero: 6,
            titulo: "Produzir o produto exatamente como descrito",
            itens: [
              "Usar balança",
              "Registrar fotos do processo"
            ]
          },
          {
            numero: 7,
            titulo: "O peso final está adequado?",
            decisao: {
              seNao: [
                "Ajustar gramaturas",
                "Repetir teste"
              ],
              seSim: [
                "Confirmar padrão oficial"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — IMPLEMENTAÇÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Treinar equipe de cozinha",
            itens: []
          },
          {
            numero: 9,
            titulo: "Disponibilizar ficha impressa na área de produção",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 10,
            titulo: "Arquivar a ficha técnica",
            itens: [
              "Pasta: CMV > Fichas Técnicas"
            ]
          },
          {
            numero: 11,
            titulo: "Agendar revisão trimestral",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "2.3",
    titulo: "ORGANIZAÇÃO DO ESTOQUE",
    icon: Warehouse,
    cor: "bg-lime-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO E ESTRUTURAÇÃO FÍSICA",
        etapas: [
          {
            numero: 1,
            titulo: "Definir áreas do estoque",
            itens: [
              "Secos",
              "Resfriados",
              "Congelados",
              "Produtos químicos",
              "Embalagens"
            ]
          },
          {
            numero: 2,
            titulo: "Identificar prateleiras e caixas",
            itens: [
              "Etiquetas claras",
              "Setorização por tipo"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ORGANIZAÇÃO DOS ITENS",
        etapas: [
          {
            numero: 3,
            titulo: "Aplicar método FIFO (Primeiro que Entra, Primeiro que Sai)",
            itens: []
          },
          {
            numero: 4,
            titulo: "Separar produtos por categoria",
            itens: [
              "Laticínios",
              "Carnes",
              "Hortifruti",
              "Insumos secos"
            ]
          },
          {
            numero: 5,
            titulo: "Conferir validade de todos os produtos",
            itens: [
              "Itens vencidos → descarte imediato"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — REGISTRO E CONTROLE",
        etapas: [
          {
            numero: 6,
            titulo: "Registrar todos os produtos no sistema / planilha",
            itens: [
              "Nome",
              "Unidade",
              "Quantidade",
              "Localização"
            ]
          },
          {
            numero: 7,
            titulo: "Conferir se todos os itens foram cadastrados",
            checklist: [
              "Todos os insumos estão registrados?",
              "Localização correta?",
              "Validades atualizadas?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — RESPONSABILIZAÇÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Definir responsável pelo estoque",
            itens: [
              "Manutenção",
              "Validação diária",
              "Limpeza e organização"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 9,
            titulo: "Arquivar relatório de organização",
            itens: []
          },
          {
            numero: 10,
            titulo: "Programar revisão semanal do estoque",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "2.4",
    titulo: "CONTAGEM DE ESTOQUE",
    icon: Calculator,
    cor: "bg-sky-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO",
        etapas: [
          {
            numero: 1,
            titulo: "Imprimir ou abrir planilha de contagem",
            itens: [
              "Estoque seco",
              "Resfriado",
              "Congelado"
            ]
          },
          {
            numero: 2,
            titulo: "Separar equipe responsável",
            itens: [
              "Dupla para conferência cruzada"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — EXECUÇÃO DA CONTAGEM",
        etapas: [
          {
            numero: 3,
            titulo: "Contar item por item, sem estimativas",
            itens: [
              "Usar balança para itens abertos",
              "Conferir unidade correta"
            ]
          },
          {
            numero: 4,
            titulo: "Registrar quantidade real no momento da contagem",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — CONFERÊNCIA",
        etapas: [
          {
            numero: 5,
            titulo: "Comparar contagem física com sistema",
            itens: [
              "Identificar variações",
              "Sinalizar diferenças relevantes"
            ]
          },
          {
            numero: 6,
            titulo: "Existem diferenças significativas?",
            decisao: {
              seSim: [
                "Recontar item",
                "Verificar validade",
                "Investigar perdas"
              ],
              seNao: [
                "Avançar para fechamento"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — AJUSTES",
        etapas: [
          {
            numero: 7,
            titulo: "Ajustar estoque no sistema",
            itens: [
              "Inserir justificativa",
              "Atualizar quantidade padrão"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Salvar relatório da contagem",
            itens: []
          },
          {
            numero: 9,
            titulo: "Enviar para gestor revisar",
            itens: []
          },
          {
            numero: 10,
            titulo: "Atualizar painel semanal de CMV",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "2.5",
    titulo: "ROTINAS DE COMPRAS",
    icon: ShoppingCart,
    cor: "bg-rose-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO PARA COMPRA",
        etapas: [
          {
            numero: 1,
            titulo: "Abrir planilha de compras atualizada",
            itens: []
          },
          {
            numero: 2,
            titulo: "Levantar estoque mínimo de cada insumo",
            itens: []
          },
          {
            numero: 3,
            titulo: "Verificar frequência de compra por fornecedor",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ANÁLISE DE NECESSIDADE",
        etapas: [
          {
            numero: 4,
            titulo: "Conferir consumo médio diário/semana",
            itens: []
          },
          {
            numero: 5,
            titulo: "O estoque atual atende até a próxima compra?",
            decisao: {
              seNao: [
                "Incluir item na lista de compras"
              ],
              seSim: [
                "Não incluir o item"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 3 — GERAÇÃO DA LISTA DE COMPRAS",
        etapas: [
          {
            numero: 6,
            titulo: "Preencher lista oficial",
            itens: [
              "Nome do item",
              "Unidade",
              "Quantidade a comprar",
              "Fornecedor correspondente"
            ]
          },
          {
            numero: 7,
            titulo: "Revisar lista antes de enviar",
            checklist: [
              "Insumos essenciais incluídos?",
              "Quantidades corretas?",
              "Fornecedores certos?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — APROVAÇÃO E ENVIO",
        etapas: [
          {
            numero: 8,
            titulo: "Enviar lista para aprovação do gestor",
            itens: []
          },
          {
            numero: 9,
            titulo: "A lista foi aprovada?",
            decisao: {
              seNao: [
                "Ajustar conforme orientação",
                "Reenviar"
              ],
              seSim: [
                "Enviar para fornecedores"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 10,
            titulo: "Arquivar lista aprovada",
            itens: []
          },
          {
            numero: 11,
            titulo: "Registrar data da próxima compra",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "2.6",
    titulo: "PROCESSO DE RECEBIMENTO",
    icon: Truck,
    cor: "bg-slate-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO PARA O RECEBIMENTO",
        etapas: [
          {
            numero: 1,
            titulo: "Conferir lista de compras e pedidos realizados",
            itens: [
              "Itens, quantidades e fornecedores",
              "Previsão de entrega",
              "Responsável pelo recebimento"
            ]
          },
          {
            numero: 2,
            titulo: "Preparar área de recebimento",
            itens: [
              "Balança calibrada",
              "Termômetro",
              "Planilha/sistema aberto"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — RECEBIMENTO DO FORNECEDOR",
        etapas: [
          {
            numero: 3,
            titulo: "Conferir nota fiscal antes de descarregar",
            itens: [
              "CNPJ",
              "Produtos",
              "Quantidades",
              "Datas"
            ]
          },
          {
            numero: 4,
            titulo: "Avaliar condições do transporte",
            itens: [
              "Temperatura adequada",
              "Integridade da embalagem",
              "Veículo limpo"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — CONFERÊNCIA FÍSICA E TÉCNICA",
        etapas: [
          {
            numero: 5,
            titulo: "Conferir item por item com a NF",
            itens: [
              "Quantidade",
              "Peso",
              "Unidade correta"
            ]
          },
          {
            numero: 6,
            titulo: "Conferir validade e integridade dos produtos",
            checklist: [
              "Validade dentro do padrão?",
              "Embalagem sem danos?",
              "Sem sinais de contaminação?"
            ]
          },
          {
            numero: 7,
            titulo: "Há divergências entre pedido e NF?",
            decisao: {
              seSim: [
                "Anotar divergência",
                "Fotografar evidência",
                "Contatar fornecedor imediatamente"
              ],
              seNao: [
                "Avançar para o registro"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — REGISTRO DO RECEBIMENTO",
        etapas: [
          {
            numero: 8,
            titulo: "Registrar dados no sistema",
            itens: [
              "Produto",
              "Quantidade",
              "Lote",
              "Validade"
            ]
          },
          {
            numero: 9,
            titulo: "Anexar NF ao sistema financeiro",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 10,
            titulo: "Encaminhar produto para estocagem correta",
            itens: []
          },
          {
            numero: 11,
            titulo: "Registrar conclusão do recebimento",
            itens: []
          },
          {
            numero: 12,
            titulo: "Atualizar estoque disponível",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "2.7",
    titulo: "ESTOCAGEM",
    icon: BoxSelect,
    cor: "bg-fuchsia-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO DO ESTOQUE",
        etapas: [
          {
            numero: 1,
            titulo: "Verificar se o estoque está limpo e organizado",
            itens: [
              "Prateleiras desobstruídas",
              "Containers adequados",
              "Freezers e geladeiras funcionando"
            ]
          },
          {
            numero: 2,
            titulo: "Conferir espaço disponível para novos itens",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — CLASSIFICAÇÃO DOS ITENS",
        etapas: [
          {
            numero: 3,
            titulo: "Separar produtos por categoria",
            itens: [
              "Secos / Refrigerados / Congelados / Químicos"
            ]
          },
          {
            numero: 4,
            titulo: "Aplicar método FIFO",
            itens: [
              "Produtos mais antigos ficam na frente",
              "Novos sempre atrás"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — ARMAZENAMENTO",
        etapas: [
          {
            numero: 5,
            titulo: "Armazenar conforme tipo de insumo",
            itens: [
              "Refrigerados entre 2° e 5°C",
              "Congelados entre -10° e -18°C",
              "Secos longe de umidade"
            ]
          },
          {
            numero: 6,
            titulo: "Registrar localização do produto",
            itens: [
              "Prateleira",
              "Setor",
              "Container"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — VERIFICAÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Conferir se os produtos foram armazenados corretamente",
            checklist: [
              "Itens no local correto?",
              "FIFO aplicado?",
              "Validades visíveis?",
              "Nenhum item obstruindo circulação?"
            ]
          },
          {
            numero: 8,
            titulo: "Há itens mal armazenados?",
            decisao: {
              seSim: [
                "Reorganizar imediatamente"
              ],
              seNao: [
                "Avançar"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 9,
            titulo: "Atualizar sistema com localização e quantidade",
            itens: []
          },
          {
            numero: 10,
            titulo: "Registrar estocagem concluída",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "2.8",
    titulo: "COMPUTAÇÃO DO CMV",
    icon: Calculator,
    cor: "bg-yellow-500",
    blocos: [
      {
        titulo: "BLOCO 1 — COLETA DE INFORMAÇÕES",
        etapas: [
          {
            numero: 1,
            titulo: "Reunir dados de estoque inicial",
            itens: []
          },
          {
            numero: 2,
            titulo: "Reunir estoque final do período",
            itens: []
          },
          {
            numero: 3,
            titulo: "Reunir total de compras do período",
            itens: [
              "Apenas insumos que impactam produção"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — CÁLCULO DO CMV",
        etapas: [
          {
            numero: 4,
            titulo: "Aplicar fórmula padrão",
            itens: [
              "CMV = (Estoque inicial + Compras) – Estoque final"
            ]
          },
          {
            numero: 5,
            titulo: "Registrar CMV total e CMV por categoria",
            itens: [
              "Laticínios",
              "Carnes",
              "Hortifruti",
              "Embalagens"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — ANÁLISE DO CMV",
        etapas: [
          {
            numero: 6,
            titulo: "Calcular CMV percentual",
            itens: [
              "CMV% = (CMV / Faturamento) * 100",
              "Padrão Pizzaria: 28% a 33%",
              "Padrão Hamburgueria: 30% a 35%"
            ]
          },
          {
            numero: 7,
            titulo: "O CMV está dentro do padrão esperado?",
            decisao: {
              seNao: [
                "Identificar variações do estoque",
                "Verificar perdas e quebra",
                "Analisar compras fora de padrão"
              ],
              seSim: [
                "Avançar"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — INVESTIGAÇÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Avaliar categorias com maior impacto",
            itens: []
          },
          {
            numero: 9,
            titulo: "Verificar diferença entre produção prevista e real",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 10,
            titulo: "Registrar CMV no painel mensal",
            itens: []
          },
          {
            numero: 11,
            titulo: "Enviar relatório para gestor",
            itens: []
          },
          {
            numero: 12,
            titulo: "Agendar revisão do CMV semanal/mensal",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "2.9",
    titulo: "GESTÃO DO GAP",
    icon: TrendingDown,
    cor: "bg-red-600",
    blocos: [
      {
        titulo: "BLOCO 1 — IDENTIFICAÇÃO DO GAP",
        etapas: [
          {
            numero: 1,
            titulo: "Comparar CMV ideal x CMV real",
            itens: []
          },
          {
            numero: 2,
            titulo: "Levantar diferenças por categoria",
            itens: [
              "Laticínios",
              "Carnes",
              "Embalagens"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ANÁLISE DA CAUSA",
        etapas: [
          {
            numero: 3,
            titulo: "Investigar possíveis origens do GAP",
            itens: [
              "Erros de ficha técnica",
              "Erros de gramatura",
              "Perdas e desperdícios",
              "Compras fora de padrão",
              "Quebras no estoque"
            ]
          },
          {
            numero: 4,
            titulo: "Localizar área com maior impacto",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — AÇÕES CORRETIVAS",
        etapas: [
          {
            numero: 5,
            titulo: "Definir ações para reduzir GAP",
            itens: [
              "Treinamento",
              "Reforço de gramatura",
              "Revisão de fichas técnicas",
              "Ajuste de fornecedores"
            ]
          },
          {
            numero: 6,
            titulo: "Estabelecer metas de redução",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 4 — ACOMPANHAMENTO",
        etapas: [
          {
            numero: 7,
            titulo: "Monitorar diariamente indicadores do GAP",
            itens: []
          },
          {
            numero: 8,
            titulo: "Reavaliar semanalmente impacto das ações",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 9,
            titulo: "Registrar redução do GAP",
            itens: []
          },
          {
            numero: 10,
            titulo: "Comunicar equipe e liderança",
            itens: []
          }
        ]
      }
    ]
  }
];

function BlocoProcesso({ bloco }) {
  return (
    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
      <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
        <span className="w-2 h-2 bg-[#FF4D00] rounded-full"></span>
        {bloco.titulo}
      </h4>
      <div className="space-y-4">
        {bloco.etapas.map((etapa, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 bg-[#FF4D00]/20 text-[#FF4D00] rounded-lg flex items-center justify-center text-sm font-bold">
                {etapa.numero}
              </span>
              <div className="flex-1">
                <p className="font-medium text-white">{etapa.titulo}</p>
                
                {/* Itens */}
                {etapa.itens && etapa.itens.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {etapa.itens.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-white/30 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Checklist */}
                {etapa.checklist && (
                  <div className="mt-3 bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-white/50 mb-2 uppercase">Checklist de Validação:</p>
                    <div className="space-y-1">
                      {etapa.checklist.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Circle size={14} className="text-white/30" />
                          <span className="text-white/70">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decisão */}
                {etapa.decisao && (
                  <div className="mt-3 grid md:grid-cols-2 gap-3">
                    {etapa.decisao.seSim && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                          <CheckCircle2 size={14} />
                          <span className="text-xs font-semibold uppercase">SE SIM:</span>
                        </div>
                        <ul className="space-y-1">
                          {etapa.decisao.seSim.map((item, i) => (
                            <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                              <span className="text-emerald-400">→</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {etapa.decisao.seNao && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                          <AlertTriangle size={14} />
                          <span className="text-xs font-semibold uppercase">SE NÃO:</span>
                        </div>
                        <ul className="space-y-1">
                          {etapa.decisao.seNao.map((item, i) => (
                            <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                              <span className="text-red-400">→</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GestaoFinanceira() {
  const [expandedProcess, setExpandedProcess] = useState(null);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">💰 Gestão Financeira</h1>
          <p className="text-white/50">19 processos operacionais completos (Financeiro + CMV)</p>
        </div>
        <Link to={createPageUrl("Dashboard")}>
          <Button variant="outline" className="border-white/10 text-white">
            <Home size={18} className="mr-2" /> Início
          </Button>
        </Link>
      </div>

      {/* Grid de Processos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {processosFinanceiros.map((processo) => {
          const Icon = processo.icon;
          return (
            <button
              key={processo.id}
              onClick={() => setExpandedProcess(expandedProcess === processo.id ? null : processo.id)}
              className={`p-4 rounded-xl border transition-all text-left ${
                expandedProcess === processo.id
                  ? "bg-[#FF4D00]/20 border-[#FF4D00]/50"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <div className={`w-10 h-10 ${processo.cor} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-xs text-white/40 mb-1">{processo.id}</p>
              <p className="text-sm font-medium text-white line-clamp-2">{processo.titulo}</p>
            </button>
          );
        })}
      </div>

      {/* Processo Expandido */}
      {expandedProcess && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          {processosFinanceiros
            .filter((p) => p.id === expandedProcess)
            .map((processo) => {
              const Icon = processo.icon;
              return (
                <div key={processo.id}>
                  {/* Header do Processo */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                    <div className={`w-14 h-14 ${processo.cor} rounded-2xl flex items-center justify-center`}>
                      <Icon size={28} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/40">PROCESSO {processo.id}</p>
                      <h2 className="text-2xl font-bold text-white">{processo.titulo}</h2>
                    </div>
                  </div>

                  {/* Blocos */}
                  <div className="space-y-4">
                    {processo.blocos.map((bloco, idx) => (
                      <BlocoProcesso key={idx} bloco={bloco} />
                    ))}
                  </div>

                  {/* Rodapé */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <p className="text-sm text-white/40">
                      ✅ Processo {processo.id} — {processo.blocos.length} blocos operacionais
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedProcess(null)}
                      className="border-white/10 text-white"
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Lista Completa em Accordion */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📋 Visão Completa dos Processos</h3>
        <Accordion type="single" collapsible className="space-y-2">
          {processosFinanceiros.map((processo) => {
            const Icon = processo.icon;
            return (
              <AccordionItem
                key={processo.id}
                value={processo.id}
                className="bg-black/20 border border-white/5 rounded-xl overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${processo.cor} rounded-lg flex items-center justify-center`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-white/40 block">{processo.id}</span>
                      <span className="text-white font-medium">{processo.titulo}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {processo.blocos.map((bloco, idx) => (
                      <BlocoProcesso key={idx} bloco={bloco} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}