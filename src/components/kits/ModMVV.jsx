import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const TIPOS = ["Pizzaria", "Hamburgueria", "Açaí", "Marmita", "Frango Frito", "Sushi", "Outro"];

const imprimir = (nomeNegocio) => {
  const html = document.getElementById('mvv-preview').innerHTML;
  const w = window.open('', '_blank', 'width=1400,height=900');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>MVV - ${nomeNegocio}</title>
  <style>*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;}@page{size:portrait;margin:8mm;}</style>
  </head><body>${html}<script>setTimeout(()=>{window.print();},400);<\/script></body></html>`);
  w.document.close();
};

export default function ModMVV() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [tipo, setTipo] = useState("Pizzaria");
  const [diferenciais, setDiferenciais] = useState("");
  const [sonho, setSonho] = useState("");
  const [loading, setLoading] = useState(false);
  const [mvv, setMvv] = useState(null);

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const obj = mentorados.find(m => m.id === mentoradoId);
  const nomeNegocio = obj?.negocio || "";

  const gerar = async () => {
    if (!nomeNegocio) return alert("Selecione um mentorado.");
    setLoading(true);
    try {
      const res = await base44.functions.invoke('kitIA', {
        system: 'Crie documentos de identidade empresarial para delivery. Responda SOMENTE com JSON válido sem markdown.',
        prompt: `Crie Missão, Visão e Valores para:
Nome: ${nomeNegocio}
Tipo: ${tipo}
Diferenciais: ${diferenciais}
Sonho do dono: ${sonho}

Retorne SOMENTE este JSON:
{"missao":"texto da missão em 2-3 linhas impactante","visao":"texto da visão em 2-3 linhas inspiradora","valores":[{"nome":"NOME DO VALOR","descricao":"descrição em 1 linha"},{"nome":"...","descricao":"..."},{"nome":"...","descricao":"..."},{"nome":"...","descricao":"..."},{"nome":"...","descricao":"..."}]}`
      });
      setMvv(res.data.resultado);
    } catch (err) {
      alert('Erro ao gerar. Verifique se a ANTHROPIC_API_KEY está configurada.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[2fr_3fr] gap-6">
      {/* Formulário */}
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
          <Label className="text-white/60 text-sm">Diferenciais do Negócio</Label>
          <textarea value={diferenciais} onChange={e => setDiferenciais(e.target.value)} rows={3}
            placeholder="Ex: ingredientes frescos, entrega rápida, atendimento personalizado..."
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm resize-none" />
        </div>
        <div>
          <Label className="text-white/60 text-sm">Sonho do Dono</Label>
          <textarea value={sonho} onChange={e => setSonho(e.target.value)} rows={2}
            placeholder="Ex: ter 3 unidades em 5 anos..."
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm resize-none" />
        </div>
        <Button onClick={gerar} disabled={loading || !mentoradoId} className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3">
          {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Gerando...</> : <><Sparkles size={16} className="mr-2" />🤖 Gerar com IA</>}
        </Button>
        {mvv && (
          <Button onClick={() => imprimir(nomeNegocio)} className="w-full bg-[#E8601C] hover:bg-[#d45218] text-white font-bold">
            <Printer size={16} className="mr-2" />🖨️ Imprimir MVV
          </Button>
        )}
      </div>

      {/* Preview */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        {!mvv ? (
          <div className="h-64 flex items-center justify-center text-white/20 text-sm">Preview aparece após geração</div>
        ) : (
          <div id="mvv-preview" style={{ background: '#fff', padding: '32px', fontFamily: 'Arial,sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#E8601C', textTransform: 'uppercase', letterSpacing: '3px' }}>{nomeNegocio}</h1>
              <p style={{ fontSize: '12px', color: '#888', letterSpacing: '4px', textTransform: 'uppercase', marginTop: '4px' }}>Identidade Empresarial</p>
            </div>

            {/* Missão */}
            <div style={{ background: '#000', borderRadius: '12px', padding: '28px', marginBottom: '16px', textAlign: 'center' }}>
              <h2 style={{ color: '#E8601C', fontSize: '11px', letterSpacing: '4px', fontWeight: '700', marginBottom: '8px' }}>MISSÃO</h2>
              <div style={{ height: '2px', background: '#E8601C', width: '60px', margin: '0 auto 16px' }} />
              <p style={{ color: '#fff', fontSize: '17px', fontWeight: '700', lineHeight: '1.6' }}>{mvv.missao}</p>
            </div>

            {/* Visão */}
            <div style={{ background: '#000', borderRadius: '12px', padding: '28px', marginBottom: '16px', textAlign: 'center' }}>
              <h2 style={{ color: '#FFD700', fontSize: '11px', letterSpacing: '4px', fontWeight: '700', marginBottom: '8px' }}>VISÃO</h2>
              <div style={{ height: '2px', background: '#FFD700', width: '60px', margin: '0 auto 16px' }} />
              <p style={{ color: '#fff', fontSize: '17px', fontWeight: '700', lineHeight: '1.6' }}>{mvv.visao}</p>
            </div>

            {/* Valores */}
            <div style={{ background: '#000', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
              <h2 style={{ color: '#fff', fontSize: '11px', letterSpacing: '4px', fontWeight: '700', marginBottom: '8px' }}>VALORES</h2>
              <div style={{ height: '2px', background: '#fff', width: '60px', margin: '0 auto 16px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', textAlign: 'left' }}>
                {mvv.valores?.map((v, i) => (
                  <div key={i} style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px 14px', borderLeft: '3px solid #E8601C' }}>
                    <p style={{ color: '#E8601C', fontWeight: '800', fontSize: '12px', marginBottom: '4px' }}>{v.nome}</p>
                    <p style={{ color: '#aaa', fontSize: '11px', lineHeight: '1.4' }}>{v.descricao}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px', color: '#ccc', fontSize: '9px', letterSpacing: '2px' }}>
              MATERIAL EXCLUSIVO DE MENTORIA PREMIUM · DELIVERY PRO
            </div>
          </div>
        )}
      </div>
    </div>
  );
}