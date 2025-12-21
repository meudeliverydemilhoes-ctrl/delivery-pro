import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  CheckCircle2, Clock, AlertTriangle, Upload, Camera, Video,
  ArrowLeft, Trophy, Target, Flame, TrendingUp, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChecklistCard from "@/components/execucao/ChecklistCard";
import PlanoAcaoCard from "@/components/execucao/PlanoAcaoCard";

export default function MentoradoExecucao() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const mentoradoId = urlParams.get("id");

  const [activeTab, setActiveTab] = useState("pendentes");

  // Queries
  const { data: mentorado } = useQuery({
    queryKey: ["mentorado", mentoradoId],
    queryFn: () => base44.entities.Mentorado.filter({ id: mentoradoId }).then(r => r[0])
  });

  const { data: execucoes = [] } = useQuery({
    queryKey: ["execucoes", mentoradoId],
    queryFn: () => base44.entities.ExecucaoChecklist.filter({ mentorado_id: mentoradoId }, "-created_date")
  });

  const { data: planosAcao = [] } = useQuery({
    queryKey: ["planosAcao", mentoradoId],
    queryFn: () => base44.entities.PlanoAcaoInteligente.filter({ mentorado_id: mentoradoId }, "-created_date")
  });

  const { data: comunicados = [] } = useQuery({
    queryKey: ["comunicados", mentoradoId],
    queryFn: () => base44.entities.ComunicadoMentoria.filter(
      { $or: [{ mentorado_id: mentoradoId }, { mentorado_id: null }] },
      "-created_date"
    )
  });

  const { data: score } = useQuery({
    queryKey: ["score", mentoradoId],
    queryFn: async () => {
      const scores = await base44.entities.ScoreMentorado.filter({ mentorado_id: mentoradoId });
      return scores[0];
    }
  });

  const handleCreatePlanoAcao = (data) => {
    return base44.entities.PlanoAcaoInteligente.create({
      mentorado_id: mentoradoId,
      problema: data.problema,
      acao_corretiva: data.acao_corretiva || data.problema,
      execucao_id: data.execucao_id,
      item_checklist: data.item_checklist,
      pilar: data.pilar,
      prazo: data.prazo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      prioridade: data.prioridade || "media",
      status: "pendente"
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["planosAcao", mentoradoId] });
    });
  };

  const pendentes = execucoes.filter(e => e.status !== "concluido");
  const concluidos = execucoes.filter(e => e.status === "concluido");
  const planosPendentes = planosAcao.filter(p => p.status !== "concluido");
  const planosResolvidos = planosAcao.filter(p => p.status === "concluido");

  // Estatísticas
  const totalChecklists = execucoes.length;
  const checklistsConcluidos = concluidos.length;
  const taxaConclusao = totalChecklists > 0 ? Math.round((checklistsConcluidos / totalChecklists) * 100) : 0;
  const pontosTotais = score?.pontos_totais || 0;
  const scoreExecucao = score?.score_execucao || 0;

  if (!mentoradoId) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-400" />
          <p className="text-white/70 mb-4">ID do mentorado não fornecido</p>
          <Link to={createPageUrl("Dashboard")}>
            <Button className="bg-[#FF4D00] hover:bg-[#E64500]">
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={createPageUrl(`MentoradoDetalhe?id=${mentoradoId}`)}
            className="inline-flex items-center gap-2 text-[#FF4D00] hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Voltar
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Execução Inteligente</h1>
              <p className="text-white/50">{mentorado?.nome} - {mentorado?.negocio}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="text-[#FF4D00]" size={24} />
              <span className="text-xs text-white/50">Score</span>
            </div>
            <p className="text-2xl font-bold text-white">{scoreExecucao}</p>
            <Progress value={scoreExecucao} className="h-1 mt-2" />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="text-emerald-400" size={24} />
              <span className="text-xs text-white/50">Concluídos</span>
            </div>
            <p className="text-2xl font-bold text-white">{taxaConclusao}%</p>
            <p className="text-xs text-white/40">{checklistsConcluidos}/{totalChecklists}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="text-amber-400" size={24} />
              <span className="text-xs text-white/50">Pendentes</span>
            </div>
            <p className="text-2xl font-bold text-white">{planosPendentes.length}</p>
            <p className="text-xs text-white/40">Planos de Ação</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="text-[#FF4D00]" size={24} />
              <span className="text-xs text-white/50">Pontos</span>
            </div>
            <p className="text-2xl font-bold text-white">{pontosTotais}</p>
            <p className="text-xs text-white/40">Total acumulado</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10 mb-6">
            <TabsTrigger value="pendentes" className="data-[state=active]:bg-[#FF4D00]">
              <Clock size={16} className="mr-2" />
              Pendentes ({pendentes.length})
            </TabsTrigger>
            <TabsTrigger value="concluidos" className="data-[state=active]:bg-[#FF4D00]">
              <CheckCircle2 size={16} className="mr-2" />
              Concluídos ({concluidos.length})
            </TabsTrigger>
            <TabsTrigger value="planos" className="data-[state=active]:bg-[#FF4D00]">
              <Target size={16} className="mr-2" />
              Planos de Ação ({planosPendentes.length})
            </TabsTrigger>
          </TabsList>

          {/* Pendentes */}
          <TabsContent value="pendentes">
            {pendentes.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-400/50" />
                <p className="text-white/50">🎉 Nenhum checklist pendente!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendentes.map(exec => (
                  <ChecklistCard
                    key={exec.id}
                    execucao={exec}
                    onUpdate={() => queryClient.invalidateQueries({ queryKey: ["execucoes", mentoradoId] })}
                    onCreatePlanoAcao={handleCreatePlanoAcao}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Concluídos */}
          <TabsContent value="concluidos">
            {concluidos.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl">
                <Clock size={48} className="mx-auto mb-4 text-white/20" />
                <p className="text-white/50">Nenhum checklist concluído ainda</p>
              </div>
            ) : (
              <div className="space-y-4 opacity-80">
                {concluidos.map(exec => (
                  <ChecklistCard key={exec.id} execucao={exec} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Planos de Ação */}
          <TabsContent value="planos">
            {planosAcao.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl">
                <Target size={48} className="mx-auto mb-4 text-white/20" />
                <p className="text-white/50">Nenhum plano de ação criado</p>
              </div>
            ) : (
              <div className="space-y-6">
                {planosPendentes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Pendentes</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {planosPendentes.map(plano => (
                        <PlanoAcaoCard
                          key={plano.id}
                          plano={plano}
                          onUpdate={() => queryClient.invalidateQueries({ queryKey: ["planosAcao", mentoradoId] })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {planosResolvidos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-white/60 mb-4">Resolvidos</h3>
                    <div className="grid md:grid-cols-2 gap-4 opacity-70">
                      {planosResolvidos.slice(0, 4).map(plano => (
                        <PlanoAcaoCard key={plano.id} plano={plano} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Comunicados */}
        {comunicados.filter(c => !c.lido).length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Award className="text-[#FF4D00]" size={20} />
              Comunicados do Mentor
            </h3>
            <div className="space-y-3">
              {comunicados.filter(c => !c.lido).slice(0, 3).map(com => (
                <div key={com.id} className="bg-[#FF4D00]/10 border border-[#FF4D00]/30 rounded-xl p-4">
                  <h4 className="font-medium text-white mb-1">{com.titulo}</h4>
                  <p className="text-sm text-white/70">{com.mensagem}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}