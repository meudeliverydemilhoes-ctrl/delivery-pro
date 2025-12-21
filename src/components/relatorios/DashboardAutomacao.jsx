import React, { useRef } from "react";
import {
  Zap, CheckCircle2, AlertTriangle, Clock, Download, Table,
  Activity, TrendingUp, Play, Pause
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from "recharts";
import { format, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const gatilhoLabels = {
  novo_registro: "Novo Registro",
  atualizacao_status: "Atualização Status",
  data_limite: "Data Limite",
  progresso_pilar: "Progresso Pilar",
  checklist_concluido: "Checklist Concluído",
  tarefa_atrasada: "Tarefa Atrasada"
};

const acaoLabels = {
  enviar_email: "Enviar E-mail",
  atualizar_status: "Atualizar Status",
  criar_tarefa: "Criar Tarefa",
  enviar_notificacao: "Enviar Notificação",
  atualizar_etapa: "Atualizar Etapa"
};

export default function DashboardAutomacao({ automacoes, logs, dateRange }) {
  const dashboardRef = useRef(null);

  // Estatísticas
  const totalAutomacoes = automacoes.length;
  const ativas = automacoes.filter(a => a.ativa !== false).length;
  const inativas = automacoes.filter(a => a.ativa === false).length;
  const totalExecucoes = logs.length;
  const execucoesSucesso = logs.filter(l => l.status === "sucesso").length;
  const execucoesErro = logs.filter(l => l.status === "erro").length;
  const taxaSucesso = totalExecucoes > 0 ? Math.round((execucoesSucesso / totalExecucoes) * 100) : 0;

  // Por tipo de gatilho
  const porGatilho = Object.keys(gatilhoLabels).map(key => ({
    name: gatilhoLabels[key],
    value: automacoes.filter(a => a.gatilho_tipo === key).length
  })).filter(d => d.value > 0);

  // Por tipo de ação
  const porAcao = Object.keys(acaoLabels).map(key => ({
    name: acaoLabels[key],
    value: automacoes.filter(a => a.acao_tipo === key).length
  })).filter(d => d.value > 0);

  // Execuções por dia
  const days = eachDayOfInterval({ start: dateRange.inicio, end: dateRange.fim });
  const execucoesPorDia = days.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayLogs = logs.filter(l => l.created_date?.startsWith(dayStr));
    return {
      dia: format(day, "dd/MM"),
      total: dayLogs.length,
      sucesso: dayLogs.filter(l => l.status === "sucesso").length,
      erro: dayLogs.filter(l => l.status === "erro").length
    };
  }).filter(d => d.total > 0);

  // Status das execuções
  const statusExecucoes = [
    { name: "Sucesso", value: execucoesSucesso, color: "#10B981" },
    { name: "Erro", value: execucoesErro, color: "#EF4444" },
    { name: "Pendente", value: logs.filter(l => l.status === "pendente").length, color: "#F59E0B" },
  ].filter(d => d.value > 0);

  // Top automações por execuções
  const topAutomacoes = automacoes.map(a => ({
    nome: a.nome?.substring(0, 20) || "Sem nome",
    execucoes: a.total_execucoes || 0,
    ativa: a.ativa !== false
  })).sort((a, b) => b.execucoes - a.execucoes).slice(0, 10);

  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { backgroundColor: "#18181b", scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`relatorio-automacao-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const exportCSV = () => {
    const headers = ["Nome", "Gatilho", "Ação", "Ativa", "Execuções", "Última Execução"];
    const rows = automacoes.map(a => [
      a.nome,
      gatilhoLabels[a.gatilho_tipo] || a.gatilho_tipo,
      acaoLabels[a.acao_tipo] || a.acao_tipo,
      a.ativa !== false ? "Sim" : "Não",
      a.total_execucoes || 0,
      a.ultima_execucao || ""
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `automacoes-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button onClick={exportCSV} variant="outline" className="border-white/10 text-white">
          <Table size={16} className="mr-2" /> Exportar CSV
        </Button>
        <Button onClick={exportPDF} className="bg-[#FF4D00] hover:bg-[#E64500]">
          <Download size={16} className="mr-2" /> Exportar PDF
        </Button>
      </div>

      <div ref={dashboardRef} className="space-y-6">
        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/50 mb-2">
              <Zap size={16} />
              <span className="text-xs">Total</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalAutomacoes}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Play size={16} />
              <span className="text-xs">Ativas</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{ativas}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Pause size={16} />
              <span className="text-xs">Inativas</span>
            </div>
            <p className="text-3xl font-bold text-amber-400">{inativas}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Activity size={16} />
              <span className="text-xs">Execuções</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">{totalExecucoes}</p>
          </div>
          <div className="bg-[#FF4D00]/10 border border-[#FF4D00]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#FF4D00] mb-2">
              <TrendingUp size={16} />
              <span className="text-xs">Taxa Sucesso</span>
            </div>
            <p className="text-3xl font-bold text-[#FF4D00]">{taxaSucesso}%</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Por Tipo de Gatilho</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porGatilho} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#666" />
                  <YAxis dataKey="name" type="category" stroke="#666" width={120} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                  <Bar dataKey="value" fill="#FF4D00" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Status das Execuções</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusExecucoes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusExecucoes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {execucoesPorDia.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Execuções por Dia</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={execucoesPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="dia" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                  <Legend />
                  <Area type="monotone" dataKey="sucesso" name="Sucesso" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="erro" name="Erro" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tabela de Automações */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-medium text-white">Lista de Automações</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-3 text-xs text-white/50 font-medium">Nome</th>
                  <th className="text-left p-3 text-xs text-white/50 font-medium">Gatilho</th>
                  <th className="text-left p-3 text-xs text-white/50 font-medium">Ação</th>
                  <th className="text-left p-3 text-xs text-white/50 font-medium">Status</th>
                  <th className="text-left p-3 text-xs text-white/50 font-medium">Execuções</th>
                </tr>
              </thead>
              <tbody>
                {automacoes.map(a => (
                  <tr key={a.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="p-3 text-sm text-white">{a.nome}</td>
                    <td className="p-3 text-sm text-white/70">{gatilhoLabels[a.gatilho_tipo] || a.gatilho_tipo}</td>
                    <td className="p-3 text-sm text-white/70">{acaoLabels[a.acao_tipo] || a.acao_tipo}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        a.ativa !== false ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/50"
                      }`}>
                        {a.ativa !== false ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-white/70">{a.total_execucoes || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}