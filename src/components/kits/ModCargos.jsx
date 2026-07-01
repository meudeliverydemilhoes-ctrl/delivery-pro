import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const TIPOS = ["Pizzaria", "Hamburgueria", "Açaí", "Marmita", "Frango Frito", "Sushi", "Outro"];
const TODOS_CARGOS = [
  "Proprietário/CEO","Gerente Operacional","Responsável de Turno","Cozinheiro/Pizzaiolo",
  "Montador","Operador de Forno","Expedição","Entregador","Atendente","Aux. Limpeza"
];

const imprimir = (nome) => {
  const html = document.getElementById('cargos-preview').innerHTML;
  const w = window.open('', '_blank', 'width=1400,height=900');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Cargos - ${nome}</title>
  <style>*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;margin:0;padding:0;box-sizing:border-box;}body{background:#000!important;font-family:Arial,sans-serif;}@page{size:portrait;margin:8mm;}</style>
  </head><body>${html}<script>setTimeout(()=>{window.print();},400);<\/script></body></html>`);
  w.document.close();
};

export default function ModCargos() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [tipo, setTipo] = useState("Pizzaria");
  const [selecionados, setSelecionados] = useState(["Cozinheiro/Pizzaiolo", "Entregador", "Atendente"]);
  const [loading, setLoading] = useState(false);
  const [cargos, setCargos] = useState(null);

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const obj = mentorados.find(m => m.id === mentoradoId);
  const nomeNegocio = obj?.negocio || "";

  const toggle = (c) => setSelecionados(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const gerar = async () => {
    if (!nomeNegocio || selecionados.length === 0) return alert("Selecione mentorado e pelo menos um cargo.");
    setLoading(true);
    try {
      const res = await base44.functions.invoke('kitIA', {
        system: 'Crie descrições de cargos para delivery/restaurantes. Responda SOMENTE com JSON.',
        prompt: `Crie descrição completa dos cargos para ${nomeNegocio} (${tipo}).
Cargos: ${selecionados.join(', ')}

Retorne SOMENTE JSON:
{"cargos":[{"nome":"CARGO","missao":"missão do cargo em 1 linha","atribuicoes":["attr1","attr2","attr3","attr4","attr5"],"nao_funcao":["item1","item2","item3"],"kpis":["kpi1","kpi2","kpi3"]}]}`
      });
      setCargos(res.data.resultado.cargos);
    } catch (err) {
      alert(err?.response?.data?.error || 'Erro ao gerar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[2fr_3fr] gap-6">
      <div className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold">Configuração</h3>
        <div>
          <Label className="text-white/60 text-sm">Mentorado</Label>
          <select value={mentoradoId} onChange={e => setMentoradoId(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm">
            <option value="" style={{ background: "#111" }}>Selecione...</option>
            {mentorados.map(m => <option key={m.id} value={m.id} style={{ background: "#111" }}>{m.nome} — {m.negocio}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-white/60 text-sm">Tipo de Delivery</Label>
          <select value={tipo} onChange={e => setTipo(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm">
            {TIPOS.map(t => <option key={t} value={t} style={{ background: "#111" }}>{t}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-white/60 text-sm mb-2 block">Cargos a gerar</Label>
          <div className="space-y-2">
            {TODOS_CARGOS.map(c => (
              <label key={c} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={selecionados.includes(c)} onChange={() => toggle(c)}
                  className="rounded border-white/20 bg-white/5" />
                <span className="text-white text-sm">{c}</span>
              </label>
            ))}
          </div>
        </div>
        <Button onClick={gerar} disabled={loading || !mentoradoId} className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3">
          {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Gerando...</> : <><Sparkles size={16} className="mr-2" />🤖 Gerar Cargos</>}
        </Button>
        {cargos && (
          <Button onClick={() => imprimir(nomeNegocio)} className="w-full bg-[#E8601C] hover:bg-[#d45218] text-white font-bold">
            <Printer size={16} className="mr-2" />🖨️ Imprimir Cargos
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 overflow-y-auto max-h-[80vh]">
        {!cargos ? (
          <div className="h-64 flex items-center justify-center text-white/20 text-sm">Preview aparece após geração</div>
        ) : (
          <div id="cargos-preview" style={{ background: '#000', padding: '16px', fontFamily: 'Arial,sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px', padding: '12px', borderBottom: '2px solid #E8601C' }}>
              <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: '900', letterSpacing: '2px' }}>DESCRIÇÃO DE CARGOS</h1>
              <p style={{ color: '#E8601C', fontSize: '13px', fontWeight: '700', marginTop: '4px' }}>{nomeNegocio.toUpperCase()}</p>
            </div>
            {cargos.map((cargo, i) => (
              <div key={i} style={{ background: '#111', borderRadius: '10px', marginBottom: '16px', overflow: 'hidden', border: '1px solid #2a2a2a' }}>
                <div style={{ background: '#E8601C', padding: '10px 16px' }}>
                  <h2 style={{ color: '#000', fontSize: '14px', fontWeight: '900', letterSpacing: '1px' }}>{cargo.nome?.toUpperCase()}</h2>
                  <p style={{ color: '#000', fontSize: '11px', marginTop: '2px', opacity: 0.8 }}>{cargo.missao}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                  <div style={{ padding: '12px 14px', borderRight: '1px solid #2a2a2a' }}>
                    <p style={{ color: '#FFD700', fontSize: '10px', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>✅ ATRIBUIÇÕES</p>
                    {cargo.atribuicoes?.map((a, j) => (
                      <div key={j} style={{ color: '#ddd', fontSize: '10px', lineHeight: '1.8', display: 'flex', gap: '6px' }}>
                        <span style={{ color: '#E8601C' }}>→</span> {a}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ color: '#ff6b6b', fontSize: '10px', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>❌ NÃO É FUNÇÃO</p>
                    {cargo.nao_funcao?.map((a, j) => (
                      <div key={j} style={{ color: '#999', fontSize: '10px', lineHeight: '1.8', display: 'flex', gap: '6px' }}>
                        <span style={{ color: '#ff6b6b' }}>✕</span> {a}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '10px 14px', borderTop: '1px solid #2a2a2a', background: '#0d0d0d' }}>
                  <p style={{ color: '#4CAF50', fontSize: '10px', fontWeight: '700', letterSpacing: '1px', marginBottom: '6px' }}>📊 KPIs</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {cargo.kpis?.map((k, j) => (
                      <span key={j} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#4CAF50', fontSize: '9px', padding: '3px 8px', borderRadius: '4px' }}>{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', color: '#444', fontSize: '8px', letterSpacing: '2px', marginTop: '8px' }}>
              MATERIAL EXCLUSIVO DE MENTORIA PREMIUM · DELIVERY PRO
            </div>
          </div>
        )}
      </div>
    </div>
  );
}