import React, { useState } from "react";
import {
  FileText, Video, Table2, ClipboardList, FormInput, LayoutDashboard,
  Play, Download, ExternalLink, ChevronRight, X, Check, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

const tipoConfig = {
  checklist: { icon: ClipboardList, label: "Checklist", color: "text-emerald-400" },
  video: { icon: Video, label: "Vídeo", color: "text-blue-400" },
  planilha: { icon: Table2, label: "Planilha", color: "text-amber-400" },
  formulario: { icon: FormInput, label: "Formulário", color: "text-violet-400" },
  documento: { icon: FileText, label: "Documento", color: "text-pink-400" },
  dashboard: { icon: LayoutDashboard, label: "Dashboard", color: "text-cyan-400" },
  tarefa: { icon: Check, label: "Tarefa", color: "text-white/60" }
};

// Conteúdos pré-prontos para cada item interativo
const conteudosInterativos = {
  "Checklist de Abertura, Fechamento e Auditoria": {
    tipo: "checklist",
    titulo: "Checklist Operacional Completo",
    secoes: [
      {
        nome: "🌅 Abertura",
        itens: [
          "Verificar limpeza geral da cozinha",
          "Conferir estoque de insumos principais",
          "Ligar equipamentos e verificar temperaturas",
          "Organizar praça de produção",
          "Verificar embalagens e materiais de entrega",
          "Testar sistema de pedidos",
          "Conferir fundo de caixa"
        ]
      },
      {
        nome: "🌙 Fechamento",
        itens: [
          "Limpar e higienizar equipamentos",
          "Armazenar corretamente os insumos",
          "Desligar equipamentos",
          "Fechar caixa e conferir valores",
          "Verificar pedidos pendentes",
          "Programar descongelamento para amanhã",
          "Trancar e ativar alarme"
        ]
      },
      {
        nome: "🔍 Auditoria Semanal",
        itens: [
          "Conferir validades de todos os produtos",
          "Avaliar organização de estoque (PVPS)",
          "Verificar cumprimento de fichas técnicas",
          "Checar uniformes e EPIs da equipe",
          "Revisar relatório de desperdício",
          "Analisar avaliações dos clientes"
        ]
      }
    ]
  },
  "Tutorial: Preenchendo a Ficha Técnica": {
    tipo: "video",
    titulo: "Como Preencher a Ficha Técnica Corretamente",
    descricao: "Aprenda passo a passo como criar fichas técnicas profissionais para controlar custos e padronizar sua produção.",
    videoUrl: "https://www.youtube.com/embed/exemplo",
    passos: [
      "1. Liste todos os ingredientes do produto",
      "2. Pese cada ingrediente individualmente",
      "3. Anote o custo unitário de cada item",
      "4. Calcule o custo total do produto",
      "5. Defina o preço de venda com markup adequado"
    ]
  },
  "Planilha Automática de Simulação de CMV": {
    tipo: "planilha",
    titulo: "Simulador de CMV",
    campos: [
      { nome: "faturamento_mensal", label: "Faturamento Mensal (R$)", tipo: "number", placeholder: "Ex: 50000" },
      { nome: "custo_insumos", label: "Custo com Insumos (R$)", tipo: "number", placeholder: "Ex: 15000" },
      { nome: "custo_embalagens", label: "Custo com Embalagens (R$)", tipo: "number", placeholder: "Ex: 2000" }
    ],
    formula: "CMV = ((Custo Insumos + Embalagens) / Faturamento) × 100",
    metaIdeal: "CMV ideal: entre 28% e 35%"
  },
  "Modelo de Metas de 90 Dias": {
    tipo: "formulario",
    titulo: "Planejamento de Metas - 90 Dias",
    secoes: [
      {
        nome: "Metas de Faturamento",
        campos: [
          { nome: "faturamento_atual", label: "Faturamento Atual", placeholder: "R$ 40.000" },
          { nome: "meta_30_dias", label: "Meta 30 dias", placeholder: "R$ 45.000" },
          { nome: "meta_60_dias", label: "Meta 60 dias", placeholder: "R$ 52.000" },
          { nome: "meta_90_dias", label: "Meta 90 dias", placeholder: "R$ 60.000" }
        ]
      },
      {
        nome: "Metas de Ticket Médio",
        campos: [
          { nome: "ticket_atual", label: "Ticket Atual", placeholder: "R$ 45" },
          { nome: "ticket_meta", label: "Ticket Meta", placeholder: "R$ 55" }
        ]
      },
      {
        nome: "Ações Semanais",
        campos: [
          { nome: "semana_1", label: "Semana 1-2", placeholder: "Revisar cardápio e precificação" },
          { nome: "semana_2", label: "Semana 3-4", placeholder: "Implementar combos estratégicos" },
          { nome: "semana_3", label: "Semana 5-6", placeholder: "Otimizar tempo de entrega" },
          { nome: "semana_4", label: "Semana 7-8", placeholder: "Campanhas de marketing" }
        ]
      }
    ]
  },
  "Inserir Missão, Visão e Valores": {
    tipo: "formulario",
    titulo: "Missão, Visão e Valores",
    prePreenchido: true,
    secoes: [
      {
        nome: "Institucional",
        campos: [
          { nome: "missao", label: "Missão", placeholder: "Por que existimos?", valorPadrao: "Transformar negócios de entrega em operações lucrativas e organizadas" },
          { nome: "visao", label: "Visão", placeholder: "Onde queremos chegar?", valorPadrao: "Ser a maior referência de mentoria em delivery no Brasil" },
          { nome: "valores", label: "Valores", placeholder: "O que é inegociável?", valorPadrao: "Resultado, transparência, liderança, evolução contínua, trabalho em equipe" }
        ]
      }
    ]
  },
  "Organograma da Operação (modelo editável)": {
    tipo: "formulario",
    titulo: "Organograma da Operação",
    secoes: [
      {
        nome: "Estrutura Organizacional",
        campos: [
          { nome: "dono", label: "👑 Dono/Proprietário", placeholder: "Nome do proprietário" },
          { nome: "gerente", label: "📋 Gerente de Operação", placeholder: "Nome do gerente" },
          { nome: "producao", label: "🍕 Líder de Produção", placeholder: "Nome do líder" },
          { nome: "atendimento", label: "📞 Responsável Atendimento", placeholder: "Nome do responsável" },
          { nome: "entrega", label: "🛵 Coordenador de Entrega", placeholder: "Nome do coordenador" }
        ]
      }
    ]
  },
  "Avaliar desempenho do time": {
    tipo: "checklist",
    titulo: "Avaliação de Desempenho da Equipe",
    secoes: [
      {
        nome: "Critérios de Avaliação",
        itens: [
          "Assiduidade e pontualidade",
          "Agilidade na execução",
          "Trabalho em equipe",
          "Qualidade no atendimento",
          "Cumprimento de processos",
          "Proatividade",
          "Organização e limpeza"
        ]
      }
    ]
  },
  "Conduzir rodada de feedback": {
    tipo: "formulario",
    titulo: "Formulário de Feedback",
    secoes: [
      {
        nome: "Feedback do Colaborador",
        campos: [
          { nome: "colaborador", label: "Nome do Colaborador", placeholder: "Nome completo" },
          { nome: "funcionou", label: "O que funcionou bem?", placeholder: "Pontos positivos do período", tipo: "textarea" },
          { nome: "melhorar", label: "O que pode melhorar?", placeholder: "Pontos de desenvolvimento", tipo: "textarea" },
          { nome: "sugestoes", label: "Sugestões", placeholder: "Ideias e sugestões do colaborador", tipo: "textarea" }
        ]
      }
    ]
  },
  "Respostas Padrão para Avaliações": {
    tipo: "documento",
    titulo: "Modelos de Resposta para Avaliações",
    conteudo: [
      {
        categoria: "⭐⭐⭐⭐⭐ Avaliações Positivas",
        respostas: [
          "Muito obrigado pela avaliação! Ficamos felizes em saber que você gostou. Esperamos você novamente! 🍕",
          "Que alegria receber esse feedback! Trabalhamos com muito carinho para entregar o melhor. Volte sempre!",
          "Obrigado por confiar na gente! Sua satisfação é nossa maior recompensa. Até a próxima! 😊"
        ]
      },
      {
        categoria: "⭐⭐⭐ Avaliações Neutras",
        respostas: [
          "Obrigado pelo feedback! Queremos melhorar sempre. Pode nos contar o que podemos fazer diferente?",
          "Agradecemos sua avaliação! Estamos trabalhando para superar suas expectativas na próxima vez."
        ]
      },
      {
        categoria: "⭐ Avaliações Negativas",
        respostas: [
          "Sentimos muito pela experiência. Isso não representa nosso padrão. Entre em contato conosco para resolvermos.",
          "Pedimos desculpas pelo ocorrido. Sua opinião é importante e vamos corrigir. Pode nos chamar no WhatsApp?"
        ]
      }
    ]
  },
  "Criar combo estratégico": {
    tipo: "formulario",
    titulo: "Criador de Combo Estratégico",
    exemplo: "Sugestão: 2 Pizzas Médias + Refrigerante 2L = R$ XX,90",
    secoes: [
      {
        nome: "Monte seu Combo",
        campos: [
          { nome: "nome_combo", label: "Nome do Combo", placeholder: "Ex: Combo Família Feliz" },
          { nome: "produto_1", label: "Produto Principal", placeholder: "Ex: 2 Pizzas Médias" },
          { nome: "produto_2", label: "Acompanhamento", placeholder: "Ex: Refrigerante 2L" },
          { nome: "produto_3", label: "Extra (opcional)", placeholder: "Ex: Sobremesa" },
          { nome: "preco_normal", label: "Preço se vendidos separados", placeholder: "R$ 89,70" },
          { nome: "preco_combo", label: "Preço do Combo", placeholder: "R$ 69,90" },
          { nome: "economia", label: "Economia para o cliente", placeholder: "Economize R$ 19,80!" }
        ]
      }
    ]
  },
  "Criar post de alta conversão": {
    tipo: "formulario",
    titulo: "Criador de Post de Alta Conversão",
    secoes: [
      {
        nome: "Estrutura do Post",
        campos: [
          { nome: "gancho", label: "🎣 Gancho (primeira linha)", placeholder: "Ex: 🔥 PROMOÇÃO RELÂMPAGO!" },
          { nome: "oferta", label: "💰 Oferta", placeholder: "Ex: 2 pizzas pelo preço de 1" },
          { nome: "urgencia", label: "⏰ Urgência", placeholder: "Ex: Só hoje até meia-noite!" },
          { nome: "cta", label: "📲 Call to Action", placeholder: "Ex: Peça agora pelo iFood!" },
          { nome: "emoji", label: "Emojis sugeridos", placeholder: "🍕🔥💥😋" }
        ]
      }
    ],
    exemplo: "🔥 PROMOÇÃO RELÂMPAGO!\n\n2 Pizzas Grandes pelo preço de 1! 🍕🍕\n\nApenas HOJE até meia-noite! ⏰\n\n👉 Peça agora pelo iFood e aproveite!\n\n#pizza #promoção #delivery"
  }
};

export default function ConteudoInterativo({ item, onClose, onSave, savedData }) {
  const [formData, setFormData] = useState(savedData || {});
  const [checklistState, setChecklistState] = useState(savedData?.checklist || {});
  
  const conteudo = conteudosInterativos[item.texto] || null;
  const config = tipoConfig[item.tipo] || tipoConfig.tarefa;
  const Icon = config.icon;

  if (!conteudo) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className={config.color} size={20} />
              {item.texto}
            </DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-white/60">Conteúdo em desenvolvimento...</p>
            <p className="text-white/40 text-sm mt-2">Este material estará disponível em breve.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSave = () => {
    onSave?.({ ...formData, checklist: checklistState });
    onClose();
  };

  const renderChecklist = () => (
    <div className="space-y-6">
      {conteudo.secoes?.map((secao, sIdx) => (
        <div key={sIdx}>
          <h4 className="font-medium text-white mb-3">{secao.nome}</h4>
          <div className="space-y-2">
            {secao.itens.map((item, iIdx) => {
              const key = `${sIdx}-${iIdx}`;
              return (
                <label key={iIdx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
                  <Checkbox
                    checked={checklistState[key] || false}
                    onCheckedChange={(checked) => setChecklistState({ ...checklistState, [key]: checked })}
                  />
                  <span className={`text-sm ${checklistState[key] ? "text-white/50 line-through" : "text-white/80"}`}>
                    {item}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderFormulario = () => (
    <div className="space-y-6">
      {conteudo.exemplo && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-amber-400 text-sm">💡 {conteudo.exemplo}</p>
        </div>
      )}
      {conteudo.secoes?.map((secao, sIdx) => (
        <div key={sIdx}>
          <h4 className="font-medium text-white mb-3">{secao.nome}</h4>
          <div className="space-y-3">
            {secao.campos.map((campo, cIdx) => (
              <div key={cIdx}>
                <Label className="text-white/70 text-sm">{campo.label}</Label>
                {campo.tipo === "textarea" ? (
                  <Textarea
                    value={formData[campo.nome] || campo.valorPadrao || ""}
                    onChange={(e) => setFormData({ ...formData, [campo.nome]: e.target.value })}
                    placeholder={campo.placeholder}
                    className="bg-white/5 border-white/10 text-white mt-1"
                    rows={3}
                  />
                ) : (
                  <Input
                    type={campo.tipo || "text"}
                    value={formData[campo.nome] || campo.valorPadrao || ""}
                    onChange={(e) => setFormData({ ...formData, [campo.nome]: e.target.value })}
                    placeholder={campo.placeholder}
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPlanilha = () => (
    <div className="space-y-6">
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
        <p className="text-emerald-400 font-medium mb-2">📊 {conteudo.formula}</p>
        <p className="text-emerald-300/70 text-sm">{conteudo.metaIdeal}</p>
      </div>
      <div className="space-y-4">
        {conteudo.campos?.map((campo, idx) => (
          <div key={idx}>
            <Label className="text-white/70 text-sm">{campo.label}</Label>
            <Input
              type={campo.tipo}
              value={formData[campo.nome] || ""}
              onChange={(e) => setFormData({ ...formData, [campo.nome]: e.target.value })}
              placeholder={campo.placeholder}
              className="bg-white/5 border-white/10 text-white mt-1"
            />
          </div>
        ))}
      </div>
      {formData.faturamento_mensal && formData.custo_insumos && (
        <div className="p-4 bg-[#FF4D00]/10 border border-[#FF4D00]/20 rounded-lg">
          <p className="text-[#FF4D00] font-bold text-lg">
            CMV: {(((Number(formData.custo_insumos) + Number(formData.custo_embalagens || 0)) / Number(formData.faturamento_mensal)) * 100).toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );

  const renderVideo = () => (
    <div className="space-y-4">
      <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Play size={48} className="mx-auto mb-3 text-[#FF4D00]" />
          <p className="text-white/60">Vídeo em breve</p>
        </div>
      </div>
      <p className="text-white/70">{conteudo.descricao}</p>
      <div className="space-y-2">
        {conteudo.passos?.map((passo, idx) => (
          <p key={idx} className="text-sm text-white/60">{passo}</p>
        ))}
      </div>
    </div>
  );

  const renderDocumento = () => (
    <div className="space-y-6">
      {conteudo.conteudo?.map((cat, idx) => (
        <div key={idx}>
          <h4 className="font-medium text-white mb-3">{cat.categoria}</h4>
          <div className="space-y-2">
            {cat.respostas.map((resp, rIdx) => (
              <div key={rIdx} className="p-3 bg-white/5 rounded-lg">
                <p className="text-sm text-white/80">{resp}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(resp)}
                  className="text-xs text-[#FF4D00] mt-2 hover:underline"
                >
                  📋 Copiar
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={config.color} size={20} />
            {conteudo.titulo}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {conteudo.tipo === "checklist" && renderChecklist()}
          {conteudo.tipo === "formulario" && renderFormulario()}
          {conteudo.tipo === "planilha" && renderPlanilha()}
          {conteudo.tipo === "video" && renderVideo()}
          {conteudo.tipo === "documento" && renderDocumento()}
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button variant="outline" onClick={onClose} className="flex-1 border-white/10 text-white">
            Fechar
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]">
            <Save size={16} className="mr-2" /> Salvar Progresso
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}