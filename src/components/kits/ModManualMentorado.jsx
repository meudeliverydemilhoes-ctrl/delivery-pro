import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MENTORES = ["Talison Rosa", "Brenda Pereira", "Marcel", "Rosiane"];
const EQUIPE = [
  { nome: "Talison Rosa", cargo: "Mentor Principal" },
  { nome: "Brenda Pereira", cargo: "Gestora Comercial" },
  { nome: "Marcel", cargo: "Mentor Financeiro" },
  { nome: "Rosiane", cargo: "Suporte Operacional" },
];

const imprimir = (nomeNegocio) => {
  const html = document.getElementById('manual-mentorado-preview').innerHTML;
  const w = window.open('', '_blank', 'width=1400,height=900');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Manual - ${nomeNegocio}</title>
  <style>*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;background:#fff;}@page{size:portrait;margin:8mm;}</style>
  </head><body>${html}<script>setTimeout(()=>{window.print();},400);<\/script></body></html>`);
  w.document.close();
};

export default function ModManualMentorado() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [mentor, setMentor] = useState("Talison Rosa");
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState(null);

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const obj = mentorados.find(m => m.id === mentoradoId);
  const nomeCliente = obj?.nome || "";
  const nomeNegocio = obj?.negocio || "";
  const dataInicio = obj?.data_entrada || new Date().toISOString().split('T')[0];

  const gerar = async () => {
    if (!nomeNegocio) return alert("Selecione um mentorado.");
    setLoading(true);
    try {
      const res = await base44.functions.invoke('kitIA', {
        system: 'Crie guias de boas-vindas para mentoria de delivery. Responda SOMENTE com JSON válido.',
        prompt: `Crie o Manual do Mentorado para:
Nome: ${nomeCliente}, Negócio: ${nomeNegocio}, Mentor: ${mentor}, Início: ${dataInicio}

Retorne SOMENTE JSON:
{"carta":"carta de boas-vindas calorosa e motivadora com 3 parágrafos mencionando o nome e o negócio","como_funciona":"parágrafo explicando as 12 semanas e 5 pilares (Processos, Desempenho, Tempo e Potência, Norte Estratégico, Presença Magnética)","entregas":["Fluxogramas operacionais personalizados","Fichas técnicas dos produtos","Manual do colaborador e regulamento interno","Missão visão e valores","Descrição de cargos e funções","Checklists operacionais diários","Plano de ação personalizado das 12 semanas"],"compromissos":["Comparecer a todos os encontros agendados","Executar as tarefas entre os encontros","Ser transparente sobre os dados do negócio","Implementar as melhorias propostas","Manter comunicação ativa com o time"],"cronograma":[{"semana":1,"foco":"Diagnóstico completo","entregavel":"Mapeamento do negócio"},{"semana":2,"foco":"Fluxogramas operacionais","entregavel":"Fluxogramas de todos os setores"},{"semana":3,"foco":"Fichas técnicas","entregavel":"Fichas técnicas dos produtos"},{"semana":4,"foco":"Descrição de cargos","entregavel":"Manual de cargos e funções"},{"semana":5,"foco":"Missão Visão e Valores","entregavel":"Identidade da empresa"},{"semana":6,"foco":"Controle financeiro","entregavel":"Planilha de CMV e DRE"},{"semana":7,"foco":"Precificação","entregavel":"Cardápio com preços corretos"},{"semana":8,"foco":"Marketing e iFood","entregavel":"Estratégia de captação"},{"semana":9,"foco":"Gestão de equipe","entregavel":"Rotinas e processos de RH"},{"semana":10,"foco":"Operacional avançado","entregavel":"SOPs dos setores críticos"},{"semana":11,"foco":"Escala e crescimento","entregavel":"Plano de expansão"},{"semana":12,"foco":"Encerramento","entregavel":"Relatório final de evolução"}]}`
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
        {obj && (
          <div className="bg-white/5 rounded-xl p-3 text-sm space-y-1">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wide">Auto-preenchido</p>
            <p className="text-white">{nomeCliente} · {nomeNegocio}</p>
            <p className="text-white/50">Início: {dataInicio}</p>
          </div>
        )}
        <div>
          <Label className="text-white/60 text-sm">Mentor Responsável</Label>
          <select value={mentor} onChange={e => setMentor(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm">
            {MENTORES.map(m => <option key={m} value={m} style={{ background: "#111" }}>{m}</option>)}
          </select>
        </div>
        <Button onClick={gerar} disabled={loading || !mentoradoId} className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3">
          {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Gerando...</> : <><Sparkles size={16} className="mr-2" />🤖 Gerar Manual</>}
        </Button>
        {manual && (
          <Button onClick={() => imprimir(nomeNegocio)} className="w-full bg-[#E8601C] hover:bg-[#d45218] text-white font-bold">
            <Printer size={16} className="mr-2" />🖨️ Imprimir Manual
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 overflow-y-auto max-h-[80vh]">
        {!manual ? (
          <div className="h-64 flex items-center justify-center text-white/20 text-sm">Preview aparece após geração</div>
        ) : (
          <div id="manual-mentorado-preview" style={{ background: '#fff', padding: '32px', fontFamily: 'Arial,sans-serif' }}>
            {/* Capa */}
            <div style={{ textAlign: 'center', padding: '40px 20px', marginBottom: '32px', background: '#000', borderRadius: '12px' }}>
              <p style={{ color: '#E8601C', fontSize: '11px', letterSpacing: '4px', fontWeight: '700' }}>MANUAL DO MENTORADO</p>
              <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '900', marginTop: '12px', lineHeight: '1.2' }}>{nomeNegocio.toUpperCase()}</h1>
              <p style={{ color: '#aaa', fontSize: '14px', marginTop: '8px' }}>{nomeCliente}</p>
              <div style={{ height: '2px', background: '#E8601C', width: '80px', margin: '16px auto' }} />
              <p style={{ color: '#666', fontSize: '11px' }}>Início: {dataInicio} · Mentor: {mentor}</p>
            </div>

            <Section title="✉️ Carta de Boas-Vindas">
              {manual.carta?.split('\n').filter(Boolean).map((p, i) => (
                <p key={i} style={{ fontSize: '12px', lineHeight: '1.8', color: '#333', marginBottom: '10px' }}>{p}</p>
              ))}
            </Section>

            <Section title="📚 Como Funciona">
              <p style={{ fontSize: '12px', lineHeight: '1.8', color: '#333' }}>{manual.como_funciona}</p>
            </Section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '16px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#E8601C', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>🎁 O Que Você Vai Receber</h3>
                {manual.entregas?.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px', fontSize: '11px', color: '#444', alignItems: 'flex-start' }}>
                    <span style={{ color: '#10B981' }}>✓</span> {e}
                  </div>
                ))}
              </div>
              <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '16px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#E8601C', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>✅ Seus Compromissos</h3>
                {manual.compromissos?.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px', fontSize: '11px', color: '#444', alignItems: 'flex-start' }}>
                    <span style={{ color: '#FFD700' }}>●</span> {c}
                  </div>
                ))}
              </div>
            </div>

            <Section title="👥 Nossa Equipe">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {EQUIPE.map((m, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '12px 8px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E8601C', color: '#fff', fontWeight: '900', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                      {m.nome.charAt(0)}
                    </div>
                    <p style={{ fontSize: '10px', fontWeight: '800', color: '#222' }}>{m.nome}</p>
                    <p style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>{m.cargo}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="📅 Cronograma das 12 Semanas">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr>
                    <th style={{ background: '#E8601C', color: '#fff', padding: '6px 10px', textAlign: 'left', border: '1px solid #ddd', width: '60px' }}>Semana</th>
                    <th style={{ background: '#E8601C', color: '#fff', padding: '6px 10px', textAlign: 'left', border: '1px solid #ddd' }}>Foco</th>
                    <th style={{ background: '#E8601C', color: '#fff', padding: '6px 10px', textAlign: 'left', border: '1px solid #ddd' }}>Entregável</th>
                  </tr>
                </thead>
                <tbody>
                  {manual.cronograma?.map((s, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ padding: '6px 10px', border: '1px solid #eee', fontWeight: '800', color: '#E8601C', textAlign: 'center' }}>{s.semana}</td>
                      <td style={{ padding: '6px 10px', border: '1px solid #eee', color: '#333' }}>{s.foco}</td>
                      <td style={{ padding: '6px 10px', border: '1px solid #eee', color: '#666' }}>{s.entregavel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <div style={{ textAlign: 'center', marginTop: '24px', color: '#aaa', fontSize: '9px', letterSpacing: '2px' }}>
              MATERIAL EXCLUSIVO DE MENTORIA PREMIUM · DELIVERY PRO
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#E8601C', borderLeft: '4px solid #E8601C', paddingLeft: '10px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}