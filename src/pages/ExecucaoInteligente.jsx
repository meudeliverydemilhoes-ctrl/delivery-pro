import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ClipboardList, Target, AlertTriangle, Trophy, BookOpen, Bell,
  Plus, Search, Filter, Download, RefreshCw, Zap, Users, FileText, Home
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import ChecklistCard from "@/components/execucao/ChecklistCard";
import PlanoAcaoCard from "@/components/execucao/PlanoAcaoCard";
import DashboardPerformance from "@/components/execucao/DashboardPerformance";
import SOPCard from "@/components/execucao/SOPCard";
import ComunicadosFeed from "@/components/execucao/ComunicadosFeed";
import RankingMentorados from "@/components/execucao/RankingMentorados";
import AssistenteIA from "@/components/execucao/AssistenteIA";

const pilarOptions = [
  { value: "processos", label: "🏆 Processos" },
  { value: "desempenho", label: "📈 Desempenho" },
  { value: "tempo_potencia", label: "⚡ Time de Potência" },
  { value: "norte_estrategico", label: "🎯 Norte Estratégico" },
  { value: "presenca_magnetica", label: "✨ Presença Magnética" },
  { value: "geral", label: "📋 Geral" }
];

const categoriaOptions = [
  { value: "diario", label: "Diário" },
  { value: "semanal", label: "Semanal" },
  { value: "mensal", label: "Mensal" },
  { value: "pontual", label: "Pontual" }
];

// Checklists prontos para usar - organizados por categoria
const checklistsProntos = {
  operacional: [
    {
      titulo: "Checklist de Abertura - Cozinha",
      descricao: "Rotina diária para abertura da cozinha",
      pilar: "processos",
      categoria: "diario",
      pontos_conclusao: 10,
      itens: [
        { texto: "Verificar temperatura das geladeiras e freezers", obrigatorio: true, requer_evidencia: true },
        { texto: "Higienizar bancadas e superfícies de trabalho", obrigatorio: true, requer_evidencia: false },
        { texto: "Verificar estoque de insumos do dia", obrigatorio: true, requer_evidencia: false },
        { texto: "Separar mise en place das praças", obrigatorio: true, requer_evidencia: false },
        { texto: "Verificar validade dos produtos", obrigatorio: true, requer_evidencia: true },
        { texto: "Conferir funcionamento dos equipamentos", obrigatorio: true, requer_evidencia: false },
        { texto: "Registrar temperaturas no controle", obrigatorio: true, requer_evidencia: true }
      ]
    },
    {
      titulo: "Checklist de Fechamento - Cozinha",
      descricao: "Rotina diária para fechamento da cozinha",
      pilar: "processos",
      categoria: "diario",
      pontos_conclusao: 10,
      itens: [
        { texto: "Guardar todos os alimentos corretamente", obrigatorio: true, requer_evidencia: false },
        { texto: "Datar e identificar produtos manipulados", obrigatorio: true, requer_evidencia: true },
        { texto: "Limpar e higienizar fogões e chapas", obrigatorio: true, requer_evidencia: false },
        { texto: "Descartar resíduos corretamente", obrigatorio: true, requer_evidencia: false },
        { texto: "Verificar se equipamentos estão desligados", obrigatorio: true, requer_evidencia: false },
        { texto: "Registrar temperatura final das geladeiras", obrigatorio: true, requer_evidencia: true }
      ]
    },
    {
      titulo: "Auditoria Semanal de Estoque",
      descricao: "Controle semanal de estoque e CMV",
      pilar: "desempenho",
      categoria: "semanal",
      pontos_conclusao: 20,
      itens: [
        { texto: "Realizar contagem física do estoque", obrigatorio: true, requer_evidencia: true },
        { texto: "Comparar estoque físico x sistema", obrigatorio: true, requer_evidencia: false },
        { texto: "Identificar produtos com baixo giro", obrigatorio: true, requer_evidencia: false },
        { texto: "Verificar produtos próximos do vencimento", obrigatorio: true, requer_evidencia: true },
        { texto: "Calcular CMV da semana", obrigatorio: true, requer_evidencia: true },
        { texto: "Analisar desperdícios e perdas", obrigatorio: true, requer_evidencia: false },
        { texto: "Registrar divergências encontradas", obrigatorio: true, requer_evidencia: false },
        { texto: "Planejar compras da próxima semana", obrigatorio: true, requer_evidencia: false }
      ]
    }
  ],
  marketing: [
    {
      titulo: "Checklist de Campanha iFood",
      descricao: "Planejamento e execução de promoções no iFood",
      pilar: "presenca_magnetica",
      categoria: "semanal",
      pontos_conclusao: 15,
      itens: [
        { texto: "Definir objetivo da campanha (vendas, novos clientes, ticket)", obrigatorio: true, requer_evidencia: false },
        { texto: "Selecionar produtos para promoção", obrigatorio: true, requer_evidencia: false },
        { texto: "Calcular desconto mantendo margem mínima", obrigatorio: true, requer_evidencia: true },
        { texto: "Configurar cupom/promoção no iFood", obrigatorio: true, requer_evidencia: true },
        { texto: "Criar post de divulgação nas redes", obrigatorio: true, requer_evidencia: true },
        { texto: "Acompanhar performance da campanha", obrigatorio: true, requer_evidencia: false },
        { texto: "Documentar resultados ao final", obrigatorio: true, requer_evidencia: true }
      ]
    },
    {
      titulo: "Calendário de Conteúdo Semanal",
      descricao: "Planejamento de posts para redes sociais",
      pilar: "presenca_magnetica",
      categoria: "semanal",
      pontos_conclusao: 15,
      itens: [
        { texto: "Definir tema da semana", obrigatorio: true, requer_evidencia: false },
        { texto: "Criar post de bastidores/equipe", obrigatorio: true, requer_evidencia: true },
        { texto: "Criar post de produto destaque", obrigatorio: true, requer_evidencia: true },
        { texto: "Criar post de promoção/oferta", obrigatorio: true, requer_evidencia: true },
        { texto: "Criar stories diários (mín. 3)", obrigatorio: true, requer_evidencia: false },
        { texto: "Responder comentários e DMs", obrigatorio: true, requer_evidencia: false },
        { texto: "Analisar métricas da semana anterior", obrigatorio: true, requer_evidencia: true }
      ]
    },
    {
      titulo: "Checklist de Atendimento - iFood",
      descricao: "Verificação diária da presença no iFood",
      pilar: "presenca_magnetica",
      categoria: "diario",
      pontos_conclusao: 10,
      itens: [
        { texto: "Verificar se a loja está online", obrigatorio: true, requer_evidencia: false },
        { texto: "Conferir horário de funcionamento", obrigatorio: true, requer_evidencia: false },
        { texto: "Verificar disponibilidade de todos os produtos", obrigatorio: true, requer_evidencia: false },
        { texto: "Responder avaliações pendentes", obrigatorio: true, requer_evidencia: true },
        { texto: "Verificar promoções ativas", obrigatorio: true, requer_evidencia: false },
        { texto: "Analisar tempo médio de entrega", obrigatorio: true, requer_evidencia: false }
      ]
    },
    {
      titulo: "Lançamento de Novo Produto",
      descricao: "Checklist para lançar produtos no cardápio",
      pilar: "presenca_magnetica",
      categoria: "pontual",
      pontos_conclusao: 25,
      itens: [
        { texto: "Criar ficha técnica completa", obrigatorio: true, requer_evidencia: true },
        { texto: "Definir preço com markup adequado", obrigatorio: true, requer_evidencia: true },
        { texto: "Produzir fotos profissionais", obrigatorio: true, requer_evidencia: true },
        { texto: "Escrever descrição atrativa", obrigatorio: true, requer_evidencia: false },
        { texto: "Cadastrar no iFood", obrigatorio: true, requer_evidencia: true },
        { texto: "Treinar equipe na produção", obrigatorio: true, requer_evidencia: false },
        { texto: "Criar campanha de lançamento", obrigatorio: true, requer_evidencia: true },
        { texto: "Coletar feedback dos primeiros pedidos", obrigatorio: true, requer_evidencia: false }
      ]
    }
  ],
  financeiro: [
    {
      titulo: "Fechamento Financeiro Diário",
      descricao: "Rotina diária de controle financeiro",
      pilar: "desempenho",
      categoria: "diario",
      pontos_conclusao: 10,
      itens: [
        { texto: "Registrar faturamento do dia", obrigatorio: true, requer_evidencia: true },
        { texto: "Conferir fechamento de caixa", obrigatorio: true, requer_evidencia: true },
        { texto: "Registrar vendas por canal (iFood, balcão, WhatsApp)", obrigatorio: true, requer_evidencia: false },
        { texto: "Anotar despesas do dia", obrigatorio: true, requer_evidencia: false },
        { texto: "Verificar recebíveis pendentes", obrigatorio: true, requer_evidencia: false },
        { texto: "Atualizar planilha de controle", obrigatorio: true, requer_evidencia: true }
      ]
    },
    {
      titulo: "DRE Simplificado Mensal",
      descricao: "Análise de resultado mensal do negócio",
      pilar: "desempenho",
      categoria: "mensal",
      pontos_conclusao: 30,
      itens: [
        { texto: "Calcular receita bruta total", obrigatorio: true, requer_evidencia: true },
        { texto: "Calcular CMV total do mês", obrigatorio: true, requer_evidencia: true },
        { texto: "Calcular lucro bruto", obrigatorio: true, requer_evidencia: false },
        { texto: "Listar todas as despesas fixas", obrigatorio: true, requer_evidencia: true },
        { texto: "Listar todas as despesas variáveis", obrigatorio: true, requer_evidencia: true },
        { texto: "Calcular resultado operacional", obrigatorio: true, requer_evidencia: false },
        { texto: "Comparar com mês anterior", obrigatorio: true, requer_evidencia: true },
        { texto: "Identificar oportunidades de redução", obrigatorio: true, requer_evidencia: false },
        { texto: "Definir metas financeiras próximo mês", obrigatorio: true, requer_evidencia: true }
      ]
    },
    {
      titulo: "Projeção de Fluxo de Caixa",
      descricao: "Planejamento financeiro para próximas semanas",
      pilar: "desempenho",
      categoria: "semanal",
      pontos_conclusao: 20,
      itens: [
        { texto: "Listar recebíveis previstos (próximos 30 dias)", obrigatorio: true, requer_evidencia: true },
        { texto: "Listar contas a pagar (próximos 30 dias)", obrigatorio: true, requer_evidencia: true },
        { texto: "Calcular saldo projetado", obrigatorio: true, requer_evidencia: false },
        { texto: "Identificar gaps de caixa", obrigatorio: true, requer_evidencia: false },
        { texto: "Planejar ações para cobrir gaps", obrigatorio: true, requer_evidencia: false },
        { texto: "Revisar prazos com fornecedores se necessário", obrigatorio: true, requer_evidencia: false },
        { texto: "Atualizar planilha de fluxo de caixa", obrigatorio: true, requer_evidencia: true }
      ]
    },
    {
      titulo: "Avaliação Mensal de Indicadores",
      descricao: "Análise mensal de performance do negócio",
      pilar: "desempenho",
      categoria: "mensal",
      pontos_conclusao: 30,
      itens: [
        { texto: "Calcular faturamento do mês", obrigatorio: true, requer_evidencia: true },
        { texto: "Analisar CMV médio mensal", obrigatorio: true, requer_evidencia: true },
        { texto: "Verificar ticket médio", obrigatorio: true, requer_evidencia: false },
        { texto: "Analisar quantidade de pedidos", obrigatorio: true, requer_evidencia: false },
        { texto: "Comparar com mês anterior", obrigatorio: true, requer_evidencia: true },
        { texto: "Identificar produtos mais vendidos", obrigatorio: true, requer_evidencia: false },
        { texto: "Analisar avaliações dos clientes", obrigatorio: true, requer_evidencia: false },
        { texto: "Definir metas para próximo mês", obrigatorio: true, requer_evidencia: true }
      ]
    }
  ],
  equipe: [
    {
      titulo: "Reunião de Alinhamento Semanal",
      descricao: "Checklist para condução da reunião semanal",
      pilar: "tempo_potencia",
      categoria: "semanal",
      pontos_conclusao: 15,
      itens: [
        { texto: "Apresentar resultados da semana anterior", obrigatorio: true, requer_evidencia: false },
        { texto: "Revisar metas e indicadores", obrigatorio: true, requer_evidencia: false },
        { texto: "Identificar problemas e gargalos", obrigatorio: true, requer_evidencia: false },
        { texto: "Definir prioridades da semana", obrigatorio: true, requer_evidencia: false },
        { texto: "Distribuir tarefas e responsáveis", obrigatorio: true, requer_evidencia: false },
        { texto: "Reconhecer destaques da equipe", obrigatorio: true, requer_evidencia: false },
        { texto: "Agendar próxima reunião", obrigatorio: true, requer_evidencia: false }
      ]
    },
    {
      titulo: "Avaliação de Desempenho Individual",
      descricao: "Avaliação mensal de colaboradores",
      pilar: "tempo_potencia",
      categoria: "mensal",
      pontos_conclusao: 20,
      itens: [
        { texto: "Avaliar pontualidade e assiduidade", obrigatorio: true, requer_evidencia: false },
        { texto: "Avaliar qualidade do trabalho", obrigatorio: true, requer_evidencia: false },
        { texto: "Avaliar trabalho em equipe", obrigatorio: true, requer_evidencia: false },
        { texto: "Avaliar cumprimento de metas", obrigatorio: true, requer_evidencia: true },
        { texto: "Avaliar proatividade e iniciativa", obrigatorio: true, requer_evidencia: false },
        { texto: "Dar feedback construtivo", obrigatorio: true, requer_evidencia: false },
        { texto: "Definir metas para próximo período", obrigatorio: true, requer_evidencia: true },
        { texto: "Identificar necessidades de treinamento", obrigatorio: true, requer_evidencia: false },
        { texto: "Registrar avaliação no prontuário", obrigatorio: true, requer_evidencia: true }
      ]
    },
    {
      titulo: "Onboarding de Novo Colaborador",
      descricao: "Integração completa de novos funcionários",
      pilar: "tempo_potencia",
      categoria: "pontual",
      pontos_conclusao: 25,
      itens: [
        { texto: "Apresentar empresa, missão e valores", obrigatorio: true, requer_evidencia: false },
        { texto: "Tour pela operação e apresentação da equipe", obrigatorio: true, requer_evidencia: false },
        { texto: "Entregar uniforme e EPIs", obrigatorio: true, requer_evidencia: true },
        { texto: "Explicar regras e regulamento interno", obrigatorio: true, requer_evidencia: false },
        { texto: "Treinar nos processos da função", obrigatorio: true, requer_evidencia: false },
        { texto: "Acompanhar período de experiência", obrigatorio: true, requer_evidencia: false },
        { texto: "Avaliar desempenho após 7 dias", obrigatorio: true, requer_evidencia: true },
        { texto: "Feedback e ajustes necessários", obrigatorio: true, requer_evidencia: false }
      ]
    },
    {
      titulo: "Plano de Treinamento Mensal",
      descricao: "Desenvolvimento contínuo da equipe",
      pilar: "tempo_potencia",
      categoria: "mensal",
      pontos_conclusao: 20,
      itens: [
        { texto: "Identificar gaps de conhecimento da equipe", obrigatorio: true, requer_evidencia: false },
        { texto: "Definir tema do treinamento do mês", obrigatorio: true, requer_evidencia: false },
        { texto: "Preparar material de treinamento", obrigatorio: true, requer_evidencia: true },
        { texto: "Agendar sessão de treinamento", obrigatorio: true, requer_evidencia: false },
        { texto: "Realizar treinamento com a equipe", obrigatorio: true, requer_evidencia: true },
        { texto: "Aplicar teste prático de aprendizado", obrigatorio: true, requer_evidencia: false },
        { texto: "Documentar participantes e resultados", obrigatorio: true, requer_evidencia: true }
      ]
    },
    {
      titulo: "Gestão de Escala Semanal",
      descricao: "Organização da escala de trabalho",
      pilar: "tempo_potencia",
      categoria: "semanal",
      pontos_conclusao: 10,
      itens: [
        { texto: "Verificar demanda prevista da semana", obrigatorio: true, requer_evidencia: false },
        { texto: "Conferir disponibilidade dos colaboradores", obrigatorio: true, requer_evidencia: false },
        { texto: "Montar escala equilibrada", obrigatorio: true, requer_evidencia: true },
        { texto: "Garantir cobertura em horários de pico", obrigatorio: true, requer_evidencia: false },
        { texto: "Comunicar escala com antecedência", obrigatorio: true, requer_evidencia: false },
        { texto: "Ter plano B para faltas", obrigatorio: true, requer_evidencia: false }
      ]
    }
  ]
};

// Planos de Ação prontos para usar
const planosAcaoProntos = [
  {
    titulo: "🔥 Plano de Redução de CMV",
    problema: "CMV acima do ideal (maior que 35%)",
    descricao: "Ações para reduzir o custo de mercadoria vendida",
    pilar: "desempenho",
    acoes: [
      { acao: "Revisar todas as fichas técnicas e atualizar custos", prazo: "3 dias", prioridade: "alta" },
      { acao: "Implementar uso obrigatório de balança na produção", prazo: "7 dias", prioridade: "critica" },
      { acao: "Fazer inventário semanal de estoque", prazo: "7 dias", prioridade: "alta" },
      { acao: "Identificar e eliminar desperdícios na cozinha", prazo: "14 dias", prioridade: "media" },
      { acao: "Renegociar preços com fornecedores principais", prazo: "14 dias", prioridade: "media" },
      { acao: "Revisar porcionamento dos produtos", prazo: "7 dias", prioridade: "alta" }
    ]
  },
  {
    titulo: "📈 Plano de Aumento de Faturamento",
    problema: "Faturamento estagnado ou em queda",
    descricao: "Estratégias para aumentar vendas e receita",
    pilar: "desempenho",
    acoes: [
      { acao: "Criar 3 combos estratégicos no iFood", prazo: "3 dias", prioridade: "alta" },
      { acao: "Ativar promoção de frete grátis em horários de baixo movimento", prazo: "7 dias", prioridade: "media" },
      { acao: "Implementar programa de fidelidade simples", prazo: "14 dias", prioridade: "media" },
      { acao: "Otimizar fotos e descrições do cardápio", prazo: "7 dias", prioridade: "alta" },
      { acao: "Criar campanha de recuperação de clientes inativos", prazo: "14 dias", prioridade: "media" },
      { acao: "Testar novos produtos com base nos mais vendidos", prazo: "21 dias", prioridade: "baixa" }
    ]
  },
  {
    titulo: "⏱️ Plano de Redução de Tempo de Entrega",
    problema: "Tempo de entrega acima de 45 minutos",
    descricao: "Ações para acelerar a operação e entrega",
    pilar: "processos",
    acoes: [
      { acao: "Mapear gargalos no fluxo de produção", prazo: "3 dias", prioridade: "critica" },
      { acao: "Reorganizar layout da cozinha para eficiência", prazo: "7 dias", prioridade: "alta" },
      { acao: "Implementar pré-preparo em horários de pico", prazo: "7 dias", prioridade: "alta" },
      { acao: "Treinar equipe para trabalho em paralelo", prazo: "14 dias", prioridade: "media" },
      { acao: "Otimizar rotas de entrega", prazo: "7 dias", prioridade: "media" },
      { acao: "Definir tempo máximo por etapa do pedido", prazo: "3 dias", prioridade: "alta" }
    ]
  },
  {
    titulo: "⭐ Plano de Melhoria de Avaliações",
    problema: "Nota abaixo de 4.5 no iFood",
    descricao: "Ações para melhorar a experiência do cliente",
    pilar: "presenca_magnetica",
    acoes: [
      { acao: "Analisar todas as avaliações negativas do último mês", prazo: "2 dias", prioridade: "critica" },
      { acao: "Criar checklist de qualidade antes do despacho", prazo: "3 dias", prioridade: "alta" },
      { acao: "Melhorar embalagem para evitar vazamentos", prazo: "7 dias", prioridade: "alta" },
      { acao: "Incluir bilhete personalizado nos pedidos", prazo: "3 dias", prioridade: "media" },
      { acao: "Responder 100% das avaliações (positivas e negativas)", prazo: "Diário", prioridade: "alta" },
      { acao: "Treinar equipe sobre padrão de montagem", prazo: "7 dias", prioridade: "alta" }
    ]
  },
  {
    titulo: "👥 Plano de Organização da Equipe",
    problema: "Equipe desorganizada ou sem produtividade",
    descricao: "Estruturar processos e responsabilidades da equipe",
    pilar: "tempo_potencia",
    acoes: [
      { acao: "Definir organograma e funções de cada cargo", prazo: "3 dias", prioridade: "critica" },
      { acao: "Criar escala de trabalho semanal", prazo: "3 dias", prioridade: "alta" },
      { acao: "Implementar reunião diária de 10 minutos", prazo: "7 dias", prioridade: "media" },
      { acao: "Criar checklist de tarefas por função", prazo: "7 dias", prioridade: "alta" },
      { acao: "Definir metas individuais e coletivas", prazo: "14 dias", prioridade: "media" },
      { acao: "Implementar sistema de feedback semanal", prazo: "14 dias", prioridade: "baixa" }
    ]
  },
  {
    titulo: "📱 Plano de Fortalecimento no iFood",
    problema: "Baixa visibilidade e conversão no iFood",
    descricao: "Melhorar presença e performance na plataforma",
    pilar: "presenca_magnetica",
    acoes: [
      { acao: "Atualizar todas as fotos do cardápio", prazo: "7 dias", prioridade: "alta" },
      { acao: "Reescrever descrições com gatilhos de venda", prazo: "5 dias", prioridade: "alta" },
      { acao: "Ativar Super Restaurante (se elegível)", prazo: "3 dias", prioridade: "media" },
      { acao: "Criar categoria de 'Mais Pedidos'", prazo: "2 dias", prioridade: "media" },
      { acao: "Configurar promoções recorrentes", prazo: "7 dias", prioridade: "alta" },
      { acao: "Analisar concorrentes e ajustar posicionamento", prazo: "7 dias", prioridade: "media" }
    ]
  }
];

// SOPs prontos para usar - organizados por categoria
const sopsProntos = {
  operacional: [
    {
      titulo: "Como Fazer a Ficha Técnica de um Produto",
      descricao: "Passo a passo para criar fichas técnicas padronizadas",
      pilar: "processos",
      categoria: "producao",
      conteudo: `## Objetivo\nPadronizar a produção e garantir consistência nos produtos.\n\n## Passo a Passo\n1. Listar todos os ingredientes\n2. Pesar cada ingrediente com balança\n3. Calcular o custo unitário\n4. Somar o custo total\n5. Definir rendimento\n6. Calcular custo por porção`,
      passos: [
        { ordem: 1, titulo: "Listar ingredientes", descricao: "Anote todos os ingredientes" },
        { ordem: 2, titulo: "Pesar ingredientes", descricao: "Use balança de precisão" },
        { ordem: 3, titulo: "Calcular custo", descricao: "Multiplique peso pelo custo/kg" },
        { ordem: 4, titulo: "Somar total", descricao: "Some todos os custos" },
        { ordem: 5, titulo: "Definir rendimento", descricao: "Quantas porções rende" },
        { ordem: 6, titulo: "Custo por porção", descricao: "Divida total pelas porções" }
      ]
    },
    {
      titulo: "Processo de Recebimento de Mercadorias",
      descricao: "Procedimento padrão para receber entregas",
      pilar: "processos",
      categoria: "estoque",
      conteudo: `## Objetivo\nGarantir produtos em conformidade.\n\n## Passos\n1. Conferir nota fiscal\n2. Verificar embalagens\n3. Verificar validade\n4. Verificar temperatura\n5. Pesar/contar\n6. Armazenar (FEFO)\n7. Registrar no sistema`,
      passos: [
        { ordem: 1, titulo: "Conferir NF", descricao: "Verificar dados e pedido" },
        { ordem: 2, titulo: "Verificar embalagens", descricao: "Checar integridade" },
        { ordem: 3, titulo: "Verificar validade", descricao: "Conferir datas" },
        { ordem: 4, titulo: "Verificar temperatura", descricao: "Medir refrigerados" },
        { ordem: 5, titulo: "Pesar/contar", descricao: "Conferir quantidades" },
        { ordem: 6, titulo: "Armazenar", descricao: "Seguir FEFO" }
      ]
    }
  ],
  marketing: [
    {
      titulo: "Como Otimizar o Cardápio no iFood",
      descricao: "Guia para melhorar performance no iFood",
      pilar: "presenca_magnetica",
      categoria: "marketing",
      conteudo: `## Objetivo\nAumentar conversão e ticket médio.\n\n## Áreas de Otimização\n- Fotos profissionais e atrativas\n- Descrições claras e vendedoras\n- Categorias organizadas logicamente\n- Preços competitivos\n- Combos estratégicos`,
      passos: [
        { ordem: 1, titulo: "Atualizar fotos", descricao: "Fotos profissionais" },
        { ordem: 2, titulo: "Revisar descrições", descricao: "Textos vendedores" },
        { ordem: 3, titulo: "Organizar categorias", descricao: "Ordem estratégica" },
        { ordem: 4, titulo: "Ajustar preços", descricao: "Análise competitiva" },
        { ordem: 5, titulo: "Criar combos", descricao: "Combos atrativos" }
      ]
    },
    {
      titulo: "Estratégia de Conteúdo para Redes Sociais",
      descricao: "Como criar conteúdo que engaja e vende",
      pilar: "presenca_magnetica",
      categoria: "marketing",
      conteudo: `## Tipos de Conteúdo\n\n### 1. Bastidores (30%)\n- Preparo dos pratos\n- Equipe trabalhando\n- Recebimento de ingredientes\n\n### 2. Produto (40%)\n- Fotos dos pratos\n- Vídeos de preparo\n- Close nos detalhes\n\n### 3. Promoções (20%)\n- Ofertas especiais\n- Combos\n- Cupons\n\n### 4. Interação (10%)\n- Enquetes\n- Perguntas\n- Depoimentos`,
      passos: [
        { ordem: 1, titulo: "Definir calendário", descricao: "Planejar semana" },
        { ordem: 2, titulo: "Criar conteúdo bastidores", descricao: "30% do conteúdo" },
        { ordem: 3, titulo: "Criar conteúdo produto", descricao: "40% do conteúdo" },
        { ordem: 4, titulo: "Criar promoções", descricao: "20% do conteúdo" },
        { ordem: 5, titulo: "Criar interações", descricao: "10% do conteúdo" }
      ]
    },
    {
      titulo: "Como Criar Campanhas de Promoção no iFood",
      descricao: "Guia completo para promoções efetivas",
      pilar: "presenca_magnetica",
      categoria: "marketing",
      conteudo: `## Tipos de Promoção\n\n### Cupom de Desconto\n- Porcentagem ou valor fixo\n- Primeira compra ou fidelização\n\n### Frete Grátis\n- Pedido mínimo\n- Horários específicos\n\n### Combo Promocional\n- Itens complementares\n- Preço especial\n\n## Dicas\n- Calcule sempre a margem\n- Defina período limitado\n- Divulgue nas redes`,
      passos: [
        { ordem: 1, titulo: "Definir objetivo", descricao: "Vendas, clientes ou ticket" },
        { ordem: 2, titulo: "Escolher tipo", descricao: "Cupom, frete ou combo" },
        { ordem: 3, titulo: "Calcular margem", descricao: "Garantir lucro mínimo" },
        { ordem: 4, titulo: "Configurar no iFood", descricao: "Ativar promoção" },
        { ordem: 5, titulo: "Divulgar", descricao: "Postar nas redes" }
      ]
    },
    {
      titulo: "Ideias de Posts para Redes Sociais",
      descricao: "Banco de ideias de conteúdo para delivery",
      pilar: "presenca_magnetica",
      categoria: "marketing",
      conteudo: `## Segunda-feira\n- "Começando a semana com..." + foto prato\n- Bastidores da preparação\n\n## Terça-feira\n- Terça da promoção\n- Combo especial\n\n## Quarta-feira\n- Ingrediente em destaque\n- Como é feito o prato X\n\n## Quinta-feira\n- Throwback de pratos antigos\n- Depoimento de cliente\n\n## Sexta-feira\n- "Sexta pede..." + prato indulgente\n- Promoção de fim de semana\n\n## Sábado\n- Família reunida\n- Combo família\n\n## Domingo\n- Preguiça + delivery\n- Promoção dominical`,
      passos: [
        { ordem: 1, titulo: "Escolher tema do dia", descricao: "Seguir calendário" },
        { ordem: 2, titulo: "Produzir conteúdo", descricao: "Foto ou vídeo" },
        { ordem: 3, titulo: "Escrever legenda", descricao: "Com CTA" },
        { ordem: 4, titulo: "Publicar", descricao: "Horário ideal" },
        { ordem: 5, titulo: "Responder", descricao: "Engajar comentários" }
      ]
    }
  ],
  financeiro: [
    {
      titulo: "Como Montar um DRE Simplificado",
      descricao: "Demonstrativo de Resultado para pequenos deliveries",
      pilar: "desempenho",
      categoria: "financeiro",
      conteudo: `## Estrutura do DRE\n\n### Receita Bruta\nTotal de vendas do período\n\n### (-) CMV\nCusto de Mercadoria Vendida\n\n### = Lucro Bruto\nReceita - CMV\n\n### (-) Despesas Operacionais\n- Aluguel\n- Salários\n- Energia\n- Marketing\n- Outros\n\n### = Resultado Operacional\nLucro Bruto - Despesas\n\n## Metas Ideais\n- CMV: máximo 35%\n- Despesas: máximo 40%\n- Lucro: mínimo 15%`,
      passos: [
        { ordem: 1, titulo: "Calcular receita bruta", descricao: "Somar todas as vendas" },
        { ordem: 2, titulo: "Calcular CMV", descricao: "Custo dos produtos vendidos" },
        { ordem: 3, titulo: "Calcular lucro bruto", descricao: "Receita - CMV" },
        { ordem: 4, titulo: "Listar despesas", descricao: "Todas as despesas fixas e variáveis" },
        { ordem: 5, titulo: "Calcular resultado", descricao: "Lucro bruto - despesas" }
      ]
    },
    {
      titulo: "Controle de Fluxo de Caixa",
      descricao: "Como projetar e controlar o caixa do negócio",
      pilar: "desempenho",
      categoria: "financeiro",
      conteudo: `## O que é\nPrevisão de entradas e saídas de dinheiro.\n\n## Por que fazer\n- Evitar surpresas\n- Planejar investimentos\n- Negociar prazos\n\n## Como fazer\n\n### 1. Listar Recebíveis\n- Vendas à vista\n- Cartões (prazo)\n- iFood (prazo)\n\n### 2. Listar Pagamentos\n- Fornecedores\n- Aluguel\n- Salários\n- Contas fixas\n\n### 3. Projetar Saldo\n- Saldo inicial + entradas - saídas\n\n### 4. Identificar Gaps\n- Dias com saldo negativo\n- Planejar ações`,
      passos: [
        { ordem: 1, titulo: "Mapear recebíveis", descricao: "Previsão de entradas" },
        { ordem: 2, titulo: "Mapear pagamentos", descricao: "Previsão de saídas" },
        { ordem: 3, titulo: "Projetar saldo", descricao: "Calcular saldo diário" },
        { ordem: 4, titulo: "Identificar gaps", descricao: "Encontrar problemas" },
        { ordem: 5, titulo: "Planejar ações", descricao: "Resolver gaps" }
      ]
    },
    {
      titulo: "Precificação com Markup",
      descricao: "Como calcular o preço de venda correto",
      pilar: "desempenho",
      categoria: "financeiro",
      conteudo: `## Fórmula do Markup\n\nMarkup = 100 / (100 - (CMV% + Despesas% + Lucro%))\n\n## Exemplo\nSe você quer:\n- CMV: 30%\n- Despesas: 40%\n- Lucro: 15%\n\nMarkup = 100 / (100 - 85) = 6,67\n\n## Aplicação\nCusto do produto: R$ 10,00\nPreço de venda = R$ 10,00 x 6,67 = R$ 66,70\n\n## Dicas\n- Arredonde para preços terminados em ,90\n- Compare com concorrência\n- Ajuste por produto se necessário`,
      passos: [
        { ordem: 1, titulo: "Calcular custo real", descricao: "Ficha técnica completa" },
        { ordem: 2, titulo: "Definir % desejados", descricao: "CMV, despesas, lucro" },
        { ordem: 3, titulo: "Calcular markup", descricao: "Aplicar fórmula" },
        { ordem: 4, titulo: "Calcular preço", descricao: "Custo x markup" },
        { ordem: 5, titulo: "Validar mercado", descricao: "Comparar concorrência" }
      ]
    }
  ],
  equipe: [
    {
      titulo: "Treinamento de Novos Colaboradores",
      descricao: "Processo de integração em 7 dias",
      pilar: "tempo_potencia",
      categoria: "equipe",
      conteudo: `## Cronograma\n\n### Dia 1 - Integração\n- Apresentar empresa e valores\n- Tour pela operação\n- Entregar uniforme/EPIs\n\n### Dias 2-3 - Observação\n- Acompanhar veterano\n- Conhecer processos\n- Estudar fichas técnicas\n\n### Dias 4-5 - Prática\n- Executar com supervisão\n- Tirar dúvidas\n- Receber feedback\n\n### Dias 6-7 - Autonomia\n- Executar sozinho\n- Avaliação inicial`,
      passos: [
        { ordem: 1, titulo: "Dia 1 - Integração", descricao: "Apresentar empresa" },
        { ordem: 2, titulo: "Dias 2-3 - Observação", descricao: "Acompanhar veterano" },
        { ordem: 3, titulo: "Dias 4-5 - Prática", descricao: "Executar supervisionado" },
        { ordem: 4, titulo: "Dias 6-7 - Autonomia", descricao: "Trabalhar independente" },
        { ordem: 5, titulo: "Avaliação", descricao: "Feedback final" }
      ]
    },
    {
      titulo: "Como Fazer Avaliação de Desempenho",
      descricao: "Modelo de avaliação para colaboradores",
      pilar: "tempo_potencia",
      categoria: "equipe",
      conteudo: `## Critérios de Avaliação (1-5)\n\n### Técnicos\n- Qualidade do trabalho\n- Conhecimento dos processos\n- Velocidade de execução\n- Uso correto de equipamentos\n\n### Comportamentais\n- Pontualidade\n- Trabalho em equipe\n- Proatividade\n- Comunicação\n\n### Resultados\n- Cumprimento de metas\n- Redução de erros\n- Satisfação do cliente\n\n## Estrutura da Conversa\n1. Pontos positivos\n2. Pontos de melhoria\n3. Metas para próximo período\n4. Perguntas do colaborador`,
      passos: [
        { ordem: 1, titulo: "Preparar dados", descricao: "Reunir informações do período" },
        { ordem: 2, titulo: "Avaliar critérios", descricao: "Pontuar cada item" },
        { ordem: 3, titulo: "Preparar feedback", descricao: "Pontos + e -" },
        { ordem: 4, titulo: "Conduzir conversa", descricao: "Reunião 1:1" },
        { ordem: 5, titulo: "Definir metas", descricao: "Próximos objetivos" },
        { ordem: 6, titulo: "Documentar", descricao: "Registrar avaliação" }
      ]
    },
    {
      titulo: "Plano de Treinamento Contínuo",
      descricao: "Como desenvolver a equipe continuamente",
      pilar: "tempo_potencia",
      categoria: "equipe",
      conteudo: `## Temas Sugeridos por Mês\n\n### Mês 1 - Processos\n- Fichas técnicas\n- Uso de balança\n- Padrão de montagem\n\n### Mês 2 - Atendimento\n- Padrão de atendimento\n- Resolução de problemas\n- Comunicação com cliente\n\n### Mês 3 - Qualidade\n- Higiene e segurança\n- Controle de temperatura\n- Apresentação dos pratos\n\n### Mês 4 - Eficiência\n- Redução de desperdício\n- Organização da praça\n- Trabalho em equipe\n\n## Formato\n- Duração: 30-60 min\n- Frequência: semanal ou quinzenal\n- Prática: sempre incluir`,
      passos: [
        { ordem: 1, titulo: "Identificar gaps", descricao: "O que precisa melhorar" },
        { ordem: 2, titulo: "Escolher tema", descricao: "Priorizar necessidades" },
        { ordem: 3, titulo: "Preparar material", descricao: "Slides, vídeos, práticas" },
        { ordem: 4, titulo: "Agendar sessão", descricao: "Horário com toda equipe" },
        { ordem: 5, titulo: "Realizar treinamento", descricao: "Teoria + prática" },
        { ordem: 6, titulo: "Avaliar aprendizado", descricao: "Teste ou observação" }
      ]
    },
    {
      titulo: "Gestão de Conflitos na Equipe",
      descricao: "Como resolver problemas entre colaboradores",
      pilar: "tempo_potencia",
      categoria: "equipe",
      conteudo: `## Sinais de Conflito\n- Comunicação reduzida\n- Fofocas\n- Queda de produtividade\n- Clima pesado\n\n## Passos para Resolver\n\n### 1. Identificar o problema\n- Ouvir as partes separadamente\n- Não tomar partido\n\n### 2. Mediar conversa\n- Reunir os envolvidos\n- Cada um expõe seu lado\n- Buscar acordo\n\n### 3. Definir solução\n- Compromissos mútuos\n- Prazos se necessário\n\n### 4. Acompanhar\n- Verificar evolução\n- Dar feedback\n\n## Prevenção\n- Comunicação clara\n- Regras definidas\n- Feedback constante`,
      passos: [
        { ordem: 1, titulo: "Identificar conflito", descricao: "Perceber os sinais" },
        { ordem: 2, titulo: "Ouvir partes", descricao: "Conversar individualmente" },
        { ordem: 3, titulo: "Mediar conversa", descricao: "Reunir envolvidos" },
        { ordem: 4, titulo: "Definir solução", descricao: "Acordo entre partes" },
        { ordem: 5, titulo: "Acompanhar", descricao: "Verificar evolução" }
      ]
    }
  ]
};

export default function ExecucaoInteligente() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("execucoes");
  const [search, setSearch] = useState("");
  const [pilarFilter, setPilarFilter] = useState("todos");
  const [mentoradoFilter, setMentoradoFilter] = useState("todos");
  
  // Dialogs
  const [checklistDialogOpen, setChecklistDialogOpen] = useState(false);
  const [sopDialogOpen, setSOPDialogOpen] = useState(false);
  const [comunicadoDialogOpen, setComunicadoDialogOpen] = useState(false);
  const [planoDialogOpen, setPlanoDialogOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState(null);
  const [planoExpandido, setPlanoExpandido] = useState(null);
  const [comentariosPlano, setComentariosPlano] = useState({});
  
  // Forms
  const [checklistForm, setChecklistForm] = useState({
    titulo: "", descricao: "", pilar: "processos", categoria: "diario", itens: [], pontos_conclusao: 10
  });
  const [novoItem, setNovoItem] = useState({ texto: "", obrigatorio: true, requer_evidencia: false, tipo_evidencia: "foto" });
  const [sopForm, setSOPForm] = useState({
    titulo: "", descricao: "", pilar: "processos", categoria: "operacional", conteudo: "", video_url: "", passos: []
  });
  const [comunicadoForm, setComunicadoForm] = useState({
    titulo: "", mensagem: "", tipo: "aviso", pilar: "geral", mentorado_id: "", requer_confirmacao: false
  });
  const [planoForm, setPlanoForm] = useState({
    problema: "", acao_corretiva: "", pilar: "geral", prioridade: "media", prazo: ""
  });


  // Queries
  const { data: checklists = [] } = useQuery({
    queryKey: ["checklists"],
    queryFn: () => base44.entities.ChecklistInteligente.list("-created_date")
  });

  const { data: execucoes = [] } = useQuery({
    queryKey: ["execucoes"],
    queryFn: () => base44.entities.ExecucaoChecklist.list("-created_date")
  });

  const { data: planosAcao = [] } = useQuery({
    queryKey: ["planosAcao"],
    queryFn: () => base44.entities.PlanoAcaoInteligente.list("-created_date")
  });

  const { data: sops = [] } = useQuery({
    queryKey: ["sops"],
    queryFn: () => base44.entities.SOPPlaybook.filter({ ativo: true }, "-created_date")
  });

  const { data: comunicados = [] } = useQuery({
    queryKey: ["comunicados"],
    queryFn: () => base44.entities.ComunicadoMentoria.list("-created_date")
  });

  const { data: mentorados = [] } = useQuery({
    queryKey: ["mentorados"],
    queryFn: () => base44.entities.Mentorado.filter({ status: "ativo" })
  });

  const { data: scores = [] } = useQuery({
    queryKey: ["scores"],
    queryFn: () => base44.entities.ScoreMentorado.list("-score_execucao")
  });

  // Mutations
  const createChecklistMutation = useMutation({
    mutationFn: (data) => base44.entities.ChecklistInteligente.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      setChecklistDialogOpen(false);
      setChecklistForm({ titulo: "", descricao: "", pilar: "processos", categoria: "diario", itens: [], pontos_conclusao: 10 });
    }
  });

  const createExecucaoMutation = useMutation({
    mutationFn: (data) => base44.entities.ExecucaoChecklist.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["execucoes"] });
      setActiveTab("execucoes");
    }
  });

  const createPlanoAcaoMutation = useMutation({
    mutationFn: (data) => base44.entities.PlanoAcaoInteligente.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planosAcao"] });
      setPlanoDialogOpen(false);
      setPlanoForm({ problema: "", acao_corretiva: "", pilar: "geral", prioridade: "media", prazo: "" });
    }
  });

  const updatePlanoAcaoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PlanoAcaoInteligente.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planosAcao"] });
      setPlanoDialogOpen(false);
      setEditingPlano(null);
      setPlanoForm({ problema: "", acao_corretiva: "", pilar: "geral", prioridade: "media", prazo: "" });
    }
  });

  const createSOPMutation = useMutation({
    mutationFn: (data) => base44.entities.SOPPlaybook.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setSOPDialogOpen(false);
      setSOPForm({ titulo: "", descricao: "", pilar: "processos", categoria: "operacional", conteudo: "", video_url: "", passos: [] });
    }
  });

  const createComunicadoMutation = useMutation({
    mutationFn: (data) => base44.entities.ComunicadoMentoria.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comunicados"] });
      setComunicadoDialogOpen(false);
      setComunicadoForm({ titulo: "", mensagem: "", tipo: "aviso", pilar: "geral", mentorado_id: "", requer_confirmacao: false });
    }
  });

  // Handlers
  const handleAddItem = () => {
    if (novoItem.texto.trim()) {
      setChecklistForm({
        ...checklistForm,
        itens: [...checklistForm.itens, { ...novoItem }]
      });
      setNovoItem({ texto: "", obrigatorio: true, requer_evidencia: false, tipo_evidencia: "foto" });
    }
  };

  const handleRemoveItem = (idx) => {
    setChecklistForm({
      ...checklistForm,
      itens: checklistForm.itens.filter((_, i) => i !== idx)
    });
  };

  const handleCreateChecklist = () => {
    if (checklistForm.titulo && checklistForm.itens.length > 0) {
      createChecklistMutation.mutate(checklistForm);
    }
  };



  const handleAplicarSOP = (sop) => {
    // Criar checklist baseado no SOP
    const checklistData = {
      titulo: `Checklist: ${sop.titulo}`,
      descricao: `Gerado automaticamente do SOP: ${sop.titulo}`,
      pilar: sop.pilar,
      categoria: "pontual",
      sop_vinculado: sop.id,
      itens: sop.passos?.map(p => ({
        texto: p.titulo,
        obrigatorio: true,
        requer_evidencia: false
      })) || [],
      pontos_conclusao: 15
    };
    createChecklistMutation.mutate(checklistData);
  };

  const handleCreatePlanoAcao = (data) => {
    createPlanoAcaoMutation.mutate({
      problema: data.problema || "Problema identificado",
      acao_corretiva: data.acao_corretiva || data.acao || "Ação necessária",
      pilar: data.pilar || "geral",
      prazo: data.prazo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      prioridade: data.prioridade || "media",
      status: "pendente"
    });
  };

  // Filtros
  const getMentoradoNome = (id) => mentorados.find(m => m.id === id)?.nome || "Desconhecido";

  const filteredExecucoes = execucoes.filter(e => {
    const matchSearch = e.titulo?.toLowerCase().includes(search.toLowerCase());
    const matchPilar = pilarFilter === "todos" || e.pilar === pilarFilter;
    const matchMentorado = mentoradoFilter === "todos" || e.mentorado_id === mentoradoFilter;
    return matchSearch && matchPilar && matchMentorado;
  });

  const filteredPlanos = planosAcao.filter(p => {
    const matchSearch = p.problema?.toLowerCase().includes(search.toLowerCase());
    const matchPilar = pilarFilter === "todos" || p.pilar === pilarFilter;
    const matchMentorado = mentoradoFilter === "todos" || p.mentorado_id === mentoradoFilter;
    return matchSearch && matchPilar && matchMentorado;
  });

  const pendentes = filteredExecucoes.filter(e => e.status !== "concluido");
  const concluidos = filteredExecucoes.filter(e => e.status === "concluido");

  return (
    <div className="max-w-7xl mx-auto" style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Zap className="text-[#FF4D00]" />
            Execução Inteligente
          </h1>
          <p className="text-white/50">Checklists, planos de ação e acompanhamento de performance</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("Dashboard")}>
            <Button className="bg-[#FF4D00] hover:bg-[#E64500] text-white">
              <Home size={18} className="mr-2" /> Voltar ao Início
            </Button>
          </Link>
          <Button onClick={() => setComunicadoDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap">
            <Bell size={18} className="mr-2" /> Comunicado
          </Button>
          <Button onClick={() => setSOPDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap">
            <BookOpen size={18} className="mr-2" /> Novo SOP
          </Button>
          <Button onClick={() => setChecklistDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
            <Plus size={18} className="mr-2" /> Novo Checklist
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Select value={pilarFilter} onValueChange={setPilarFilter}>
          <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Pilar" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="todos">Todos os Pilares</SelectItem>
            {pilarOptions.map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={mentoradoFilter} onValueChange={setMentoradoFilter}>
          <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Mentorado" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="todos">Todos</SelectItem>
            {mentorados.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 p-1 mb-6">
          <TabsTrigger value="execucoes" className="data-[state=active]:bg-[#FF4D00]">
            <ClipboardList size={16} className="mr-2" /> Execuções
          </TabsTrigger>
          <TabsTrigger value="modelos" className="data-[state=active]:bg-[#FF4D00]">
            <FileText size={16} className="mr-2" /> Modelos
          </TabsTrigger>
          <TabsTrigger value="planos-prontos" className="data-[state=active]:bg-[#FF4D00]">
            <Target size={16} className="mr-2" /> Planos de Ação
          </TabsTrigger>
          <TabsTrigger value="sops" className="data-[state=active]:bg-[#FF4D00]">
            <BookOpen size={16} className="mr-2" /> SOPs
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#FF4D00]">
            <Trophy size={16} className="mr-2" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="comunicados" className="data-[state=active]:bg-[#FF4D00]">
            <Bell size={16} className="mr-2" /> Comunicados
          </TabsTrigger>
        </TabsList>

        {/* Execuções */}
        <TabsContent value="execucoes">
          <div className="space-y-6">
            {pendentes.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Em Andamento ({pendentes.length})</h3>
                <div className="space-y-3">
                  {pendentes.map(exec => (
                    <ChecklistCard
                      key={exec.id}
                      execucao={exec}
                      onCreatePlanoAcao={handleCreatePlanoAcao}
                    />
                  ))}
                </div>
              </div>
            )}
            {concluidos.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white/60 mb-4">Concluídos ({concluidos.length})</h3>
                <div className="space-y-3 opacity-70">
                  {concluidos.slice(0, 5).map(exec => (
                    <ChecklistCard key={exec.id} execucao={exec} />
                  ))}
                </div>
              </div>
            )}
            {filteredExecucoes.length === 0 && (
              <div className="text-center py-12 bg-white/5 rounded-xl">
                <ClipboardList size={40} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/50">Nenhuma execução encontrada</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Modelos de Checklist */}
        <TabsContent value="modelos">
          <div className="space-y-8">
            {/* Checklists Criados */}
            {checklists.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Seus Modelos</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {checklists.map(checklist => (
                    <div key={checklist.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{pilarOptions.find(p => p.value === checklist.pilar)?.label?.charAt(0) || "📋"}</span>
                        <h4 className="font-medium text-white">{checklist.titulo}</h4>
                      </div>
                      <p className="text-sm text-white/50 mb-3">{checklist.descricao}</p>
                      <div className="flex items-center justify-between text-xs text-white/40 mb-3">
                        <span>{checklist.itens?.length || 0} itens</span>
                        <span>{checklist.categoria}</span>
                      </div>
                      <Button
                        onClick={() => {
                          createExecucaoMutation.mutate({
                            checklist_id: checklist.id,
                            titulo: checklist.titulo,
                            pilar: checklist.pilar,
                            categoria: checklist.categoria,
                            data_inicio: new Date().toISOString().split("T")[0],
                            status: "pendente",
                            itens: checklist.itens.map(item => ({
                              texto: item.texto,
                              concluido: false,
                              requer_evidencia: item.requer_evidencia
                            })),
                            progresso: 0
                          });
                        }}
                        className="w-full bg-[#FF4D00] hover:bg-[#E64500]"
                        size="sm"
                      >
                        Aplicar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checklists Prontos por Categoria */}
            {[
              { key: "operacional", label: "🏭 Operacional", desc: "Abertura, fechamento, estoque e rotinas" },
              { key: "marketing", label: "📱 Marketing", desc: "Campanhas, redes sociais e iFood" },
              { key: "financeiro", label: "💰 Financeiro", desc: "DRE, fluxo de caixa e indicadores" },
              { key: "equipe", label: "👥 Gestão de Equipe", desc: "Treinamento, avaliação e escalas" }
            ].map(cat => (
              <div key={cat.key}>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-white">{cat.label}</h3>
                  <span className="text-xs text-white/40">{checklistsProntos[cat.key]?.length || 0} modelos</span>
                </div>
                <p className="text-sm text-white/50 mb-4">{cat.desc}</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(checklistsProntos[cat.key] || []).map((checklist, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4 hover:border-[#FF4D00]/30 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{pilarOptions.find(p => p.value === checklist.pilar)?.label?.charAt(0) || "📋"}</span>
                        <h4 className="font-medium text-white text-sm">{checklist.titulo}</h4>
                      </div>
                      <p className="text-xs text-white/50 mb-3">{checklist.descricao}</p>
                      <div className="flex items-center justify-between text-xs text-white/40 mb-3">
                        <span>{checklist.itens?.length || 0} itens</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          checklist.categoria === "diario" ? "bg-blue-500/20 text-blue-400" :
                          checklist.categoria === "semanal" ? "bg-amber-500/20 text-amber-400" :
                          checklist.categoria === "mensal" ? "bg-violet-500/20 text-violet-400" :
                          "bg-pink-500/20 text-pink-400"
                        }`}>{checklist.categoria}</span>
                      </div>
                      <Button
                        onClick={() => {
                          // Criar execução diretamente
                          createExecucaoMutation.mutate({
                            checklist_id: checklist.id || `pronto_${idx}`,
                            titulo: checklist.titulo,
                            pilar: checklist.pilar,
                            categoria: checklist.categoria,
                            data_inicio: new Date().toISOString().split("T")[0],
                            status: "pendente",
                            itens: checklist.itens.map(item => ({
                              texto: item.texto,
                              concluido: false,
                              requer_evidencia: item.requer_evidencia
                            })),
                            progresso: 0
                          });
                        }}
                        className="w-full bg-[#FF4D00] hover:bg-[#E64500]"
                        size="sm"
                      >
                        <Plus size={14} className="mr-1" /> Aplicar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Planos de Ação */}
        <TabsContent value="planos-prontos">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Planos de Ação Prontos</h3>
              <p className="text-sm text-white/50 mb-6">Selecione, edite e adicione comentários antes de aplicar.</p>
              <div className="grid gap-6">
                {planosAcaoProntos.map((plano, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-white mb-2">{plano.titulo}</h4>
                          <p className="text-sm text-red-400/90 mb-2">❗ {plano.problema}</p>
                          <p className="text-sm text-white/60 mb-3">{plano.descricao}</p>
                          <span className={`inline-flex items-center text-xs px-3 py-1 rounded-full ${
                            plano.pilar === "processos" ? "bg-blue-500/20 text-blue-400" :
                            plano.pilar === "desempenho" ? "bg-emerald-500/20 text-emerald-400" :
                            plano.pilar === "tempo_potencia" ? "bg-violet-500/20 text-violet-400" :
                            "bg-pink-500/20 text-pink-400"
                          }`}>{pilarOptions.find(p => p.value === plano.pilar)?.label}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setPlanoExpandido(planoExpandido === idx ? null : idx)}
                            className="bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap"
                          >
                            {planoExpandido === idx ? "Ocultar" : "Expandir"}
                          </Button>
                          <Button
                            onClick={async () => {
                              for (const acao of plano.acoes) {
                                const prazoTexto = String(acao.prazo || "7 dias").toLowerCase();
                                let prazoData;
                                
                                if (prazoTexto.includes("diário") || prazoTexto.includes("diario")) {
                                  prazoData = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                                } else {
                                  const dias = parseInt(prazoTexto.match(/\d+/)?.[0]) || 7;
                                  prazoData = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                                }
                                
                                const comentario = comentariosPlano[`${idx}-${plano.acoes.indexOf(acao)}`] || "";
                                
                                await createPlanoAcaoMutation.mutateAsync({
                                  problema: plano.problema || "Problema identificado",
                                  acao_corretiva: acao.acao + (comentario ? `\n\nComentários: ${comentario}` : ""),
                                  pilar: plano.pilar || "geral",
                                  prioridade: acao.prioridade || "media",
                                  prazo: prazoData,
                                  status: "pendente"
                                });
                              }
                              setComentariosPlano({});
                              setPlanoExpandido(null);
                            }}
                            className="bg-[#FF4D00] hover:bg-[#E64500]"
                          >
                            <Target size={16} className="mr-2" /> Aplicar
                          </Button>
                        </div>
                      </div>
                      
                      {planoExpandido === idx && (
                        <div className="space-y-4 mt-4 border-t border-white/10 pt-4">
                          <h5 className="text-sm font-medium text-white/80 mb-3">Ações do Plano ({plano.acoes.length}):</h5>
                          {plano.acoes.map((acao, aIdx) => (
                            <div key={aIdx} className="p-4 bg-white/5 rounded-lg space-y-3">
                              <div className="flex items-start gap-3">
                                <span className={`mt-1 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                                  acao.prioridade === "critica" ? "bg-red-500/20 text-red-400" :
                                  acao.prioridade === "alta" ? "bg-amber-500/20 text-amber-400" :
                                  "bg-blue-500/20 text-blue-400"
                                }`}>{aIdx + 1}</span>
                                <div className="flex-1 min-w-0">
                                  <Textarea
                                    value={comentariosPlano[`${idx}-${aIdx}`] !== undefined 
                                      ? comentariosPlano[`${idx}-${aIdx}`] 
                                      : acao.acao}
                                    onChange={(e) => setComentariosPlano({
                                      ...comentariosPlano,
                                      [`${idx}-${aIdx}`]: e.target.value
                                    })}
                                    className="bg-white/5 border-white/10 text-white mb-2"
                                    rows={2}
                                  />
                                  <div className="flex items-center gap-3 text-xs">
                                    <Select
                                      defaultValue={acao.prioridade}
                                      onValueChange={(val) => {
                                        const newAcoes = [...plano.acoes];
                                        newAcoes[aIdx] = { ...newAcoes[aIdx], prioridade: val };
                                      }}
                                    >
                                      <SelectTrigger className="w-32 h-7 bg-white/5 border-white/10 text-white text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-zinc-900 border-white/10">
                                        <SelectItem value="baixa">⚪ Baixa</SelectItem>
                                        <SelectItem value="media">🔵 Média</SelectItem>
                                        <SelectItem value="alta">🟡 Alta</SelectItem>
                                        <SelectItem value="critica">🔴 Crítica</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      type="text"
                                      defaultValue={acao.prazo}
                                      placeholder="7 dias"
                                      className="w-28 h-7 bg-white/5 border-white/10 text-white text-xs"
                                    />
                                  </div>
                                  <div className="mt-2">
                                    <label className="text-xs text-white/50 mb-1 block">Comentários adicionais:</label>
                                    <Textarea
                                      placeholder="Adicione observações, ajustes ou contexto..."
                                      value={comentariosPlano[`${idx}-${aIdx}-comment`] || ""}
                                      onChange={(e) => setComentariosPlano({
                                        ...comentariosPlano,
                                        [`${idx}-${aIdx}-comment`]: e.target.value
                                      })}
                                      className="bg-white/5 border-white/10 text-white text-xs"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {!planoExpandido || planoExpandido !== idx ? (
                        <div className="mt-3 text-xs text-white/40">
                          {plano.acoes.length} ações • Clique em "Expandir" para editar
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* SOPs */}
        <TabsContent value="sops">
          <div className="space-y-8">
            {/* SOPs Criados */}
            {sops.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Seus SOPs</h3>
                <div className="space-y-4">
                  {sops.map(sop => (
                    <SOPCard key={sop.id} sop={sop} onAplicarChecklist={handleAplicarSOP} />
                  ))}
                </div>
              </div>
            )}

            {/* SOPs Prontos por Categoria */}
            {[
              { key: "operacional", label: "🏭 Operacional", desc: "Fichas técnicas, recebimento e processos" },
              { key: "marketing", label: "📱 Marketing", desc: "iFood, redes sociais e campanhas" },
              { key: "financeiro", label: "💰 Financeiro", desc: "DRE, fluxo de caixa e precificação" },
              { key: "equipe", label: "👥 Gestão de Equipe", desc: "Treinamento, avaliação e conflitos" }
            ].map(cat => (
              <div key={cat.key}>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-white">{cat.label}</h3>
                  <span className="text-xs text-white/40">{sopsProntos[cat.key]?.length || 0} SOPs</span>
                </div>
                <p className="text-sm text-white/50 mb-4">{cat.desc}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {(sopsProntos[cat.key] || []).map((sop, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4 hover:border-[#FF4D00]/30 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{pilarOptions.find(p => p.value === sop.pilar)?.label?.charAt(0) || "📋"}</span>
                        <h4 className="font-medium text-white">{sop.titulo}</h4>
                      </div>
                      <p className="text-sm text-white/50 mb-3">{sop.descricao}</p>
                      <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                        <span className={`px-2 py-0.5 rounded-full ${
                          sop.pilar === "processos" ? "bg-blue-500/20 text-blue-400" :
                          sop.pilar === "desempenho" ? "bg-emerald-500/20 text-emerald-400" :
                          sop.pilar === "presenca_magnetica" ? "bg-pink-500/20 text-pink-400" :
                          "bg-violet-500/20 text-violet-400"
                        }`}>{pilarOptions.find(p => p.value === sop.pilar)?.label}</span>
                        <span>{sop.passos?.length || 0} passos</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => createSOPMutation.mutate({ ...sop, ativo: true })}
                          className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap"
                          size="sm"
                        >
                          <Plus size={14} className="mr-1" /> Adicionar
                        </Button>
                        <Button
                          onClick={() => handleAplicarSOP(sop)}
                          className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
                          size="sm"
                        >
                          <ClipboardList size={14} className="mr-1" /> Checklist
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Dashboard */}
        <TabsContent value="dashboard">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DashboardPerformance
                execucoes={execucoes}
                planosAcao={planosAcao}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Trophy className="text-[#FF4D00]" size={20} />
                Ranking
              </h3>
              <RankingMentorados scores={scores} mentorados={mentorados} />
            </div>
          </div>
        </TabsContent>

        {/* Comunicados */}
        <TabsContent value="comunicados">
          <ComunicadosFeed comunicados={comunicados} />
        </TabsContent>
      </Tabs>

      {/* Dialog: Criar Checklist */}
      <Dialog open={checklistDialogOpen} onOpenChange={setChecklistDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Modelo de Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Título *</Label>
                <Input
                  value={checklistForm.titulo}
                  onChange={(e) => setChecklistForm({ ...checklistForm, titulo: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Pilar</Label>
                <Select value={checklistForm.pilar} onValueChange={(v) => setChecklistForm({ ...checklistForm, pilar: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {pilarOptions.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Categoria</Label>
                <Select value={checklistForm.categoria} onValueChange={(v) => setChecklistForm({ ...checklistForm, categoria: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {categoriaOptions.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Pontos por Conclusão</Label>
                <Input
                  type="number"
                  value={checklistForm.pontos_conclusao}
                  onChange={(e) => setChecklistForm({ ...checklistForm, pontos_conclusao: Number(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-white/70">Descrição</Label>
              <Textarea
                value={checklistForm.descricao}
                onChange={(e) => setChecklistForm({ ...checklistForm, descricao: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>

            {/* Itens do checklist */}
            <div>
              <Label className="text-white/70 mb-2 block">Itens do Checklist *</Label>
              <div className="space-y-2 mb-3">
                {checklistForm.itens.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    <span className="flex-1 text-sm text-white">{item.texto}</span>
                    {item.requer_evidencia && <span className="text-xs text-amber-400">📷</span>}
                    <button onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-300">×</button>
                  </div>
                ))}
              </div>
              <div className="space-y-2 p-3 bg-white/5 rounded-lg">
                <Input
                  value={novoItem.texto}
                  onChange={(e) => setNovoItem({ ...novoItem, texto: e.target.value })}
                  placeholder="Texto do item..."
                  className="bg-white/5 border-white/10 text-white"
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-white/60">
                    <Checkbox
                      checked={novoItem.obrigatorio}
                      onCheckedChange={(c) => setNovoItem({ ...novoItem, obrigatorio: c })}
                    />
                    Obrigatório
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white/60">
                    <Checkbox
                      checked={novoItem.requer_evidencia}
                      onCheckedChange={(c) => setNovoItem({ ...novoItem, requer_evidencia: c })}
                    />
                    Requer Evidência
                  </label>
                </div>
                <Button onClick={handleAddItem} disabled={!novoItem.texto.trim()} size="sm" className="bg-[#FF4D00]">
                  <Plus size={14} className="mr-1" /> Adicionar Item
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setChecklistDialogOpen(false)} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap">
                Cancelar
              </Button>
              <Button onClick={handleCreateChecklist} disabled={!checklistForm.titulo || checklistForm.itens.length === 0} className="flex-1 bg-[#FF4D00]">
                Criar Checklist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>



      {/* Dialog: Criar SOP */}
      <Dialog open={sopDialogOpen} onOpenChange={setSOPDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar SOP / Playbook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Título *</Label>
                <Input
                  value={sopForm.titulo}
                  onChange={(e) => setSOPForm({ ...sopForm, titulo: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Pilar</Label>
                <Select value={sopForm.pilar} onValueChange={(v) => setSOPForm({ ...sopForm, pilar: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {pilarOptions.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-white/70">Descrição</Label>
              <Textarea
                value={sopForm.descricao}
                onChange={(e) => setSOPForm({ ...sopForm, descricao: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Conteúdo (Markdown)</Label>
              <Textarea
                value={sopForm.conteudo}
                onChange={(e) => setSOPForm({ ...sopForm, conteudo: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1 min-h-[150px]"
                placeholder="## Passo 1&#10;Descrição do passo..."
              />
            </div>
            <div>
              <Label className="text-white/70">URL do Vídeo (opcional)</Label>
              <Input
                value={sopForm.video_url}
                onChange={(e) => setSOPForm({ ...sopForm, video_url: e.target.value })}
                placeholder="https://youtube.com/..."
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setSOPDialogOpen(false)} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap">
                Cancelar
              </Button>
              <Button onClick={() => createSOPMutation.mutate(sopForm)} disabled={!sopForm.titulo} className="flex-1 bg-[#FF4D00]">
                Criar SOP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Plano de Ação */}
      <Dialog open={planoDialogOpen} onOpenChange={setPlanoDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlano ? "Editar Plano de Ação" : "Novo Plano de Ação"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white/70">Problema Identificado *</Label>
              <Textarea
                value={planoForm.problema}
                onChange={(e) => setPlanoForm({ ...planoForm, problema: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                placeholder="Descreva o problema..."
              />
            </div>
            <div>
              <Label className="text-white/70">Ação Corretiva *</Label>
              <Textarea
                value={planoForm.acao_corretiva}
                onChange={(e) => setPlanoForm({ ...planoForm, acao_corretiva: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                placeholder="O que deve ser feito..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Pilar</Label>
                <Select value={planoForm.pilar} onValueChange={(v) => setPlanoForm({ ...planoForm, pilar: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {pilarOptions.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Prioridade</Label>
                <Select value={planoForm.prioridade} onValueChange={(v) => setPlanoForm({ ...planoForm, prioridade: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-white/70">Prazo *</Label>
              <Input
                type="date"
                value={planoForm.prazo}
                onChange={(e) => setPlanoForm({ ...planoForm, prazo: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setPlanoDialogOpen(false)} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap">
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (editingPlano) {
                    updatePlanoAcaoMutation.mutate({ id: editingPlano.id, data: planoForm });
                  } else {
                    createPlanoAcaoMutation.mutate({ ...planoForm, status: "pendente" });
                  }
                }}
                disabled={!planoForm.problema || !planoForm.acao_corretiva || !planoForm.prazo}
                className="flex-1 bg-[#FF4D00]"
              >
                {editingPlano ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Comunicado */}
      <Dialog open={comunicadoDialogOpen} onOpenChange={setComunicadoDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Comunicado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white/70">Título *</Label>
              <Input
                value={comunicadoForm.titulo}
                onChange={(e) => setComunicadoForm({ ...comunicadoForm, titulo: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Tipo</Label>
              <Select value={comunicadoForm.tipo} onValueChange={(v) => setComunicadoForm({ ...comunicadoForm, tipo: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="aviso">📢 Aviso</SelectItem>
                  <SelectItem value="tarefa">✅ Tarefa</SelectItem>
                  <SelectItem value="feedback">💬 Feedback</SelectItem>
                  <SelectItem value="novidade">⭐ Novidade</SelectItem>
                  <SelectItem value="urgente">🚨 Urgente</SelectItem>
                  <SelectItem value="parabens">🎉 Parabéns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Destinatário</Label>
              <Select value={comunicadoForm.mentorado_id} onValueChange={(v) => setComunicadoForm({ ...comunicadoForm, mentorado_id: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue placeholder="Todos os mentorados" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value={null}>Todos os mentorados</SelectItem>
                  {mentorados.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Mensagem *</Label>
              <Textarea
                value={comunicadoForm.mensagem}
                onChange={(e) => setComunicadoForm({ ...comunicadoForm, mensagem: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-white/60">
              <Checkbox
                checked={comunicadoForm.requer_confirmacao}
                onCheckedChange={(c) => setComunicadoForm({ ...comunicadoForm, requer_confirmacao: c })}
              />
              Requer confirmação de leitura
            </label>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setComunicadoDialogOpen(false)} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap">
                Cancelar
              </Button>
              <Button onClick={() => createComunicadoMutation.mutate(comunicadoForm)} disabled={!comunicadoForm.titulo || !comunicadoForm.mensagem} className="flex-1 bg-[#FF4D00]">
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assistente IA */}
      <AssistenteIA 
        contexto={{
          execucoes: pendentes.length,
          planosAcao: filteredPlanos.filter(p => p.status === "pendente").length,
          mentorados: mentorados.length
        }}
      />
    </div>
  );
}