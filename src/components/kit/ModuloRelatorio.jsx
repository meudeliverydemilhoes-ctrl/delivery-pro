import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, CheckCircle2, Circle, TrendingUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DOCS = ["MVV","Manual do Colaborador","Descrição de Cargos","Fichas Técnicas","Fluxogramas","Guia de Boas-Vindas","Checklists Operacionais","Plano de Ação","Relatório de Progresso"];

export default function ModuloRelatorio() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [metricas, setMetricas] = useState({ fat_inicial: "", fat_atual: "", pedidos_inicial: "", pedidos_atual: "", ticket_inicial: "", ticket_atual: "" });
  const [docsEntregues, setDocsEntregues] = useState({});
  const [analise, setAnalise] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: briefings = [] } = useQuery({ queryKey: ["briefings-all"], queryFn: () => base44.entities.Briefing.list() });

  const mentorado = mentorados.find(m => m.id === mentoradoId);
  const briefing = briefings.find(b => b.mentorado_id === mentoradoId);
  const semana = mentorado?.data_entrada ? Math.min(Math.max(Math.ceil((new Date()-new Date(mentorado.data_entrada))/604800000),1),12) : 0;
  const docsCount = Object.values(docsEntregues).filter(Boolean).length;

  const ao_selecionar = (id) => {
    setMentoradoId(id);
    const b = briefings.find(x => x.mentorado_id === id);
    if (b) {
      setMetricas(m => ({
        ...m,
        fat_inicial: b.faturamento_mensal || "",
        pedidos_inicial: b.media_pedidos_dia || "",
        ticket_inicial: b.ticket_medio || ""
      }));
    }
  };

  const gerar = async () => {
    setLoading(true);
    const prompt = `Você é mentora Brenda Pereira. Gere uma análise de progresso detalhada e motivadora para o mentorado ${mentorado?.nome} (${mentorado?.negocio}):

Semana atual: ${semana}/12
Faturamento: R$${metricas.fat_inicial} → R$${metricas.fat_atual}
Pedidos/dia: ${metricas.pedidos_inicial} → ${metricas.pedidos_atual}
Ticket médio: R$${metricas.ticket_inicial} → R$${metricas.ticket_atual}
Documentos entregues: ${docsCount}/${DOCS.length}
Etapa: ${mentorado?.etapa || "diagnostico"}

Retorne JSON com: resumo_executivo (2 parágrafos), pontos_destaque (array 3 conquistas), pontos_atencao (array 2-3 itens), proximos_passos (array 4 ações), frase_motivacional (frase impactante)`;
    
    const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: "object", properties: {
      resumo_executivo: {type:"string"},
      pontos_destaque: {type:"array",items:{type:"string"}},
      pontos_atencao: {type:"array",items:{type:"string"}},
      proximos_passos: {type:"array",items:{type:"string"}},
      frase_motivacional: {type:"string"}
    }}});
    setAnalise(res);
    setLoading(false);
  };

  const fatGrowth = metricas.fat_inicial && metricas.fat_atual ? (((+metricas.fat_atual - +metricas.fat_inicial) / +metricas.fat_inicial) * 100).toFixed(1) : null;

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
        <div>
          <Label className="text-white/60">Mentorado</Label>
          <select value={mentoradoId} onChange={e=>ao_selecionar(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
            <option value="">Selecione...</option>
            {mentorados.map(m=><option key={m.id} value={m.id} style={{background:"#111"}}>{m.nome} — {m.negocio}</option>)}
          </select>
        </div>
        
        {mentoradoId && (
          <>
            {/* Timeline semanas */}
            <div>
              <Label className="text-white/60 mb-2 block">Timeline — Semana {semana}/12</Label>
              <div className="flex gap-1">
                {Array.from({length:12},(_,i)=>(
                  <div key={i} className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-bold transition-all ${i<semana ? "bg-[#7c6bff] text-white" : i===semana ? "bg-[#E8601C] text-white" : "bg-white/10 text-white/30"}`}>
                    {i+1}
                  </div>
                ))}
              </div>
            </div>

            {/* Métricas */}
            <div>
              <Label className="text-white/60 mb-2 block">Métricas — Inicial vs Atual</Label>
              <div className="grid grid-cols-3 gap-3">
                {[["Faturamento (R$)","fat"],["Pedidos/dia","pedidos"],["Ticket Médio (R$)","ticket"]].map(([label,key])=>(
                  <div key={key} className="bg-white/5 rounded-xl p-3 space-y-2">
                    <p className="text-white/40 text-xs">{label}</p>
                    <div className="flex gap-2">
                      <Input value={metricas[`${key}_inicial`]} onChange={e=>setMetricas({...metricas,[`${key}_inicial`]:e.target.value})} placeholder="Inicial" className="bg-white/5 border-white/10 text-white text-sm"/>
                      <Input value={metricas[`${key}_atual`]} onChange={e=>setMetricas({...metricas,[`${key}_atual`]:e.target.value})} placeholder="Atual" className="bg-white/5 border-white/10 text-white text-sm"/>
                    </div>
                  </div>
                ))}
              </div>
              {fatGrowth && (
                <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${+fatGrowth>0?"bg-[#10B981]/20 text-[#10B981]":"bg-red-500/20 text-red-400"}`}>
                  <TrendingUp size={14}/> Faturamento: {+fatGrowth>0?"+":""}{fatGrowth}%
                </div>
              )}
            </div>

            {/* Documentos entregues */}
            <div>
              <Label className="text-white/60 mb-2 block">Documentos Entregues ({docsCount}/{DOCS.length})</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DOCS.map(d=>(
                  <button key={d} onClick={()=>setDocsEntregues(prev=>({...prev,[d]:!prev[d]}))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${docsEntregues[d]?"bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40":"bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`}>
                    {docsEntregues[d]?<CheckCircle2 size={14}/>:<Circle size={14}/>} {d}
                  </button>
                ))}
              </div>
              <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full transition-all" style={{width:`${(docsCount/DOCS.length)*100}%`}}/>
              </div>
            </div>
          </>
        )}

        <Button onClick={gerar} disabled={loading||!mentoradoId} className="w-full bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold py-3">
          {loading?<><Loader2 size={18} className="mr-2 animate-spin"/>Analisando com IA...</>:<><Sparkles size={18} className="mr-2"/>🤖 Gerar Relatório com IA</>}
        </Button>
      </div>

      {analise && (
        <div className="space-y-4">
          {analise.frase_motivacional && (
            <div className="bg-[#7c6bff]/10 border border-[#7c6bff]/30 rounded-2xl p-5 text-center">
              <p className="text-[#FFD700] font-black text-xl italic">"{analise.frase_motivacional}"</p>
            </div>
          )}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-[#7c6bff] font-bold mb-3">📝 Resumo Executivo</h3>
            <p className="text-white/80 whitespace-pre-wrap text-sm">{analise.resumo_executivo}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl p-5">
              <h3 className="text-[#10B981] font-bold mb-3">🏆 Pontos em Destaque</h3>
              <ul className="space-y-2">{(analise.pontos_destaque||[]).map((p,i)=><li key={i} className="flex gap-2 text-sm text-white/80"><span className="text-[#10B981]">✓</span>{p}</li>)}</ul>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
              <h3 className="text-amber-400 font-bold mb-3">⚠️ Pontos de Atenção</h3>
              <ul className="space-y-2">{(analise.pontos_atencao||[]).map((p,i)=><li key={i} className="flex gap-2 text-sm text-white/80"><span className="text-amber-400">!</span>{p}</li>)}</ul>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-[#E8601C] font-bold mb-3">🚀 Próximos Passos</h3>
            <ol className="space-y-2">{(analise.proximos_passos||[]).map((p,i)=><li key={i} className="flex gap-3 text-sm text-white/80"><span className="w-6 h-6 rounded-full bg-[#E8601C] text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">{i+1}</span>{p}</li>)}</ol>
          </div>
        </div>
      )}
    </div>
  );
}