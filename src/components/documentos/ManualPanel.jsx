import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, FileText, Printer } from "lucide-react";
import { toast } from "sonner";

const TIPOS = ["pizzaria", "hamburgueria", "açaí", "sushi", "marmitaria", "lanchonete", "outro"];
const TONS = ["formal", "informal", "amigável", "profissional"];

function ManualImpresso({ dados, manual }) {
  return (
    <div id="manual-print" style={{ fontFamily: 'Arial, sans-serif', color: '#111', background: 'white', padding: '40px', maxWidth: '210mm' }}>
      {/* Capa */}
      <div style={{ textAlign: 'center', padding: '60px 20px', borderBottom: '3px solid #FF4D00', marginBottom: '40px' }}>
        <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '3px', color: '#FF4D00', marginBottom: '16px' }}>Manual do Colaborador</div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 8px' }}>{dados.nome_negocio}</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>{dados.tipo_delivery?.toUpperCase()} · {dados.cidade}</p>
        <p style={{ marginTop: '30px', fontSize: '12px', color: '#999' }}>Versão 1.0 · {new Date().getFullYear()}</p>
      </div>

      {/* Boas-vindas */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', color: '#FF4D00', borderBottom: '2px solid #FF4D0020', paddingBottom: '8px' }}>Mensagem de Boas-Vindas</h2>
        <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{manual.boas_vindas}</p>
        <p style={{ marginTop: '16px', fontWeight: 'bold' }}>— {dados.nome_responsavel}, {dados.tipo_delivery}</p>
      </section>

      {/* História */}
      {manual.nossa_historia && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', color: '#FF4D00', borderBottom: '2px solid #FF4D0020', paddingBottom: '8px' }}>Nossa História</h2>
          <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{manual.nossa_historia}</p>
        </section>
      )}

      {/* MVV */}
      <section style={{ marginBottom: '32px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #FF4D00' }}>
        <h2 style={{ fontSize: '18px', color: '#FF4D00', marginBottom: '16px' }}>Missão, Visão e Valores</h2>
        <p><strong>Missão:</strong> {manual.missao || dados.missao}</p>
        <p style={{ marginTop: '8px' }}><strong>Visão:</strong> {manual.visao || dados.visao}</p>
        <div style={{ marginTop: '8px' }}>
          <strong>Valores:</strong>
          <ul style={{ marginTop: '6px', paddingLeft: '20px' }}>
            {(manual.valores || []).map((v, i) => <li key={i} style={{ marginBottom: '4px' }}>{v}</li>)}
          </ul>
        </div>
      </section>

      {/* Regras */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', color: '#FF4D00', borderBottom: '2px solid #FF4D0020', paddingBottom: '8px' }}>Regras e Conduta</h2>
        <ol style={{ paddingLeft: '20px', lineHeight: '2' }}>
          {(manual.regras_conduta || []).map((r, i) => <li key={i}>{r}</li>)}
        </ol>
      </section>

      {/* Uniforme */}
      {manual.uniforme && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', color: '#FF4D00', borderBottom: '2px solid #FF4D0020', paddingBottom: '8px' }}>Uniforme e Apresentação Pessoal</h2>
          <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{manual.uniforme}</p>
        </section>
      )}

      {/* Horários */}
      {manual.horarios && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', color: '#FF4D00', borderBottom: '2px solid #FF4D0020', paddingBottom: '8px' }}>Horários e Pontualidade</h2>
          <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{manual.horarios}</p>
        </section>
      )}

      {/* Atendimento */}
      {manual.atendimento?.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', color: '#FF4D00', borderBottom: '2px solid #FF4D0020', paddingBottom: '8px' }}>Padrão de Atendimento</h2>
          <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
            {manual.atendimento.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </section>
      )}

      {/* Higiene */}
      {manual.higiene?.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', color: '#FF4D00', borderBottom: '2px solid #FF4D0020', paddingBottom: '8px' }}>Higiene e Segurança Alimentar</h2>
          <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
            {manual.higiene.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </section>
      )}

      {/* Celular */}
      {manual.celular_redes && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', color: '#FF4D00', borderBottom: '2px solid #FF4D0020', paddingBottom: '8px' }}>Uso do Celular e Redes Sociais</h2>
          <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{manual.celular_redes}</p>
        </section>
      )}

      {/* Punições */}
      {manual.punicoes?.length > 0 && (
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '18px', color: '#FF4D00', borderBottom: '2px solid #FF4D0020', paddingBottom: '8px' }}>Punições e Consequências</h2>
          <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
            {manual.punicoes.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </section>
      )}

      {/* Assinatura */}
      <section style={{ borderTop: '2px solid #eee', paddingTop: '32px', marginTop: '48px' }}>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '40px' }}>
          Declaro que li, compreendi e concordo com todas as normas deste Manual do Colaborador de <strong>{dados.nome_negocio}</strong>.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <div style={{ borderBottom: '1px solid #333', marginBottom: '6px', height: '40px' }} />
            <p style={{ fontSize: '12px', color: '#666' }}>Assinatura do Colaborador</p>
          </div>
          <div>
            <div style={{ borderBottom: '1px solid #333', marginBottom: '6px', height: '40px' }} />
            <p style={{ fontSize: '12px', color: '#666' }}>Data e Cargo</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ManualPanel() {
  const [form, setForm] = useState({ nome_negocio: "", tipo_delivery: "pizzaria", nome_responsavel: "", cidade: "", num_funcionarios: "", missao: "", visao: "", valores: "", horario_funcionamento: "", dress_code: "", regras_conduta: "", tom_atendimento: "amigável" });
  const [manual, setManual] = useState(null);
  const [loadingMVV, setLoadingMVV] = useState(false);
  const [loadingManual, setLoadingManual] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleMVV = async () => {
    if (!form.nome_negocio) { toast.error("Informe o nome do negócio"); return; }
    setLoadingMVV(true);
    try {
      const res = await base44.functions.invoke("gerarManual", { tipo: "preencher_mvv", dados: form });
      const r = res.data.result;
      setForm(f => ({ ...f, missao: r.missao || f.missao, visao: r.visao || f.visao, valores: Array.isArray(r.valores) ? r.valores.join('\n') : r.valores || f.valores, regras_conduta: r.regras_conduta || f.regras_conduta }));
      toast.success("Missão, Visão e Valores gerados!");
    } catch (e) { toast.error("Erro: " + e.message); }
    finally { setLoadingMVV(false); }
  };

  const handleGerarManual = async () => {
    if (!form.nome_negocio) { toast.error("Informe o nome do negócio"); return; }
    setLoadingManual(true);
    setManual(null);
    try {
      const res = await base44.functions.invoke("gerarManual", { tipo: "gerar_manual", dados: form });
      setManual(res.data.result);
    } catch (e) { toast.error("Erro: " + e.message); }
    finally { setLoadingManual(false); }
  };

  const handlePrint = () => {
    const content = document.getElementById('manual-print');
    if (!content) return;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Manual - ${form.nome_negocio}</title><style>body{margin:0;padding:0;}@media print{body{margin:0}}</style></head><body>${content.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const inputCls = "bg-white/10 border-white/20 text-white placeholder:text-white/30";
  const textCls = "bg-white/10 border-white/20 text-white placeholder:text-white/30 min-h-[80px]";

  return (
    <div className="space-y-6">
      {/* Formulário */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-base font-semibold text-white mb-4">Dados do Negócio</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label className="text-white/60 text-xs">Nome do Negócio *</Label><Input value={form.nome_negocio} onChange={e => set('nome_negocio', e.target.value)} className={inputCls} placeholder="Ex: Pizzaria do João" /></div>
          <div><Label className="text-white/60 text-xs">Tipo de Delivery</Label>
            <Select value={form.tipo_delivery} onValueChange={v => set('tipo_delivery', v)}>
              <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {TIPOS.map(t => <SelectItem key={t} value={t} className="text-white capitalize">{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-white/60 text-xs">Nome do Responsável</Label><Input value={form.nome_responsavel} onChange={e => set('nome_responsavel', e.target.value)} className={inputCls} placeholder="Ex: João Silva" /></div>
          <div><Label className="text-white/60 text-xs">Cidade</Label><Input value={form.cidade} onChange={e => set('cidade', e.target.value)} className={inputCls} placeholder="Ex: São Paulo - SP" /></div>
          <div><Label className="text-white/60 text-xs">Nº de Funcionários</Label><Input value={form.num_funcionarios} onChange={e => set('num_funcionarios', e.target.value)} className={inputCls} placeholder="Ex: 8" /></div>
          <div><Label className="text-white/60 text-xs">Horário de Funcionamento</Label><Input value={form.horario_funcionamento} onChange={e => set('horario_funcionamento', e.target.value)} className={inputCls} placeholder="Ex: Seg-Dom 18h–23h" /></div>
          <div><Label className="text-white/60 text-xs">Tom de Atendimento</Label>
            <Select value={form.tom_atendimento} onValueChange={v => set('tom_atendimento', v)}>
              <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {TONS.map(t => <SelectItem key={t} value={t} className="text-white capitalize">{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-white/60 text-xs">Uniforme / Dress Code</Label><Input value={form.dress_code} onChange={e => set('dress_code', e.target.value)} className={inputCls} placeholder="Ex: Camiseta preta com logotipo..." /></div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleMVV} disabled={loadingMVV} variant="outline" className="border-[#FF4D00]/40 text-[#FF4D00] hover:bg-[#FF4D00]/10">
            {loadingMVV ? <><div className="w-4 h-4 border-2 border-[#FF4D00]/30 border-t-[#FF4D00] rounded-full animate-spin mr-2" />Gerando...</>
              : <><Wand2 size={15} className="mr-2" />✨ Preencher MVV com IA</>}
          </Button>
        </div>
      </div>

      {/* MVV e Regras */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-base font-semibold text-white mb-4">Identidade e Conduta</h3>
        <div className="space-y-4">
          <div><Label className="text-white/60 text-xs">Missão</Label><Textarea value={form.missao} onChange={e => set('missao', e.target.value)} className={textCls} placeholder="Ex: Servir comida de qualidade com agilidade e carinho..." /></div>
          <div><Label className="text-white/60 text-xs">Visão</Label><Textarea value={form.visao} onChange={e => set('visao', e.target.value)} className={textCls} placeholder="Ex: Ser referência em delivery na nossa cidade até 2027..." /></div>
          <div><Label className="text-white/60 text-xs">Valores (um por linha)</Label><Textarea value={form.valores} onChange={e => set('valores', e.target.value)} className={textCls} placeholder="Qualidade&#10;Pontualidade&#10;Respeito&#10;..." /></div>
          <div><Label className="text-white/60 text-xs">Regras de Conduta</Label><Textarea value={form.regras_conduta} onChange={e => set('regras_conduta', e.target.value)} className={textCls} rows={5} placeholder="Ex: Pontualidade, respeito, higiene..." /></div>
        </div>
      </div>

      {/* Botão gerar manual */}
      <div className="flex justify-center">
        <Button onClick={handleGerarManual} disabled={loadingManual || !form.nome_negocio} size="lg" className="bg-[#FF4D00] hover:bg-[#E64500] px-8">
          {loadingManual ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Gerando Manual...</>
            : <><FileText size={18} className="mr-2" />📄 Gerar Manual Completo</>}
        </Button>
      </div>

      {/* Loading */}
      {loadingManual && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 border-4 border-[#FF4D00]/30 border-t-[#FF4D00] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-semibold">Gerando Manual do Colaborador...</p>
          <p className="text-white/40 text-sm mt-1">A IA está criando um documento profissional e personalizado</p>
        </div>
      )}

      {/* Manual gerado */}
      {manual && !loadingManual && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <p className="text-sm font-semibold text-white">✅ Manual Gerado com Sucesso</p>
            <Button onClick={handlePrint} className="bg-[#FF4D00] hover:bg-[#E64500]">
              <Printer size={15} className="mr-2" /> 🖨️ Imprimir
            </Button>
          </div>
          <div className="bg-white rounded-b-2xl overflow-auto">
            <ManualImpresso dados={form} manual={manual} />
          </div>
        </div>
      )}
    </div>
  );
}