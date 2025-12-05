import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ClipboardList, Target, AlertTriangle, Trophy, BookOpen, Bell,
  Plus, Search, Filter, Download, RefreshCw, Zap, Users, FileText
} from "lucide-react";
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

// Checklists prontos para usar
const checklistsProntos = [
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
];

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

// SOPs prontos para usar
const sopsProntos = [
  {
    titulo: "Como Fazer a Ficha Técnica de um Produto",
    descricao: "Passo a passo para criar fichas técnicas padronizadas",
    pilar: "processos",
    categoria: "producao",
    conteudo: `## Objetivo
Padronizar a produção e garantir consistência nos produtos.

## Materiais Necessários
- Balança de precisão
- Receita original do produto
- Planilha de ficha técnica

## Passo a Passo

### 1. Listar todos os ingredientes
Anote cada ingrediente que compõe o produto, sem esquecer de nenhum.

### 2. Pesar cada ingrediente
Use a balança para pesar cada ingrediente na quantidade exata da receita.

### 3. Calcular o custo unitário
Multiplique o peso de cada ingrediente pelo custo por kg/unidade.

### 4. Somar o custo total
Some todos os custos para obter o custo da receita.

### 5. Definir rendimento
Determine quantas porções a receita rende.

### 6. Calcular custo por porção
Divida o custo total pelo número de porções.

## Dicas Importantes
- Revise as fichas técnicas a cada alteração de preço dos insumos
- Treine a equipe para seguir as fichas à risca
- Use a balança SEMPRE`,
    passos: [
      { ordem: 1, titulo: "Listar todos os ingredientes", descricao: "Anote cada ingrediente que compõe o produto" },
      { ordem: 2, titulo: "Pesar cada ingrediente", descricao: "Use balança de precisão para pesar" },
      { ordem: 3, titulo: "Calcular custo unitário", descricao: "Multiplique peso pelo custo por kg" },
      { ordem: 4, titulo: "Somar custo total", descricao: "Some todos os custos dos ingredientes" },
      { ordem: 5, titulo: "Definir rendimento", descricao: "Quantas porções a receita rende" },
      { ordem: 6, titulo: "Calcular custo por porção", descricao: "Divida custo total pelas porções" }
    ]
  },
  {
    titulo: "Processo de Recebimento de Mercadorias",
    descricao: "Procedimento padrão para receber entregas de fornecedores",
    pilar: "processos",
    categoria: "estoque",
    conteudo: `## Objetivo
Garantir que todos os produtos recebidos estejam em conformidade.

## Responsável
Gerente ou responsável pelo estoque.

## Passo a Passo

### 1. Conferir nota fiscal
Verifique se os dados estão corretos e se o pedido confere.

### 2. Verificar integridade das embalagens
Recuse produtos com embalagens danificadas.

### 3. Verificar data de validade
Não aceite produtos próximos do vencimento.

### 4. Verificar temperatura (se aplicável)
Produtos refrigerados devem estar na temperatura correta.

### 5. Pesar/contar mercadorias
Confira se a quantidade está correta.

### 6. Armazenar corretamente
Siga o sistema FEFO (primeiro a vencer, primeiro a sair).

### 7. Registrar no sistema
Atualize o estoque no sistema.

## Critérios de Recusa
- Embalagem violada ou danificada
- Produto fora da temperatura
- Prazo de validade curto
- Quantidade divergente`,
    passos: [
      { ordem: 1, titulo: "Conferir nota fiscal", descricao: "Verificar dados e pedido" },
      { ordem: 2, titulo: "Verificar integridade", descricao: "Checar embalagens" },
      { ordem: 3, titulo: "Verificar validade", descricao: "Conferir datas de validade" },
      { ordem: 4, titulo: "Verificar temperatura", descricao: "Medir temperatura de refrigerados" },
      { ordem: 5, titulo: "Pesar/contar", descricao: "Conferir quantidades" },
      { ordem: 6, titulo: "Armazenar", descricao: "Guardar seguindo FEFO" },
      { ordem: 7, titulo: "Registrar", descricao: "Atualizar sistema" }
    ]
  },
  {
    titulo: "Como Otimizar o Cardápio no iFood",
    descricao: "Guia para melhorar a performance do cardápio no iFood",
    pilar: "presenca_magnetica",
    categoria: "marketing",
    conteudo: `## Objetivo
Aumentar conversão e ticket médio no iFood.

## Checklist de Otimização

### Fotos
- Use fotos profissionais ou bem iluminadas
- Mostre o produto de forma atrativa
- Padronize o estilo das fotos

### Descrições
- Seja objetivo e claro
- Destaque ingredientes principais
- Use palavras que despertam desejo

### Categorias
- Organize de forma lógica
- Coloque os mais vendidos no topo
- Crie categorias para combos e promoções

### Preços
- Analise a concorrência
- Use preços terminados em ,90
- Crie combos com valor percebido

### Combos e Promoções
- Monte combos estratégicos
- Use cupons para fidelizar
- Ative promoções em horários estratégicos

## Métricas para Acompanhar
- Taxa de conversão
- Ticket médio
- Avaliação média
- Tempo de entrega`,
    passos: [
      { ordem: 1, titulo: "Atualizar fotos", descricao: "Usar fotos profissionais e atrativas" },
      { ordem: 2, titulo: "Revisar descrições", descricao: "Textos claros e vendedores" },
      { ordem: 3, titulo: "Organizar categorias", descricao: "Ordem lógica e estratégica" },
      { ordem: 4, titulo: "Ajustar preços", descricao: "Preços competitivos" },
      { ordem: 5, titulo: "Criar combos", descricao: "Montar combos atrativos" },
      { ordem: 6, titulo: "Ativar promoções", descricao: "Configurar cupons e ofertas" }
    ]
  },
  {
    titulo: "Treinamento de Novos Colaboradores",
    descricao: "Processo padrão para integração de novos funcionários",
    pilar: "tempo_potencia",
    categoria: "equipe",
    conteudo: `## Objetivo
Garantir que novos colaboradores estejam aptos para a função em até 7 dias.

## Dia 1 - Integração
- Apresentar a empresa e valores
- Tour pela operação
- Apresentar a equipe
- Entregar uniforme e EPIs
- Explicar regras e regulamento

## Dias 2-3 - Observação
- Acompanhar colaborador experiente
- Conhecer todos os processos
- Estudar fichas técnicas
- Aprender sistema/PDV

## Dias 4-5 - Prática Supervisionada
- Executar tarefas com supervisão
- Tirar dúvidas
- Receber feedback constante

## Dias 6-7 - Autonomia
- Executar tarefas sozinho
- Supervisor apenas monitora
- Avaliação de desempenho inicial

## Checklist de Conclusão
- [ ] Conhece todos os produtos
- [ ] Sabe operar equipamentos
- [ ] Entende os processos
- [ ] Usa EPI corretamente
- [ ] Conhece padrão de atendimento`,
    passos: [
      { ordem: 1, titulo: "Dia 1 - Integração", descricao: "Apresentar empresa e regras" },
      { ordem: 2, titulo: "Dias 2-3 - Observação", descricao: "Acompanhar colaborador experiente" },
      { ordem: 3, titulo: "Dias 4-5 - Prática", descricao: "Executar com supervisão" },
      { ordem: 4, titulo: "Dias 6-7 - Autonomia", descricao: "Trabalhar de forma independente" },
      { ordem: 5, titulo: "Avaliação", descricao: "Avaliar desempenho inicial" }
    ]
  }
];

export default function ExecucaoInteligente() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("execucoes");
  const [search, setSearch] = useState("");
  const [pilarFilter, setPilarFilter] = useState("todos");
  const [mentoradoFilter, setMentoradoFilter] = useState("todos");
  
  // Dialogs
  const [checklistDialogOpen, setChecklistDialogOpen] = useState(false);
  const [atribuirDialogOpen, setAtribuirDialogOpen] = useState(false);
  const [sopDialogOpen, setSOPDialogOpen] = useState(false);
  const [comunicadoDialogOpen, setComunicadoDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  
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
  const [atribuirForm, setAtribuirForm] = useState({ mentorado_id: "", data_limite: "" });

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
      setAtribuirDialogOpen(false);
      setSelectedChecklist(null);
      setAtribuirForm({ mentorado_id: "", data_limite: "" });
    }
  });

  const createPlanoAcaoMutation = useMutation({
    mutationFn: (data) => base44.entities.PlanoAcaoInteligente.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planosAcao"] });
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

  const handleAtribuirChecklist = () => {
    if (selectedChecklist && atribuirForm.mentorado_id) {
      createExecucaoMutation.mutate({
        mentorado_id: atribuirForm.mentorado_id,
        checklist_id: selectedChecklist.id,
        titulo: selectedChecklist.titulo,
        pilar: selectedChecklist.pilar,
        categoria: selectedChecklist.categoria,
        data_inicio: new Date().toISOString().split("T")[0],
        data_limite: atribuirForm.data_limite || null,
        status: "pendente",
        itens: selectedChecklist.itens.map(item => ({
          texto: item.texto,
          concluido: false,
          requer_evidencia: item.requer_evidencia
        })),
        progresso: 0
      });
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
      ...data,
      prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      prioridade: "media",
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
    <div className="max-w-7xl mx-auto">
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
          <Button variant="outline" onClick={() => setComunicadoDialogOpen(true)} className="border-white/10 text-white">
            <Bell size={18} className="mr-2" /> Comunicado
          </Button>
          <Button variant="outline" onClick={() => setSOPDialogOpen(true)} className="border-white/10 text-white">
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
          <TabsTrigger value="planos" className="data-[state=active]:bg-[#FF4D00]">
            <AlertTriangle size={16} className="mr-2" /> Planos de Ação
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
          <div className="space-y-6">
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
                          setSelectedChecklist(checklist);
                          setAtribuirDialogOpen(true);
                        }}
                        className="w-full bg-[#FF4D00] hover:bg-[#E64500]"
                        size="sm"
                      >
                        Atribuir a Mentorado
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checklists Prontos */}
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Modelos Prontos</h3>
              <p className="text-sm text-white/50 mb-4">Checklists prontos para usar. Clique para adicionar à sua biblioteca.</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checklistsProntos.map((checklist, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4 hover:border-[#FF4D00]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{pilarOptions.find(p => p.value === checklist.pilar)?.label?.charAt(0) || "📋"}</span>
                      <h4 className="font-medium text-white">{checklist.titulo}</h4>
                    </div>
                    <p className="text-sm text-white/50 mb-3">{checklist.descricao}</p>
                    <div className="flex items-center justify-between text-xs text-white/40 mb-3">
                      <span>{checklist.itens?.length || 0} itens</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        checklist.categoria === "diario" ? "bg-blue-500/20 text-blue-400" :
                        checklist.categoria === "semanal" ? "bg-amber-500/20 text-amber-400" :
                        "bg-violet-500/20 text-violet-400"
                      }`}>{checklist.categoria}</span>
                    </div>
                    <Button
                      onClick={() => createChecklistMutation.mutate(checklist)}
                      variant="outline"
                      className="w-full border-[#FF4D00]/50 text-[#FF4D00] hover:bg-[#FF4D00]/10"
                      size="sm"
                    >
                      <Plus size={14} className="mr-1" /> Adicionar à Biblioteca
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Planos de Ação */}
        <TabsContent value="planos">
          <div className="space-y-6">
            {/* Planos Ativos */}
            {filteredPlanos.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Planos Ativos</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredPlanos.map(plano => (
                    <PlanoAcaoCard key={plano.id} plano={plano} />
                  ))}
                </div>
              </div>
            )}

            {/* Planos Prontos */}
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Planos de Ação Prontos para Delivery</h3>
              <p className="text-sm text-white/50 mb-4">Selecione um plano e atribua a um mentorado para começar.</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {planosAcaoProntos.map((plano, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4 hover:border-[#FF4D00]/30 transition-colors">
                    <h4 className="font-medium text-white mb-2">{plano.titulo}</h4>
                    <p className="text-sm text-red-400/80 mb-2">❗ {plano.problema}</p>
                    <p className="text-xs text-white/50 mb-3">{plano.descricao}</p>
                    <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                      <span className={`px-2 py-0.5 rounded-full ${
                        plano.pilar === "processos" ? "bg-blue-500/20 text-blue-400" :
                        plano.pilar === "desempenho" ? "bg-emerald-500/20 text-emerald-400" :
                        plano.pilar === "tempo_potencia" ? "bg-violet-500/20 text-violet-400" :
                        "bg-pink-500/20 text-pink-400"
                      }`}>{pilarOptions.find(p => p.value === plano.pilar)?.label}</span>
                      <span>{plano.acoes.length} ações</span>
                    </div>
                    <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
                      {plano.acoes.slice(0, 4).map((acao, aIdx) => (
                        <div key={aIdx} className="flex items-start gap-2 text-xs">
                          <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            acao.prioridade === "critica" ? "bg-red-500" :
                            acao.prioridade === "alta" ? "bg-amber-500" :
                            "bg-blue-500"
                          }`} />
                          <span className="text-white/60 line-clamp-1">{acao.acao}</span>
                        </div>
                      ))}
                      {plano.acoes.length > 4 && (
                        <p className="text-xs text-white/40 pl-3">+{plano.acoes.length - 4} mais...</p>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        // Criar múltiplos planos de ação
                        plano.acoes.forEach((acao, index) => {
                          setTimeout(() => {
                            createPlanoAcaoMutation.mutate({
                              problema: plano.problema,
                              acao_corretiva: acao.acao,
                              pilar: plano.pilar,
                              prioridade: acao.prioridade,
                              prazo: new Date(Date.now() + (parseInt(acao.prazo) || 7) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                              status: "pendente"
                            });
                          }, index * 100);
                        });
                      }}
                      className="w-full bg-[#FF4D00] hover:bg-[#E64500]"
                      size="sm"
                    >
                      <Target size={14} className="mr-1" /> Aplicar Plano
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* SOPs */}
        <TabsContent value="sops">
          <div className="space-y-6">
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

            {/* SOPs Prontos */}
            <div>
              <h3 className="text-lg font-medium text-white mb-2">SOPs Prontos</h3>
              <p className="text-sm text-white/50 mb-4">Procedimentos padrão prontos para usar. Clique para adicionar à sua biblioteca.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {sopsProntos.map((sop, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4 hover:border-[#FF4D00]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{pilarOptions.find(p => p.value === sop.pilar)?.label?.charAt(0) || "📋"}</span>
                      <h4 className="font-medium text-white">{sop.titulo}</h4>
                    </div>
                    <p className="text-sm text-white/50 mb-3">{sop.descricao}</p>
                    <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                      <span className={`px-2 py-0.5 rounded-full ${
                        sop.pilar === "processos" ? "bg-blue-500/20 text-blue-400" :
                        sop.pilar === "presenca_magnetica" ? "bg-pink-500/20 text-pink-400" :
                        "bg-violet-500/20 text-violet-400"
                      }`}>{pilarOptions.find(p => p.value === sop.pilar)?.label}</span>
                      <span>{sop.passos?.length || 0} passos</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => createSOPMutation.mutate({ ...sop, ativo: true })}
                        variant="outline"
                        className="flex-1 border-[#FF4D00]/50 text-[#FF4D00] hover:bg-[#FF4D00]/10"
                        size="sm"
                      >
                        <Plus size={14} className="mr-1" /> Adicionar
                      </Button>
                      <Button
                        onClick={() => handleAplicarSOP(sop)}
                        className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
                        size="sm"
                      >
                        <ClipboardList size={14} className="mr-1" /> Gerar Checklist
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
              <Button variant="outline" onClick={() => setChecklistDialogOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={handleCreateChecklist} disabled={!checklistForm.titulo || checklistForm.itens.length === 0} className="flex-1 bg-[#FF4D00]">
                Criar Checklist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Atribuir Checklist */}
      <Dialog open={atribuirDialogOpen} onOpenChange={setAtribuirDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Atribuir Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-white/60">Atribuindo: <span className="text-white font-medium">{selectedChecklist?.titulo}</span></p>
            <div>
              <Label className="text-white/70">Mentorado *</Label>
              <Select value={atribuirForm.mentorado_id} onValueChange={(v) => setAtribuirForm({ ...atribuirForm, mentorado_id: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {mentorados.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nome} - {m.negocio}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Prazo (opcional)</Label>
              <Input
                type="date"
                value={atribuirForm.data_limite}
                onChange={(e) => setAtribuirForm({ ...atribuirForm, data_limite: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setAtribuirDialogOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={handleAtribuirChecklist} disabled={!atribuirForm.mentorado_id} className="flex-1 bg-[#FF4D00]">
                Atribuir
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
              <Button variant="outline" onClick={() => setSOPDialogOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={() => createSOPMutation.mutate(sopForm)} disabled={!sopForm.titulo} className="flex-1 bg-[#FF4D00]">
                Criar SOP
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
              <Button variant="outline" onClick={() => setComunicadoDialogOpen(false)} className="flex-1 border-white/10 text-white">
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