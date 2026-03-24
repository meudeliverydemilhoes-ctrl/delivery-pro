import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";

const TIPOS = ["pizzaria", "hamburgueria", "açaí", "sushi", "chinesa", "árabe", "marmitaria", "outro"];

const PILARES_CORES = ["#FF6B00", "#F97316", "#A855F7", "#3B82F6", "#10B981"];

export default function GuiaMentorado() {
  const [form, setForm] = useState({ nome_mentorado: "", nome_negocio: "", tipo_delivery: "pizzaria", cidade: "", data_inicio: "" });
  const [guia, setGuia] = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  const handleGerar = async () => {
    if (!form.nome_mentorado || !form.nome_negocio) return toast.error("Preencha nome do mentorado e negócio");
    setLoading(true);
    try {
      const res = await base44.functions.invoke("gerarDocumento", { tipo: "guia", dados: form });
      setGuia(res.data.result);
    } catch (e) { toast.error("Erro: " + e.message); }
    finally { setLoading(false); }
  };

  const handlePrint = () => {
    const conteudo = printRef.current?.innerHTML;
    if (!conteudo) return;
    const janela = window.open("", "_blank");
    janela.document.write(`<!DOCTYPE html><html><head><title>Guia do Mentorado</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Arial', sans-serif; background: #fff; color: #111; }
  @page { size: A4; margin: 15mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>${conteudo}</body></html>`);
    janela.document.close();
    janela.focus();
    setTimeout(() => { janela.print(); janela.close(); }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Formulário */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen size={16} className="text-[#FF6B00]" /> Personalizar Guia
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Nome do Mentorado *</label>
            <Input value={form.nome_mentorado} onChange={e => setForm(f => ({ ...f, nome_mentorado: e.target.value }))}
              placeholder="Ex: João Silva" className="bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Nome do Negócio *</label>
            <Input value={form.nome_negocio} onChange={e => setForm(f => ({ ...f, nome_negocio: e.target.value }))}
              placeholder="Ex: Pizzaria da Família" className="bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Tipo de Delivery</label>
            <Select value={form.tipo_delivery} onValueChange={v => setForm(f => ({ ...f, tipo_delivery: v }))}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {TIPOS.map(t => <SelectItem key={t} value={t} className="text-white capitalize">{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Cidade</label>
            <Input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))}
              placeholder="Ex: São Paulo - SP" className="bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Data de Início</label>
            <Input type="date" value={form.data_inicio} onChange={e => setForm(f => ({ ...f, data_inicio: e.target.value }))}
              className="bg-white/10 border-white/20 text-white" />
          </div>
        </div>
        <Button onClick={handleGerar} disabled={loading} className="bg-[#FF6B00] hover:bg-[#E65C00] w-full">
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Gerando com IA...</>
            : <><Sparkles size={15} className="mr-2" />Gerar Guia Personalizado</>}
        </Button>
      </div>

      {/* Preview + Print */}
      {guia && (
        <div>
          <div className="flex justify-end mb-3">
            <Button onClick={handlePrint} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Printer size={15} className="mr-2" /> Imprimir / Salvar PDF
            </Button>
          </div>

          <div ref={printRef} style={{ background: '#fff', color: '#111', fontFamily: 'Arial, sans-serif', borderRadius: 8, overflow: 'hidden' }}>
            {/* Capa */}
            <div style={{ background: '#0a0a0f', color: '#fff', padding: '60px 40px', textAlign: 'center', borderBottom: '6px solid #FF6B00' }}>
              <p style={{ color: '#FF6B00', fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16 }}>MENTORIA</p>
              <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 8 }}>Delivery Pro</h1>
              <p style={{ color: '#FF6B00', fontSize: 18, fontWeight: 600, marginBottom: 24 }}>
                Transforme seu delivery em uma operação lucrativa e profissional
              </p>
              <div style={{ borderTop: '1px solid #ffffff20', paddingTop: 24, marginTop: 24 }}>
                <p style={{ color: '#ffffff80', fontSize: 14 }}>Preparado exclusivamente para</p>
                <p style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginTop: 4 }}>{form.nome_mentorado}</p>
                <p style={{ color: '#FF6B00', fontSize: 16, marginTop: 2 }}>{form.nome_negocio} · {form.cidade}</p>
                {form.data_inicio && <p style={{ color: '#ffffff40', fontSize: 13, marginTop: 8 }}>Início: {new Date(form.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>}
              </div>
            </div>

            <div style={{ padding: '40px' }}>
              {/* Boas-vindas */}
              {guia.boas_vindas && (
                <div style={{ marginBottom: 40 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#FF6B00', marginBottom: 16, borderBottom: '2px solid #FF6B00', paddingBottom: 8 }}>Bem-vindo à Mentoria</h2>
                  {guia.boas_vindas.split('\n\n').map((p, i) => (
                    <p key={i} style={{ fontSize: 14, lineHeight: 1.8, color: '#333', marginBottom: 12 }}>{p}</p>
                  ))}
                </div>
              )}

              {/* Visão do Método */}
              {guia.visao_metodo && (
                <div style={{ marginBottom: 40, background: '#f9f9f9', borderRadius: 8, padding: 24, borderLeft: '4px solid #FF6B00' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 12 }}>Visão do Método Delivery Pro</h2>
                  {guia.visao_metodo.split('\n\n').map((p, i) => (
                    <p key={i} style={{ fontSize: 13, lineHeight: 1.8, color: '#444', marginBottom: 10 }}>{p}</p>
                  ))}
                </div>
              )}

              {/* Pilares */}
              {guia.pilares?.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#FF6B00', marginBottom: 20, borderBottom: '2px solid #FF6B00', paddingBottom: 8 }}>Os 5 Pilares da Mentoria</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {guia.pilares.map((p, i) => (
                      <div key={i} style={{ border: `2px solid ${PILARES_CORES[i] || '#FF6B00'}`, borderRadius: 8, padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: PILARES_CORES[i] || '#FF6B00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16 }}>{p.numero}</div>
                          <span style={{ fontWeight: 800, fontSize: 14, color: '#111' }}>Pilar {p.numero}: {p.nome}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>{p.descricao}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* O que vai mudar */}
              {guia.o_que_vai_mudar?.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#FF6B00', marginBottom: 16, borderBottom: '2px solid #FF6B00', paddingBottom: 8 }}>O Que Vai Mudar na Sua Operação</h2>
                  {guia.o_que_vai_mudar.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#FF6B00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>✓</div>
                      <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6 }}>{item}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Sumário executivo */}
              <div style={{ marginBottom: 40, background: '#0a0a0f', color: '#fff', borderRadius: 8, padding: 28 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#FF6B00', marginBottom: 20, textAlign: 'center' }}>Sumário Executivo</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, textAlign: 'center' }}>
                  {[['12', 'Semanas'], ['12', 'Reuniões'], ['8–12h', 'Por semana'], ['50+', 'Templates']].map(([n, l], i) => (
                    <div key={i}>
                      <p style={{ fontSize: 32, fontWeight: 900, color: '#FF6B00' }}>{n}</p>
                      <p style={{ fontSize: 12, color: '#ffffff80', marginTop: 4 }}>{l}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jornada 12 semanas */}
              {guia.semanas?.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#FF6B00', marginBottom: 20, borderBottom: '2px solid #FF6B00', paddingBottom: 8 }}>Jornada de Transformação — 12 Semanas</h2>
                  {guia.semanas.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: i < 4 ? '#EF4444' : i < 8 ? '#F97316' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{s.semana}</div>
                      <div style={{ flex: 1, borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 4 }}>{s.tema}</p>
                        <p style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{s.objetivo}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {s.entregas?.map((e, j) => (
                            <span key={j} style={{ background: '#fff3e0', color: '#FF6B00', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{e}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Primeiros passos */}
              {guia.primeiros_passos?.length > 0 && (
                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 24, border: '2px solid #10B981' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#059669', marginBottom: 16 }}>Seus Primeiros Passos</h2>
                  {guia.primeiros_passos.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{i + 1}</div>
                      <p style={{ fontSize: 14, color: '#166534', fontWeight: 500 }}>{p}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}