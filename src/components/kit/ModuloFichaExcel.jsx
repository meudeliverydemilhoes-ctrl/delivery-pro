import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Printer, Save, Loader2, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Carrega SheetJS dinamicamente via CDN (evita erro de build)
let _XLSX = null;
async function getXLSX() {
  if (_XLSX) return _XLSX;
  const mod = await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs");
  _XLSX = mod;
  return _XLSX;
}

function parsearIngredientes(celula) {
  if (!celula || celula.toString().trim() === "") return [];
  const texto = celula.toString();
  const partes = texto.split(";").map(p => p.trim()).filter(p => p !== "");
  const SKIP = ["PEQUENA", "GRANDE", "FAMÍLIA", "FAMILIA", "PEQUENO", "MEDIO", "MÉDIO", "MEDIO"];
  return partes
    .filter(p => !SKIP.includes(p.toUpperCase()))
    .map(p => {
      const match = p.match(/^(\d[\d,\.]*)\s*(?:[Gg][Rr]?\.?|[Mm][Ll]\.?|[Kk][Gg]\.?|[Uu][Nn]\.?)\s+(.+)$/);
      if (match) return { qtd: match[1].replace(",", "."), nome: match[2].trim() };
      return { qtd: "", nome: p };
    });
}

export default function ModuloFichaExcel() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [titulo, setTitulo] = useState("PIZZAS SALGADAS");
  const [headers, setHeaders] = useState([]);
  const [sabores, setSabores] = useState([]);
  const [arquivoCarregado, setArquivoCarregado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const inputRef = useRef();

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: briefings = [] } = useQuery({ queryKey: ["briefings-all"], queryFn: () => base44.entities.Briefing.list() });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const XLSX = await getXLSX();
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false });

        const hdrs = jsonData[0].filter(h => h && h.toString().trim() !== "");
        const rows = jsonData.slice(1).filter(row => row[0] && row[0].toString().trim() !== "");

        setHeaders(hdrs);
        setSabores(rows);
        setArquivoCarregado(true);
      } catch (err) {
        console.error("Erro ao ler Excel:", err);
        alert("Erro ao ler o arquivo. Verifique se é um .xlsx válido.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const salvar = async () => {
    if (!mentoradoId || !arquivoCarregado) return;
    setSalvando(true);
    const fichaRecord = {
      id: Date.now().toString(),
      titulo: `FICHA TÉCNICA — ${titulo.toUpperCase()}`,
      data_geracao: new Date().toISOString(),
      total_sabores: sabores.length,
      tamanhos: headers.slice(1),
      dados: sabores.map(r => ({
        sabor: r[0]?.toString().toUpperCase(),
        colunas: headers.slice(1).map((_, i) => parsearIngredientes(r[i + 1]))
      }))
    };
    const briefing = briefings.find(b => b.mentorado_id === mentoradoId);
    const fichasAtuais = briefing?.fichas_tecnicas || [];
    if (briefing?.id) {
      await base44.entities.Briefing.update(briefing.id, { fichas_tecnicas: [...fichasAtuais, fichaRecord] });
    } else {
      await base44.entities.Briefing.create({ mentorado_id: mentoradoId, fichas_tecnicas: [fichaRecord] });
    }
    setSalvando(false);
    alert("Ficha salva com sucesso!");
  };

  const imprimirFicha = () => {
    const conteudo = document.getElementById("ficha-preview").innerHTML;
    const janela = window.open("", "_blank");
    janela.document.write(`<!DOCTYPE html><html><head>
      <title>Ficha Técnica — ${titulo}</title>
      <style>
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000 !important; font-family: Arial, sans-serif; }
        @page { size: landscape; margin: 8mm; }
        @media print { body { background: #000 !important; } }
      </style>
    </head><body>
      ${conteudo}
      <script>window.onload = function() { window.print(); window.close(); }<\/script>
    </body></html>`);
    janela.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Configuração */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-white/60 text-sm">Mentorado</Label>
            <select
              value={mentoradoId}
              onChange={e => setMentoradoId(e.target.value)}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
            >
              <option value="" style={{background:"#111"}}>Selecione...</option>
              {mentorados.map(m => (
                <option key={m.id} value={m.id} style={{background:"#111"}}>{m.nome} — {m.negocio}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-white/60 text-sm">Título da Ficha</Label>
            <Input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: PIZZAS SALGADAS"
              className="bg-white/5 border-white/10 text-white mt-1"
            />
          </div>
        </div>

        {/* Upload */}
        <div>
          <Label className="text-white/60 text-sm mb-2 block">Arquivo Excel (.xlsx / .xls)</Label>
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-[#E8601C]/60 hover:bg-[#E8601C]/5 transition-all"
          >
            <FileSpreadsheet size={40} className="mx-auto text-white/30 mb-3" />
            <p className="text-white font-semibold mb-1">Clique para selecionar a planilha</p>
            <p className="text-white/40 text-sm">Aceita .xlsx e .xls</p>
            <div className="mt-3 inline-block bg-white/5 rounded-xl px-4 py-2 text-xs text-white/40 text-left">
              <p className="font-bold text-white/60 mb-1">Formato esperado:</p>
              <p>Col A: Sabor | Col B, C, D...: Tamanhos</p>
              <p>Célula: "PEQUENA; 115 Gr Ingrediente; 35 Gr Outro"</p>
            </div>
          </div>
          <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
        </div>
      </div>

      {/* Preview */}
      {arquivoCarregado && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-white/60 text-sm">✅ {sabores.length} sabores · {headers.slice(1).length} tamanhos</p>
            <div className="flex gap-2">
              <Button onClick={salvar} disabled={salvando || !mentoradoId} className="bg-[#10B981] hover:bg-[#059669] text-white">
                {salvando ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                Salvar
              </Button>
              <Button onClick={imprimirFicha} className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                <Printer size={16} className="mr-2" />🖨️ Gerar PDF
              </Button>
            </div>
          </div>

          <div id="ficha-preview" style={{ background: "#000", padding: "8px", overflowX: "auto", borderRadius: 12 }}>
            {/* Título */}
            <div style={{
              background: "#000", color: "#FFD700", textAlign: "center",
              fontWeight: "bold", fontSize: "16px", padding: "10px",
              border: "1px solid #333", marginBottom: "2px"
            }}>
              FICHA TÉCNICA — {titulo.toUpperCase()}
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
              <thead>
                <tr>
                  <th style={{ background: "#1A1A1A", color: "#fff", padding: "6px 8px", border: "1px solid #2A2A2A", fontWeight: "bold", textAlign: "center", minWidth: "100px" }}>
                    SABOR
                  </th>
                  {headers.slice(1).map((h, i) => (
                    <th key={i} style={{ background: "#E8601C", color: "#000", padding: "6px 8px", border: "1px solid #2A2A2A", fontWeight: "bold", textAlign: "center", minWidth: "150px" }}>
                      {h.toString().toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sabores.map((row, rowIdx) => (
                  <tr key={rowIdx} style={{ background: rowIdx % 2 === 0 ? "#111" : "#1C1C1C" }}>
                    <td style={{ color: "#fff", fontWeight: "bold", padding: "6px 8px", border: "1px solid #2A2A2A", textAlign: "center", verticalAlign: "middle" }}>
                      {row[0]?.toString().toUpperCase()}
                    </td>
                    {headers.slice(1).map((_, colIdx) => {
                      const ings = parsearIngredientes(row[colIdx + 1]);
                      return (
                        <td key={colIdx} style={{ padding: "6px 8px", border: "1px solid #2A2A2A", verticalAlign: "top" }}>
                          {ings.map((ing, iIdx) => (
                            <div key={iIdx} style={{ lineHeight: "1.6" }}>
                              {ing.qtd && <span style={{ color: "#FFD700", fontWeight: "bold" }}>+{ing.qtd}g </span>}
                              <span style={{ color: "#fff" }}>{ing.nome}</span>
                            </div>
                          ))}
                        </td>
                      );
                    })}
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