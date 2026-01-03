import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Home,
  TrendingDown,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categorias = [
  { value: "carnes", label: "🥩 Carnes" },
  { value: "hortifruti", label: "🥬 Hortifrúti" },
  { value: "graos_cereais", label: "🌾 Grãos e Cereais" },
  { value: "laticinios", label: "🥛 Laticínios" },
  { value: "bebidas", label: "🥤 Bebidas" },
  { value: "embalagens", label: "📦 Embalagens" },
  { value: "limpeza", label: "🧹 Limpeza" },
  { value: "descartaveis", label: "🍽️ Descartáveis" },
  { value: "temperos", label: "🌶️ Temperos" },
  { value: "congelados", label: "❄️ Congelados" },
  { value: "massas", label: "🍝 Massas" },
  { value: "oleos", label: "🫗 Óleos" },
  { value: "outros", label: "📋 Outros" },
];

const unidadesMedida = [
  { value: "kg", label: "Kg" },
  { value: "g", label: "g" },
  { value: "l", label: "L" },
  { value: "ml", label: "ml" },
  { value: "un", label: "Unidade" },
  { value: "cx", label: "Caixa" },
  { value: "fardo", label: "Fardo" },
  { value: "pacote", label: "Pacote" },
];

export default function Fornecedores() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [cidadeFilter, setCidadeFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    produto: "",
    categoria: "outros",
    fornecedor_nome: "",
    contato_nome: "",
    telefone: "",
    email: "",
    valor_unitario: "",
    unidade_medida: "un",
    condicao_pagamento: "",
    cidade: "",
    observacoes: "",
    ativo: true
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: () => base44.entities.Fornecedor.list("-created_date")
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Fornecedor.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Fornecedor.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Fornecedor.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fornecedores"] })
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setForm({
      produto: "",
      categoria: "outros",
      fornecedor_nome: "",
      contato_nome: "",
      telefone: "",
      email: "",
      valor_unitario: "",
      unidade_medida: "un",
      condicao_pagamento: "",
      cidade: "",
      observacoes: "",
      ativo: true
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      produto: item.produto || "",
      categoria: item.categoria || "outros",
      fornecedor_nome: item.fornecedor_nome || "",
      contato_nome: item.contato_nome || "",
      telefone: item.telefone || "",
      email: item.email || "",
      valor_unitario: item.valor_unitario || "",
      unidade_medida: item.unidade_medida || "un",
      condicao_pagamento: item.condicao_pagamento || "",
      cidade: item.cidade || "",
      observacoes: item.observacoes || "",
      ativo: item.ativo ?? true
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      ...form,
      valor_unitario: parseFloat(form.valor_unitario)
    };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Análise de preços por produto
  const analisePrecos = useMemo(() => {
    const grupos = {};
    fornecedores.forEach((f) => {
      if (!f.ativo) return;
      if (!grupos[f.produto]) {
        grupos[f.produto] = [];
      }
      grupos[f.produto].push(f);
    });

    const resultado = {};
    Object.keys(grupos).forEach((produto) => {
      const items = grupos[produto];
      const valores = items.map((i) => i.valor_unitario);
      const menorValor = Math.min(...valores);
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;

      resultado[produto] = {
        menorValor,
        media,
        items: items.map((item) => ({
          ...item,
          isMelhor: item.valor_unitario === menorValor,
          isAcimaMedia: item.valor_unitario > media
        }))
      };
    });

    return resultado;
  }, [fornecedores]);

  // Filtros
  const filtered = useMemo(() => {
    return fornecedores.filter((f) => {
      const matchSearch =
        f.produto?.toLowerCase().includes(search.toLowerCase()) ||
        f.fornecedor_nome?.toLowerCase().includes(search.toLowerCase()) ||
        f.categoria?.toLowerCase().includes(search.toLowerCase());
      const matchCategoria = categoriaFilter === "todos" || f.categoria === categoriaFilter;
      const matchCidade = cidadeFilter === "todos" || f.cidade === cidadeFilter;
      return matchSearch && matchCategoria && matchCidade && f.ativo;
    });
  }, [fornecedores, search, categoriaFilter, cidadeFilter]);

  const cidades = [...new Set(fornecedores.map((f) => f.cidade).filter(Boolean))];

  const exportToCSV = () => {
    const headers = ["Produto", "Categoria", "Fornecedor", "Contato", "Telefone", "Email", "Valor", "Unidade", "Pagamento", "Cidade", "Observações"];
    const rows = filtered.map((f) => [
      f.produto,
      f.categoria,
      f.fornecedor_nome,
      f.contato_nome,
      f.telefone,
      f.email,
      f.valor_unitario,
      f.unidade_medida,
      f.condicao_pagamento,
      f.cidade,
      f.observacoes
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell || ""}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fornecedores.csv";
    a.click();
  };

  // Agrupar por produto
  const produtosAgrupados = useMemo(() => {
    const grupos = {};
    filtered.forEach((f) => {
      if (!grupos[f.produto]) {
        grupos[f.produto] = {
          produto: f.produto,
          categoria: f.categoria,
          fornecedores: []
        };
      }
      grupos[f.produto].fornecedores.push(f);
    });
    return Object.values(grupos);
  }, [filtered]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Comparação de Fornecedores</h1>
          <p className="text-white/50">{fornecedores.filter(f => f.ativo).length} fornecedores ativos</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("Dashboard")}>
            <Button className="bg-[#FF4D00] hover:bg-[#E64500] text-white">
              <Home size={18} className="mr-2" /> Início
            </Button>
          </Link>
          <Button onClick={exportToCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Download size={18} className="mr-2" /> Exportar
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
            <Plus size={20} className="mr-2" /> Novo Fornecedor
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Buscar por produto ou fornecedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="todos">Todas Categorias</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cidadeFilter} onValueChange={setCidadeFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="todos">Todas Cidades</SelectItem>
            {cidades.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista agrupada por produto */}
      <div className="space-y-6">
        {produtosAgrupados.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl">
            <p className="text-white/50">Nenhum fornecedor cadastrado</p>
          </div>
        ) : (
          produtosAgrupados.map((grupo) => {
            const analise = analisePrecos[grupo.produto];
            return (
              <div key={grupo.produto} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{grupo.produto}</h3>
                    <p className="text-sm text-white/50">
                      {categorias.find((c) => c.value === grupo.categoria)?.label || grupo.categoria}
                    </p>
                  </div>
                  {analise && (
                    <div className="text-right">
                      <p className="text-xs text-white/40">Valor médio</p>
                      <p className="text-lg font-semibold text-white">
                        R$ {analise.media.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-xs text-white/60 font-medium">Fornecedor</th>
                        <th className="text-left py-3 px-4 text-xs text-white/60 font-medium">Contato</th>
                        <th className="text-left py-3 px-4 text-xs text-white/60 font-medium">Cidade</th>
                        <th className="text-right py-3 px-4 text-xs text-white/60 font-medium">Valor</th>
                        <th className="text-left py-3 px-4 text-xs text-white/60 font-medium">Pagamento</th>
                        <th className="text-center py-3 px-4 text-xs text-white/60 font-medium">Status</th>
                        <th className="text-right py-3 px-4 text-xs text-white/60 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.fornecedores.map((f) => {
                        const info = analise?.items.find((i) => i.id === f.id);
                        return (
                          <tr
                            key={f.id}
                            className={`border-b border-white/5 ${
                              info?.isMelhor ? "bg-emerald-500/10" : info?.isAcimaMedia ? "bg-red-500/5" : ""
                            }`}
                          >
                            <td className="py-4 px-4">
                              <p className="font-medium text-white">{f.fornecedor_nome}</p>
                              {f.contato_nome && (
                                <p className="text-xs text-white/50">{f.contato_nome}</p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col gap-1">
                                {f.telefone && (
                                  <a
                                    href={`https://wa.me/${f.telefone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                                  >
                                    <Phone size={12} /> {f.telefone}
                                  </a>
                                )}
                                {f.email && (
                                  <a
                                    href={`mailto:${f.email}`}
                                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                  >
                                    <Mail size={12} /> {f.email}
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-white/70">{f.cidade || "-"}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <p className="text-lg font-bold text-white">
                                  R$ {f.valor_unitario?.toFixed(2)}
                                </p>
                                <span className="text-xs text-white/40">/{f.unidade_medida}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-white/70">{f.condicao_pagamento || "-"}</p>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {info?.isMelhor && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                                  <CheckCircle size={12} /> Melhor Preço
                                </span>
                              )}
                              {info?.isAcimaMedia && !info?.isMelhor && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                                  <TrendingUp size={12} /> Acima da Média
                                </span>
                              )}
                              {!info?.isMelhor && !info?.isAcimaMedia && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                                  <TrendingDown size={12} /> Abaixo da Média
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" className="bg-white/5 hover:bg-white/10 text-white border-white/10">
                                    •••
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-zinc-900 border-white/10">
                                  <DropdownMenuItem onClick={() => handleEdit(f)} className="text-white hover:bg-white/10">
                                    <Edit2 size={14} className="mr-2" /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => deleteMutation.mutate(f.id)}
                                    className="text-red-400 hover:bg-red-500/10"
                                  >
                                    <Trash2 size={14} className="mr-2" /> Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {grupo.fornecedores.length > 0 && grupo.fornecedores[0].observacoes && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-white/40 mb-1">Observações</p>
                    <p className="text-sm text-white/70">{grupo.fornecedores[0].observacoes}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Produto *</Label>
                <Input
                  value={form.produto}
                  onChange={(e) => setForm({ ...form, produto: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Categoria *</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {categorias.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Fornecedor *</Label>
                <Input
                  value={form.fornecedor_nome}
                  onChange={(e) => setForm({ ...form, fornecedor_nome: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Nome do Contato</Label>
                <Input
                  value={form.contato_nome}
                  onChange={(e) => setForm({ ...form, contato_nome: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Telefone/WhatsApp</Label>
                <Input
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-white/70">Valor Unitário *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.valor_unitario}
                  onChange={(e) => setForm({ ...form, valor_unitario: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Unidade</Label>
                <Select value={form.unidade_medida} onValueChange={(v) => setForm({ ...form, unidade_medida: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {unidadesMedida.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Cidade</Label>
                <Input
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-white/70">Condição de Pagamento</Label>
              <Input
                value={form.condicao_pagamento}
                onChange={(e) => setForm({ ...form, condicao_pagamento: e.target.value })}
                placeholder="Ex: À vista, 30 dias, 30/60 dias..."
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-white/70">Observações</Label>
              <Textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleCloseDialog} className="flex-1 bg-white/5 hover:bg-white/10 text-white">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!form.produto || !form.fornecedor_nome || !form.valor_unitario}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                {editingItem ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}