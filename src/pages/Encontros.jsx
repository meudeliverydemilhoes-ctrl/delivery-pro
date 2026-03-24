import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Save, Loader2, CheckCircle2, Calendar, Clock, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const FOCOS = ["diagnostico","processos","financeiro","marketing","equipe","operacional","cardapio","precificacao","trafego","lideranca","escala","fechamento"];
const FOCOS_LABEL = { diagnostico:"Diagnóstico", processos:"Processos", financeiro:"Financeiro", marketing:"Marketing", equipe:"Equipe", operacional:"Operacional", cardapio:"Cardápio", precificacao:"Precificação", trafego:"Tráfego Pago", lideranca:"Liderança", escala:"Escala", fechamento:"Fechamento" };
const DOCS_LIST = ["Fluxograma","Ficha Técnica","Manual","MVV","Checklist","Plano de Ação","Descrição de Cargos"];

const statusConfig = {
  realizado: { label: "✅ Realizado", bg: "bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]" },
  agendado:  { label: "📅 Agendado",  bg: "bg-[#7c6bff]/20 border-[#7c6bff]/40 text-[#7c6bff]" },
  pendente:  { label: "⏳ Pendente",  bg: "bg-white/5 border-white/10 text-white/40" },
};

function encontroVazio(n) {
  return { numero: n, status: "pendente", foco: "", data: "", o_que_foi: "", docs: {}, tarefas: [], proximos: "", link: "", nota: "" };
}

export default function Encontros() {
  const qc = useQueryClient();
  const [mentoradoId, setMentoradoId] = useState("");
  const [encontroAtivo, setEncontroAtivo] = useState(null);
  const [sugestao, setSugestao] = useState("");
  const [loadSug, setLoadSug] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState("");

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: registros = [] } = useQuery({
    queryKey: ["registros", mentoradoId],
    queryFn: () => base44.entities.RegistroAula.filter({ mentorado_id: mentoradoId }),
    enabled: !!mentoradoId
  });

  const saveMutation = useMutation({
    mutationFn: (enc) => {
      const existing = registros.find(r => r.numero_encontro === enc.numero);
      const data = { mentorado_id: mentoradoId, numero_encontro: enc.numero, data: enc.data, status: enc.status, foco: enc.foco, descricao: enc.o_que_foi, tarefas_passadas: enc.tarefas, proximos_passos: enc.proximos, link_gravacao: enc.link, nota: enc.nota ? +enc.nota : null, docs_entregues: enc.docs };
      return existing ? base44.entities.RegistroAula.update(existing.id, data) : base44.entities.RegistroAula.create(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registros", mentoradoId] })
  });

  const getEncontro = (n) => {
    const r = registros.find(x => x.numero_encontro === n);
    if (!r) return encontroVazio(n);
    return { numero: n, status: r.status||"pendente", foco: r.foco||"", data: r.data||"", o_que_foi: r.descricao||"", docs: r.docs_entregues||{}, tarefas: r.tarefas_passadas||[], proximos: r.proximos_passos||"", link: r.link_gravacao||"", nota: r.nota||"" };
  };

  const [enc, setEnc] = useState(encontroVazio(1));
  const abrirEncontro = (n) => { setEncontroAtivo(n); setEnc(getEncontro(n)); setSugestao(""); };

  const salvar = () => { saveMutation.mutate(enc); alert("Encontro salvo!"); };

  const sugerirFoco = async () => {
    setLoadSug(true);
    const m = mentorados.find(x => x.id === mentoradoId);
    const encontrosRealizados = registros.filter(r => r.status === "realizado").length;
    const prompt = `Você é a mentora Brenda Pereira. O mentorado ${m?.nome} (${m?.negocio}) está na semana ${enc.numero} da mentoria (${encontrosRealizados} encontros realizados).

Baseado no contexto de uma mentoria de delivery com 5 pilares (Processos, Desempenho, Tempo de Potência, Norte Estratégico, Presença Magnética), sugira o foco ideal para o encontro ${enc.numero} com 2-3 parágrafos explicando por quê e o que trabalhar. Seja específico e prático.`;
    const res = await base44.integrations.Core.InvokeLLM({ prompt });
    setSugestao(res);
    setLoadSug(false);
  };

  const mentorado = mentorados.find(m => m.id === mentoradoId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>👤 Encontros</h1>
        <p className="text-white/40 text-sm mt-1">Gestão dos 12 encontros de mentoria</p>
      </div>

      {/* Seleção de mentorado */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <Label className="text-white/60">Selecionar Mentorado</Label>
        <select value={mentoradoId} onChange={e=>{ setMentoradoId(e.target.value); setEncontroAtivo(null); }}
          className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white">
          <option value="">Selecione um mentorado...</option>
          {mentorados.map(m=><option key={m.id} value={m.id} style={{background:"#111"}}>{m.nome} — {m.negocio}</option>)}
        </select>
      </div>

      {mentoradoId && (
        <>
          {/* Timeline dos 12 encontros */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-white font-bold mb-4">Timeline — {mentorado?.nome}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {Array.from({length:12},(_,i)=>{
                const n = i+1;
                const r = registros.find(x=>x.numero_encontro===n);
                const s = r?.status || "pendente";
                const isAtivo = encontroAtivo === n;
                return (
                  <button key={n} onClick={()=>abrirEncontro(n)}
                    className={`p-3 rounded-xl border transition-all text-left ${isAtivo?"ring-2 ring-[#7c6bff]":""} ${s==="realizado"?"bg-[#10B981]/15 border-[#10B981]/30":s==="agendado"?"bg-[#7c6bff]/15 border-[#7c6bff]/30":"bg-white/5 border-white/10"}`}>
                    <p className="font-black text-white text-lg leading-none">{n}</p>
                    <p className="text-[10px] mt-1 leading-tight" style={{color:s==="realizado"?"#10B981":s==="agendado"?"#7c6bff":"#ffffff44"}}>
                      {s==="realizado"?"✅ Realizado":s==="agendado"?"📅 Agendado":"⏳ Pendente"}
                    </p>
                    {r?.foco && <p className="text-[9px] text-white/30 mt-0.5 capitalize">{FOCOS_LABEL[r.foco]||r.foco}</p>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detalhe do encontro */}
          {encontroAtivo && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Encontro {encontroAtivo}</h2>
                <div className="flex gap-2">
                  {["pendente","agendado","realizado"].map(s=>(
                    <button key={s} onClick={()=>setEnc({...enc,status:s})}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${enc.status===s?statusConfig[s].bg:"bg-white/5 border-white/10 text-white/40 hover:bg-white/10"}`}>
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div><Label className="text-white/60">Data do Encontro</Label>
                  <Input type="date" value={enc.data} onChange={e=>setEnc({...enc,data:e.target.value})} className="bg-white/5 border-white/10 text-white mt-1"/></div>
                <div><Label className="text-white/60">Foco Principal</Label>
                  <select value={enc.foco} onChange={e=>setEnc({...enc,foco:e.target.value})} className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
                    <option value="">Selecione...</option>
                    {FOCOS.map(f=><option key={f} value={f} style={{background:"#111"}}>{FOCOS_LABEL[f]}</option>)}
                  </select>
                </div>
                <div><Label className="text-white/60">Nota (1-10)</Label>
                  <Input type="number" min={1} max={10} value={enc.nota} onChange={e=>setEnc({...enc,nota:e.target.value})} className="bg-white/5 border-white/10 text-white mt-1"/></div>
              </div>

              <div><Label className="text-white/60">O que foi trabalhado</Label>
                <Textarea value={enc.o_que_foi} onChange={e=>setEnc({...enc,o_que_foi:e.target.value})} rows={3} className="bg-white/5 border-white/10 text-white mt-1" placeholder="Descreva os temas abordados, decisões e implementações..."/></div>

              <div>
                <Label className="text-white/60 mb-2 block">Documentos Entregues Neste Encontro</Label>
                <div className="flex flex-wrap gap-2">
                  {DOCS_LIST.map(d=>(
                    <button key={d} onClick={()=>setEnc({...enc,docs:{...enc.docs,[d]:!enc.docs[d]}})}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${enc.docs[d]?"bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]":"bg-white/5 border-white/10 text-white/50 hover:bg-white/10"}`}>
                      {enc.docs[d]?"✓ ":""}{d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-white/60 mb-2 block">Tarefas Passadas</Label>
                <div className="space-y-2 mb-2">
                  {(enc.tarefas||[]).map((t,i)=>(
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-white/60 text-sm flex-1">{t}</span>
                      <button onClick={()=>setEnc({...enc,tarefas:enc.tarefas.filter((_,j)=>j!==i)})} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={novaTarefa} onChange={e=>setNovaTarefa(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&novaTarefa.trim()){setEnc({...enc,tarefas:[...(enc.tarefas||[]),novaTarefa.trim()]});setNovaTarefa("");}}} placeholder="Adicionar tarefa..." className="bg-white/5 border-white/10 text-white"/>
                  <Button onClick={()=>{if(novaTarefa.trim()){setEnc({...enc,tarefas:[...(enc.tarefas||[]),novaTarefa.trim()]});setNovaTarefa("");}}} className="bg-white/10 border border-white/20 text-white hover:bg-white/20">+</Button>
                </div>
              </div>

              <div><Label className="text-white/60">Próximos Passos</Label>
                <Textarea value={enc.proximos} onChange={e=>setEnc({...enc,proximos:e.target.value})} rows={2} className="bg-white/5 border-white/10 text-white mt-1"/></div>

              <div><Label className="text-white/60 flex items-center gap-2"><Link2 size={14}/>Link da Gravação</Label>
                <Input value={enc.link} onChange={e=>setEnc({...enc,link:e.target.value})} placeholder="https://..." className="bg-white/5 border-white/10 text-white mt-1"/></div>

              {/* Sugestão de foco */}
              <div className="border-t border-white/10 pt-4">
                <Button onClick={sugerirFoco} disabled={loadSug} variant="outline" className="border-[#7c6bff]/40 text-[#7c6bff] hover:bg-[#7c6bff]/10">
                  {loadSug?<><Loader2 size={16} className="animate-spin mr-2"/>Analisando...</>:<><Sparkles size={16} className="mr-2"/>🤖 Sugerir foco do próximo encontro</>}
                </Button>
                {sugestao && (
                  <div className="mt-3 bg-[#7c6bff]/10 border border-[#7c6bff]/20 rounded-xl p-4">
                    <p className="text-white/80 text-sm whitespace-pre-wrap">{sugestao}</p>
                  </div>
                )}
              </div>

              <Button onClick={salvar} disabled={saveMutation.isPending} className="w-full bg-[#E8601C] hover:bg-[#d45218] text-white font-bold py-3">
                {saveMutation.isPending?<Loader2 size={18} className="animate-spin mr-2"/>:<Save size={18} className="mr-2"/>}
                Salvar Encontro {encontroAtivo}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}