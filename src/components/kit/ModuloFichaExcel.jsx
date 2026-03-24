import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Upload, Printer, Save, Loader2, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

let XLSXLib = null;
const loadXLSX = async () => {
  if (XLSXLib) return XLSXLib;
  const mod = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs');
  XLSXLib = mod;
  return XLSXLib;
};

function parseIngredientes(cellValue) {
  if (!cellValue) return [];
  const parts = String(cellValue).split(";").map(s => s.trim()).filter(Boolean);
  return parts.slice(1).map(p => {
    const match = p.match(/^(\d[\d,\.]*)\s*[Gg][Rr]?\s+(.+)/);
    if (match) return { qtd: match[1].replace(",", "."), nome: match[2].trim().toUpperCase() };
    return { qtd: "", nome: p };
  });
}

export default function ModuloFichaExcel() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [titulo, setTitulo] = useState("FICHA TÉCNICA — PIZZAS SALGADAS");
  const [dados, setDados] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const inputRef = useRef();
  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: briefings = [] } = useQuery({ queryKey: ["briefings-all"], queryFn: () => base44.entities.Briefing.list() });

  const handleFile = async (file) => {
    const XLSX = await loadXLSX();
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      if (rows.length < 2) return;
      const headers = rows[0];
      const tamanhos = headers.slice(1).filter(Boolean);
      const sabores = rows.slice(1).filter(r => r[0]);
      setDados({ tamanhos, sabores: sabores.map(r => ({ sabor: String(r[0]).toUpperCase(), colunas: tamanhos.map((_, ti) => parseIngredientes(r[ti + 1])) })) });
    };
    reader.readAsArrayBuffer(file);
  };

  const onDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };
  const onInput = (e) => { const f = e.target.files[0]; if (f) handleFile(f); };

  const salvar = async () => {
    if (!mentoradoId || !dados) return;
    setSalvando(true);
    const nomeProduto = titulo.replace(/FICHA TÉCNICA[—\-–\s]*/i, "").trim() || "PRODUTO";
    const fichaRecord = {
      id: crypto.randomUUID(),
      nome_produto: nomeProduto,
      titulo,
      data_geracao: new Date().toISOString(),
      total_sabores: dados.sabores.length,
      tamanhos: dados.tamanhos,
      dados: dados.sabores
    };
    const briefing = briefings.find(b => b.mentorado_id === mentoradoId);
    const fichasAtuais = briefing?.fichas_tecnicas || [];
    if (briefing?.id) {
      await base44.entities.Briefing.update(briefing.id, { ...briefing, fichas_tecnicas: [...fichasAtuais, fichaRecord] });
    } else {
      await base44.entities.Briefing.create({ mentorado_id: mentoradoId, fichas_tecnicas: [fichaRecord] });
    }
    setSalvando(false);
    alert("Ficha salva com sucesso!");
  };

  const imprimir = () => {
    if (!dados) return;
    const mentorado = mentorados.find(m => m.id === mentoradoId);
    const html = `<!DOCTYPE html><html><head><title>${titulo}</title>
<style>@page{size:landscape;margin:10mm} body{background:#000;color:#fff;font-family:Arial,sans-serif;margin:0;padding:0;-webkit-print-color-adjust:exact}
table{width:100%;border-collapse:collapse;font-size:9px}
.titulo-row td{background:#000;color:#FFD700;font-size:18px;font-weight:900;text-align:center;padding:12px;text-transform:uppercase;letter-spacing:2px}
.header-sabor{background:#1A1A1A;color:#fff;font-weight:bold;text-align:center;padding:8px 5px;border:1px solid #2A2A2A}
.header-tam{background:#E8601C;color:#000;font-weight:900;text-align:center;padding:8px 5px;border:1px solid #2A2A2A;text-transform:uppercase}
.cell-sabor{text-align:center;font-weight:bold;color:#fff;padding:5px;border:1px solid #2A2A2A;vertical-align:middle;white-space:nowrap}
.cell-ing{padding:4px 5px;border:1px solid #2A2A2A;vertical-align:top}
.qtd{color:#FFD700;font-weight:900} .nome{color:#fff}
.par{background:#111111} .impar{background:#1C1C1C}
.footer{text-align:center;color:#555;font-size:10px;margin-top:8px}
</style></head><body>
<table><tr class="titulo-row"><td colspan="${1 + dados.tamanhos.length}">${titulo}</td></tr>
<tr><td class="header-sabor">SABOR</td>${dados.tamanhos.map(t=>`<td class="header-tam">${t}</td>`).join("")}</tr>
${dados.sabores.map((s,i)=>`<tr class="${i%2===0?"par":"impar"}">
<td class="cell-sabor">${s.sabor}</td>
${s.colunas.map(ings=>`<td class="cell-ing">${ings.map(ing=>`<span class="qtd">+${ing.qtd}g</span> <span class="nome">${ing.nome}</span>`).join("<br>")}</td>`).join("")}
</tr>`).join("")}
</table>
<div class="footer">MATERIAL EXCLUSIVO DE MENTORIA PREMIUM · ${mentorado?.nome||""} · ${dados.sabores.length} sabores</div>
</body></html>`;
    const w=window.open("","_blank"); w.document.write(html); w.document.close(); w.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-white/60">Mentorado</Label>
            <select value={mentoradoId} onChange={e=>setMentoradoId(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
              <option value="">Selecione...</option>
              {mentorados.map(m=><option key={m.id} value={m.id} style={{background:"#111"}}>{m.nome} — {m.negocio}</option>)}
            </select>
          </div>
          <div><Label className="text-white/60">Título da Ficha</Label>
            <Input value={titulo} onChange={e=>setTitulo(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1"/></div>
        </div>

        {/* Upload */}
        <div onDrop={onDrop} onDragOver={e=>e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-white/20 rounded-2xl p-10 text-center cursor-pointer hover:border-[#E8601C]/60 hover:bg-[#E8601C]/5 transition-all">
          <FileSpreadsheet size={48} className="mx-auto text-white/30 mb-4" />
          <p className="text-white font-semibold text-lg mb-1">Arraste ou clique para subir a planilha</p>
          <p className="text-white/40 text-sm">Aceita .xlsx e .xls</p>
          <div className="mt-4 text-left inline-block bg-white/5 rounded-xl px-4 py-3 text-xs text-white/40">
            <p className="font-bold text-white/60 mb-1">Formato esperado:</p>
            <p>Coluna A: Sabor | Colunas B/C/D...: Tamanhos</p>
            <p>Célula: "PEQUENA; 115g Ingrediente; 30g Outro"</p>
          </div>
          <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={onInput} className="hidden"/>
        </div>
      </div>

      {/* Preview */}
      {dados && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-sm">✅ {dados.sabores.length} sabores carregados · {dados.tamanhos.length} tamanhos</p>
            <div className="flex gap-2">
              <Button onClick={salvar} disabled={salvando||!mentoradoId} className="bg-[#10B981] hover:bg-[#059669] text-white">
                {salvando?<Loader2 size={16} className="animate-spin mr-2"/>:<Save size={16} className="mr-2"/>}Salvar
              </Button>
              <Button onClick={imprimir} className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                <Printer size={16} className="mr-2"/>🖨️ PDF Landscape
              </Button>
            </div>
          </div>

          {/* Tabela Preview */}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table style={{ borderCollapse: "collapse", width: "100%", background: "#000", fontSize: 10 }}>
              <thead>
                <tr><td colSpan={1+dados.tamanhos.length} style={{ background: "#000", color: "#FFD700", fontWeight: 900, textAlign: "center", padding: "12px", fontSize: 16, textTransform: "uppercase", letterSpacing: 2 }}>{titulo}</td></tr>
                <tr>
                  <th style={{ background: "#1A1A1A", color: "#fff", padding: "8px 12px", border: "1px solid #2A2A2A", textAlign: "center" }}>SABOR</th>
                  {dados.tamanhos.map((t,i)=><th key={i} style={{ background: "#E8601C", color: "#000", fontWeight: 900, padding: "8px 12px", border: "1px solid #2A2A2A", textAlign: "center", textTransform: "uppercase" }}>{t}</th>)}
                </tr>
              </thead>
              <tbody>
                {dados.sabores.map((s,i)=>(
                  <tr key={i} style={{ background: i%2===0?"#111111":"#1C1C1C" }}>
                    <td style={{ color: "#fff", fontWeight: "bold", textAlign: "center", padding: "6px 10px", border: "1px solid #2A2A2A", whiteSpace: "nowrap" }}>{s.sabor}</td>
                    {s.colunas.map((ings,j)=>(
                      <td key={j} style={{ padding: "4px 8px", border: "1px solid #2A2A2A", verticalAlign: "top" }}>
                        {ings.map((ing,k)=>(
                          <div key={k} style={{ lineHeight: 1.6 }}>
                            <span style={{ color: "#FFD700", fontWeight: 900 }}>+{ing.qtd}g</span>{" "}
                            <span style={{ color: "#fff" }}>{ing.nome}</span>
                          </div>
                        ))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}