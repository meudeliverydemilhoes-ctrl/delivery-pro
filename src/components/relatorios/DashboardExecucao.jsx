import React, { useRef } from "react";
import {
  ClipboardList, CheckCircle2, Clock, AlertTriangle, Download, Table,
  Target, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from "recharts";
import { format, eachDayOfInterval, eachWeekOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const COLORS = ["#FF4D00", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"];

export default function DashboardExecucao({ execucoes, planosAcao, mentorados, dateRange }) {
  const dashboardRef = useRef(null);

  // Estatísticas
  const totalExecucoes = execucoes.length;
  const concluidas = execucoes.filter(e => e.status === "concluido").length;
  const emAndamento = execucoes.filter(e => e.status === "em_andamento").length;
  const pendentes = execucoes.filter(e => e.status === "pendente").length;
  const atrasadas = execucoes.filter(e => 
    e.data_limite && new Date(e.data_limite) < new Date() && e.status !== "concluido"
  ).length;

  // Progresso médio
  const progressoMedio = execucoes.length > 0
    ? Math.round(execucoes.reduce((acc, e) => acc + (e.progresso || 0), 0) / execucoes.length)
    : 0;

  // Por pilar
  const porPilar = [
    { name: "Processos", value: execucoes.filter(e => e.pilar === "processos").length, icon: "🏆" },
    { name: "Desempenho", value: execucoes.filter(e => e.pilar === "desempenho").length, icon: "📈" },
    { name: "Tempo", value: execucoes.filter(e => e.pilar === "tempo_potencia").length, icon: "⚡" },
    { name: "Norte", value: execucoes.filter(e => e.pilar === "norte_estrategico").length, icon: "🎯" },
    { name: "Presença", value: execucoes.filter(e => e.pilar === "presenca_magnetica").length, icon: "✨" },
  ].filter(d => d.value > 0);

  // Por categoria
  const porCategoria = [
    { name: "Diário", value: execucoes.filter(e => e.categoria === "diario").length },
    { name: "Semanal", value: execucoes.filter(e => e.categoria === "semanal").length },
    { name: "Mensal", value: execucoes.filter(e => e.categoria === "mensal").length },
    { name: "Pontual", value: execucoes.filter(e => e.categoria === "pontual").length },
  ].filter(d => d.value > 0);

  // Planos de Ação por status
  const planosPorStatus = [
    { name: "Pendente", value: planosAcao.filter(p => p.status === "pendente").length, color: "#F59E0B" },
    { name: "Em Andamento", value: planosAcao.filter(p => p.status === "em_andamento").length, color: "#3B82F6" },
    { name: "Concluído", value: planosAcao.filter(p => p.status === "concluido").length, color: "#10B981" },
    { name: "Atrasado", value: planosAcao.filter(p => p.status === "atrasado").length, color: "#EF4444" },
  ].filter(d => d.value > 0);

  // Timeline de execuções por semana
  const weeks = eachWeekOfInterval({ start: dateRange.inicio, end: dateRange.fim });
  const execucoesPorSemana = weeks.map(weekStart => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekExecucoes = execucoes.filter(e => {
      const date = new Date(e.created_date);
      return date >= weekStart && date < weekEnd;
    });
    return {
      semana: format(weekStart, "dd/MM"),
      total: weekExecucoes.length,
      concluidas: weekExecucoes.filter(e => e.status === "concluido").length
    };
  });

  // Top mentorados por execuções
  const topMentorados = mentorados.map(m => {
    const exec = execucoes.filter(e => e.mentorado_id === m.id);
    return {
      nome: m.nome?.split(" ")[0] || "N/A",
      execucoes: exec.length,
      concluidas: exec.filter(e => e.status === "concluido").length,
      progresso: exec.length > 0 
        ? Math.round(exec.reduce((acc, e) => acc + (e.progresso || 0), 0) / exec.length) 
        : 0
    };
  }).filter(d => d.execucoes > 0).sort((a, b) => b.concluidas - a.concluidas).slice(0, 10);

  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { backgroundColor: "#18181b", scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`relatorio-execucao-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const exportCSV = () => {
    const headers = ["Título", "Mentorado", "Pilar", "Categoria", "Status", "Progresso", "Data Limite"];
    const rows = execucoes.map(e => {
      const mentorado = mentorados.find(m => m.id === e.mentorado_id);
      return [
        e.titulo,
        mentorado?.nome || "",
        e.pilar,
        e.categoria,
        e.status,
        `${e.progresso || 0}%`,
        e.data_limite || ""
      ];
    });
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `execucoes-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button onClick={exportCSV} variant="outline" className="border-white/10 text-white hover:bg-white/10">
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
              <ClipboardList size={16} />
              <span className="text-xs">Total</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalExecucoes}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <CheckCircle2 size={16} />
              <span className="text-xs">Concluídas</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{concluidas}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Clock size={16} />
              <span className="text-xs">Em Andamento</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">{emAndamento}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertTriangle size={16} />
              <span className="text-xs">Atrasadas</span>
            </div>
            <p className="text-3xl font-bold text-red-400">{atrasadas}</p>
          </div>
          <div className="bg-[#FF4D00]/10 border border-[#FF4D00]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#FF4D00] mb-2">
              <TrendingUp size={16} />
              <span className="text-xs">Progresso Médio</span>
            </div>
            <p className="text-3xl font-bold text-[#FF4D00]">{progressoMedio}%</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Execuções por Pilar</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porPilar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                  <Bar dataKey="value" fill="#FF4D00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Planos de Ação por Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planosPorStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {planosPorStatus.map((entry, index) => (
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
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Evolução Semanal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={execucoesPorSemana}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="semana" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                <Legend />
                <Area type="monotone" dataKey="total" name="Total" stroke="#FF4D00" fill="#FF4D00" fillOpacity={0.3} />
                <Area type="monotone" dataKey="concluidas" name="Concluídas" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Mentorados */}
        {topMentorados.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Top Mentorados por Execução</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMentorados} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#666" />
                  <YAxis dataKey="nome" type="category" stroke="#666" width={80} fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                  <Legend />
                  <Bar dataKey="concluidas" name="Concluídas" fill="#10B981" />
                  <Bar dataKey="execucoes" name="Total" fill="#FF4D00" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}