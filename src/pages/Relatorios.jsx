import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  BarChart3, PieChart, TrendingUp, Download, FileText, Filter,
  Calendar, Users, ClipboardList, Zap, Home, RefreshCw, Table,
  LayoutDashboard, ChevronDown, Settings, Eye, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

import DashboardMentorados from "@/components/relatorios/DashboardMentorados";
import DashboardExecucao from "@/components/relatorios/DashboardExecucao";
import DashboardAutomacao from "@/components/relatorios/DashboardAutomacao";
import RelatorioBuilder from "@/components/relatorios/RelatorioBuilder";

const periodoOptions = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "mes_atual", label: "Mês Atual" },
  { value: "mes_anterior", label: "Mês Anterior" },
  { value: "custom", label: "Personalizado" }
];

export default function Relatorios() {
  const [activeTab, setActiveTab] = useState("mentorados");
  const [periodo, setPeriodo] = useState("30d");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [mentoradoFilter, setMentoradoFilter] = useState("todos");
  const [pilarFilter, setPilarFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Queries
  const { data: mentorados = [] } = useQuery({
    queryKey: ["mentorados"],
    queryFn: () => base44.entities.Mentorado.list()
  });

  const { data: execucoes = [] } = useQuery({
    queryKey: ["execucoes"],
    queryFn: () => base44.entities.ExecucaoChecklist.list("-created_date")
  });

  const { data: tarefas = [] } = useQuery({
    queryKey: ["tarefas"],
    queryFn: () => base44.entities.TarefaMentorado.list("-created_date")
  });

  const { data: automacoes = [] } = useQuery({
    queryKey: ["automacoes"],
    queryFn: () => base44.entities.Automacao.list()
  });

  const { data: logsAutomacao = [] } = useQuery({
    queryKey: ["logsAutomacao"],
    queryFn: () => base44.entities.LogAutomacao.list("-created_date", 100)
  });

  const { data: planosAcao = [] } = useQuery({
    queryKey: ["planosAcao"],
    queryFn: () => base44.entities.PlanoAcaoInteligente.list("-created_date")
  });

  // Calcular datas baseado no período
  const getDateRange = () => {
    const hoje = new Date();
    switch (periodo) {
      case "7d":
        return { inicio: subDays(hoje, 7), fim: hoje };
      case "30d":
        return { inicio: subDays(hoje, 30), fim: hoje };
      case "90d":
        return { inicio: subDays(hoje, 90), fim: hoje };
      case "mes_atual":
        return { inicio: startOfMonth(hoje), fim: endOfMonth(hoje) };
      case "mes_anterior":
        const mesAnterior = subMonths(hoje, 1);
        return { inicio: startOfMonth(mesAnterior), fim: endOfMonth(mesAnterior) };
      case "custom":
        return {
          inicio: dataInicio ? new Date(dataInicio) : subDays(hoje, 30),
          fim: dataFim ? new Date(dataFim) : hoje
        };
      default:
        return { inicio: subDays(hoje, 30), fim: hoje };
    }
  };

  const dateRange = getDateRange();

  // Filtrar dados baseado nos filtros
  const filteredMentorados = mentorados.filter(m => {
    if (statusFilter !== "todos" && m.status !== statusFilter) return false;
    return true;
  });

  const filteredExecucoes = execucoes.filter(e => {
    if (mentoradoFilter !== "todos" && e.mentorado_id !== mentoradoFilter) return false;
    if (pilarFilter !== "todos" && e.pilar !== pilarFilter) return false;
    const createdDate = new Date(e.created_date);
    if (createdDate < dateRange.inicio || createdDate > dateRange.fim) return false;
    return true;
  });

  const filteredTarefas = tarefas.filter(t => {
    if (mentoradoFilter !== "todos" && t.mentorado_id !== mentoradoFilter) return false;
    if (pilarFilter !== "todos" && t.pilar !== pilarFilter) return false;
    return true;
  });

  const filteredLogs = logsAutomacao.filter(l => {
    const createdDate = new Date(l.created_date);
    if (createdDate < dateRange.inicio || createdDate > dateRange.fim) return false;
    return true;
  });

  const resetFilters = () => {
    setPeriodo("30d");
    setMentoradoFilter("todos");
    setPilarFilter("todos");
    setStatusFilter("todos");
    setDataInicio("");
    setDataFim("");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="text-[#FF4D00]" />
            Relatórios e Dashboards
          </h1>
          <p className="text-white/50">Visualize e exporte dados de toda a plataforma</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" className="border-white/10 text-white">
              <Home size={18} className="mr-2" /> Início
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros Globais */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-[#FF4D00]" />
          <span className="font-medium text-white">Filtros</span>
          <button onClick={resetFilters} className="ml-auto text-xs text-white/50 hover:text-white flex items-center gap-1">
            <RefreshCw size={12} /> Limpar
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <Label className="text-white/60 text-xs">Período</Label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {periodoOptions.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {periodo === "custom" && (
            <>
              <div>
                <Label className="text-white/60 text-xs">Data Início</Label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs">Data Fim</Label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </>
          )}
          <div>
            <Label className="text-white/60 text-xs">Mentorado</Label>
            <Select value={mentoradoFilter} onValueChange={setMentoradoFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="todos">Todos</SelectItem>
                {mentorados.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/60 text-xs">Pilar</Label>
            <Select value={pilarFilter} onValueChange={setPilarFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="processos">🏆 Processos</SelectItem>
                <SelectItem value="desempenho">📈 Desempenho</SelectItem>
                <SelectItem value="tempo_potencia">⚡ Tempo de Potência</SelectItem>
                <SelectItem value="norte_estrategico">🎯 Norte Estratégico</SelectItem>
                <SelectItem value="presenca_magnetica">✨ Presença Magnética</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/60 text-xs">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="pausado">Pausado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 p-1 mb-6">
          <TabsTrigger value="mentorados" className="data-[state=active]:bg-[#FF4D00]">
            <Users size={16} className="mr-2" /> Mentorados
          </TabsTrigger>
          <TabsTrigger value="execucao" className="data-[state=active]:bg-[#FF4D00]">
            <ClipboardList size={16} className="mr-2" /> Execução
          </TabsTrigger>
          <TabsTrigger value="automacao" className="data-[state=active]:bg-[#FF4D00]">
            <Zap size={16} className="mr-2" /> Automação
          </TabsTrigger>
          <TabsTrigger value="builder" className="data-[state=active]:bg-[#FF4D00]">
            <Settings size={16} className="mr-2" /> Criar Relatório
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mentorados">
          <DashboardMentorados
            mentorados={filteredMentorados}
            tarefas={filteredTarefas}
            execucoes={filteredExecucoes}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="execucao">
          <DashboardExecucao
            execucoes={filteredExecucoes}
            planosAcao={planosAcao}
            mentorados={mentorados}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="automacao">
          <DashboardAutomacao
            automacoes={automacoes}
            logs={filteredLogs}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="builder">
          <RelatorioBuilder
            mentorados={mentorados}
            execucoes={execucoes}
            tarefas={tarefas}
            automacoes={automacoes}
            planosAcao={planosAcao}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}