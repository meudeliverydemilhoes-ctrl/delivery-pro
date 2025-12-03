import React, { useState } from "react";
import { Flag, Download, CheckCircle2, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

export default function CheckpointSemanal({ 
  pilarKey, 
  pilarTitulo,
  tarefasData = [],
  exerciciosData = {},
  onFecharSemana 
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [relatorio, setRelatorio] = useState(null);

  const gerarRelatorio = () => {
    const concluidas = tarefasData.filter(t => t.status === "concluido").length;
    const emAndamento = tarefasData.filter(t => t.status === "em_andamento").length;
    const pendentes = tarefasData.filter(t => t.status === "pendente").length;
    const total = tarefasData.length;
    
    const progressoTarefas = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    
    const exerciciosConcluidos = Object.values(exerciciosData).filter(e => e && Object.keys(e).length > 0).length;

    const report = {
      semana: `Semana ${Math.ceil(new Date().getDate() / 7)} - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      pilar: pilarTitulo,
      dataGeracao: new Date().toLocaleString('pt-BR'),
      metricas: {
        tarefasConcluidas: concluidas,
        tarefasEmAndamento: emAndamento,
        tarefasPendentes: pendentes,
        totalTarefas: total,
        progressoTarefas,
        exerciciosConcluidos
      },
      status: progressoTarefas >= 80 ? "excelente" : progressoTarefas >= 50 ? "bom" : progressoTarefas >= 20 ? "atencao" : "critico",
      destaques: tarefasData.filter(t => t.status === "concluido").map(t => t.atividade || t.meta || t.objetivo || t.acao),
      proximasAcoes: tarefasData.filter(t => t.status !== "concluido").slice(0, 3).map(t => t.atividade || t.meta || t.objetivo || t.acao)
    };

    setRelatorio(report);
    setDialogOpen(true);
  };

  const baixarRelatorio = () => {
    if (!relatorio) return;

    const texto = `
═══════════════════════════════════════════════════════════
          RELATÓRIO SEMANAL - ${relatorio.pilar.toUpperCase()}
═══════════════════════════════════════════════════════════

📅 ${relatorio.semana}
🕐 Gerado em: ${relatorio.dataGeracao}

───────────────────────────────────────────────────────────
                     RESUMO EXECUTIVO
───────────────────────────────────────────────────────────

📊 PROGRESSO GERAL: ${relatorio.metricas.progressoTarefas}%

✅ Tarefas Concluídas:    ${relatorio.metricas.tarefasConcluidas}
⏳ Em Andamento:          ${relatorio.metricas.tarefasEmAndamento}
❌ Pendentes:             ${relatorio.metricas.tarefasPendentes}
📋 Total de Tarefas:      ${relatorio.metricas.totalTarefas}

🎯 Exercícios Realizados: ${relatorio.metricas.exerciciosConcluidos}

───────────────────────────────────────────────────────────
                      DESTAQUES
───────────────────────────────────────────────────────────

${relatorio.destaques.length > 0 ? relatorio.destaques.map((d, i) => `  ✓ ${d}`).join('\n') : '  Nenhuma tarefa concluída esta semana'}

───────────────────────────────────────────────────────────
                   PRÓXIMAS AÇÕES
───────────────────────────────────────────────────────────

${relatorio.proximasAcoes.length > 0 ? relatorio.proximasAcoes.map((a, i) => `  ${i + 1}. ${a}`).join('\n') : '  Todas as tarefas foram concluídas!'}

───────────────────────────────────────────────────────────
                      STATUS
───────────────────────────────────────────────────────────

${relatorio.status === "excelente" ? "🎉 EXCELENTE! Continue assim!" : 
  relatorio.status === "bom" ? "👍 BOM PROGRESSO! Mantenha o ritmo!" :
  relatorio.status === "atencao" ? "⚠️ ATENÇÃO! Acelere o ritmo!" :
  "🚨 CRÍTICO! Foque nas prioridades!"}

═══════════════════════════════════════════════════════════
                    FIM DO RELATÓRIO
═══════════════════════════════════════════════════════════
`;

    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${pilarKey}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFecharSemana = () => {
    onFecharSemana?.(relatorio);
    setDialogOpen(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "excelente": return "text-emerald-400 bg-emerald-500/20";
      case "bom": return "text-blue-400 bg-blue-500/20";
      case "atencao": return "text-amber-400 bg-amber-500/20";
      default: return "text-red-400 bg-red-500/20";
    }
  };

  return (
    <>
      <Button 
        onClick={gerarRelatorio}
        className="w-full bg-gradient-to-r from-[#FF4D00] to-[#FF6B00] hover:from-[#E64500] hover:to-[#FF4D00]"
      >
        <Flag size={16} className="mr-2" />
        Fechar Semana e Gerar Relatório
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="text-[#FF4D00]" size={20} />
              Relatório Semanal - {pilarTitulo}
            </DialogTitle>
          </DialogHeader>

          {relatorio && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <p className="text-sm text-white/50 mb-2">{relatorio.semana}</p>
                <div className={`inline-block px-4 py-2 rounded-full ${getStatusColor(relatorio.status)}`}>
                  {relatorio.status === "excelente" && "🎉 Excelente!"}
                  {relatorio.status === "bom" && "👍 Bom Progresso"}
                  {relatorio.status === "atencao" && "⚠️ Atenção"}
                  {relatorio.status === "critico" && "🚨 Crítico"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-3xl font-bold text-[#FF4D00]">{relatorio.metricas.progressoTarefas}%</p>
                  <p className="text-xs text-white/50">Progresso Geral</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-3xl font-bold text-emerald-400">{relatorio.metricas.tarefasConcluidas}</p>
                  <p className="text-xs text-white/50">Tarefas Concluídas</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
                  <CheckCircle2 size={16} className="mx-auto text-emerald-400 mb-1" />
                  <p className="text-lg font-bold text-emerald-400">{relatorio.metricas.tarefasConcluidas}</p>
                  <p className="text-xs text-white/50">Concluídas</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                  <Clock size={16} className="mx-auto text-amber-400 mb-1" />
                  <p className="text-lg font-bold text-amber-400">{relatorio.metricas.tarefasEmAndamento}</p>
                  <p className="text-xs text-white/50">Em Andamento</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg text-center">
                  <AlertTriangle size={16} className="mx-auto text-red-400 mb-1" />
                  <p className="text-lg font-bold text-red-400">{relatorio.metricas.tarefasPendentes}</p>
                  <p className="text-xs text-white/50">Pendentes</p>
                </div>
              </div>

              {relatorio.destaques.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white/70 mb-2">✅ Destaques da Semana</h4>
                  <ul className="space-y-1">
                    {relatorio.destaques.slice(0, 5).map((d, i) => (
                      <li key={i} className="text-sm text-white/60 flex items-center gap-2">
                        <span className="text-emerald-400">•</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {relatorio.proximasAcoes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white/70 mb-2">📌 Próximas Ações</h4>
                  <ul className="space-y-1">
                    {relatorio.proximasAcoes.map((a, i) => (
                      <li key={i} className="text-sm text-white/60 flex items-center gap-2">
                        <span className="text-[#FF4D00]">{i + 1}.</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={baixarRelatorio} className="flex-1 border-white/10 text-white">
                  <Download size={16} className="mr-2" /> Baixar Relatório
                </Button>
                <Button onClick={handleFecharSemana} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]">
                  <CheckCircle2 size={16} className="mr-2" /> Confirmar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}