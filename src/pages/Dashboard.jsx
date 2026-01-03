import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users,
  TrendingUp,
  Calendar,
  BookOpen,
  Library,
  Lightbulb,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { data: mentorados = [] } = useQuery({
    queryKey: ["mentorados"],
    queryFn: () => base44.entities.Mentorado.list()
  });

  const { data: agenda = [] } = useQuery({
    queryKey: ["agenda"],
    queryFn: () => base44.entities.Agenda.filter({ status: "pendente" }, "-data", 5)
  });

  const { data: cursos = [] } = useQuery({
    queryKey: ["cursos"],
    queryFn: () => base44.entities.Curso.list()
  });

  const { data: biblioteca = [] } = useQuery({
    queryKey: ["biblioteca"],
    queryFn: () => base44.entities.Biblioteca.list()
  });

  const { data: notas = [] } = useQuery({
    queryKey: ["notas"],
    queryFn: () => base44.entities.Nota.list("-created_date", 5)
  });

  const ativos = mentorados.filter((m) => m.status === "ativo").length;
  const concluidos = mentorados.filter((m) => m.status === "concluido").length;

  const stats = [
    { label: "Mentorados Ativos", value: ativos, icon: Users, color: "bg-[#FF4D00]" },
    { label: "Concluídos", value: concluidos, icon: CheckCircle2, color: "bg-emerald-500" },
    { label: "Cursos", value: cursos.length, icon: BookOpen, color: "bg-violet-500" },
    { label: "Materiais", value: biblioteca.length, icon: Library, color: "bg-blue-500" },
  ];

  const getDateLabel = (dateStr) => {
    if (!dateStr) return "";
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "dd MMM", { locale: ptBR });
  };

  const tipoColors = {
    reuniao: "bg-blue-500/20 text-blue-400",
    acompanhamento: "bg-violet-500/20 text-violet-400",
    auditoria: "bg-amber-500/20 text-amber-400",
    entrega: "bg-emerald-500/20 text-emerald-400",
    aula_vivo: "bg-[#FF4D00]/20 text-[#FF4D00]",
    tarefa: "bg-pink-500/20 text-pink-400",
    lembrete: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/50">Visão geral das suas mentorias</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-white/50">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Próximos Compromissos */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar size={20} className="text-[#FF4D00]" />
              Próximos Compromissos
            </h2>
            <Link
              to={createPageUrl("Agenda")}
              className="text-sm text-white bg-[#FF4D00] hover:bg-[#E64500] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          {agenda.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <Calendar size={40} className="mx-auto mb-3 opacity-50" />
              <p>Nenhum compromisso pendente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agenda.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/[0.07] transition-colors"
                >
                  <div className="text-center min-w-[50px]">
                    <p className="text-xs text-white/40 uppercase">{getDateLabel(item.data)}</p>
                    <p className="text-lg font-bold text-white">{item.horario || "--:--"}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{item.titulo}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tipoColors[item.tipo] || tipoColors.lembrete}`}>
                      {item.tipo?.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notas Recentes */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lightbulb size={20} className="text-[#FF4D00]" />
              Notas Recentes
            </h2>
            <Link
              to={createPageUrl("Notas")}
              className="text-sm text-white bg-[#FF4D00] hover:bg-[#E64500] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          {notas.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <Lightbulb size={40} className="mx-auto mb-3 opacity-50" />
              <p>Nenhuma nota criada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notas.map((nota) => (
                <div
                  key={nota.id}
                  className="p-3 bg-white/5 rounded-xl hover:bg-white/[0.07] transition-colors"
                >
                  <p className="font-medium text-white text-sm truncate">{nota.titulo}</p>
                  <p className="text-xs text-white/40 mt-1 capitalize">
                    {nota.categoria?.replace("_", " ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mentorados Ativos */}
      <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users size={20} className="text-[#FF4D00]" />
            Mentorados Ativos
          </h2>
          <Link
            to={createPageUrl("Mentorados")}
            className="text-sm text-white bg-[#FF4D00] hover:bg-[#E64500] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {mentorados.filter((m) => m.status === "ativo").length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <Users size={40} className="mx-auto mb-3 opacity-50" />
            <p>Nenhum mentorado ativo</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentorados
              .filter((m) => m.status === "ativo")
              .slice(0, 6)
              .map((m) => (
                <Link
                  key={m.id}
                  to={createPageUrl(`MentoradoDetalhe?id=${m.id}`)}
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/[0.07] transition-colors group"
                >
                  <div className="w-10 h-10 bg-[#FF4D00]/20 rounded-full flex items-center justify-center">
                    <span className="text-[#FF4D00] font-semibold">
                      {m.nome?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{m.nome}</p>
                    <p className="text-xs text-white/40 truncate">{m.negocio}</p>
                  </div>
                  <ArrowRight size={16} className="text-white/30 group-hover:text-[#FF4D00] transition-colors" />
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}