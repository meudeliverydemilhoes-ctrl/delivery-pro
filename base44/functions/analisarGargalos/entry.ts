import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { briefing, mentorado } = await req.json();

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) return Response.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 });

    const prompt = `Você é um especialista em mentoria de delivery e restaurantes da Mentoria Delivery Pro (programa de 12 semanas, R$3.600). Analise o briefing deste mentorado e gere um diagnóstico completo e personalizado. Use linguagem direta, prática e motivadora.

DADOS DO MENTORADO:
Nome: ${mentorado?.nome || 'Não informado'}
Negócio: ${mentorado?.negocio || 'Não informado'}
Cidade: ${mentorado?.cidade || 'Não informado'}

DADOS DO BRIEFING:
- Faturamento Mensal: R$ ${briefing?.faturamento_mensal || 'Não informado'}
- Média de Pedidos/Dia: ${briefing?.media_pedidos_dia || 'Não informado'}
- Ticket Médio: R$ ${briefing?.ticket_medio || 'Não informado'}
- CMV (%): ${briefing?.cmv || 'Não informado'}
- Raio de Entrega: ${briefing?.raio_entrega || 'Não informado'}
- Estrutura da Equipe: ${briefing?.estrutura_equipe || 'Não informado'}
- Problemas Identificados: ${briefing?.problemas_identificados || 'Não informado'}
- Objetivos do Mentorado: ${briefing?.objetivos || 'Não informado'}
- Diagnóstico Inicial do Mentor: ${briefing?.diagnostico_inicial || 'Não informado'}
- Anotações: ${briefing?.anotacoes || 'Nenhuma'}

CHECKLIST DE MATURIDADE:
${briefing?.checklist_maturidade ? Object.entries(briefing.checklist_maturidade).map(([k, v]) => `- ${k}: ${v ? 'SIM' : 'NÃO'}`).join('\n') : 'Não preenchido'}

PADRÕES COMUNS em mentorados de delivery:
- 100% não tem CMV definido
- 100% não tem fichas técnicas padronizadas
- 100% não tem controle financeiro estruturado
- 90% o dono está preso na operação
- 90% não tem processos documentados
- Faturamentos variam de R$40k a R$120k/mês

Responda APENAS com JSON válido, sem markdown, sem texto extra. Estrutura:
{
  "score_saude": (número 0-100 baseado nos dados),
  "resumo_executivo": "2-3 frases diretas sobre a situação do negócio",
  "gargalos": [
    {
      "titulo": "Nome do gargalo",
      "criticidade": "critico" | "alto" | "medio",
      "impacto": "Descrição do impacto no negócio",
      "acao_recomendada": "O que fazer",
      "pilar": "processos" | "desempenho" | "tempo_potencia" | "norte_estrategico" | "presenca_magnetica"
    }
  ],
  "plano_12_semanas": [
    {
      "pilar": "processos",
      "semanas": "1-3",
      "foco": "Título do foco",
      "gargalos_trabalhados": ["gargalo1", "gargalo2"],
      "entregas": ["entrega1", "entrega2", "entrega3"]
    }
  ],
  "potencial_resultado": {
    "faturamento_atual": (número),
    "faturamento_projetado": (número),
    "percentual_crescimento": (número),
    "principais_ganhos": ["ganho1", "ganho2", "ganho3"]
  },
  "kit_entregas_sugerido": [
    {
      "documento": "Nome do documento/material",
      "descricao": "Para que serve",
      "pilar": "processos"
    }
  ]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `Anthropic API error: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const content = data.content[0].text;

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      // try to extract JSON from response
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        analysis = JSON.parse(match[0]);
      } else {
        return Response.json({ error: 'Resposta inválida da IA' }, { status: 500 });
      }
    }

    return Response.json({ analysis });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});