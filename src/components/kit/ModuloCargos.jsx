import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Printer, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CARGOS_LISTA = [
  "Proprietário/CEO","Gerente Operacional","Responsável de Turno","Cozinheiro/Pizzaiolo",
  "Montador","Operador de Forno","Expedição","Entregador","Atendente","Aux. Limpeza","Aux. de Produção"
];

export default function ModuloCargos() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [tipo, setTipo] = useState("");
  const [selecionados, setSelecionados] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandido, setExpandido] = useState({});
  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });

  const toggle = (c) => setSelecionados(s => s.includes(c) ? s.filter(x=>x!==c) : [...s,c]);

  const gerar = async () => {
    setLoading(true);
    const prompt = `Você é especialista em gestão de delivery. Para um ${tipo}, crie descrição de cargos detalhada para os seguintes cargos: ${selecionados.join(", ")}.

Para cada cargo, retorne objeto com: cargo (nome), missao (1 frase), atribuicoes (array 5-7 itens), nao_funcao (array 3-4 itens), kpis (array 3-4 métricas).
Retorne JSON com array "cargos".`;

    const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: "object", properties: { cargos: { type: "array", items: { type: "object", properties: { cargo: {type:"string"}, missao: {type:"string"}, atribuicoes: {type:"array",items:{type:"string"}}, nao_funcao: {type:"array",items:{type:"string"}}, kpis: {type:"array",items:{type:"string"}} } } } } } });
    setCargos(res.cargos || []);
    const exp = {};
    (res.cargos||[]).forEach((_,i) => { exp[i] = i === 0; });
    setExpandido(exp);
    setLoading(false);
  };

  const imprimir = () => {
    const mentorado = mentorados.find(m => m.id === mentoradoId);
    const html = `<!DOCTYPE html><html><head><title>Cargos</title>
<style>@page{margin:15mm} body{background:#fff;color:#000;font-family:Arial,sans-serif;margin:0;padding:20px;-webkit-print-color-adjust:exact}
h1{background:#000;color:#FFD700;padding:20px;text-align:center;font-size:24px;margin:0 0 20px}
.cargo{margin-bottom:30px;page-break-inside:avoid;border:1px solid #ddd;border-radius:6px;overflow:hidden}
.cargo-header{background:#E8601C;color:#000;padding:12px 20px;font-weight:bold;font-size:18px;text-transform:uppercase}
.cargo-body{padding:15px 20px;display:grid;grid-template-columns:1fr 1fr;gap:15px}
.secao h4{color:#E8601C;font-size:13px;text-transform:uppercase;margin:0 0 8px;font-weight:900}
.secao ul{margin:0;padding-left:18px;font-size:13px;color:#333}
.missao{grid-column:1/-1;background:#f9f9f9;padding:10px 15px;border-radius:4px;font-style:italic;font-size:14px}
.footer{text-align:center;color:#999;margin-top:30px;font-size:11px}
</style></head><body>
<h1>DESCRIÇÃO DE CARGOS E FUNÇÕES</h1>
${cargos.map(c=>`<div class="cargo">
<div class="cargo-header">${c.cargo}</div>
<div class="cargo-body">
<div class="missao">🎯 <strong>Missão:</strong> ${c.missao}</div>
<div class="secao"><h4>✅ Atribuições</h4><ul>${(c.atribuicoes||[]).map(a=>`<li>${a}</li>`).join("")}</ul></div>
<div class="secao"><h4>🚫 Não é função deste cargo</h4><ul>${(c.nao_funcao||[]).map(a=>`<li>${a}</li>`).join("")}</ul></div>
<div class="secao" style="grid-column:1/-1"><h4>📊 KPIs de Avaliação</h4><ul>${(c.kpis||[]).map(a=>`<li>${a}</li>`).join("")}</ul></div>
</div></div>`).join("")}
<div class="footer">MATERIAL EXCLUSIVO DE MENTORIA PREMIUM · ${mentorado?.nome||tipo}</div>
</body></html>`;
    const w = window.open("","_blank"); w.document.write(html); w.document.close(); w.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div>
          <Label className="text-white/60">Mentorado</Label>
          <select value={mentoradoId} onChange={e=>setMentoradoId(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
            <option value="">Selecione...</option>
            {mentorados.map(m=><option key={m.id} value={m.id} style={{background:"#111"}}>{m.nome} — {m.negocio}</option>)}
          </select>
        </div>
        <div><Label className="text-white/60">Tipo de Delivery</Label>
          <Input value={tipo} onChange={e=>setTipo(e.target.value)} placeholder="Ex: Pizzaria, Hamburguer, Açaí" className="bg-white/5 border-white/10 text-white mt-1" /></div>
        <div>
          <Label className="text-white/60 mb-2 block">Cargos Existentes (selecione todos)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CARGOS_LISTA.map(c => (
              <button key={c} onClick={() => toggle(c)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${selecionados.includes(c) ? "bg-[#10B981] text-black" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
                {selecionados.includes(c) ? "✓ " : ""}{c}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={gerar} disabled={loading||selecionados.length===0} className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3">
          {loading ? <><Loader2 size={18} className="mr-2 animate-spin"/>Gerando Cargos...</> : <><Sparkles size={18} className="mr-2"/>🤖 Gerar Cargos com IA ({selecionados.length})</>}
        </Button>
      </div>

      {cargos.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button onClick={imprimir} className="bg-white/10 hover:bg-white/20 text-white border border-white/20"><Printer size={16} className="mr-2"/>🖨️ Imprimir</Button>
          </div>
          {cargos.map((c, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => setExpandido({...expandido,[i]:!expandido[i]})}
                className="w-full flex items-center justify-between p-4 bg-[#E8601C]/20 border-b border-[#E8601C]/20">
                <span className="font-bold text-white text-lg">{c.cargo}</span>
                {expandido[i] ? <ChevronUp size={20} className="text-white/50"/> : <ChevronDown size={20} className="text-white/50"/>}
              </button>
              {expandido[i] && (
                <div className="p-5 space-y-4">
                  <p className="text-white/70 italic text-sm bg-white/5 rounded-xl px-4 py-2">🎯 {c.missao}</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[#10B981] font-bold text-xs uppercase mb-2">✅ Atribuições</p>
                      <ul className="space-y-1">{(c.atribuicoes||[]).map((a,j)=><li key={j} className="text-white/70 text-sm flex gap-2"><span className="text-[#10B981]">•</span>{a}</li>)}</ul>
                    </div>
                    <div>
                      <p className="text-red-400 font-bold text-xs uppercase mb-2">🚫 Não é função</p>
                      <ul className="space-y-1">{(c.nao_funcao||[]).map((a,j)=><li key={j} className="text-white/70 text-sm flex gap-2"><span className="text-red-400">•</span>{a}</li>)}</ul>
                    </div>
                  </div>
                  <div>
                    <p className="text-[#FFD700] font-bold text-xs uppercase mb-2">📊 KPIs</p>
                    <div className="flex flex-wrap gap-2">{(c.kpis||[]).map((k,j)=><span key={j} className="px-3 py-1 bg-[#FFD700]/10 text-[#FFD700] rounded-full text-xs font-medium">{k}</span>)}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}