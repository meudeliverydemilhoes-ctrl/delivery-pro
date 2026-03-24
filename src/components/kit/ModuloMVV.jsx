import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Printer, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ModuloMVV() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [form, setForm] = useState({ negocio: "", tipo: "", diferenciais: "", sonho: "", publico: "" });
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: briefings = [] } = useQuery({ queryKey: ["briefings-all"], queryFn: () => base44.entities.Briefing.list() });

  const gerarMVV = async () => {
    setLoading(true);
    const prompt = `Você é consultor de gestão de delivery. Crie o MVV completo para o seguinte negócio:
Negócio: ${form.negocio}
Tipo: ${form.tipo}
Diferenciais: ${form.diferenciais}
Sonho do dono: ${form.sonho}
Público-alvo: ${form.publico}

Retorne JSON com: { missao: "texto 2-3 linhas", visao: "texto 2-3 linhas", valores: [{ nome: "VALOR", descricao: "explicação 1 linha" }] } (5 valores)`;
    
    const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: "object", properties: { missao: { type: "string" }, visao: { type: "string" }, valores: { type: "array", items: { type: "object", properties: { nome: { type: "string" }, descricao: { type: "string" } } } } } } });
    setResultado(res);
    setLoading(false);
  };

  const salvar = async () => {
    if (!mentoradoId || !resultado) return;
    setSalvando(true);
    const briefing = briefings.find(b => b.mentorado_id === mentoradoId);
    const mvvData = { ...resultado, titulo: form.negocio, data_geracao: new Date().toISOString() };
    if (briefing?.id) {
      await base44.entities.Briefing.update(briefing.id, { ...briefing, diagnostico_status: { ...briefing.diagnostico_status, mvv: mvvData } });
    } else {
      await base44.entities.Briefing.create({ mentorado_id: mentoradoId, diagnostico_status: { mvv: mvvData } });
    }
    setSalvando(false);
    alert("MVV salvo com sucesso!");
  };

  const imprimir = () => {
    const mentorado = mentorados.find(m => m.id === mentoradoId);
    const html = `<!DOCTYPE html><html><head><title>MVV - ${form.negocio}</title>
<style>
  @page { margin: 20mm; }
  body { background: #000; color: #fff; font-family: 'Arial Black', sans-serif; margin: 0; padding: 40px; -webkit-print-color-adjust: exact; }
  h1 { color: #FFD700; font-size: 36px; text-align: center; text-transform: uppercase; border-bottom: 3px solid #E8601C; padding-bottom: 20px; margin-bottom: 40px; }
  .section { margin-bottom: 40px; padding: 30px; border: 1px solid #333; border-radius: 8px; }
  .section h2 { color: #E8601C; font-size: 22px; text-transform: uppercase; margin-bottom: 15px; }
  .section p { font-size: 16px; line-height: 1.8; color: #eee; }
  .valores { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
  .valor { background: #111; padding: 20px; border-left: 4px solid #FFD700; border-radius: 4px; }
  .valor h3 { color: #FFD700; font-size: 18px; margin-bottom: 8px; }
  .valor p { color: #ccc; font-size: 14px; }
  .footer { text-align: center; color: #555; margin-top: 60px; font-size: 12px; }
</style></head><body>
<h1>${form.negocio}</h1>
<div class="section"><h2>🎯 Missão</h2><p>${resultado?.missao || ""}</p></div>
<div class="section"><h2>🔭 Visão</h2><p>${resultado?.visao || ""}</p></div>
<div class="section"><h2>💎 Valores</h2>
<div class="valores">${(resultado?.valores || []).map(v => `<div class="valor"><h3>${v.nome}</h3><p>${v.descricao}</p></div>`).join("")}</div>
</div>
<div class="footer">MATERIAL EXCLUSIVO DE MENTORIA PREMIUM · ${mentorado?.nome || ""}</div>
</body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6">
      {/* Formulário */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Dados do Negócio</h2>
        <div>
          <Label className="text-white/60">Mentorado</Label>
          <select value={mentoradoId} onChange={e => setMentoradoId(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
            <option value="">Selecione...</option>
            {mentorados.map(m => <option key={m.id} value={m.id} style={{ background: "#111" }}>{m.nome} — {m.negocio}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label className="text-white/60">Nome do Negócio</Label>
            <Input value={form.negocio} onChange={e => setForm({...form, negocio: e.target.value})} className="bg-white/5 border-white/10 text-white mt-1" /></div>
          <div><Label className="text-white/60">Tipo de Delivery</Label>
            <Input value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} placeholder="Ex: Pizzaria, Açaí, Hamburguer" className="bg-white/5 border-white/10 text-white mt-1" /></div>
        </div>
        <div><Label className="text-white/60">Diferenciais do Negócio</Label>
          <Textarea value={form.diferenciais} onChange={e => setForm({...form, diferenciais: e.target.value})} placeholder="Ex: entrega em 30min, ingredientes premium, atendimento humanizado" className="bg-white/5 border-white/10 text-white mt-1" rows={2} /></div>
        <div><Label className="text-white/60">Sonho do Dono</Label>
          <Input value={form.sonho} onChange={e => setForm({...form, sonho: e.target.value})} placeholder="Ex: ser referência de pizza artesanal na cidade" className="bg-white/5 border-white/10 text-white mt-1" /></div>
        <div><Label className="text-white/60">Público-Alvo</Label>
          <Input value={form.publico} onChange={e => setForm({...form, publico: e.target.value})} placeholder="Ex: famílias, jovens de 18-35 anos, trabalhadores" className="bg-white/5 border-white/10 text-white mt-1" /></div>
        <Button onClick={gerarMVV} disabled={loading || !form.negocio} className="w-full bg-[#7c6bff] hover:bg-[#6a59e0] text-white font-bold py-3">
          {loading ? <><Loader2 size={18} className="mr-2 animate-spin" />Gerando com IA...</> : <><Sparkles size={18} className="mr-2" />✨ Gerar MVV com IA</>}
        </Button>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-[#7c6bff]/30 rounded-2xl p-6">
            <h3 className="text-[#FFD700] font-bold text-lg mb-2">🎯 MISSÃO</h3>
            <Textarea value={resultado.missao} onChange={e => setResultado({...resultado, missao: e.target.value})} className="bg-white/5 border-white/10 text-white" rows={3} />
          </div>
          <div className="bg-white/5 border border-[#7c6bff]/30 rounded-2xl p-6">
            <h3 className="text-[#FFD700] font-bold text-lg mb-2">🔭 VISÃO</h3>
            <Textarea value={resultado.visao} onChange={e => setResultado({...resultado, visao: e.target.value})} className="bg-white/5 border-white/10 text-white" rows={3} />
          </div>
          <div className="bg-white/5 border border-[#7c6bff]/30 rounded-2xl p-6">
            <h3 className="text-[#FFD700] font-bold text-lg mb-3">💎 VALORES</h3>
            <div className="space-y-3">
              {(resultado.valores || []).map((v, i) => (
                <div key={i} className="flex gap-3">
                  <Input value={v.nome} onChange={e => { const vals=[...resultado.valores]; vals[i]={...vals[i],nome:e.target.value}; setResultado({...resultado,valores:vals}); }} className="bg-white/5 border-white/10 text-[#FFD700] font-bold w-40" />
                  <Input value={v.descricao} onChange={e => { const vals=[...resultado.valores]; vals[i]={...vals[i],descricao:e.target.value}; setResultado({...resultado,valores:vals}); }} className="bg-white/5 border-white/10 text-white flex-1" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={salvar} disabled={salvando || !mentoradoId} className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white">
              {salvando ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />} Salvar no Perfil
            </Button>
            <Button onClick={imprimir} className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20">
              <Printer size={16} className="mr-2" /> 🖨️ Imprimir PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}