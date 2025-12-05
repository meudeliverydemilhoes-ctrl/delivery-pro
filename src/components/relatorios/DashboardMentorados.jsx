import React, { useRef } from "react";
import {
  Users, TrendingUp, CheckCircle2, Clock, AlertTriangle, Download,
  FileText, Table, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const COLORS = ["#FF4D00", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899"];

export default function DashboardMentorados({ mentorados, tarefas, execucoes, dateRange }) {
  const dashboardRef = useRef(null);

  // Estatísticas
  const totalMentorados = mentorados.length;
  const ativos = mentorados.filter(m => m.status === "ativo").length;
  const concluidos = mentorados.filter(m => m.status === "concluido").length;
  const pausados = mentorados.filter(m => m.status === "pausado").length;

  // Dados por etapa
  const etapasData = [
    { name: "Diagnóstico", value: mentorados.filter(m => m.etapa === "diagnostico").length },
    { name: "Pilar 1", value: mentorados.filter(m => m.etapa === "pilar1").length },
    { name: "Pilar 2", value: mentorados.filter(m => m.etapa === "pilar2").length },
    { name: "Pilar 3", value: mentorados.filter(m => m.etapa === "pilar3").length },
    { name: "Pilar 4", value: mentorados.filter(m => m.etapa === "pilar4").length },
    { name: "Pilar 5", value: mentorados.filter(m => m.etapa === "pilar5").length },
    { name: "Acompanhamento", value: mentorados.filter(m => m.etapa === "acompanhamento").length },
  ].filter(d => d.value > 0);

  // Dados por status
  const statusData = [
    { name: "Ativos", value: ativos, color: "#10B981" },
    { name: "Pausados", value: pausados, color: "#F59E0B" },
    { name: "Concluídos", value: concluidos, color: "#3B82F6" },
    { name: "Desistentes", value: mentorados.filter(m => m.status === "desistente").length, color: "#EF4444" },
  ].filter(d => d.value > 0);

  // Tarefas por mentorado
  const tarefasPorMentorado = mentorados.map(m => {
    const tarefasM = tarefas.filter(t => t.mentorado_id === m.id);
    return {
      nome: m.nome?.split(" ")[0] || "N/A",
      total: tarefasM.length,
      concluidas: tarefasM.filter(t => t.status === "concluida").length,
      pendentes: tarefasM.filter(t => t.status !== "concluida").length
    };
  }).filter(d => d.total > 0).slice(0, 10);

  // Execuções por mentorado
  const execucoesPorMentorado = mentorados.map(m => {
    const execM = execucoes.filter(e => e.mentorado_id === m.id);
    const progressoMedio = execM.length > 0
      ? Math.round(execM.reduce((acc, e) => acc + (e.progresso || 0), 0) / execM.length)
      : 0;
    return {
      nome: m.nome?.split(" ")[0] || "N/A",
      checklists: execM.length,
      progresso: progressoMedio
    };
  }).filter(d => d.checklists > 0).slice(0, 10);

  // Exportar PDF
  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { 
      backgroundColor: "#18181b",
      scale: 2 
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`relatorio-mentorados-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  // Exportar CSV
  const exportCSV = () => {
    const headers = ["Nome", "Negócio", "Status", "Etapa", "Cidade", "Data Entrada"];
    const rows = mentorados.map(m => [
      m.nome,
      m.negocio,
      m.status,
      m.etapa,
      m.cidade || "",
      m.data_entrada || ""
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mentorados-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Ações de Exportação */}
      <div className="flex justify-end gap-2">
        <Button onClick={exportCSV} variant="outline" className="border-white/10 text-black hover:bg-white/10">
          <Table size={16} className="mr-2" /> Exportar CSV
        </Button>
        <Button onClick={exportPDF} className="bg-[#FF4D00] hover:bg-[#E64500]">
          <Download size={16} className="mr-2" /> Exportar PDF
        </Button>
      </div>

      <div ref={dashboardRef} className="space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/50 mb-2">
              <Users size={16} />
              <span className="text-xs">Total</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalMentorados}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <TrendingUp size={16} />
              <span className="text-xs">Ativos</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{ativos}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <CheckCircle2 size={16} />
              <span className="text-xs">Concluídos</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">{concluidos}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Clock size={16} />
              <span className="text-xs">Pausados</span>
            </div>
            <p className="text-3xl font-bold text-amber-400">{pausados}</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gráfico de Pizza - Status */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Distribuição por Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Barras - Etapas */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Mentorados por Etapa</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={etapasData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="value" fill="#FF4D00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráfico de Tarefas */}
        {tarefasPorMentorado.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Tarefas por Mentorado</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tarefasPorMentorado} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#666" />
                  <YAxis dataKey="nome" type="category" stroke="#666" width={80} fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Bar dataKey="concluidas" name="Concluídas" fill="#10B981" stackId="a" />
                  <Bar dataKey="pendentes" name="Pendentes" fill="#F59E0B" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tabela de Mentorados */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-medium text-white">Lista de Mentorados</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-3 text-xs text-white/50 font-medium">Nome</th>
                  <th className="text-left p-3 text-xs text-white/50 font-medium">Negócio</th>
                  <th className="text-left p-3 text-xs text-white/50 font-medium">Status</th>
                  <th className="text-left p-3 text-xs text-white/50 font-medium">Etapa</th>
                  <th className="text-left p-3 text-xs text-white/50 font-medium">Cidade</th>
                  <th className="text-left p-3 text-xs text-white/50 font-medium">Tarefas</th>
                </tr>
              </thead>
              <tbody>
                {mentorados.slice(0, 20).map(m => {
                  const tarefasM = tarefas.filter(t => t.mentorado_id === m.id);
                  return (
                    <tr key={m.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="p-3 text-sm text-white">{m.nome}</td>
                      <td className="p-3 text-sm text-white/70">{m.negocio}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          m.status === "ativo" ? "bg-emerald-500/20 text-emerald-400" :
                          m.status === "concluido" ? "bg-blue-500/20 text-blue-400" :
                          m.status === "pausado" ? "bg-amber-500/20 text-amber-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-white/70">{m.etapa}</td>
                      <td className="p-3 text-sm text-white/70">{m.cidade || "-"}</td>
                      <td className="p-3 text-sm text-white/70">
                        {tarefasM.filter(t => t.status === "concluida").length}/{tarefasM.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}