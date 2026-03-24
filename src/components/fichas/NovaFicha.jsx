import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Sparkles, ChevronRight, ChevronLeft, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIAS = ["Pizza Doce", "Pizza Salgada", "Hambúrguer", "Açaí", "Marmita", "Bebida", "Outro"];
const UNIDADES = ["g", "kg", "ml", "L", "un", "colher", "pitada", "fatia"];
const TAMANHOS_PADRAO = ["Pequena 1/2", "Grande 1/3", "Grande 1/2", "Quarto Família 1/4", "Terço Família 1/3"];

function novoTamanho(nome = "") {
  return { nome, ingredientes: [{ qtd: "", unidade: "g", nome: "" }], custo: "" };
}

function fichaInicial() {
  return {
    id: Date.now().toString(),
    nome_produto: "", categoria: "Pizza Doce", foto_url: "", observacoes: "",
    tamanhos: [novoTamanho("Pequena 1/2"), novoTamanho("Grande 1/2")],
    modo_preparo: [], tempo_preparo: ""
  };
}

export default function NovaFicha({ mentoradoIdInicial, fichaEditar, briefingEditar, onSalvo }) {
  const [etapa, setEtapa] = useState(1);
  const [ficha, setFicha] = useState(() => fichaEditar || fichaInicial());
  const [mentoradoId, setMentoradoId] = useState(mentoradoIdInicial || "");
  const [loadingIA, setLoadingIA] = useState(false);
  const [loadingPreparo, setLoadingPreparo] = useState(false);
  const qc = useQueryClient();

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: briefingData } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: d => d[0], enabled: !!mentoradoId && !briefingEditar
  });

  const briefing = briefingEditar || briefingData;

  useEffect(() => { if (fichaEditar) setFicha(fichaEditar); }, [fichaEditar]);
  useEffect(() => { if (mentoradoIdInicial) setMentoradoId(mentoradoIdInicial); }, [mentoradoIdInicial]);

  const salvarMutation = useMutation({
    mutationFn: async () => {
      if (!mentoradoId) throw new Error("Selecione um mentorado");
      let b = briefing;
      if (!b) {
        const lista = await base44.entities.Briefing.filter({ mentorado_id: mentoradoId });
        b = lista[0];
      }
      if (!b) {
        b = await base44.entities.Briefing.create({ mentorado_id: mentoradoId, fichas_tecnicas: [ficha] });
        return b;
      }
      const fichasAtuais = b.fichas_tecnicas || [];
      const idx = fichasAtuais.findIndex(f => f.id === ficha.id);
      const novas = idx >= 0
        ? fichasAtuais.map(f => f.id === ficha.id ? ficha : f)
        : [...fichasAtuais, ficha];
      return base44.entities.Briefing.update(b.id, { ...b, fichas_tecnicas: novas });
    },
    onSuccess: () => {
      qc.invalidateQueries(["briefing", mentoradoId]);
      toast.success(fichaEditar ? "Ficha atualizada!" : "Ficha salva com sucesso!");
      onSalvo?.();
    },
    onError: e => toast.error("Erro: " + e.message)
  });

  /* ── IA ingredientes ── */
  const handleSugerirIngredientes = async () => {
    if (!ficha.nome_produto) return toast.error("Informe o nome do produto primeiro");
    setLoadingIA(true);
    try {
      const res = await base44.functions.invoke("sugerirFicha", { nomeProduto: ficha.nome_produto, categoria: ficha.categoria, tipo: "ingredientes" });
      const tamanhosSugeridos = res.data.result.tamanhos || [];
      setFicha(f => ({ ...f, tamanhos: tamanhosSugeridos.map(t => ({ nome: t.nome, ingredientes: t.ingredientes || [], custo: "" })) }));
      toast.success("Ingredientes sugeridos pela IA!");
    } catch (e) { toast.error("Erro: " + e.message); }
    finally { setLoadingIA(false); }
  };

  const handleSugerirPreparo = async () => {
    setLoadingPreparo(true);
    try {
      const res = await base44.functions.invoke("sugerirFicha", { nomeProduto: ficha.nome_produto, categoria: ficha.categoria, tipo: "preparo" });
      const r = res.data.result;
      setFicha(f => ({ ...f, modo_preparo: r.passos || [], tempo_preparo: r.tempo_preparo || "" }));
      toast.success("Modo de preparo gerado pela IA!");
    } catch (e) { toast.error("Erro: " + e.message); }
    finally { setLoadingPreparo(false); }
  };

  /* ── helpers tamanhos ── */
  const addTamanho = () => setFicha(f => ({ ...f, tamanhos: [...f.tamanhos, novoTamanho()] }));
  const removeTamanho = idx => setFicha(f => ({ ...f, tamanhos: f.tamanhos.filter((_, i) => i !== idx) }));
  const updateTamanho = (idx, key, val) => setFicha(f => {
    const ts = [...f.tamanhos]; ts[idx] = { ...ts[idx], [key]: val }; return { ...f, tamanhos: ts };
  });
  const addIngrediente = tidx => setFicha(f => {
    const ts = [...f.tamanhos]; ts[tidx].ingredientes = [...(ts[tidx].ingredientes || []), { qtd: "", unidade: "g", nome: "" }]; return { ...f, tamanhos: ts };
  });
  const removeIngrediente = (tidx, iidx) => setFicha(f => {
    const ts = [...f.tamanhos]; ts[tidx].ingredientes = ts[tidx].ingredientes.filter((_, i) => i !== iidx); return { ...f, tamanhos: ts };
  });
  const updateIngrediente = (tidx, iidx, key, val) => setFicha(f => {
    const ts = [...f.tamanhos]; ts[tidx].ingredientes[iidx] = { ...ts[tidx].ingredientes[iidx], [key]: val }; return { ...f, tamanhos: ts };
  });

  const inputCls = "bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm";

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map(n => (
          <React.Fragment key={n}>
            <button onClick={() => setEtapa(n)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${etapa === n ? 'bg-[#FF4D00] text-white' : etapa > n ? 'bg-[#FF4D00]/30 text-[#FF4D00]' : 'bg-white/10 text-white/40'}`}>{n}</button>
            {n < 3 && <div className={`flex-1 h-0.5 ${etapa > n ? 'bg-[#FF4D00]/40' : 'bg-white/10'}`} />}
          </React.Fragment>
        ))}
        <span className="ml-2 text-xs text-white/40">{['Informações', 'Ingredientes', 'Preparo'][etapa - 1]}</span>
      </div>

      {/* ETAPA 1 */}
      {etapa === 1 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Informações do Produto</h3>

          {!fichaEditar && (
            <div>
              <label className="text-xs text-white/50 mb-1 block">Mentorado *</label>
              <Select value={mentoradoId} onValueChange={setMentoradoId}>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {mentorados.map(m => <SelectItem key={m.id} value={m.id} className="text-white">{m.nome} — {m.negocio}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Nome do Produto *</label>
              <Input value={ficha.nome_produto} onChange={e => setFicha(f => ({ ...f, nome_produto: e.target.value }))}
                placeholder="Ex: Brigadeiro, Pizza Calabresa" className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Categoria</label>
              <Select value={ficha.categoria} onValueChange={v => setFicha(f => ({ ...f, categoria: v }))}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {CATEGORIAS.map(c => <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Foto (URL)</label>
              <Input value={ficha.foto_url} onChange={e => setFicha(f => ({ ...f, foto_url: e.target.value }))}
                placeholder="https://..." className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Observações gerais</label>
              <Input value={ficha.observacoes} onChange={e => setFicha(f => ({ ...f, observacoes: e.target.value }))}
                placeholder="Ex: Servir imediatamente" className={inputCls} />
            </div>
          </div>

          <Button onClick={() => { if (!ficha.nome_produto) return toast.error("Informe o nome do produto"); if (!mentoradoId && !fichaEditar) return toast.error("Selecione um mentorado"); setEtapa(2); }}
            className="w-full bg-[#FF4D00] hover:bg-[#E64500]">
            Próximo: Tamanhos e Ingredientes <ChevronRight size={15} className="ml-1" />
          </Button>
        </div>
      )}

      {/* ETAPA 2 */}
      {etapa === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Tamanhos e Ingredientes</h3>
            <Button onClick={handleSugerirIngredientes} disabled={loadingIA} size="sm"
              variant="outline" className="border-[#FF4D00]/30 text-[#FF4D00] hover:bg-[#FF4D00]/10">
              {loadingIA ? <><div className="w-3 h-3 border-2 border-[#FF4D00]/30 border-t-[#FF4D00] rounded-full animate-spin mr-1.5" />IA...</>
                : <><Sparkles size={13} className="mr-1.5" />🤖 Sugerir com IA</>}
            </Button>
          </div>

          {ficha.tamanhos.map((tam, tidx) => (
            <div key={tidx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-3 border-b border-white/10 bg-white/5">
                <Input value={tam.nome} onChange={e => updateTamanho(tidx, "nome", e.target.value)}
                  placeholder="Nome do tamanho (ex: Grande 1/2)" className="bg-transparent border-0 text-[#FF4D00] font-bold text-sm p-0 focus-visible:ring-0 flex-1" />
                <Input value={tam.custo} onChange={e => updateTamanho(tidx, "custo", e.target.value)}
                  placeholder="Custo R$" className="w-20 bg-black/20 border-white/10 text-white text-xs text-center" />
                {ficha.tamanhos.length > 1 && (
                  <button onClick={() => removeTamanho(tidx)} className="text-white/20 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="p-3 space-y-1.5">
                {tam.ingredientes.map((ing, iidx) => (
                  <div key={iidx} className="flex items-center gap-2">
                    <Input value={ing.qtd} onChange={e => updateIngrediente(tidx, iidx, "qtd", e.target.value)}
                      placeholder="Qtd" type="number" className="w-16 bg-black/20 border-white/10 text-white text-xs text-center px-1" />
                    <select value={ing.unidade} onChange={e => updateIngrediente(tidx, iidx, "unidade", e.target.value)}
                      className="bg-black/30 border border-white/10 text-white/70 text-xs rounded-md px-2 py-1.5 w-14">
                      {UNIDADES.map(u => <option key={u} value={u} style={{ background: "#111" }}>{u}</option>)}
                    </select>
                    <Input value={ing.nome} onChange={e => updateIngrediente(tidx, iidx, "nome", e.target.value)}
                      placeholder="Nome do ingrediente" className="flex-1 bg-black/20 border-white/10 text-white text-xs" />
                    <button onClick={() => removeIngrediente(tidx, iidx)} className="text-white/20 hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button onClick={() => addIngrediente(tidx)}
                  className="w-full py-1.5 text-xs text-white/30 hover:text-white/60 hover:bg-white/3 rounded-lg transition-colors flex items-center justify-center gap-1">
                  <Plus size={12} /> Adicionar ingrediente
                </button>
              </div>
            </div>
          ))}

          <button onClick={addTamanho}
            className="w-full py-3 border border-dashed border-white/20 rounded-xl text-sm text-white/40 hover:text-white/70 hover:border-white/30 transition-colors flex items-center justify-center gap-2">
            <Plus size={15} /> Adicionar tamanho
          </button>

          <div className="flex gap-3">
            <Button onClick={() => setEtapa(1)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <ChevronLeft size={15} className="mr-1" /> Voltar
            </Button>
            <Button onClick={() => setEtapa(3)} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]">
              Próximo: Modo de Preparo <ChevronRight size={15} className="ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ETAPA 3 */}
      {etapa === 3 && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Modo de Preparo <span className="text-white/40 font-normal">(opcional)</span></h3>
              <Button onClick={handleSugerirPreparo} disabled={loadingPreparo} size="sm"
                variant="outline" className="border-[#FF4D00]/30 text-[#FF4D00] hover:bg-[#FF4D00]/10">
                {loadingPreparo ? <><div className="w-3 h-3 border-2 border-[#FF4D00]/30 border-t-[#FF4D00] rounded-full animate-spin mr-1.5" />IA...</>
                  : <><Wand2 size={13} className="mr-1.5" />🤖 Gerar com IA</>}
              </Button>
            </div>

            {ficha.tempo_preparo && (
              <p className="text-xs text-white/50">⏱ Tempo: {ficha.tempo_preparo}</p>
            )}

            {ficha.modo_preparo.map((passo, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="w-6 h-6 rounded-full bg-[#FF4D00]/20 text-[#FF4D00] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1">{i + 1}</span>
                <textarea value={passo} rows={2}
                  onChange={e => setFicha(f => { const p = [...f.modo_preparo]; p[i] = e.target.value; return { ...f, modo_preparo: p }; })}
                  className="flex-1 bg-black/20 border border-white/10 text-white text-xs rounded-lg p-2 resize-none placeholder:text-white/30"
                  placeholder="Descreva o passo..." />
                <button onClick={() => setFicha(f => ({ ...f, modo_preparo: f.modo_preparo.filter((_, j) => j !== i) }))}
                  className="text-white/20 hover:text-red-400 mt-1"><Trash2 size={13} /></button>
              </div>
            ))}

            <button onClick={() => setFicha(f => ({ ...f, modo_preparo: [...f.modo_preparo, ""] }))}
              className="w-full py-2 border border-dashed border-white/15 rounded-xl text-xs text-white/35 hover:text-white/60 transition-colors flex items-center justify-center gap-1">
              <Plus size={12} /> Adicionar passo
            </button>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setEtapa(2)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <ChevronLeft size={15} className="mr-1" /> Voltar
            </Button>
            <Button onClick={() => salvarMutation.mutate()} disabled={salvarMutation.isPending}
              className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]">
              {salvarMutation.isPending
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Salvando...</>
                : <><Save size={15} className="mr-2" />Salvar Ficha Técnica</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}