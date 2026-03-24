import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ModuloGuia() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [form, setForm] = useState({ nome: "", negocio: "", data_inicio: "", mentor: "Brenda Pereira" });
  const [guia, setGuia] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });

  const ao_selecionar = (id) => {
    setMentoradoId(id);
    const m = mentorados.find(x => x.id === id);
    if (m) setForm(f => ({ ...f, nome: m.nome, negocio: m.negocio, data_inicio: m.data_entrada || "" }));
  };

  const gerar = async () => {
    setLoading(true);
    const prompt = `Você é Brenda Pereira, mentora especialista em delivery. Crie um guia de boas-vindas completo e emocionante para o mentorado:
Nome: ${form.nome} | Negócio: ${form.negocio} | Data início: ${form.data_inicio}

Crie um JSON com:
- carta_boas_vindas: carta personalizada e motivadora (3 parágrafos)
- como_funciona: explicação da mentoria 12 semanas e 5 pilares (Processos, Desempenho, Tempo de Potência, Norte Estratégico, Presença Magnética)
- o_que_vai_receber: lista de 7 entregáveis (fluxogramas, fichas técnicas, manual, MVV, checklists, planos de ação, relatórios)
- compromissos: 5 compromissos do mentorado
- cronograma: array de 12 objetos { semana: número, titulo: string, foco: string }`;

    const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: "object", properties: {
      carta_boas_vindas: {type:"string"},
      como_funciona: {type:"string"},
      o_que_vai_receber: {type:"array",items:{type:"string"}},
      compromissos: {type:"array",items:{type:"string"}},
      cronograma: {type:"array",items:{type:"object",properties:{semana:{type:"number"},titulo:{type:"string"},foco:{type:"string"}}}}
    }}});
    setGuia(res);
    setLoading(false);
  };

  const imprimir = () => {
    const html = `<!DOCTYPE html><html><head><title>Guia - ${form.nome}</title>
<style>@page{margin:18mm} body{background:#0a0a0f;color:#fff;font-family:'Arial',sans-serif;margin:0;padding:30px;-webkit-print-color-adjust:exact}
h1{color:#FFD700;font-size:30px;text-align:center;text-transform:uppercase;margin-bottom:5px}
.sub{text-align:center;color:#E8601C;font-size:18px;margin-bottom:40px}
.secao{margin-bottom:30px;padding:25px;border:1px solid #222;border-radius:8px;background:#111}
.secao h2{color:#7c6bff;font-size:18px;text-transform:uppercase;border-left:4px solid #7c6bff;padding-left:12px;margin-bottom:15px}
.secao p,.secao li{color:#ddd;line-height:1.8;font-size:14px}
.item{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
.bullet{color:#FFD700;font-weight:bold;flex-shrink:0}
.crono{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.sem{background:#1a1a2e;padding:12px;border-radius:6px;border:1px solid #7c6bff33}
.sem .n{color:#7c6bff;font-size:11px;font-weight:bold;text-transform:uppercase}
.sem .t{color:#FFD700;font-size:13px;font-weight:bold;margin:4px 0}
.sem .f{color:#aaa;font-size:11px}
.footer{text-align:center;color:#555;margin-top:40px;font-size:11px;border-top:1px solid #222;padding-top:15px}
</style></head><body>
<h1>Guia de Boas-Vindas</h1>
<div class="sub">${form.nome} · ${form.negocio}</div>
<div class="secao"><h2>💌 Carta de Boas-Vindas</h2><p>${(guia?.carta_boas_vindas||"").replace(/\n/g,"<br>")}</p></div>
<div class="secao"><h2>📚 Como Funciona a Mentoria</h2><p>${(guia?.como_funciona||"").replace(/\n/g,"<br>")}</p></div>
<div class="secao"><h2>🎁 O Que Você Vai Receber</h2>${(guia?.o_que_vai_receber||[]).map(i=>`<div class="item"><span class="bullet">✅</span><span>${i}</span></div>`).join("")}</div>
<div class="secao"><h2>🤝 Seus Compromissos</h2>${(guia?.compromissos||[]).map(c=>`<div class="item"><span class="bullet">●</span><span>${c}</span></div>`).join("")}</div>
<div class="secao"><h2>📅 Cronograma das 12 Semanas</h2><div class="crono">${(guia?.cronograma||[]).map(s=>`<div class="sem"><div class="n">Semana ${s.semana}</div><div class="t">${s.titulo}</div><div class="f">${s.foco}</div></div>`).join("")}</div></div>
<div class="secao" style="background:#1a0a00;border-color:#E8601C44"><h2 style="color:#E8601C">📞 Equipe de Suporte</h2><p>Talison Rosa · Brenda Pereira · Marcel · Rosiane<br>WhatsApp da mentoria · App Delivery Pro</p></div>
<div class="footer">MATERIAL EXCLUSIVO DE MENTORIA PREMIUM · Mentor: ${form.mentor}</div>
</body></html>`;
    const w=window.open("","_blank"); w.document.write(html); w.document.close(); w.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div>
          <Label className="text-white/60">Mentorado</Label>
          <select value={mentoradoId} onChange={e=>ao_selecionar(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
            <option value="">Selecione...</option>
            {mentorados.map(m=><option key={m.id} value={m.id} style={{background:"#111"}}>{m.nome} — {m.negocio}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label className="text-white/60">Nome</Label><Input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="bg-white/5 border-white/10 text-white mt-1"/></div>
          <div><Label className="text-white/60">Negócio</Label><Input value={form.negocio} onChange={e=>setForm({...form,negocio:e.target.value})} className="bg-white/5 border-white/10 text-white mt-1"/></div>
          <div><Label className="text-white/60">Data de Início</Label><Input type="date" value={form.data_inicio} onChange={e=>setForm({...form,data_inicio:e.target.value})} className="bg-white/5 border-white/10 text-white mt-1"/></div>
          <div><Label className="text-white/60">Mentor Responsável</Label><Input value={form.mentor} onChange={e=>setForm({...form,mentor:e.target.value})} className="bg-white/5 border-white/10 text-white mt-1"/></div>
        </div>
        <Button onClick={gerar} disabled={loading||!form.nome} className="w-full bg-[#F59E0B] hover:bg-[#d97706] text-black font-bold py-3">
          {loading ? <><Loader2 size={18} className="mr-2 animate-spin"/>Gerando Guia...</> : <><Sparkles size={18} className="mr-2"/>✨ Gerar Guia de Boas-Vindas</>}
        </Button>
      </div>
      {guia && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-[#F59E0B] font-bold mb-3">💌 Carta de Boas-Vindas</h3>
            <Textarea value={guia.carta_boas_vindas} onChange={e=>setGuia({...guia,carta_boas_vindas:e.target.value})} className="bg-white/5 border-white/10 text-white" rows={5}/>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-[#F59E0B] font-bold mb-3">📅 Cronograma — {guia.cronograma?.length} semanas</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(guia.cronograma||[]).map((s,i)=>(
                <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-[#7c6bff] text-xs font-bold">SEMANA {s.semana}</p>
                  <p className="text-white text-sm font-semibold">{s.titulo}</p>
                  <p className="text-white/40 text-xs">{s.foco}</p>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={imprimir} className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <Printer size={16} className="mr-2"/>🖨️ Imprimir Guia Completo
          </Button>
        </div>
      )}
    </div>
  );
}