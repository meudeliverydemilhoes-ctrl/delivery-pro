import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const SECOES_DEFAULT = ["Valores da Empresa","Postura Esperada","Uniforme e Apresentação","Uso de Celular","Faltas e Atrasos","Higiene e Limpeza","Produto e Qualidade","Proibições Absolutas (Justa Causa)"];
const COR_SECOES = ["#7c6bff","#E8601C","#10B981","#3B82F6","#F59E0B","#06B6D4","#A855F7","#EF4444"];

export default function ModuloManual() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [form, setForm] = useState({ negocio: "", dono: "", horario: "", cargos: "", regras: "" });
  const [secoes, setSecoes] = useState([]);
  const [ativos, setAtivos] = useState({});
  const [loading, setLoading] = useState(false);
  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });

  const gerar = async () => {
    setLoading(true);
    const prompt = `Você é especialista em gestão de delivery. Crie um regulamento interno profissional completo para:
Negócio: ${form.negocio} | Dono: ${form.dono} | Horário: ${form.horario}
Cargos: ${form.cargos} | Regras específicas: ${form.regras}

Retorne JSON com as seções: valores_empresa, postura_esperada, uniforme_apresentacao, uso_celular, faltas_atrasos, higiene_limpeza, produto_qualidade, proibicoes_absolutas
Cada seção: { titulo: string, regras: string[] (5-8 regras objetivas) }`;

    const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: "object", properties: { valores_empresa: { type: "object" }, postura_esperada: { type: "object" }, uniforme_apresentacao: { type: "object" }, uso_celular: { type: "object" }, faltas_atrasos: { type: "object" }, higiene_limpeza: { type: "object" }, produto_qualidade: { type: "object" }, proibicoes_absolutas: { type: "object" } } } });
    
    const arr = Object.values(res).map((s, i) => ({ titulo: s.titulo || SECOES_DEFAULT[i], regras: s.regras || [], cor: COR_SECOES[i] }));
    setSecoes(arr);
    const a = {};
    arr.forEach((_, i) => { a[i] = true; });
    setAtivos(a);
    setLoading(false);
  };

  const imprimir = () => {
    const mentorado = mentorados.find(m => m.id === mentoradoId);
    const secoesAtivas = secoes.filter((_, i) => ativos[i]);
    const html = `<!DOCTYPE html><html><head><title>Manual - ${form.negocio}</title>
<style>
@page { margin: 15mm; } body { background: #0a0a0f; color: #fff; font-family: Arial, sans-serif; margin: 0; padding: 30px; -webkit-print-color-adjust: exact; }
h1 { text-align: center; font-size: 28px; color: #FFD700; border-bottom: 3px solid #E8601C; padding-bottom: 15px; margin-bottom: 30px; text-transform: uppercase; }
.secao { margin-bottom: 25px; page-break-inside: avoid; border-radius: 8px; overflow: hidden; }
.secao-header { padding: 12px 20px; font-weight: bold; font-size: 16px; color: #000; text-transform: uppercase; }
.secao-body { background: #111; padding: 15px 20px; }
.regra { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 14px; color: #eee; }
.regra::before { content: "●"; color: #FFD700; flex-shrink: 0; margin-top: 2px; }
.footer { text-align: center; color: #555; margin-top: 40px; font-size: 11px; border-top: 1px solid #333; padding-top: 15px; }
</style></head><body>
<h1>REGULAMENTO INTERNO<br><span style="font-size:18px;color:#E8601C">${form.negocio}</span></h1>
${secoesAtivas.map(s => `<div class="secao">
<div class="secao-header" style="background:${s.cor}">${s.titulo}</div>
<div class="secao-body">${s.regras.map(r => `<div class="regra">${r}</div>`).join("")}</div>
</div>`).join("")}
<div class="footer">MATERIAL EXCLUSIVO DE MENTORIA PREMIUM · ${mentorado?.nome || form.negocio}</div>
</body></html>`;
    const w = window.open("", "_blank"); w.document.write(html); w.document.close(); w.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div>
          <Label className="text-white/60">Mentorado</Label>
          <select value={mentoradoId} onChange={e => setMentoradoId(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
            <option value="">Selecione...</option>
            {mentorados.map(m => <option key={m.id} value={m.id} style={{background:"#111"}}>{m.nome} — {m.negocio}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label className="text-white/60">Nome do Negócio</Label><Input value={form.negocio} onChange={e=>setForm({...form,negocio:e.target.value})} className="bg-white/5 border-white/10 text-white mt-1" /></div>
          <div><Label className="text-white/60">Nome do Dono</Label><Input value={form.dono} onChange={e=>setForm({...form,dono:e.target.value})} className="bg-white/5 border-white/10 text-white mt-1" /></div>
          <div><Label className="text-white/60">Horário de Funcionamento</Label><Input value={form.horario} onChange={e=>setForm({...form,horario:e.target.value})} placeholder="Ex: Seg-Dom 18h-23h" className="bg-white/5 border-white/10 text-white mt-1" /></div>
          <div><Label className="text-white/60">Cargos Presentes</Label><Input value={form.cargos} onChange={e=>setForm({...form,cargos:e.target.value})} placeholder="Ex: pizzaiolo, motoboy, atendente" className="bg-white/5 border-white/10 text-white mt-1" /></div>
        </div>
        <div><Label className="text-white/60">Regras Específicas do Negócio</Label><Textarea value={form.regras} onChange={e=>setForm({...form,regras:e.target.value})} placeholder="Regras particulares que devem constar no manual..." className="bg-white/5 border-white/10 text-white mt-1" rows={3} /></div>
        <Button onClick={gerar} disabled={loading||!form.negocio} className="w-full bg-[#E8601C] hover:bg-[#d45218] text-white font-bold py-3">
          {loading ? <><Loader2 size={18} className="mr-2 animate-spin"/>Gerando Manual...</> : <><Sparkles size={18} className="mr-2"/>🤖 Gerar Manual Completo</>}
        </Button>
      </div>

      {secoes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-sm">{secoes.filter((_,i)=>ativos[i]).length} seções ativas — clique para ativar/desativar</p>
            <Button onClick={imprimir} className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
              <Printer size={16} className="mr-2" />🖨️ Imprimir
            </Button>
          </div>
          {secoes.map((s, i) => (
            <div key={i} className={`rounded-2xl border transition-all ${ativos[i] ? "border-white/20" : "border-white/5 opacity-50"}`}>
              <button onClick={() => setAtivos({...ativos,[i]:!ativos[i]})}
                className="w-full flex items-center gap-3 p-4 text-left rounded-t-2xl"
                style={{ background: `${s.cor}22`, borderBottom: `1px solid ${s.cor}33` }}>
                <span className="w-5 h-5 rounded border-2 flex items-center justify-center text-xs font-bold" style={{borderColor:s.cor,color:ativos[i]?s.cor:"transparent",background:ativos[i]?`${s.cor}22`:"transparent"}}>{ativos[i]?"✓":""}</span>
                <span className="font-bold text-white">{s.titulo}</span>
              </button>
              {ativos[i] && (
                <div className="p-4 bg-white/3 rounded-b-2xl space-y-2">
                  {s.regras.map((r, j) => (
                    <div key={j} className="flex gap-2 items-start">
                      <span className="text-[#FFD700] mt-1 flex-shrink-0">●</span>
                      <input value={r} onChange={e => { const ss=[...secoes]; ss[i]={...ss[i],regras:ss[i].regras.map((rr,jj)=>jj===j?e.target.value:rr)}; setSecoes(ss); }}
                        className="flex-1 bg-transparent border-b border-white/10 text-white/80 text-sm py-1 focus:outline-none focus:border-white/30" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}