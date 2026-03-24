import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Printer, Loader2, Users, Clock, CheckCircle, Gift, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MENTORES = ["Talison Rosa", "Brenda Pereira", "Marcel", "Rosiane"];

export default function ModuloManual() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [nomeNegocio, setNomeNegocio] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [mentorResponsavel, setMentorResponsavel] = useState("Talison Rosa");
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState(null);

  const { data: mentorados = [] } = useQuery({
    queryKey: ["mentorados"],
    queryFn: () => base44.entities.Mentorado.list()
  });

  const handleSelectMentorado = (id) => {
    setMentoradoId(id);
    const m = mentorados.find(x => x.id === id);
    if (m) {
      setNomeCliente(m.nome || "");
      setNomeNegocio(m.negocio || "");
      if (m.data_entrada) setDataInicio(m.data_entrada);
    }
  };

  const gerarManual = async () => {
    if (!nomeCliente || !nomeNegocio) return alert("Preencha nome e negócio.");
    setLoading(true);
    try {
      const res = await base44.functions.invoke("gerarManualMentorado", {
        nomeCliente,
        nomeNegocio,
        mentorResponsavel,
        dataInicio
      });
      setManual(res.data.manual);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar manual. Verifique se a ANTHROPIC_API_KEY está configurada.");
    } finally {
      setLoading(false);
    }
  };

  const imprimir = () => {
    const html = `<!DOCTYPE html><html><head><title>Manual — ${nomeNegocio}</title>
<style>
* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
@page { margin: 15mm; }
body { background: white !important; color: #111; font-family: Arial, sans-serif; margin: 0; padding: 20px; }
.no-print { display: none !important; }
h1 { text-align: center; font-size: 26px; font-weight: 900; color: #E8601C; text-transform: uppercase; border-bottom: 3px solid #E8601C; padding-bottom: 12px; margin-bottom: 24px; }
h2 { font-size: 15px; font-weight: 800; background: #E8601C; color: white; padding: 8px 14px; border-radius: 6px; text-transform: uppercase; margin: 24px 0 10px; }
p { font-size: 13px; line-height: 1.7; color: #333; margin-bottom: 8px; }
ul { padding-left: 20px; margin: 4px 0 12px; }
li { font-size: 13px; line-height: 1.8; color: #333; }
table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
th { background: #E8601C; color: white; padding: 8px 10px; text-align: left; border: 1px solid #ddd; }
td { padding: 7px 10px; border: 1px solid #ddd; vertical-align: top; }
tr:nth-child(even) td { background: #f9f9f9; }
.equipe-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 8px; }
.membro { border: 1px solid #eee; padding: 10px 12px; border-radius: 8px; }
.membro-nome { font-weight: 800; font-size: 13px; color: #E8601C; }
.membro-cargo { font-size: 12px; color: #666; }
.footer { text-align: center; color: #aaa; font-size: 10px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 12px; }
</style></head><body>
<h1>Manual do Mentorado<br><span style="font-size:18px;color:#333">${nomeNegocio} — ${nomeCliente}</span></h1>

<h2>✉️ Carta de Boas-Vindas</h2>
${(manual.carta_boas_vindas||"").split("\n").filter(Boolean).map(p=>`<p>${p}</p>`).join("")}

<h2>📚 Como Funciona a Mentoria</h2>
<p>${manual.como_funciona||""}</p>

<h2>🎁 O Que Você Vai Receber</h2>
<ul>${(manual.o_que_vai_receber||[]).map(i=>`<li>${i}</li>`).join("")}</ul>

<h2>✅ Seus Compromissos</h2>
<ul>${(manual.compromissos||[]).map(i=>`<li>${i}</li>`).join("")}</ul>

<h2>👥 Nossa Equipe</h2>
<div class="equipe-grid">
${(manual.equipe||[]).map(m=>`<div class="membro"><div class="membro-nome">${m.nome}</div><div class="membro-cargo">${m.cargo}</div></div>`).join("")}
</div>

<h2>📅 Cronograma das 12 Semanas</h2>
<table>
<thead><tr><th>Semana</th><th>Foco</th><th>Entregável</th></tr></thead>
<tbody>
${(manual.cronograma||[]).map(s=>`<tr><td><strong>Semana ${s.semana}</strong></td><td>${s.foco}</td><td>${s.entregavel}</td></tr>`).join("")}
</tbody></table>

<div class="footer">MATERIAL EXCLUSIVO DE MENTORIA PREMIUM — Meu Delivery de Milhões</div>
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
        <div>
          <Label className="text-white/60 text-sm">Selecionar Mentorado</Label>
          <select
            value={mentoradoId}
            onChange={e => handleSelectMentorado(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
          >
            <option value="" style={{background:"#111"}}>Selecione um mentorado...</option>
            {mentorados.map(m => (
              <option key={m.id} value={m.id} style={{background:"#111"}}>
                {m.nome} — {m.negocio}{m.cidade ? ` (${m.cidade})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-white/60 text-sm">Nome do Mentorado</Label>
            <Input value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} placeholder="Nome completo" className="bg-white/5 border-white/10 text-white mt-1" />
          </div>
          <div>
            <Label className="text-white/60 text-sm">Nome do Negócio</Label>
            <Input value={nomeNegocio} onChange={e => setNomeNegocio(e.target.value)} placeholder="Ex: Pizza do João" className="bg-white/5 border-white/10 text-white mt-1" />
          </div>
          <div>
            <Label className="text-white/60 text-sm">Data de Início da Mentoria</Label>
            <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" />
          </div>
          <div>
            <Label className="text-white/60 text-sm">Mentor Responsável</Label>
            <select
              value={mentorResponsavel}
              onChange={e => setMentorResponsavel(e.target.value)}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
            >
              {MENTORES.map(m => <option key={m} value={m} style={{background:"#111"}}>{m}</option>)}
            </select>
          </div>
        </div>

        <Button
          onClick={gerarManual}
          disabled={loading || !nomeCliente || !nomeNegocio}
          className="w-full bg-[#E8601C] hover:bg-[#d45218] text-white font-bold py-3 text-base"
        >
          {loading
            ? <><Loader2 size={18} className="mr-2 animate-spin" />Gerando Manual com IA...</>
            : <><Sparkles size={18} className="mr-2" />🤖 Gerar Manual com IA</>}
        </Button>
      </div>

      {/* Resultado */}
      {manual && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">✅ Manual Gerado</h3>
            <Button onClick={imprimir} className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
              <Printer size={16} className="mr-2" />🖨️ Imprimir Manual
            </Button>
          </div>

          {/* Carta */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h4 className="text-[#E8601C] font-bold mb-3 flex items-center gap-2"><BookOpen size={16} />Carta de Boas-Vindas</h4>
            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{manual.carta_boas_vindas}</p>
          </div>

          {/* Como funciona */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h4 className="text-[#E8601C] font-bold mb-3">📚 Como Funciona</h4>
            <p className="text-white/80 text-sm leading-relaxed">{manual.como_funciona}</p>
          </div>

          {/* O que vai receber + compromissos */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h4 className="text-[#E8601C] font-bold mb-3 flex items-center gap-2"><Gift size={16} />O Que Você Vai Receber</h4>
              <ul className="space-y-2">
                {(manual.o_que_vai_receber||[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <CheckCircle size={14} className="text-[#10B981] mt-0.5 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h4 className="text-[#E8601C] font-bold mb-3">✅ Seus Compromissos</h4>
              <ul className="space-y-2">
                {(manual.compromissos||[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-[#FFD700] mt-0.5 flex-shrink-0">●</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Equipe */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h4 className="text-[#E8601C] font-bold mb-3 flex items-center gap-2"><Users size={16} />Nossa Equipe</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(manual.equipe||[]).map((m, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#E8601C]/20 flex items-center justify-center mx-auto mb-2 text-lg font-black text-[#E8601C]">
                    {m.nome.charAt(0)}
                  </div>
                  <p className="text-white font-bold text-xs">{m.nome}</p>
                  <p className="text-white/40 text-xs mt-0.5">{m.cargo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cronograma */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h4 className="text-[#E8601C] font-bold mb-3 flex items-center gap-2"><Clock size={16} />Cronograma das 12 Semanas</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-white/40 font-semibold w-20">Semana</th>
                    <th className="text-left py-2 px-3 text-white/40 font-semibold">Foco</th>
                    <th className="text-left py-2 px-3 text-white/40 font-semibold">Entregável</th>
                  </tr>
                </thead>
                <tbody>
                  {(manual.cronograma||[]).map((s, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2 px-3 text-[#E8601C] font-bold">S{s.semana}</td>
                      <td className="py-2 px-3 text-white/80">{s.foco}</td>
                      <td className="py-2 px-3 text-white/60 text-xs">{s.entregavel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}