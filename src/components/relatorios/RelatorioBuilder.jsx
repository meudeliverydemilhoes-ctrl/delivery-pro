import React, { useState, useRef } from "react";
import {
  Plus, Trash2, Download, Table, BarChart3, PieChart as PieChartIcon,
  TrendingUp, Eye, Save, Settings, GripVertical, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const COLORS = ["#FF4D00", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899"];

const widgetTypes = [
  { value: "card", label: "Card de Métrica", icon: BarChart3 },
  { value: "bar_chart", label: "Gráfico de Barras", icon: BarChart3 },
  { value: "pie_chart", label: "Gráfico de Pizza", icon: PieChartIcon },
  { value: "line_chart", label: "Gráfico de Linha", icon: TrendingUp },
  { value: "table", label: "Tabela", icon: Table },
];

const dataSourceOptions = [
  { value: "mentorados", label: "Mentorados" },
  { value: "mentorados_status", label: "Mentorados por Status" },
  { value: "mentorados_etapa", label: "Mentorados por Etapa" },
  { value: "execucoes", label: "Execuções" },
  { value: "execucoes_pilar", label: "Execuções por Pilar" },
  { value: "execucoes_status", label: "Execuções por Status" },
  { value: "tarefas", label: "Tarefas" },
  { value: "tarefas_status", label: "Tarefas por Status" },
  { value: "automacoes", label: "Automações" },
  { value: "planos_acao", label: "Planos de Ação" },
];

export default function RelatorioBuilder({ mentorados, execucoes, tarefas, automacoes, planosAcao }) {
  const reportRef = useRef(null);
  const [reportName, setReportName] = useState("Meu Relatório");
  const [widgets, setWidgets] = useState([]);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [newWidget, setNewWidget] = useState({
    type: "card",
    title: "",
    dataSource: "mentorados",
    metric: "count"
  });

  const addWidget = () => {
    setWidgets([...widgets, { ...newWidget, id: Date.now() }]);
    setAddWidgetOpen(false);
    setNewWidget({ type: "card", title: "", dataSource: "mentorados", metric: "count" });
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const getWidgetData = (widget) => {
    switch (widget.dataSource) {
      case "mentorados":
        return { value: mentorados.length, label: "Total Mentorados" };
      case "mentorados_status":
        return [
          { name: "Ativos", value: mentorados.filter(m => m.status === "ativo").length, color: "#10B981" },
          { name: "Pausados", value: mentorados.filter(m => m.status === "pausado").length, color: "#F59E0B" },
          { name: "Concluídos", value: mentorados.filter(m => m.status === "concluido").length, color: "#3B82F6" },
        ].filter(d => d.value > 0);
      case "mentorados_etapa":
        return [
          { name: "Diagnóstico", value: mentorados.filter(m => m.etapa === "diagnostico").length },
          { name: "Pilar 1", value: mentorados.filter(m => m.etapa === "pilar1").length },
          { name: "Pilar 2", value: mentorados.filter(m => m.etapa === "pilar2").length },
          { name: "Pilar 3", value: mentorados.filter(m => m.etapa === "pilar3").length },
          { name: "Pilar 4", value: mentorados.filter(m => m.etapa === "pilar4").length },
          { name: "Pilar 5", value: mentorados.filter(m => m.etapa === "pilar5").length },
        ].filter(d => d.value > 0);
      case "execucoes":
        return { value: execucoes.length, label: "Total Execuções" };
      case "execucoes_pilar":
        return [
          { name: "Processos", value: execucoes.filter(e => e.pilar === "processos").length },
          { name: "Desempenho", value: execucoes.filter(e => e.pilar === "desempenho").length },
          { name: "Tempo", value: execucoes.filter(e => e.pilar === "tempo_potencia").length },
          { name: "Norte", value: execucoes.filter(e => e.pilar === "norte_estrategico").length },
          { name: "Presença", value: execucoes.filter(e => e.pilar === "presenca_magnetica").length },
        ].filter(d => d.value > 0);
      case "execucoes_status":
        return [
          { name: "Concluído", value: execucoes.filter(e => e.status === "concluido").length, color: "#10B981" },
          { name: "Em Andamento", value: execucoes.filter(e => e.status === "em_andamento").length, color: "#3B82F6" },
          { name: "Pendente", value: execucoes.filter(e => e.status === "pendente").length, color: "#F59E0B" },
        ].filter(d => d.value > 0);
      case "tarefas":
        return { value: tarefas.length, label: "Total Tarefas" };
      case "tarefas_status":
        return [
          { name: "Concluídas", value: tarefas.filter(t => t.status === "concluida").length, color: "#10B981" },
          { name: "Em Andamento", value: tarefas.filter(t => t.status === "em_andamento").length, color: "#3B82F6" },
          { name: "Pendentes", value: tarefas.filter(t => t.status === "pendente").length, color: "#F59E0B" },
        ].filter(d => d.value > 0);
      case "automacoes":
        return { value: automacoes.length, label: "Total Automações" };
      case "planos_acao":
        return { value: planosAcao.length, label: "Planos de Ação" };
      default:
        return { value: 0, label: "N/A" };
    }
  };

  const renderWidget = (widget) => {
    const data = getWidgetData(widget);

    switch (widget.type) {
      case "card":
        return (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h4 className="text-sm text-white/50 mb-2">{widget.title || data.label}</h4>
            <p className="text-4xl font-bold text-[#FF4D00]">{data.value}</p>
          </div>
        );

      case "bar_chart":
        return (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h4 className="text-lg font-medium text-white mb-4">{widget.title}</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Array.isArray(data) ? data : []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                  <Bar dataKey="value" fill="#FF4D00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "pie_chart":
        return (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h4 className="text-lg font-medium text-white mb-4">{widget.title}</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Array.isArray(data) ? data : []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {(Array.isArray(data) ? data : []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "line_chart":
        return (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h4 className="text-lg font-medium text-white mb-4">{widget.title}</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={Array.isArray(data) ? data : []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                  <Line type="monotone" dataKey="value" stroke="#FF4D00" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "table":
        const tableData = Array.isArray(data) ? data : [{ name: data.label, value: data.value }];
        return (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h4 className="text-lg font-medium text-white">{widget.title}</h4>
            </div>
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-3 text-xs text-white/50">Nome</th>
                  <th className="text-right p-3 text-xs text-white/50">Valor</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx} className="border-t border-white/5">
                    <td className="p-3 text-sm text-white">{row.name}</td>
                    <td className="p-3 text-sm text-white/70 text-right">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { backgroundColor: "#18181b", scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${reportName}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <Input
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="bg-white/5 border-white/10 text-white text-xl font-bold"
            placeholder="Nome do Relatório"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAddWidgetOpen(true)} variant="outline" className="border-white/10 text-white">
            <Plus size={16} className="mr-2" /> Adicionar Widget
          </Button>
          <Button onClick={() => setPreviewMode(!previewMode)} variant="outline" className="border-white/10 text-white">
            <Eye size={16} className="mr-2" /> {previewMode ? "Editar" : "Preview"}
          </Button>
          <Button onClick={exportPDF} className="bg-[#FF4D00] hover:bg-[#E64500]" disabled={widgets.length === 0}>
            <Download size={16} className="mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* Área de Widgets */}
      <div ref={reportRef} className="min-h-[400px]">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/20 rounded-2xl">
            <BarChart3 size={48} className="text-white/20 mb-4" />
            <p className="text-white/50 mb-4">Adicione widgets para criar seu relatório</p>
            <Button onClick={() => setAddWidgetOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
              <Plus size={16} className="mr-2" /> Adicionar Widget
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgets.map((widget) => (
              <div key={widget.id} className="relative group">
                {!previewMode && (
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="absolute -top-2 -right-2 z-10 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-white" />
                  </button>
                )}
                {renderWidget(widget)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog Adicionar Widget */}
      <Dialog open={addWidgetOpen} onOpenChange={setAddWidgetOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Widget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white/70">Título</Label>
              <Input
                value={newWidget.title}
                onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                placeholder="Título do widget"
              />
            </div>
            <div>
              <Label className="text-white/70">Tipo de Visualização</Label>
              <Select value={newWidget.type} onValueChange={(v) => setNewWidget({ ...newWidget, type: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {widgetTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <t.icon size={14} />
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Fonte de Dados</Label>
              <Select value={newWidget.dataSource} onValueChange={(v) => setNewWidget({ ...newWidget, dataSource: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {dataSourceOptions.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setAddWidgetOpen(false)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={addWidget} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]">
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}