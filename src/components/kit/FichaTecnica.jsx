import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Printer, Sparkles, ChefHat, X } from "lucide-react";
import { toast } from "sonner";

const TAMANHOS_PADRAO = ["P", "M", "G", "Família"];
const TIPOS = ["pizzaria", "hamburgueria", "açaí", "sushi", "marmitaria", "outro"];

function novaFicha() {
  return {
    id: Date.now(),
    nome_negocio: "",
    tipo_delivery: "pizzaria",
    produto: "",
    ingredientes: [{ nome: "", unidade: "g", p: "", m: "", g: "", familia: "" }]
  };
}

export default function FichaTecnica() {
  const [fichas, setFichas] = useState([novaFicha()]);
  const [loadingIA, setLoadingIA] = useState(null);
  const printRef = useRef();

  const addFicha = () => setFichas(f => [...f, novaFicha()]);
  const removeFicha = id => setFichas(f => f.filter(x => x.id !== id));

  const updateFicha = (id, key, val) => setFichas(f => f.map(x => x.id === id ? { ...x, [key]: val } : x));

  const updateIngrediente = (fichaId, idx, key, val) => setFichas(f => f.map(x => {
    if (x.id !== fichaId) return x;
    const novos = [...x.ingredientes];
    novos[idx] = { ...novos[idx], [key]: val };
    return { ...x, ingredientes: novos };
  }));

  const addIngrediente = fichaId => setFichas(f => f.map(x =>
    x.id !== fichaId ? x : { ...x, ingredientes: [...x.ingredientes, { nome: "", unidade: "g", p: "", m: "", g: "", familia: "" }] }
  ));

  const removeIngrediente = (fichaId, idx) => setFichas(f => f.map(x =>
    x.id !== fichaId ? x : { ...x, ingredientes: x.ingredientes.filter((_, i) => i !== idx) }
  ));

  const sugerirIA = async (ficha) => {
    if (!ficha.produto) return toast.error("Informe o produto primeiro");
    setLoadingIA(ficha.id);
    try {
      const res = await base44.functions.invoke("gerarDocumento", {
        tipo: "ingredientes",
        dados: { produto: ficha.produto, tipo_delivery: ficha.tipo_delivery, tamanhos: TAMANHOS_PADRAO }
      });
      const sugestoes = res.data.result.ingredientes || [];
      setFichas(f => f.map(x => x.id !== ficha.id ? x : {
        ...x,
        ingredientes: sugestoes.map(s => ({
          nome: s.nome, unidade: s.unidade || "g",
          p: s.quantidades?.P || "", m: s.quantidades?.M || "",
          g: s.quantidades?.G || "", familia: s.quantidades?.Família || s.quantidades?.Familia || ""
        }))
      }));
      toast.success("Ingredientes sugeridos pela IA!");
    } catch (e) { toast.error("Erro: " + e.message); }
    finally { setLoadingIA(null); }
  };

  const handlePrint = () => {
    const conteudo = printRef.current?.innerHTML;
    if (!conteudo) return;
    const janela = window.open("", "_blank");
    janela.document.write(`<!DOCTYPE html><html><head><title>Fichas Técnicas</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #fff; }
  @page { size: A6; margin: 8mm; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .ficha-page { page-break-after: always; }
    .ficha-page:last-child { page-break-after: avoid; }
  }
</style></head><body>${conteudo}</body></html>`);
    janela.document.close();
    janela.focus();
    setTimeout(() => { janela.print(); janela.close(); }, 500);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-white/70">Fichas para impressão em A6 (10.5 × 14.8 cm)</h3>
        <div className="flex gap-2">
          <Button onClick={addFicha} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            <Plus size={14} className="mr-1" /> Nova Ficha
          </Button>
          <Button onClick={handlePrint} size="sm" className="bg-[#FF6B00] hover:bg-[#E65C00]">
            <Printer size={14} className="mr-1" /> Imprimir Todas A6
          </Button>
        </div>
      </div>

      {fichas.map((ficha, fi) => (
        <div key={ficha.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ChefHat size={15} className="text-[#FF6B00]" /> Ficha {fi + 1}
            </h4>
            {fichas.length > 1 && (
              <button onClick={() => removeFicha(ficha.id)} className="text-white/30 hover:text-red-400 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Nome do Negócio</label>
              <Input value={ficha.nome_negocio} onChange={e => updateFicha(ficha.id, "nome_negocio", e.target.value)}
                placeholder="Ex: Pizzaria da Família" className="bg-white/10 border-white/20 text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Tipo</label>
              <Select value={ficha.tipo_delivery} onValueChange={v => updateFicha(ficha.id, "tipo_delivery", v)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {TIPOS.map(t => <SelectItem key={t} value={t} className="text-white capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Produto *</label>
              <Input value={ficha.produto} onChange={e => updateFicha(ficha.id, "produto", e.target.value)}
                placeholder="Ex: Pizza Margherita" className="bg-white/10 border-white/20 text-white text-sm" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => sugerirIA(ficha)} disabled={loadingIA === ficha.id} size="sm"
              variant="outline" className="border-[#FF6B00]/40 text-[#FF6B00] hover:bg-[#FF6B00]/10">
              {loadingIA === ficha.id
                ? <><div className="w-3 h-3 border-2 border-[#FF6B00]/30 border-t-[#FF6B00] rounded-full animate-spin mr-1.5" />IA pensando...</>
                : <><Sparkles size={13} className="mr-1.5" />✨ Sugerir ingredientes com IA</>}
            </Button>
          </div>

          {/* Tabela de ingredientes */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-zinc-800">
                  <th className="text-left px-3 py-2 text-white/60 font-semibold">Ingrediente</th>
                  <th className="px-2 py-2 text-white/60 font-semibold text-center">Un.</th>
                  {TAMANHOS_PADRAO.map(t => (
                    <th key={t} className="px-2 py-2 text-white/60 font-semibold text-center">{t}</th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {ficha.ingredientes.map((ing, idx) => (
                  <tr key={idx} className="border-t border-white/5 hover:bg-white/3">
                    <td className="px-3 py-1.5">
                      <input value={ing.nome} onChange={e => updateIngrediente(ficha.id, idx, "nome", e.target.value)}
                        placeholder="Ingrediente" className="w-full bg-transparent text-white placeholder-white/30 outline-none text-xs" />
                    </td>
                    <td className="px-2 py-1.5">
                      <select value={ing.unidade} onChange={e => updateIngrediente(ficha.id, idx, "unidade", e.target.value)}
                        className="bg-transparent text-white/70 outline-none text-xs text-center w-full">
                        {["g", "ml", "un", "kg", "L"].map(u => <option key={u} value={u} style={{ background: "#111" }}>{u}</option>)}
                      </select>
                    </td>
                    {["p", "m", "g", "familia"].map(tam => (
                      <td key={tam} className="px-2 py-1.5 text-center">
                        <input value={ing[tam]} onChange={e => updateIngrediente(ficha.id, idx, tam, e.target.value)}
                          placeholder="0" className="w-14 bg-transparent text-white/80 placeholder-white/20 outline-none text-xs text-center" />
                      </td>
                    ))}
                    <td className="px-2 py-1.5">
                      <button onClick={() => removeIngrediente(ficha.id, idx)} className="text-white/20 hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => addIngrediente(ficha.id)}
              className="w-full py-2 text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors flex items-center justify-center gap-1">
              <Plus size={12} /> Adicionar ingrediente
            </button>
          </div>
        </div>
      ))}

      {/* Preview para impressão (oculto) */}
      <div ref={printRef} style={{ display: 'none' }}>
        {fichas.map((ficha, fi) => (
          <div key={ficha.id} className="ficha-page" style={{ width: '100%', fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#111' }}>
            {/* Cabeçalho */}
            <div style={{ background: '#0a0a0f', color: '#fff', padding: '10px 12px', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 900, fontSize: 13, color: '#FF6B00' }}>{ficha.produto || "Produto"}</p>
                <p style={{ fontSize: 9, color: '#ffffff60' }}>{ficha.nome_negocio || "Negócio"}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 9, color: '#ffffff60', textTransform: 'uppercase', letterSpacing: 1 }}>Ficha Técnica</p>
                <p style={{ fontSize: 9, color: '#ffffff40' }}>#{fi + 1}</p>
              </div>
            </div>
            {/* Tabela */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
              <thead>
                <tr style={{ background: '#1a1a1a', color: '#fff' }}>
                  <th style={{ padding: '5px 8px', textAlign: 'left', fontWeight: 700 }}>Ingrediente</th>
                  <th style={{ padding: '5px 4px', textAlign: 'center', fontWeight: 700 }}>Un.</th>
                  {TAMANHOS_PADRAO.map(t => (
                    <th key={t} style={{ padding: '5px 4px', textAlign: 'center', fontWeight: 700 }}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ficha.ingredientes.filter(i => i.nome).map((ing, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '4px 8px', fontWeight: 500 }}>{ing.nome}</td>
                    <td style={{ padding: '4px 4px', textAlign: 'center', color: '#666' }}>{ing.unidade}</td>
                    {["p", "m", "g", "familia"].map(tam => (
                      <td key={tam} style={{ padding: '4px 4px', textAlign: 'center', fontWeight: 600, color: ing[tam] ? '#FF6B00' : '#999' }}>
                        {ing[tam] ? `+${ing[tam]}` : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 8, padding: '6px 8px', background: '#f9f9f9', borderTop: '2px solid #FF6B00', fontSize: 8, color: '#999', display: 'flex', justifyContent: 'space-between' }}>
              <span>Válido para uso interno</span>
              <span>Mentoria Delivery Pro</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}