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
  UserMinus, Heart, Compass, Flag, Rocket, LayoutGrid, BookOpen,
  FileSpreadsheet, Utensils, ChefHat, Sparkles, CalendarDays,
  MessageSquare, ListChecks, Clock, Store, UtensilsCrossed,
  ClipboardCheck, Send, HandPlatter, ShieldAlert, MessageCircle,
  Globe, Smartphone, Bike, Navigation, PhoneCall, Award, Star,
  BarChart2, CalendarRange, MessageSquareWarning, RefreshCw, Search
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
  },
  // GRUPO 3 - GESTÃO DE PESSOAS
  {
    id: "3.1",
    titulo: "RECRUTAMENTO E SELEÇÃO",
    icon: UserPlus,
    cor: "bg-cyan-500",
    blocos: [
      {
        titulo: "BLOCO 1 — IDENTIFICAÇÃO DA NECESSIDADE",
        etapas: [
          {
            numero: 1,
            titulo: "Levantar necessidade de contratação",
            itens: [
              "Solicitação do gestor",
              "Demanda de operação",
              "Substituição ou nova vaga"
            ]
          },
          {
            numero: 2,
            titulo: "Definir perfil da vaga",
            itens: [
              "Função",
              "Competências necessárias",
              "Horário e escala",
              "Requisitos obrigatórios"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — DIVULGAÇÃO DA VAGA",
        etapas: [
          {
            numero: 3,
            titulo: "Criar anúncio estruturado",
            itens: [
              "Função",
              "Requisitos",
              "Benefícios",
              "Local",
              "Forma de inscrição"
            ]
          },
          {
            numero: 4,
            titulo: "Publicar a vaga nos canais oficiais",
            itens: [
              "WhatsApp",
              "Instagram",
              "Facebook",
              "Sites de emprego"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — TRIAGEM DOS CURRÍCULOS",
        etapas: [
          {
            numero: 5,
            titulo: "Separar currículos compatíveis com a vaga",
            itens: [
              "Experiência",
              "Localidade",
              "Disponibilidade"
            ]
          },
          {
            numero: 6,
            titulo: "Lista de candidatos pré-selecionados",
            itens: []
          },
          {
            numero: 7,
            titulo: "O candidato atende o perfil básico?",
            decisao: {
              seNao: [
                "Arquivar currículo"
              ],
              seSim: [
                "Avançar para entrevista"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — ENTREVISTA",
        etapas: [
          {
            numero: 8,
            titulo: "Agendar entrevista",
            itens: [
              "Informar horário",
              "Endereço",
              "Documentação necessária"
            ]
          },
          {
            numero: 9,
            titulo: "Realizar entrevista presencial ou online",
            itens: [
              "Verificar postura",
              "Comunicação",
              "Experiência prática",
              "Disponibilidade"
            ]
          },
          {
            numero: 10,
            titulo: "Registrar avaliação do candidato",
            checklist: [
              "Compareceu?",
              "Experiência comprovada?",
              "Atitude compatível?",
              "Motivação real pela vaga?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FECHAMENTO DA SELEÇÃO",
        etapas: [
          {
            numero: 11,
            titulo: "Escolher candidato aprovado",
            itens: []
          },
          {
            numero: 12,
            titulo: "Solicitar documentação",
            itens: [
              "RG / CPF",
              "Comprovante de endereço",
              "Carteira de trabalho",
              "Dados bancários"
            ]
          },
          {
            numero: 13,
            titulo: "Enviar para processo de integração",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "3.2",
    titulo: "PROCESSO DE INTEGRAÇÃO",
    icon: Users,
    cor: "bg-indigo-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO DA ADMISSÃO",
        etapas: [
          {
            numero: 1,
            titulo: "Conferir documentação completa do candidato",
            itens: []
          },
          {
            numero: 2,
            titulo: "Criar cadastro interno",
            itens: [
              "Dados pessoais",
              "Função",
              "Escala",
              "Supervisor responsável"
            ]
          },
          {
            numero: 3,
            titulo: "Enviar contrato de trabalho ou termo de prestação de serviço",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — PRIMEIRO CONTATO OFICIAL",
        etapas: [
          {
            numero: 4,
            titulo: "Dar boas-vindas ao novo colaborador",
            itens: [
              "Explicar cultura e valores",
              "Apresentar regras básicas",
              "Entregar manual interno"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — APRESENTAÇÃO DA OPERAÇÃO",
        etapas: [
          {
            numero: 5,
            titulo: "Fazer tour guiado pela unidade",
            itens: [
              "Cozinha",
              "Estoque",
              "Área de delivery",
              "Salão (se houver)"
            ]
          },
          {
            numero: 6,
            titulo: "Apresentar equipe e liderança",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 4 — CONFIGURAÇÕES E ACESSOS",
        etapas: [
          {
            numero: 7,
            titulo: "Criar acessos necessários",
            itens: [
              "Sistema",
              "WhatsApp interno",
              "Ponto digital"
            ]
          },
          {
            numero: 8,
            titulo: "Entregar uniformes e EPIs",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO DA INTEGRAÇÃO",
        etapas: [
          {
            numero: 9,
            titulo: "Registrar integração concluída",
            itens: [
              "Checklist assinado"
            ]
          },
          {
            numero: 10,
            titulo: "Encaminhar colaborador ao Treinamento Introdutório",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "3.3",
    titulo: "TREINAMENTO INTRODUTÓRIO",
    icon: GraduationCap,
    cor: "bg-purple-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PLANEJAMENTO DO TREINAMENTO",
        etapas: [
          {
            numero: 1,
            titulo: "Definir conteúdo do treinamento inicial",
            itens: [
              "Função do colaborador",
              "Procedimentos padrões",
              "Segurança alimentar",
              "Postura profissional"
            ]
          },
          {
            numero: 2,
            titulo: "Selecionar colaborador-tutor",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — TREINAMENTO EM AÇÃO",
        etapas: [
          {
            numero: 3,
            titulo: "Treinar nas atividades práticas da função",
            itens: [
              "Preparo",
              "Montagem",
              "Atendimento",
              "Regras internas"
            ]
          },
          {
            numero: 4,
            titulo: "Observar desempenho e velocidade de aprendizado",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — CHECKLIST DE AVALIAÇÃO",
        etapas: [
          {
            numero: 5,
            titulo: "Avaliar domínio dos processos",
            checklist: [
              "Entendeu a função?",
              "Sabe executar com segurança?",
              "Memorizou ficha técnica?",
              "Cumpre regras de higiene?"
            ]
          },
          {
            numero: 6,
            titulo: "O colaborador apresentou dificuldades relevantes?",
            decisao: {
              seSim: [
                "Reforçar treinamento",
                "Agendar mais 1 ou 2 dias de prática"
              ],
              seNao: [
                "Avançar"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — LIBERAÇÃO DO COLABORADOR PARA OPERAÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Assinar termo de conclusão do treinamento",
            itens: []
          },
          {
            numero: 8,
            titulo: "Comunicar gestor para inclusão na escala oficial",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 9,
            titulo: "Registrar treinamento no prontuário interno",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "3.4",
    titulo: "GESTÃO DE DESEMPENHO",
    icon: Target,
    cor: "bg-orange-600",
    blocos: [
      {
        titulo: "BLOCO 1 — ACOMPANHAMENTO CONTÍNUO",
        etapas: [
          {
            numero: 1,
            titulo: "Observar desempenho individual diariamente",
            itens: [
              "Velocidade",
              "Qualidade",
              "Comprometimento"
            ]
          },
          {
            numero: 2,
            titulo: "Registrar comportamentos positivos e negativos",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — FEEDBACKS PERIÓDICOS",
        etapas: [
          {
            numero: 3,
            titulo: "Realizar feedback mensal",
            itens: [
              "Pontos fortes",
              "Pontos de melhoria"
            ]
          },
          {
            numero: 4,
            titulo: "Registrar devolutiva no sistema interno",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — AVALIAÇÃO DE HABILIDADES",
        etapas: [
          {
            numero: 5,
            titulo: "Usar matriz de avaliação",
            checklist: [
              "Técnica",
              "Agilidade",
              "Postura",
              "Trabalho em equipe",
              "Presença e pontualidade"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — PLANO DE MELHORIA",
        etapas: [
          {
            numero: 6,
            titulo: "O desempenho está abaixo do esperado?",
            decisao: {
              seSim: [
                "Criar plano de ação",
                "Reforçar treinamento",
                "Reavaliar em 15 dias"
              ],
              seNao: [
                "Manter acompanhamento normal"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Registrar status de desempenho",
            itens: []
          },
          {
            numero: 8,
            titulo: "Comunicar liderança sobre evolução do colaborador",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "3.5",
    titulo: "GESTÃO DA FOLHA E BENEFÍCIOS",
    icon: DollarSign,
    cor: "bg-green-600",
    blocos: [
      {
        titulo: "BLOCO 1 — LEVANTAMENTO DOS DADOS",
        etapas: [
          {
            numero: 1,
            titulo: "Reunir informações do mês",
            itens: [
              "Horas trabalhadas",
              "Faltas",
              "Atestados",
              "Extras",
              "Adicionais e benefícios"
            ]
          },
          {
            numero: 2,
            titulo: "Conferir se todos os registros foram inseridos corretamente",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — CÁLCULO DA FOLHA",
        etapas: [
          {
            numero: 3,
            titulo: "Enviar informações para o contador / DP",
            itens: []
          },
          {
            numero: 4,
            titulo: "Validar folha prévia enviada pelo DP",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — CONFERÊNCIA DA FOLHA",
        etapas: [
          {
            numero: 5,
            titulo: "Verificar inconsistências",
            checklist: [
              "Horas corretas?",
              "Faltas validadas?",
              "Atestados inseridos?",
              "Extras autorizadas?"
            ]
          },
          {
            numero: 6,
            titulo: "Há divergências?",
            decisao: {
              seSim: [
                "Solicitar correção ao DP"
              ],
              seNao: [
                "Avançar"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — BENEFÍCIOS",
        etapas: [
          {
            numero: 7,
            titulo: "Conferir implantação de benefícios",
            itens: [
              "Vale transporte",
              "Vale refeição",
              "Alimentação",
              "Bonificações"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Aprovar folha do mês",
            itens: []
          },
          {
            numero: 9,
            titulo: "Registrar pagamento aos colaboradores",
            itens: []
          },
          {
            numero: 10,
            titulo: "Arquivar documentos da folha",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "3.6",
    titulo: "PROCESSO DEMISSIONAL",
    icon: UserMinus,
    cor: "bg-red-500",
    blocos: [
      {
        titulo: "BLOCO 1 — INÍCIO DO PROCESSO",
        etapas: [
          {
            numero: 1,
            titulo: "Receber solicitação de desligamento",
            itens: [
              "Pedido do colaborador",
              "Decisão da empresa"
            ]
          },
          {
            numero: 2,
            titulo: "Registrar data de comunicação",
            itens: [
              "Documento de aviso",
              "Motivo do desligamento"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — DOCUMENTAÇÃO NECESSÁRIA",
        etapas: [
          {
            numero: 3,
            titulo: "Solicitar documentos obrigatórios",
            itens: [
              "Dados bancários",
              "Assinaturas",
              "Entrega de uniformes e EPIs"
            ]
          },
          {
            numero: 4,
            titulo: "Enviar informações ao Departamento Pessoal / Contabilidade",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — PROCESSO DE DESLIGAMENTO",
        etapas: [
          {
            numero: 5,
            titulo: "Agendar acerto e entrega de documentos",
            itens: [
              "Extrato FGTS",
              "Termo de rescisão",
              "Guias obrigatórias"
            ]
          },
          {
            numero: 6,
            titulo: "Fazer entrevista de desligamento (opcional)",
            itens: [
              "Motivo real da saída",
              "Sugestões",
              "Percepções do colaborador"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — DEVOLUÇÕES E CONFERÊNCIAS",
        etapas: [
          {
            numero: 7,
            titulo: "Conferir devolução de itens da empresa",
            checklist: [
              "Uniforme entregue?",
              "Chave do armário?",
              "Acesso ao sistema bloqueado?",
              "Equipamentos devolvidos?"
            ]
          },
          {
            numero: 8,
            titulo: "Houve algum dano ou item faltante?",
            decisao: {
              seSim: [
                "Registrar ocorrência",
                "Descontar conforme regra interna"
              ],
              seNao: [
                "Prosseguir"
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
            titulo: "Realizar pagamento da rescisão",
            itens: []
          },
          {
            numero: 10,
            titulo: "Encerrar cadastro do colaborador",
            itens: []
          },
          {
            numero: 11,
            titulo: "Arquivar documentação",
            itens: []
          },
          {
            numero: 12,
            titulo: "Comunicar equipe sobre o desligamento",
            itens: []
          }
        ]
      }
    ]
  },
  // GRUPO 4 - GESTÃO ESTRATÉGICA (VTO)
  {
    id: "4.1",
    titulo: "VTO: DEFINIÇÃO DE VALORES",
    icon: Heart,
    cor: "bg-pink-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO PARA DEFINIR VALORES",
        etapas: [
          {
            numero: 1,
            titulo: "Reunir lideranças ou gestores chave",
            itens: []
          },
          {
            numero: 2,
            titulo: "Levantar comportamentos esperados na cultura",
            itens: []
          },
          {
            numero: 3,
            titulo: "Identificar valores já praticados na operação",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — CRIAÇÃO DOS VALORES",
        etapas: [
          {
            numero: 4,
            titulo: "Listar comportamentos essenciais",
            itens: [
              "Pontualidade",
              "Disciplina",
              "Respeito",
              "Entrega acima do combinado"
            ]
          },
          {
            numero: 5,
            titulo: "Transformar comportamentos em valores escritos",
            itens: [
              "Objetivos",
              "Claros",
              "Curtos"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — VALIDAÇÃO",
        etapas: [
          {
            numero: 6,
            titulo: "Conferir se os valores representam a cultura real",
            checklist: [
              "Todos entendem o significado?",
              "São aplicáveis no dia a dia?",
              "São mensuráveis?"
            ]
          },
          {
            numero: 7,
            titulo: "Algum valor está genérico ou irrelevante?",
            decisao: {
              seSim: [
                "Ajustar texto",
                "Tornar prático"
              ],
              seNao: [
                "Avançar"
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
            titulo: "Comunicar valores à equipe",
            itens: [
              "Reunião",
              "Cartazes",
              "Manuais"
            ]
          },
          {
            numero: 9,
            titulo: "Treinar time para aplicação dos valores",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 10,
            titulo: "Inserir valores no VTO oficial",
            itens: []
          },
          {
            numero: 11,
            titulo: "Revisar anualmente",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "4.2",
    titulo: "VTO: CENÁRIO FUTURO / PROPÓSITO / DIFERENCIAL",
    icon: Compass,
    cor: "bg-violet-600",
    blocos: [
      {
        titulo: "BLOCO 1 — DEFINIÇÃO DO PROPÓSITO",
        etapas: [
          {
            numero: 1,
            titulo: "Alinhar propósito da empresa",
            itens: [
              "Missão",
              "Razão da existência",
              "Qual impacto entrega?"
            ]
          },
          {
            numero: 2,
            titulo: "Registrar propósito em frase clara e objetiva",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — DEFINIÇÃO DO CENÁRIO FUTURO",
        etapas: [
          {
            numero: 3,
            titulo: "Identificar como a empresa quer estar em 5 anos",
            itens: [
              "Quantas unidades?",
              "Qual faturamento?",
              "Quais produtos?",
              "Qual presença de mercado?"
            ]
          },
          {
            numero: 4,
            titulo: "Descrever cenário futuro de forma visual",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — DEFINIÇÃO DO DIFERENCIAL",
        etapas: [
          {
            numero: 5,
            titulo: "Levantar pontos fortes da empresa",
            itens: [
              "Qualidade",
              "Velocidade",
              "Marca",
              "Processo"
            ]
          },
          {
            numero: 6,
            titulo: "Validar o que realmente diferencia da concorrência",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 4 — VALIDAÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Os três blocos estão claros e coerentes?",
            checklist: [
              "Propósito prático?",
              "Cenário futuro realista?",
              "Diferencial verdadeiro?"
            ]
          },
          {
            numero: 8,
            titulo: "Há incoerência entre desejo e capacidade atual?",
            decisao: {
              seSim: [
                "Ajustar metas",
                "Reescrever texto"
              ],
              seNao: [
                "Prosseguir"
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
            titulo: "Arquivar no VTO oficial",
            itens: []
          },
          {
            numero: 10,
            titulo: "Apresentar para toda equipe",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "4.3",
    titulo: "VTO: METAS ANUAIS",
    icon: Flag,
    cor: "bg-amber-600",
    blocos: [
      {
        titulo: "BLOCO 1 — DEFINIÇÃO DAS METAS PRINCIPAIS",
        etapas: [
          {
            numero: 1,
            titulo: "Avaliar histórico do último ano",
            itens: []
          },
          {
            numero: 2,
            titulo: "Escolher metas prioritárias",
            itens: [
              "Faturamento",
              "Lucro",
              "Expansão",
              "Redução de custos"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — CRIAÇÃO DAS METAS",
        etapas: [
          {
            numero: 3,
            titulo: "Transformar metas em formato SMART",
            itens: [
              "Específica",
              "Mensurável",
              "Alcançável",
              "Relevante",
              "Temporal"
            ]
          },
          {
            numero: 4,
            titulo: "Definir responsáveis por cada meta",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — VALIDAÇÃO DAS METAS",
        etapas: [
          {
            numero: 5,
            titulo: "As metas são realistas?",
            checklist: [
              "Dados reais usados?",
              "Recursos existem?",
              "Prazo viável?"
            ]
          },
          {
            numero: 6,
            titulo: "O time concorda com as metas?",
            decisao: {
              seNao: [
                "Ajustar metas",
                "Nova validação"
              ],
              seSim: [
                "Avançar"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — IMPLEMENTAÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Inserir metas no painel oficial",
            itens: []
          },
          {
            numero: 8,
            titulo: "Comunicar metas para toda equipe",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 9,
            titulo: "Revisão trimestral obrigatória",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "4.4",
    titulo: "VTO: METAS TRIMESTRAIS (ROCKS)",
    icon: Rocket,
    cor: "bg-rose-600",
    blocos: [
      {
        titulo: "BLOCO 1 — DEFINIÇÃO DOS ROCKS",
        etapas: [
          {
            numero: 1,
            titulo: "Selecionar 3 a 7 metas essenciais para os próximos 90 dias",
            itens: []
          },
          {
            numero: 2,
            titulo: "Definir impacto direto no anual",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — DESDOBRAMENTO",
        etapas: [
          {
            numero: 3,
            titulo: "Transformar cada Rock em ações práticas",
            itens: [
              "O que deve ser feito?",
              "Por quem?",
              "Até quando?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — RESPONSABILIZAÇÃO",
        etapas: [
          {
            numero: 4,
            titulo: "Atribuir responsáveis por cada ação",
            itens: []
          },
          {
            numero: 5,
            titulo: "Registrar no painel oficial de metas",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 4 — ACOMPANHAMENTO SEMANAL",
        etapas: [
          {
            numero: 6,
            titulo: "Realizar reunião semanal de status",
            itens: []
          },
          {
            numero: 7,
            titulo: "O Rock está evoluindo?",
            decisao: {
              seNao: [
                "Ajustar ações",
                "Reforçar responsáveis",
                "Identificar bloqueios"
              ],
              seSim: [
                "Continuar execução"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Revisão após 90 dias",
            itens: []
          },
          {
            numero: 9,
            titulo: "Classificar como:",
            itens: [
              "Concluído",
              "Parcial",
              "Não concluído"
            ]
          },
          {
            numero: 10,
            titulo: "Atualizar painel anual do VTO",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "4.5",
    titulo: "QUADRO DE RESPONSABILIDADES",
    icon: LayoutGrid,
    cor: "bg-slate-600",
    blocos: [
      {
        titulo: "BLOCO 1 — MAPEAMENTO DAS FUNÇÕES",
        etapas: [
          {
            numero: 1,
            titulo: "Levantar todas as funções da operação",
            itens: [
              "Cozinha",
              "Estoque",
              "Delivery",
              "Financeiro",
              "Atendimento",
              "Gestão"
            ]
          },
          {
            numero: 2,
            titulo: "Identificar responsabilidades essenciais para cada função",
            itens: [
              "Tarefas diárias",
              "Tarefas semanais",
              "Tarefas mensais"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — DEFINIÇÃO DOS RESPONSÁVEIS",
        etapas: [
          {
            numero: 3,
            titulo: "Atribuir um titular para cada responsabilidade",
            itens: [
              "Nome",
              "Cargo",
              "Turno"
            ]
          },
          {
            numero: 4,
            titulo: "Definir substitutos quando o responsável estiver ausente",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — ORGANIZAÇÃO DO QUADRO",
        etapas: [
          {
            numero: 5,
            titulo: "Criar tabela com colunas:",
            itens: [
              "Atividade",
              "Responsável",
              "Frequência",
              "Horário",
              "Indicador de conclusão"
            ]
          },
          {
            numero: 6,
            titulo: "Verificar se todas as atividades da operação foram mapeadas",
            checklist: [
              "Nenhuma tarefa ficou sem responsável?",
              "Frequências definidas?",
              "Turnos alinhados?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — VALIDAÇÃO E ALINHAMENTO",
        etapas: [
          {
            numero: 7,
            titulo: "Reunir a equipe para explicar o quadro",
            itens: [
              "Quem faz o quê",
              "Quando faz",
              "Como reporta"
            ]
          },
          {
            numero: 8,
            titulo: "Existe conflito de responsabilidade?",
            decisao: {
              seSim: [
                "Redistribuir tarefas",
                "Ajustar carga de trabalho"
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
            titulo: "Fixar o quadro visível na área operacional",
            itens: []
          },
          {
            numero: 10,
            titulo: "Revisar mensalmente e atualizar mudanças",
            itens: []
          }
        ]
      }
    ]
  },
  // GRUPO 5 - PRODUÇÃO E COZINHA
  {
    id: "5.1",
    titulo: "RECEITUÁRIO",
    icon: BookOpen,
    cor: "bg-amber-500",
    blocos: [
      {
        titulo: "BLOCO 1 — LEVANTAMENTO DE RECEITAS",
        etapas: [
          {
            numero: 1,
            titulo: "Listar todos os itens produzidos na cozinha",
            itens: [
              "Massas",
              "Molhos",
              "Recheios",
              "Insumos preparados"
            ]
          },
          {
            numero: 2,
            titulo: "Identificar receitas base e receitas derivadas",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — PADRONIZAÇÃO DAS RECEITAS",
        etapas: [
          {
            numero: 3,
            titulo: "Registrar ingredientes exatos de cada receita",
            itens: [
              "Nome",
              "Quantidade",
              "Unidade de medida"
            ]
          },
          {
            numero: 4,
            titulo: "Definir tempo de preparo de cada receita",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — TESTE E VALIDAÇÃO",
        etapas: [
          {
            numero: 5,
            titulo: "Executar receita conforme descrita",
            itens: []
          },
          {
            numero: 6,
            titulo: "Validar resultado final",
            checklist: [
              "Textura correta?",
              "Sabor padronizado?",
              "Cor e aparência estável?"
            ]
          },
          {
            numero: 7,
            titulo: "A receita está consistente e replicável?",
            decisao: {
              seNao: [
                "Ajustar ingredientes",
                "Ajustar proporções",
                "Retestar até padronizar"
              ],
              seSim: [
                "Aprovar receita"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — DOCUMENTAÇÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Criar ficha de receita com:",
            itens: [
              "Ingredientes",
              "Quantidades",
              "Rendimento",
              "Prazo de validade",
              "Armazenamento"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 9,
            titulo: "Treinar equipe",
            itens: []
          },
          {
            numero: 10,
            titulo: "Arquivar receita no setor de cozinha",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "5.2",
    titulo: "PLANILHA DE PRODUÇÃO",
    icon: FileSpreadsheet,
    cor: "bg-teal-600",
    blocos: [
      {
        titulo: "BLOCO 1 — PLANEJAMENTO DA PRODUÇÃO",
        etapas: [
          {
            numero: 1,
            titulo: "Levantar previsões de venda do dia",
            itens: []
          },
          {
            numero: 2,
            titulo: "Identificar insumos que precisam ser produzidos",
            itens: [
              "Massas",
              "Molhos",
              "Recheios",
              "Cortes"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — DEFINIÇÃO DAS QUANTIDADES",
        etapas: [
          {
            numero: 3,
            titulo: "Basear produção no giro histórico",
            itens: []
          },
          {
            numero: 4,
            titulo: "Definir quantidade ideal para o turno",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — REGISTRO NA PLANILHA",
        etapas: [
          {
            numero: 5,
            titulo: "Preencher planilha com colunas:",
            itens: [
              "Item",
              "Quantidade a produzir",
              "Quantidade produzida",
              "Responsável",
              "Horário"
            ]
          },
          {
            numero: 6,
            titulo: "Verificar coerência das quantidades",
            checklist: [
              "Quantidade suficiente?",
              "Sem exagero?",
              "Sem risco de faltar?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — EXECUÇÃO DA PRODUÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Orientar equipe a produzir conforme planilha",
            itens: []
          },
          {
            numero: 8,
            titulo: "Conferir produção finalizada",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 9,
            titulo: "Salvar planilha do dia",
            itens: []
          },
          {
            numero: 10,
            titulo: "Enviar relatório para o gestor",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "5.3",
    titulo: "MISE EN PLACE DAS PRAÇAS",
    icon: Utensils,
    cor: "bg-orange-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO",
        etapas: [
          {
            numero: 1,
            titulo: "Conferir planilha de produção e fichas técnicas",
            itens: []
          },
          {
            numero: 2,
            titulo: "Separar insumos necessários para turno",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ORGANIZAÇÃO DA PRAÇA",
        etapas: [
          {
            numero: 3,
            titulo: "Montar estação conforme padrão:",
            itens: [
              "Ingredientes nas cubas",
              "Gramaturas corretas",
              "Utensílios limpos",
              "Etiquetas de validade"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — VERIFICAÇÃO DE QUALIDADE",
        etapas: [
          {
            numero: 4,
            titulo: "Conferir qualidade dos insumos",
            checklist: [
              "Frescor?",
              "Cor adequada?",
              "Odor normal?",
              "Temperatura correta?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — AJUSTES",
        etapas: [
          {
            numero: 5,
            titulo: "Algum insumo está fora do padrão?",
            decisao: {
              seSim: [
                "Descartar",
                "Repor com insumo válido",
                "Registrar ocorrência"
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
            numero: 6,
            titulo: "Registrar mise en place concluída",
            itens: []
          },
          {
            numero: 7,
            titulo: "Comunicar líder da cozinha",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "5.4",
    titulo: "FICHA DE FINALIZAÇÃO",
    icon: ChefHat,
    cor: "bg-red-500",
    blocos: [
      {
        titulo: "BLOCO 1 — MONTAGEM DO PADRÃO FINAL",
        etapas: [
          {
            numero: 1,
            titulo: "Definir padrão visual do produto pronto",
            itens: [
              "Cor",
              "Textura",
              "Altura",
              "Quantidade de cobertura"
            ]
          },
          {
            numero: 2,
            titulo: "Registrar gramaturas de finalização",
            itens: [
              "Quantidade de queijo",
              "Quantidade de molho",
              "Quantidade de recheio adicional"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — CRIAÇÃO DA FICHA",
        etapas: [
          {
            numero: 3,
            titulo: "Criar ficha com:",
            itens: [
              "Foto do produto final",
              "Gramaturas",
              "Passo a passo da montagem final",
              "Correções de padrão"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — TREINAMENTO",
        etapas: [
          {
            numero: 4,
            titulo: "Treinar equipe na finalização",
            itens: []
          },
          {
            numero: 5,
            titulo: "Validar execução do padrão",
            checklist: [
              "Visual igual ao modelo?",
              "Quantidade correta?",
              "Produto aquecido corretamente?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — AJUSTES",
        etapas: [
          {
            numero: 6,
            titulo: "Há divergência na entrega final?",
            decisao: {
              seSim: [
                "Ajustar gramatura",
                "Reforçar padrão",
                "Retreinar equipe"
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
            numero: 7,
            titulo: "Fixar ficha de finalização na praça",
            itens: []
          },
          {
            numero: 8,
            titulo: "Revisar mensalmente",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "5.5",
    titulo: "ROTINAS DE LIMPEZA",
    icon: Sparkles,
    cor: "bg-cyan-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO E MATERIAIS",
        etapas: [
          {
            numero: 1,
            titulo: "Conferir materiais de limpeza disponíveis",
            itens: [
              "Detergente",
              "Sanitizante",
              "Panos",
              "Esponjas",
              "Escovas"
            ]
          },
          {
            numero: 2,
            titulo: "Identificar áreas de limpeza obrigatória",
            itens: [
              "Cozinha",
              "Praças",
              "Estoque",
              "Banheiros",
              "Salão (se houver)"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — EXECUÇÃO DAS LIMPEZAS DIÁRIAS",
        etapas: [
          {
            numero: 3,
            titulo: "Executar limpeza imediata em áreas críticas",
            itens: [
              "Pias",
              "Bancadas",
              "Cubas",
              "Fornos",
              "Utensílios"
            ]
          },
          {
            numero: 4,
            titulo: "Registrar limpeza concluída no checklist diário",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — LIMPEZA PROFUNDA SEMANAL",
        etapas: [
          {
            numero: 5,
            titulo: "Realizar higienização completa de equipamentos",
            itens: [
              "Geladeiras",
              "Freezers",
              "Exaustores",
              "Mesas de inox"
            ]
          },
          {
            numero: 6,
            titulo: "Conferir se limpeza profunda foi concluída",
            checklist: [
              "Equipamentos higienizados?",
              "Sem resíduos acumulados?",
              "Paredes limpas?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — ACOMPANHAMENTO",
        etapas: [
          {
            numero: 7,
            titulo: "Avaliar se padrão de limpeza está adequado",
            decisao: {
              seNao: [
                "Refazer limpeza",
                "Treinar equipe novamente"
              ],
              seSim: [
                "Manter rotina"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Registrar limpeza semanal e diária",
            itens: []
          },
          {
            numero: 9,
            titulo: "Comunicar gestor sobre pendências",
            itens: []
          }
        ]
      }
    ]
  },
  // GRUPO 6 - GESTÃO OPERACIONAL
  {
    id: "6.1",
    titulo: "GESTÃO DA ESCALA DOS FUNCIONÁRIOS",
    icon: CalendarDays,
    cor: "bg-blue-600",
    blocos: [
      {
        titulo: "BLOCO 1 — PLANEJAMENTO DA ESCALA",
        etapas: [
          {
            numero: 1,
            titulo: "Levantar necessidade operacional da semana",
            itens: [
              "Picos de movimento",
              "Dias de maior demanda",
              "Baixas previstas"
            ]
          },
          {
            numero: 2,
            titulo: "Identificar disponibilidade dos colaboradores",
            itens: [
              "Folgas",
              "Turnos",
              "Preferências"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — CRIAÇÃO DA ESCALA",
        etapas: [
          {
            numero: 3,
            titulo: "Montar escala equilibrada",
            itens: [
              "Ninguém sobrecarregado",
              "Cobertura total da operação"
            ]
          },
          {
            numero: 4,
            titulo: "Conferir conflitos ou horários descobertos",
            checklist: [
              "Turnos completos?",
              "Folgas respeitadas?",
              "Funções distribuídas?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — APROVAÇÃO",
        etapas: [
          {
            numero: 5,
            titulo: "Enviar escala para o gestor validar",
            itens: []
          },
          {
            numero: 6,
            titulo: "A escala foi aprovada?",
            decisao: {
              seNao: [
                "Ajustar",
                "Reenviar"
              ],
              seSim: [
                "Avançar"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — COMUNICAÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Enviar escala para a equipe",
            itens: [
              "WhatsApp",
              "Mural interno"
            ]
          },
          {
            numero: 8,
            titulo: "Solicitar confirmação dos colaboradores",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 9,
            titulo: "Registrar escala oficial da semana",
            itens: []
          },
          {
            numero: 10,
            titulo: "Arquivar escala para controle mensal",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "6.2",
    titulo: "REUNIÃO NOTA 10",
    icon: MessageSquare,
    cor: "bg-violet-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO",
        etapas: [
          {
            numero: 1,
            titulo: "Definir pauta da reunião",
            itens: [
              "Indicadores",
              "Problemas da semana",
              "Melhorias",
              "Ponto positivo"
            ]
          },
          {
            numero: 2,
            titulo: "Separar dados e relatórios para apresentação",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ABERTURA DA REUNIÃO",
        etapas: [
          {
            numero: 3,
            titulo: "Começar reunião com resumo do período",
            itens: []
          },
          {
            numero: 4,
            titulo: "Agradecer pontos positivos da equipe",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — DISCUSSÃO OPERACIONAL",
        etapas: [
          {
            numero: 5,
            titulo: "Apresentar indicadores principais",
            itens: [
              "CMV",
              "Faturamento",
              "Reclamações"
            ]
          },
          {
            numero: 6,
            titulo: "Levantar problemas da semana",
            itens: [
              "Quebras",
              "Erros de produção",
              "Atrasos"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — DEFINIÇÃO DE AÇÕES",
        etapas: [
          {
            numero: 7,
            titulo: "Criar lista de ações para corrigir problemas",
            itens: [
              "Responsável por ação",
              "Prazo",
              "Critério de sucesso"
            ]
          },
          {
            numero: 8,
            titulo: "Alguma ação ficou sem responsável?",
            decisao: {
              seSim: [
                "Definir responsável imediatamente"
              ],
              seNao: [
                "Continuar"
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
            titulo: "Registrar ata da reunião",
            itens: []
          },
          {
            numero: 10,
            titulo: "Enviar resumo ao gestor",
            itens: []
          },
          {
            numero: 11,
            titulo: "Verificar execução na reunião seguinte",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "6.3",
    titulo: "CHECKLISTS OPERACIONAIS",
    icon: ListChecks,
    cor: "bg-emerald-500",
    blocos: [
      {
        titulo: "BLOCO 1 — ESTRUTURAÇÃO DO CHECKLIST",
        etapas: [
          {
            numero: 1,
            titulo: "Identificar rotinas críticas do turno",
            itens: [
              "Abertura",
              "Operação",
              "Fechamento"
            ]
          },
          {
            numero: 2,
            titulo: "Criar checklist com atividades essenciais",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — EXECUÇÃO DO CHECKLIST",
        etapas: [
          {
            numero: 3,
            titulo: "O responsável deve preencher checklist diariamente",
            itens: [
              "Itens concluídos",
              "Itens pendentes"
            ]
          },
          {
            numero: 4,
            titulo: "Conferir se checklist foi preenchido corretamente",
            checklist: [
              "Horário preenchido?",
              "Nome do responsável?",
              "Todos itens marcados?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — ANÁLISE DE PENDÊNCIAS",
        etapas: [
          {
            numero: 5,
            titulo: "Há itens pendentes?",
            decisao: {
              seSim: [
                "Corrigir antes do final do turno",
                "Registrar motivo da pendência"
              ],
              seNao: [
                "Avançar"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — VALIDAÇÃO DO GESTOR",
        etapas: [
          {
            numero: 6,
            titulo: "Gestor valida checklist no final do dia",
            itens: [
              "Marcar como aprovado"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Arquivar checklist diário",
            itens: []
          },
          {
            numero: 8,
            titulo: "Atualizar painel de rotina",
            itens: []
          }
        ]
      }
    ]
  },
  // GRUPO 7 - ATENDIMENTO
  {
    id: "7.1",
    titulo: "GESTÃO DA LISTA DE ESPERA",
    icon: Clock,
    cor: "bg-pink-600",
    blocos: [
      {
        titulo: "BLOCO 1 — INÍCIO DO ATENDIMENTO",
        etapas: [
          {
            numero: 1,
            titulo: "Criar lista de espera oficial do dia",
            itens: [
              "Sistema",
              "Caderno",
              "Tablet"
            ]
          },
          {
            numero: 2,
            titulo: "Registrar nome e quantidade de pessoas",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ORGANIZAÇÃO DA LISTA",
        etapas: [
          {
            numero: 3,
            titulo: "Informar tempo estimado de espera",
            itens: []
          },
          {
            numero: 4,
            titulo: "Acompanhar tempo real x tempo informado",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — CONTROLE DA ORDEM",
        etapas: [
          {
            numero: 5,
            titulo: "Chamar clientes na ordem correta",
            itens: []
          },
          {
            numero: 6,
            titulo: "Registrar quando o cliente entrou no salão",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 4 — TRATAMENTO DE OCORRÊNCIAS",
        etapas: [
          {
            numero: 7,
            titulo: "Cliente reclamou da demora?",
            decisao: {
              seSim: [
                "Checar tempo real",
                "Atualizar previsão",
                "Oferecer atenção e desculpa"
              ],
              seNao: [
                "Continuar fluxo"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Fechar lista de espera ao final do turno",
            itens: []
          },
          {
            numero: 9,
            titulo: "Registrar volume de espera para indicadores",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "7.2",
    titulo: "ATENDIMENTO NO BALCÃO",
    icon: Store,
    cor: "bg-indigo-600",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO DO BALCÃO",
        etapas: [
          {
            numero: 1,
            titulo: "Garantir que o balcão esteja limpo e organizado",
            itens: [
              "Sem resíduos",
              "Sem objetos pessoais",
              "Área visualmente atrativa"
            ]
          },
          {
            numero: 2,
            titulo: "Conferir sistema de pedidos e equipamentos",
            itens: [
              "Caixa funcionando",
              "Impressora ativa",
              "Comandas disponíveis"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — RECEBIMENTO DO CLIENTE",
        etapas: [
          {
            numero: 3,
            titulo: "Receber o cliente com saudação padrão",
            itens: [
              "Boa noite, seja bem-vindo!"
            ]
          },
          {
            numero: 4,
            titulo: "Identificar necessidade do cliente",
            itens: [
              "Retirada?",
              "Novo pedido?",
              "Dúvidas?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — REGISTRO DO PEDIDO",
        etapas: [
          {
            numero: 5,
            titulo: "Registrar pedido no sistema corretamente",
            itens: [
              "Sabores",
              "Observações",
              "Quantidade",
              "Borda / adicionais"
            ]
          },
          {
            numero: 6,
            titulo: "Repetir pedido para o cliente validar",
            checklist: [
              "Pedido correto?",
              "Observações registradas?",
              "Forma de pagamento informada?"
            ]
          },
          {
            numero: 7,
            titulo: "Algum ponto está incorreto?",
            decisao: {
              seSim: [
                "Corrigir imediatamente"
              ],
              seNao: [
                "Prosseguir"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — PAGAMENTO E ENTREGA",
        etapas: [
          {
            numero: 8,
            titulo: "Confirmar forma de pagamento",
            itens: [
              "PIX",
              "Cartão",
              "Dinheiro"
            ]
          },
          {
            numero: 9,
            titulo: "Entregar comanda/recibo ao cliente",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 10,
            titulo: "Agradecer atendimento",
            itens: [
              "Obrigado, seu pedido está sendo preparado!"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "7.3",
    titulo: "ATENDIMENTO NA MESA",
    icon: UtensilsCrossed,
    cor: "bg-amber-600",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO DO SALÃO",
        etapas: [
          {
            numero: 1,
            titulo: "Conferir limpeza e organização das mesas",
            itens: []
          },
          {
            numero: 2,
            titulo: "Verificar talheres, guardanapos e cardápios",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — RECEPÇÃO DOS CLIENTES",
        etapas: [
          {
            numero: 3,
            titulo: "Cumprimentar e encaminhar à mesa",
            itens: []
          },
          {
            numero: 4,
            titulo: "Entregar cardápio e informar tempo médio de preparo",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — ANOTAÇÃO DO PEDIDO",
        etapas: [
          {
            numero: 5,
            titulo: "Anotar pedido com clareza",
            itens: [
              "Sabores",
              "Adicionais",
              "Observações"
            ]
          },
          {
            numero: 6,
            titulo: "Repetir pedido para o cliente validar",
            checklist: [
              "Pedido completo?",
              "Dúvidas esclarecidas?",
              "Observações registradas?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — ACOMPANHAMENTO DO CLIENTE",
        etapas: [
          {
            numero: 7,
            titulo: "Conferir satisfação durante a refeição",
            itens: [
              "Perguntar se está tudo certo",
              "Repor bebidas quando necessário"
            ]
          },
          {
            numero: 8,
            titulo: "Houve problema com o pedido?",
            decisao: {
              seSim: [
                "Resolver imediatamente",
                "Acionar gerente"
              ],
              seNao: [
                "Continuar atendimento"
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
            titulo: "Levar nota fiscal à mesa (se aplicável)",
            itens: []
          },
          {
            numero: 10,
            titulo: "Agradecer e convidar para retornar",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "7.4",
    titulo: "PREPARO E CONFERÊNCIA DO PEDIDO",
    icon: ClipboardCheck,
    cor: "bg-teal-500",
    blocos: [
      {
        titulo: "BLOCO 1 — RECEBIMENTO DO PEDIDO PELO SISTEMA",
        etapas: [
          {
            numero: 1,
            titulo: "Acompanhar entrada de pedidos na tela da cozinha",
            itens: []
          },
          {
            numero: 2,
            titulo: "Conferir observações antes de iniciar preparo",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — EXECUÇÃO DO PREPARO",
        etapas: [
          {
            numero: 3,
            titulo: "Seguir ficha técnica e gramaturas",
            itens: []
          },
          {
            numero: 4,
            titulo: "Garantir padrão visual e sabor",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — CONFERÊNCIA FINAL",
        etapas: [
          {
            numero: 5,
            titulo: "Conferir o pedido com o comprovante do sistema",
            checklist: [
              "Sabores corretos?",
              "Bordas e adicionais?",
              "Embalagem correta?",
              "Sem erros de produção?"
            ]
          },
          {
            numero: 6,
            titulo: "Existe alguma divergência?",
            decisao: {
              seSim: [
                "Refazer antes de enviar"
              ],
              seNao: [
                "Avançar para despacho"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — EMBALAGEM",
        etapas: [
          {
            numero: 7,
            titulo: "Embalar produto conforme padrão",
            itens: [
              "Caixa limpa",
              "Fechamento correto",
              "Etiqueta quando necessário"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Enviar pedido para despacho (garçom ou motoboy)",
            itens: []
          },
          {
            numero: 9,
            titulo: "Registrar conclusão no sistema",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "7.5",
    titulo: "DESPACHO DOS PEDIDOS PARA O GARÇOM",
    icon: Send,
    cor: "bg-blue-500",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO DO DESPACHO",
        etapas: [
          {
            numero: 1,
            titulo: "Conferir status do pedido na tela",
            itens: []
          },
          {
            numero: 2,
            titulo: "Garantir que o pedido está completo antes de entregar ao garçom",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ENTREGA AO GARÇOM",
        etapas: [
          {
            numero: 3,
            titulo: "Chamar garçom responsável pela mesa",
            itens: []
          },
          {
            numero: 4,
            titulo: "Entregar pedido com instruções",
            itens: [
              "Mesa correta",
              "Observações especiais"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — CHECAGEM RÁPIDA",
        etapas: [
          {
            numero: 5,
            titulo: "Conferir novamente a comanda da mesa",
            checklist: [
              "Produto correto?",
              "Adicionais conferidos?",
              "Bebidas incluídas?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — AJUSTES",
        etapas: [
          {
            numero: 6,
            titulo: "Pedido está incorreto?",
            decisao: {
              seSim: [
                "Recolher e corrigir",
                "Priorizar refação"
              ],
              seNao: [
                "Liberar entrega"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Atualizar sistema com status 'Pedido Entregue ao Garçom'",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "7.6",
    titulo: "ENTREGA DO PEDIDO NA MESA",
    icon: HandPlatter,
    cor: "bg-emerald-600",
    blocos: [
      {
        titulo: "BLOCO 1 — DESLOCAMENTO ATÉ A MESA",
        etapas: [
          {
            numero: 1,
            titulo: "Conferir mesa correta pela comanda",
            itens: []
          },
          {
            numero: 2,
            titulo: "Transportar pedido com cuidado",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ENTREGA AO CLIENTE",
        etapas: [
          {
            numero: 3,
            titulo: "Entregar pedido de forma cordial",
            itens: [
              "Aqui está sua pizza, bom apetite!"
            ]
          },
          {
            numero: 4,
            titulo: "Conferir reação imediata do cliente",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — VALIDAÇÃO DE QUALIDADE",
        etapas: [
          {
            numero: 5,
            titulo: "Perguntar se precisam de algo mais",
            itens: [
              "Talheres",
              "Guardanapos",
              "Molhos"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — AJUSTES",
        etapas: [
          {
            numero: 6,
            titulo: "Cliente encontrou algum problema?",
            decisao: {
              seSim: [
                "Resolver imediatamente",
                "Acionar cozinha ou gestor"
              ],
              seNao: [
                "Prosseguir"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Atualizar sistema com status 'Pedido Entregue'",
            itens: []
          },
          {
            numero: 8,
            titulo: "Acompanhar satisfação ao longo da refeição",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "7.7",
    titulo: "GESTÃO DE CRISES NO ATENDIMENTO",
    icon: ShieldAlert,
    cor: "bg-red-600",
    blocos: [
      {
        titulo: "BLOCO 1 — IDENTIFICAÇÃO DA CRISE",
        etapas: [
          {
            numero: 1,
            titulo: "Identificar o tipo de crise:",
            itens: [
              "Atraso no pedido",
              "Pedido errado",
              "Produto fora do padrão",
              "Cliente irritado",
              "Problema com pagamento"
            ]
          },
          {
            numero: 2,
            titulo: "Classificar urgência da crise:",
            itens: [
              "Baixa",
              "Média",
              "Alta"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ABORDAGEM INICIAL",
        etapas: [
          {
            numero: 3,
            titulo: "Ouvir o cliente sem interrupção",
            itens: []
          },
          {
            numero: 4,
            titulo: "Registrar exatamente o que aconteceu",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — TOMADA DE AÇÃO",
        etapas: [
          {
            numero: 5,
            titulo: "A crise envolve erro da empresa?",
            decisao: {
              seSim: [
                "Pedir desculpas",
                "Resolver imediatamente",
                "Oferecer solução clara (refazer, devolver valor, bônus)"
              ],
              seNao: [
                "Explicar situação com cordialidade",
                "Orientar cliente com calma"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — EXECUÇÃO DA SOLUÇÃO",
        etapas: [
          {
            numero: 6,
            titulo: "Tomar providência conforme tipo de crise:",
            itens: [
              "Pedido errado → refação imediata",
              "Atraso → verificar posição real da entrega",
              "Produto ruim → enviar novo produto",
              "Confusão no pagamento → corrigir no sistema"
            ]
          },
          {
            numero: 7,
            titulo: "Informar cliente sobre o que será feito e prazo real",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Registrar o ocorrido para análise semanal",
            itens: []
          },
          {
            numero: 9,
            titulo: "Agradecer cliente pela compreensão",
            itens: []
          },
          {
            numero: 10,
            titulo: "Notificar gestor sobre crises graves",
            itens: []
          }
        ]
      }
    ]
  },
  // GRUPO 8 - DELIVERY
  {
    id: "8.1",
    titulo: "ATENDIMENTO DELIVERY – WHATSAPP",
    icon: MessageCircle,
    cor: "bg-green-500",
    blocos: [
      {
        titulo: "BLOCO 1 — ABERTURA DO ATENDIMENTO",
        etapas: [
          {
            numero: 1,
            titulo: "Responder o cliente imediatamente",
            itens: [
              "Olá! Seja bem-vindo(a)! Como posso ajudar?"
            ]
          },
          {
            numero: 2,
            titulo: "Perguntar CEP e número para checar área de entrega",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — APRESENTAÇÃO DO CARDÁPIO",
        etapas: [
          {
            numero: 3,
            titulo: "Enviar cardápio atualizado",
            itens: [
              "PDF",
              "Link do menu",
              "Lista de sabores"
            ]
          },
          {
            numero: 4,
            titulo: "Perguntar o que deseja pedir",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — REGISTRO DO PEDIDO",
        etapas: [
          {
            numero: 5,
            titulo: "Anotar pedido corretamente:",
            itens: [
              "Sabores",
              "Borda",
              "Observações",
              "Bebidas"
            ]
          },
          {
            numero: 6,
            titulo: "Repetir tudo para o cliente validar",
            checklist: [
              "Sabores certos?",
              "Adicionais?",
              "Endereço completo?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — PAGAMENTO",
        etapas: [
          {
            numero: 7,
            titulo: "Perguntar forma de pagamento",
            itens: [
              "PIX",
              "Cartão",
              "Dinheiro"
            ]
          },
          {
            numero: 8,
            titulo: "Enviar chave PIX ou confirmar máquina",
            itens: []
          },
          {
            numero: 9,
            titulo: "Confirmar comprovante (no caso de PIX)",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 10,
            titulo: "Informar tempo de entrega real",
            itens: []
          },
          {
            numero: 11,
            titulo: "Agradecer e registrar pedido no sistema",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "8.2",
    titulo: "ATENDIMENTO DELIVERY – SITE PRÓPRIO",
    icon: Globe,
    cor: "bg-blue-600",
    blocos: [
      {
        titulo: "BLOCO 1 — MONITORAMENTO DO SISTEMA",
        etapas: [
          {
            numero: 1,
            titulo: "Manter tela do site aberta para acompanhar pedidos",
            itens: []
          },
          {
            numero: 2,
            titulo: "Conferir se notificações estão funcionando",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — RECEBIMENTO DO PEDIDO",
        etapas: [
          {
            numero: 3,
            titulo: "Validar informações recebidas:",
            itens: [
              "Nome",
              "Telefone",
              "Endereço",
              "Itens do pedido"
            ]
          },
          {
            numero: 4,
            titulo: "Conferir forma de pagamento selecionada",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — CONFIRMAÇÃO COM O CLIENTE",
        etapas: [
          {
            numero: 5,
            titulo: "Entrar em contato se houver dúvidas ou incoerências",
            checklist: [
              "Endereço válido?",
              "Bairro dentro da área de entrega?",
              "Pedido legível?"
            ]
          },
          {
            numero: 6,
            titulo: "Há inconsistência?",
            decisao: {
              seSim: [
                "Corrigir com cliente antes de produzir"
              ],
              seNao: [
                "Avançar"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — LIBERAÇÃO DO PEDIDO",
        etapas: [
          {
            numero: 7,
            titulo: "Enviar pedido para cozinha",
            itens: []
          },
          {
            numero: 8,
            titulo: "Atualizar status no sistema ('Em preparo')",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 9,
            titulo: "Atualizar status 'Saiu para entrega'",
            itens: []
          },
          {
            numero: 10,
            titulo: "Finalizar pedido no sistema",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "8.3",
    titulo: "ATENDIMENTO DELIVERY – IFOOD",
    icon: Smartphone,
    cor: "bg-red-500",
    blocos: [
      {
        titulo: "BLOCO 1 — MONITORAMENTO DO PAINEL",
        etapas: [
          {
            numero: 1,
            titulo: "Manter painel do iFood sempre aberto",
            itens: []
          },
          {
            numero: 2,
            titulo: "Ativar alertas sonoros ou notificações",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ACEITAÇÃO DO PEDIDO",
        etapas: [
          {
            numero: 3,
            titulo: "Conferir informações antes de aceitar",
            itens: [
              "Endereço",
              "Itens",
              "Observações"
            ]
          },
          {
            numero: 4,
            titulo: "Pedido está dentro do padrão?",
            decisao: {
              seNao: [
                "Cancelar com justificativa adequada"
              ],
              seSim: [
                "Aceitar pedido"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 3 — PREPARAÇÃO DO PEDIDO",
        etapas: [
          {
            numero: 5,
            titulo: "Enviar automaticamente para a cozinha",
            itens: []
          },
          {
            numero: 6,
            titulo: "Conferir preparo conforme ficha técnica",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 4 — DESPACHO",
        etapas: [
          {
            numero: 7,
            titulo: "Acompanhar chegada do entregador",
            itens: []
          },
          {
            numero: 8,
            titulo: "Verificar dados do pedido antes de entregar",
            checklist: [
              "Correto para aquele entregador?",
              "Embalagem fechada?",
              "Bebidas incluídas?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 9,
            titulo: "Atualizar status no iFood",
            itens: [
              "Pronto",
              "Saiu para entrega"
            ]
          },
          {
            numero: 10,
            titulo: "Registrar ocorrências no painel do iFood",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "8.4",
    titulo: "PREPARO E CONFERÊNCIA – DELIVERY",
    icon: Bike,
    cor: "bg-orange-600",
    blocos: [
      {
        titulo: "BLOCO 1 — RECEBIMENTO DO PEDIDO",
        etapas: [
          {
            numero: 1,
            titulo: "Conferir pedido no sistema de delivery",
            itens: []
          },
          {
            numero: 2,
            titulo: "Validar observações (retirar ingredientes, borda etc.)",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — PREPARO CONFORME FICHA TÉCNICA",
        etapas: [
          {
            numero: 3,
            titulo: "Executar pedido com gramaturas exatas",
            itens: []
          },
          {
            numero: 4,
            titulo: "Conferir padrão antes de embalar",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — CONFERÊNCIA FINAL",
        etapas: [
          {
            numero: 5,
            titulo: "Revisar pedido antes de enviar",
            checklist: [
              "Sabores certos?",
              "Endereço correto impresso?",
              "Bebidas e adicionais incluídos?",
              "Etiqueta OK?"
            ]
          },
          {
            numero: 6,
            titulo: "Alguma divergência encontrada?",
            decisao: {
              seSim: [
                "Corrigir imediatamente"
              ],
              seNao: [
                "Embalar"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — EMBALAGEM",
        etapas: [
          {
            numero: 7,
            titulo: "Embalar de forma segura",
            itens: [
              "Caixa alinhada",
              "Sem vazamentos",
              "Pacote reforçado"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Entregar pedido ao motoboy",
            itens: []
          },
          {
            numero: 9,
            titulo: "Registrar saída no sistema",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "8.5",
    titulo: "ENTREGA DO PEDIDO – MOTOBOY",
    icon: Navigation,
    cor: "bg-violet-600",
    blocos: [
      {
        titulo: "BLOCO 1 — RETIRADA DO PEDIDO NA LOJA",
        etapas: [
          {
            numero: 1,
            titulo: "Motoboy confirma dados do pedido",
            itens: [
              "Nome do cliente",
              "Endereço",
              "Número do pedido"
            ]
          },
          {
            numero: 2,
            titulo: "Conferir integridade da embalagem",
            itens: [
              "Caixa fechada",
              "Bebidas separadas",
              "Sem vazamentos"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ORGANIZAÇÃO DA ENTREGA",
        etapas: [
          {
            numero: 3,
            titulo: "Posicionar pedido corretamente na bag",
            itens: [
              "Evitar tombar",
              "Manter quente",
              "Organizar bebidas na lateral"
            ]
          },
          {
            numero: 4,
            titulo: "Confirmar rota mais rápida no GPS",
            itens: [
              "Conferir bairro",
              "Conferir referência"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — ENTREGA AO CLIENTE",
        etapas: [
          {
            numero: 5,
            titulo: "Confirmar nome do cliente ao chegar",
            itens: []
          },
          {
            numero: 6,
            titulo: "Entregar pedido com cordialidade",
            itens: [
              "Boa noite! Seu pedido chegou!"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — PAGAMENTO (quando necessário)",
        etapas: [
          {
            numero: 7,
            titulo: "Conferir pagamento:",
            itens: [
              "PIX",
              "Troco",
              "Cartão"
            ]
          },
          {
            numero: 8,
            titulo: "Pagamento não realizado?",
            decisao: {
              seSim: [
                "Acionar loja imediatamente",
                "Resolver antes de sair do local"
              ],
              seNao: [
                "Continuar"
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
            titulo: "Registrar entrega no sistema (iFood, site, WhatsApp)",
            itens: []
          },
          {
            numero: 10,
            titulo: "Retornar para a loja ou próximo pedido",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "8.6",
    titulo: "FINALIZAÇÃO DO PEDIDO",
    icon: ClipboardCheck,
    cor: "bg-sky-600",
    blocos: [
      {
        titulo: "BLOCO 1 — CONFIRMAÇÃO DA ENTREGA",
        etapas: [
          {
            numero: 1,
            titulo: "Verificar no sistema se o motoboy marcou como entregue",
            itens: []
          },
          {
            numero: 2,
            titulo: "Caso não marcado, entrar em contato com o entregador",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — CHECAGEM DE PROBLEMAS",
        etapas: [
          {
            numero: 3,
            titulo: "Perguntar ao motoboy se houve algum imprevisto",
            itens: [
              "Endereço incorreto",
              "Ausência do cliente",
              "Recusa do pedido"
            ]
          },
          {
            numero: 4,
            titulo: "Houve algum problema na entrega?",
            decisao: {
              seSim: [
                "Registrar ocorrido",
                "Acionar pós-venda"
              ],
              seNao: [
                "Finalizar pedido"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 3 — FINALIZAÇÃO NO SISTEMA",
        etapas: [
          {
            numero: 5,
            titulo: "Marcar pedido como finalizado no painel",
            itens: [
              "iFood",
              "Site",
              "Sistema interno"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — INDICADORES",
        etapas: [
          {
            numero: 6,
            titulo: "Atualizar painel de entregas:",
            itens: [
              "Tempo total",
              "Entregador responsável",
              "Ocorrências"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Enviar pedido para etapa de pós-venda",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "8.7",
    titulo: "PÓS-VENDA",
    icon: PhoneCall,
    cor: "bg-emerald-600",
    blocos: [
      {
        titulo: "BLOCO 1 — CONTATO APÓS ENTREGA",
        etapas: [
          {
            numero: 1,
            titulo: "Contatar cliente 15–25 minutos após recebimento",
            itens: [
              "Olá! Aqui é da [Nome da Pizzaria]. Gostaria de saber se seu pedido chegou certinho e se estava tudo do seu gosto!"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ANÁLISE DA RESPOSTA DO CLIENTE",
        etapas: [
          {
            numero: 2,
            titulo: "Cliente respondeu bem?",
            decisao: {
              seSim: [
                "Agradecer",
                "Convidar para avaliar no Google",
                "Oferecer cupom para próxima compra"
              ],
              seNao: [
                "Acionar imediatamente o processo de Gestão de Crises",
                "Registrar problema",
                "Resolver no mesmo momento"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 3 — REGISTRO DE SATISFAÇÃO",
        etapas: [
          {
            numero: 3,
            titulo: "Registrar feedback do cliente",
            itens: [
              "Ótimo",
              "Bom",
              "Regular",
              "Ruim"
            ]
          },
          {
            numero: 4,
            titulo: "Atualizar indicador semanal de satisfação",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 4 — AÇÕES DE FIDELIZAÇÃO",
        etapas: [
          {
            numero: 5,
            titulo: "Oferecer benefício quando apropriado",
            itens: [
              "Cupom",
              "Brinde",
              "Desconto especial"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 6,
            titulo: "Encerrar pós-venda no sistema",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "8.8",
    titulo: "FIDELIZAÇÃO",
    icon: Award,
    cor: "bg-amber-500",
    blocos: [
      {
        titulo: "BLOCO 1 — IDENTIFICAÇÃO DE CLIENTES RECORRENTES",
        etapas: [
          {
            numero: 1,
            titulo: "Consultar relatórios de clientes mais ativos",
            itens: [
              "Últimos 30 dias",
              "Compras recorrentes",
              "Ticket acima da média"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — CRIAÇÃO DE BENEFÍCIOS",
        etapas: [
          {
            numero: 2,
            titulo: "Criar campanhas de fidelização:",
            itens: [
              "Desconto progressivo",
              "Programa de pontos",
              "Promoções exclusivas"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — APLICAÇÃO DE BENEFÍCIOS",
        etapas: [
          {
            numero: 3,
            titulo: "Oferecer benefício personalizado",
            itens: [
              "Cliente VIP",
              "Obrigado por pedir conosco novamente!"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — ACOMPANHAMENTO",
        etapas: [
          {
            numero: 4,
            titulo: "Analisar impacto da fidelização",
            checklist: [
              "Clientes voltando mais?",
              "Ticket maior?",
              "Melhor avaliação?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 5,
            titulo: "Registrar clientes fidelizados no painel",
            itens: []
          },
          {
            numero: 6,
            titulo: "Revisar campanhas mensalmente",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "8.9",
    titulo: "PESQUISA DE SATISFAÇÃO",
    icon: Star,
    cor: "bg-pink-500",
    blocos: [
      {
        titulo: "BLOCO 1 — DEFINIÇÃO DA PESQUISA",
        etapas: [
          {
            numero: 1,
            titulo: "Criar formulário simples",
            itens: [
              "Nota de 1 a 5",
              "Comentário opcional",
              "Pergunta rápida sobre experiência"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ENVIO AO CLIENTE",
        etapas: [
          {
            numero: 2,
            titulo: "Enviar pesquisa após pós-venda",
            itens: []
          },
          {
            numero: 3,
            titulo: "Incentivar cliente a responder",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — COLETA DE RESPOSTAS",
        etapas: [
          {
            numero: 4,
            titulo: "Monitorar taxa de resposta",
            itens: []
          },
          {
            numero: 5,
            titulo: "Registrar todas avaliações recebidas",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 4 — ANÁLISE DOS RESULTADOS",
        etapas: [
          {
            numero: 6,
            titulo: "Calcular média de satisfação",
            checklist: [
              "Nota geral acima de 4?",
              "Muitos comentários negativos?",
              "Algum colaborador citado?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Criar plano de ação para problemas recorrentes",
            itens: []
          },
          {
            numero: 8,
            titulo: "Apresentar resultado na Reunião Nota 10",
            itens: []
          }
        ]
      }
    ]
  },
  // GRUPO 9 - GESTÃO E INDICADORES
  {
    id: "9.1",
    titulo: "INDICADORES SEMANAIS",
    icon: BarChart2,
    cor: "bg-blue-500",
    blocos: [
      {
        titulo: "BLOCO 1 — COLETA DE DADOS",
        etapas: [
          {
            numero: 1,
            titulo: "Reunir dados da semana:",
            itens: [
              "Faturamento",
              "Ticket médio",
              "CMV semanal",
              "Reclamações",
              "Tempo médio de entrega",
              "Quebras de estoque",
              "Absenteísmo da equipe"
            ]
          },
          {
            numero: 2,
            titulo: "Validar se todos os dados estão completos",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ATUALIZAÇÃO DO PAINEL",
        etapas: [
          {
            numero: 3,
            titulo: "Inserir dados no painel semanal",
            itens: []
          },
          {
            numero: 4,
            titulo: "Conferir se números estão coerentes com relatórios",
            checklist: [
              "Dados inseridos?",
              "Nenhum campo vazio?",
              "Relatórios conferidos?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — ANÁLISE",
        etapas: [
          {
            numero: 5,
            titulo: "Comparar semana atual com semana anterior",
            itens: []
          },
          {
            numero: 6,
            titulo: "Identificar crescimento ou queda",
            itens: []
          },
          {
            numero: 7,
            titulo: "Algum indicador está fora do padrão?",
            decisao: {
              seSim: [
                "Analisar causa",
                "Criar ação corretiva"
              ],
              seNao: [
                "Prosseguir"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — RELATÓRIO PARA GESTÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Gerar resumo semanal:",
            itens: [
              "Pontos positivos",
              "Pontos críticos",
              "Ações necessárias"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 9,
            titulo: "Enviar relatório para diretoria/gestor",
            itens: []
          },
          {
            numero: 10,
            titulo: "Salvar na pasta: Indicadores > Semana",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "9.2",
    titulo: "INDICADORES MENSAIS",
    icon: CalendarRange,
    cor: "bg-purple-600",
    blocos: [
      {
        titulo: "BLOCO 1 — COLETA DO MÊS",
        etapas: [
          {
            numero: 1,
            titulo: "Consolidar dados das 4 semanas:",
            itens: [
              "Faturamento total",
              "CMV geral",
              "Custo fixo",
              "Lucro",
              "NPS (satisfação)",
              "Reclamações",
              "Desempenho do time"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — ATUALIZAÇÃO DO PAINEL",
        etapas: [
          {
            numero: 2,
            titulo: "Atualizar painel mensal completo",
            itens: []
          },
          {
            numero: 3,
            titulo: "Validar cálculos automáticos",
            checklist: [
              "CMV calculado?",
              "Faturamento consolidado?",
              "Dados de pessoas completos?"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 3 — ANÁLISE MENSAL",
        etapas: [
          {
            numero: 4,
            titulo: "Comparar mês atual com meses anteriores",
            itens: []
          },
          {
            numero: 5,
            titulo: "Identificar tendências:",
            itens: [
              "Crescimento",
              "Queda",
              "Estabilidade"
            ]
          },
          {
            numero: 6,
            titulo: "Indicador fora do ideal?",
            decisao: {
              seSim: [
                "Registrar alerta",
                "Criar plano de ação"
              ],
              seNao: [
                "Confirmar estabilidade"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — RELATÓRIO EXECUTIVO",
        etapas: [
          {
            numero: 7,
            titulo: "Criar resumo mensal:",
            itens: [
              "Melhor semana",
              "Pior semana",
              "Maior gasto",
              "Melhor indicador",
              "Ponto mais crítico"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 8,
            titulo: "Enviar relatório mensal para diretoria",
            itens: []
          },
          {
            numero: 9,
            titulo: "Arquivar no histórico anual",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "9.3",
    titulo: "ANÁLISE DE RECLAMAÇÕES",
    icon: MessageSquareWarning,
    cor: "bg-red-500",
    blocos: [
      {
        titulo: "BLOCO 1 — COLETA DAS RECLAMAÇÕES",
        etapas: [
          {
            numero: 1,
            titulo: "Reunir todas as reclamações da semana/mês:",
            itens: [
              "WhatsApp",
              "Google",
              "iFood",
              "Pós-venda"
            ]
          },
          {
            numero: 2,
            titulo: "Classificar tipo de problema:",
            itens: [
              "Atraso",
              "Produto errado",
              "Produto frio",
              "Produto mal preparado",
              "Atendimento"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — AGRUPAMENTO E FREQUÊNCIA",
        etapas: [
          {
            numero: 3,
            titulo: "Contar quantidade de ocorrências por tipo",
            itens: []
          },
          {
            numero: 4,
            titulo: "Identificar categoria mais recorrente",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — ANÁLISE DA CAUSA",
        etapas: [
          {
            numero: 5,
            titulo: "Pergunta principal: Por que isso está acontecendo?",
            itens: []
          },
          {
            numero: 6,
            titulo: "Identificar falha em:",
            itens: [
              "Cozinha",
              "Atendimento",
              "Motoboy",
              "Estoque",
              "Sistematização"
            ]
          },
          {
            numero: 7,
            titulo: "É possível provar causa exata?",
            decisao: {
              seNao: [
                "Investigar mais dados",
                "Conversar com equipe"
              ],
              seSim: [
                "Criar ação para eliminar problema"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 4 — AÇÃO CORRETIVA",
        etapas: [
          {
            numero: 8,
            titulo: "Definir ação clara:",
            itens: [
              "Treinamento",
              "Ajuste de rota",
              "Refazer ficha técnica",
              "Reorganizar escala"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 9,
            titulo: "Registrar análise em relatório mensal",
            itens: []
          },
          {
            numero: 10,
            titulo: "Monitorar se reclamações diminuem",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "9.4",
    titulo: "MELHORIA CONTÍNUA",
    icon: RefreshCw,
    cor: "bg-emerald-500",
    blocos: [
      {
        titulo: "BLOCO 1 — IDENTIFICAÇÃO DO PONTO DE MELHORIA",
        etapas: [
          {
            numero: 1,
            titulo: "Levantar pontos fracos da semana",
            itens: [
              "Reclamações",
              "Atrasos",
              "Problemas internos",
              "Erros de operação"
            ]
          },
          {
            numero: 2,
            titulo: "Priorizar pontos mais urgentes",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 2 — DEFINIÇÃO DA AÇÃO",
        etapas: [
          {
            numero: 3,
            titulo: "Criar ação de melhoria:",
            itens: [
              "O que será feito?",
              "Quem fará?",
              "Prazo?"
            ]
          },
          {
            numero: 4,
            titulo: "Registrar ação no plano semanal",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — EXECUÇÃO",
        etapas: [
          {
            numero: 5,
            titulo: "Implementar ação definida",
            itens: [
              "Treinar",
              "Ajustar processo",
              "Reorganizar fluxo"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — AVALIAÇÃO",
        etapas: [
          {
            numero: 6,
            titulo: "A ação melhorou o indicador?",
            decisao: {
              seNao: [
                "Criar nova ação",
                "Revisar estratégia"
              ],
              seSim: [
                "Padronizar nova prática"
              ]
            }
          }
        ]
      },
      {
        titulo: "BLOCO 5 — FINALIZAÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Registrar melhoria concluída",
            itens: []
          },
          {
            numero: 8,
            titulo: "Atualizar manual operacional (se aplicável)",
            itens: []
          }
        ]
      }
    ]
  },
  {
    id: "9.5",
    titulo: "AUDITORIA INTERNA",
    icon: Search,
    cor: "bg-amber-600",
    blocos: [
      {
        titulo: "BLOCO 1 — PREPARAÇÃO DA AUDITORIA",
        etapas: [
          {
            numero: 1,
            titulo: "Definir escopo da auditoria:",
            itens: [
              "Cozinha",
              "Estoque",
              "Atendimento",
              "Delivery",
              "Higiene",
              "Financeiro"
            ]
          },
          {
            numero: 2,
            titulo: "Preparar checklist de auditoria",
            itens: [
              "Itens críticos",
              "Itens obrigatórios",
              "Itens de qualidade"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 2 — EXECUÇÃO DA AUDITORIA",
        etapas: [
          {
            numero: 3,
            titulo: "Auditor percorre setores verificando padrões",
            itens: []
          },
          {
            numero: 4,
            titulo: "Registrar evidências com fotos",
            itens: []
          },
          {
            numero: 5,
            titulo: "Atribuir notas por item",
            itens: []
          }
        ]
      },
      {
        titulo: "BLOCO 3 — CLASSIFICAÇÃO",
        etapas: [
          {
            numero: 6,
            titulo: "Calcular nota final da auditoria",
            itens: [
              "Abaixo de 70 = Crítico",
              "70 a 85 = Atenção",
              "85 a 100 = Excelente"
            ]
          }
        ]
      },
      {
        titulo: "BLOCO 4 — AÇÕES DE CORREÇÃO",
        etapas: [
          {
            numero: 7,
            titulo: "Itens não conformes precisam de ação imediata",
            checklist: [
              "Falta de padrão de limpeza?",
              "Estoque bagunçado?",
              "Ficha não seguida?",
              "Atendimento falho?"
            ]
          },
          {
            numero: 8,
            titulo: "Alguma não conformidade grave?",
            decisao: {
              seSim: [
                "Ação corretiva urgente",
                "Reauditoria em 7 dias"
              ],
              seNao: [
                "Corrigir dentro de 30 dias"
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
            titulo: "Registrar relatório final da auditoria",
            itens: []
          },
          {
            numero: 10,
            titulo: "Apresentar para a gestão",
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
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">📋 Detalhamento de Processos</h1>
          <p className="text-white/50">59 processos operacionais completos</p>
        </div>
        <Link to={createPageUrl("Dashboard")}>
          <Button variant="outline" className="border-white/10 text-white">
            <Home size={18} className="mr-2" /> Início
          </Button>
        </Link>
      </div>

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