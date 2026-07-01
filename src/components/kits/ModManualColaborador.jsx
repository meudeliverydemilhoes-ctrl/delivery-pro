import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TIPOS = ["Pizzaria", "Hamburgueria", "Açaí", "Marmita", "Frango Frito", "Sushi", "Outro"];

const COR = {
  postura: '#E8601C', uniforme: '#1A237E', celular: '#4A148C',
  faltas: '#E65100', higiene: '#1B5E20', qualidade: '#BF360C', proibicoes: '#B71C1C'
};

const SECOES = [
  { key: 'postura', label: 'PONTUALIDADE E PRESENÇA' },
  { key: 'uniforme', label: 'UNIFORME E APRESENTAÇÃO' },
  { key: 'celular', label: 'USO DO CELULAR' },
  { key: 'faltas', label: 'FALTAS E ATRASOS' },
  { key: 'higiene', label: 'HIGIENE E LIMPEZA' },
  { key: 'qualidade', label: 'QUALIDADE E ATENDIMENTO' },
  { key: 'proibicoes', label: 'PROIBIÇÕES — JUSTA CAUSA' },
];

const imprimir = (nome) => {
  const html = document.getElementById('manual-preview').innerHTML;
  const w = window.open('', '_blank', 'width=1400,height=900');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Regulamento - ${nome}</title>
  <style>*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;}@page{size:portrait;margin:8mm;}</style>
  </head><body>${html}<script>setTimeout(()=>{window.print();},400);<\/script></body></html>`);
  w.document.close();
};

export default function ModManualColaborador() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [tipo, setTipo] = useState("Pizzaria");
  const [horario, setHorario] = useState("10h às 23h");
  const [funcionarios, setFuncionarios] = useState("5");
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState(null);

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const obj = mentorados.find(m => m.id === mentoradoId);
  const nomeNegocio = obj?.negocio || "";

  const gerar = async () => {
    if (!nomeNegocio) return alert("Selecione um mentorado.");
    setLoading(true);
    try {
      const res = await base44.functions.invoke('kitIA', {
        system: 'Crie regulamentos internos para delivery/restaurantes. Responda SOMENTE com JSON válido sem markdown.',
        prompt: `Crie um Regulamento Interno completo para:
Nome: ${nomeNegocio}
Tipo: ${tipo}
Horário: ${horario}
Funcionários: ${funcionarios}

Retorne SOMENTE este JSON:
{"valores":"lista dos valores separados por vírgula","postura":["regra1","regra2","regra3","regra4","regra5"],"uniforme":["regra1","regra2","regra3","regra4"],"celular":["regra1","regra2","regra3"],"faltas":["regra1","regra2","regra3"],"higiene":["regra1","regra2","regra3","regra4"],"qualidade":["regra1","regra2","regra3"],"proibicoes":["proibição1 — justa causa","proibição2","proibição3","proibição4","proibição5"]}`
      });
      setManual(res.data.resultado);
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
          <Label className="text-white/60 text-sm">Horário de Funcionamento</Label>
          <Input value={horario} onChange={e => setHorario(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" />
        </div>
        <div>
          <Label className="text-white/60 text-sm">Número de Funcionários</Label>
          <Input value={funcionarios} onChange={e => setFuncionarios(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" />
        </div>
        <Button onClick={gerar} disabled={loading || !mentoradoId} className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3">
          {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Gerando...</> : <><Sparkles size={16} className="mr-2" />🤖 Gerar Regulamento</>}
        </Button>
        {manual && (
          <Button onClick={() => imprimir(nomeNegocio)} className="w-full bg-[#E8601C] hover:bg-[#d45218] text-white font-bold">
            <Printer size={16} className="mr-2" />🖨️ Imprimir Regulamento
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 overflow-y-auto max-h-[80vh]">
        {!manual ? (
          <div className="h-64 flex items-center justify-center text-white/20 text-sm">Preview aparece após geração</div>
        ) : (
          <div id="manual-preview" style={{ background: '#fff', padding: '24px', fontFamily: 'Arial,sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '3px solid #E8601C', paddingBottom: '16px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#000', textTransform: 'uppercase', letterSpacing: '2px' }}>REGULAMENTO INTERNO</h1>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#E8601C', marginTop: '4px' }}>{nomeNegocio.toUpperCase()}</h2>
            </div>
            {manual.valores && (
              <div style={{ background: '#f5f5f5', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #E8601C' }}>
                <p style={{ fontSize: '10px', color: '#888', fontWeight: '700', letterSpacing: '2px', marginBottom: '4px' }}>NOSSOS VALORES</p>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#000', textTransform: 'uppercase' }}>{manual.valores}</p>
              </div>
            )}
            {SECOES.map(s => {
              const itens = manual[s.key] || [];
              const cor = COR[s.key];
              const isProib = s.key === 'proibicoes';
              return (
                <div key={s.key} style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: cor, color: '#fff', padding: '8px 14px', fontWeight: '800', fontSize: '11px', letterSpacing: '1px' }}>
                    {s.label}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <tbody>
                      {itens.map((item, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                          <td style={{ padding: '7px 12px', borderBottom: '1px solid #eee', color: '#222' }}>{item}</td>
                          <td style={{ padding: '7px 12px', borderBottom: '1px solid #eee', textAlign: 'center', width: '100px', fontWeight: '700', fontSize: '10px', color: isProib ? '#B71C1C' : '#1B5E20' }}>
                            {isProib ? 'PROIBIDO' : 'OBRIGATÓRIO'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
            <div style={{ textAlign: 'center', marginTop: '20px', color: '#aaa', fontSize: '9px', letterSpacing: '2px' }}>
              MATERIAL EXCLUSIVO DE MENTORIA PREMIUM · DELIVERY PRO
            </div>
          </div>
        )}
      </div>
    </div>
  );
}