import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { briefing, mentorado } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) return Response.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 });

    const fluxogramasKeys = briefing?.fluxogramas_data ? Object.keys(briefing.fluxogramas_data) : [];
    const temFluxogramas = fluxogramasKeys.length > 0;

    const prompt = `Você é especialista na Mentoria Delivery Pro de Brenda Souza (12 encontros, R$3.600). Analise este mentorado e gere diagnóstico completo.

MENTORADO: ${mentorado?.nome || 'N/A'} — ${mentorado?.negocio || 'N/A'}, ${mentorado?.cidade || 'N/A'}

PILAR 1 - PROCESSOS:
- Fichas técnicas: ${briefing?.fichas_tecnicas?.length > 0 ? briefing.fichas_tecnicas.length + ' fichas cadastradas' : 'NENHUMA'}
- Fluxogramas: ${temFluxogramas ? fluxogramasKeys.join(', ') : 'NENHUM'}
- SOPs: não avaliado ainda

PILAR 2 - DESEMPENHO:
- Faturamento mensal: R$ ${briefing?.faturamento_mensal || 'NÃO INFORMADO'}
- Ticket médio: R$ ${briefing?.ticket_medio || 'NÃO INFORMADO'}
- CMV: ${briefing?.cmv ? briefing.cmv + '%' : 'NÃO DEFINIDO'}
- Pedidos/dia: ${briefing?.media_pedidos_dia || 'NÃO INFORMADO'}
- Financeiro organizado: ${briefing?.checklist_maturidade?.financeiro_organizado ? 'SIM' : 'NÃO'}

PILAR 3 - TEMPO & POTÊNCIA:
- Estrutura equipe: ${briefing?.estrutura_equipe || 'Não informado'}
- Equipe treinada: ${briefing?.checklist_maturidade?.equipe_treinada ? 'SIM' : 'NÃO'}
- Processos definidos: ${briefing?.checklist_maturidade?.processos_definidos ? 'SIM' : 'NÃO'}

PILAR 4 - NORTE ESTRATÉGICO:
- Objetivos declarados: ${briefing?.objetivos || 'NÃO INFORMADO'}
- Delivery eficiente: ${briefing?.checklist_maturidade?.delivery_eficiente ? 'SIM' : 'NÃO'}

PILAR 5 - PRESENÇA MAGNÉTICA:
- Marketing ativo: ${briefing?.checklist_maturidade?.marketing_ativo ? 'SIM' : 'NÃO'}
- Cardápio otimizado: ${briefing?.checklist_maturidade?.cardapio_otimizado ? 'SIM' : 'NÃO'}

PROBLEMAS RELATADOS: ${briefing?.problemas_identificados || 'Nenhum'}
DIAGNÓSTICO INICIAL: ${briefing?.diagnostico_inicial || 'Nenhum'}
ANOTAÇÕES: ${briefing?.anotacoes || 'Nenhuma'}

Retorne APENAS JSON válido sem markdown:
{
  "diagnostico_executivo": "3 parágrafos separados por \\n\\n analisando o negócio de forma honesta e motivadora",
  "frase_motivacional": "frase curta e poderosa para o mentorado",
  "faturamento_potencial": número em reais estimado após 12 semanas,
  "percentual_crescimento": número percentual,
  "top3_gargalos_urgentes": [
    {
      "posicao": 1,
      "titulo": "título curto",
      "pilar": "processos|desempenho|tempo_potencia|norte_estrategico|presenca_magnetica",
      "por_que_urgente": "explicação em 1 frase",
      "quick_win": "o que fazer nos próximos 7 dias"
    }
  ],
  "plano_12_encontros": [
    {
      "encontro": número,
      "semana": "semana X",
      "pilar": "nome do pilar",
      "tema": "tema principal",
      "objetivo": "objetivo do encontro",
      "entregaveis": ["entrega 1", "entrega 2"]
    }
  ],
  "insights_personalizados": ["insight 1", "insight 2", "insight 3"]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: 'Você é especialista em mentoria de delivery. Responda sempre com JSON válido, sem markdown, sem texto extra.',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `Erro Anthropic: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content[0].text;
    let analysis;
    try { analysis = JSON.parse(text); }
    catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) analysis = JSON.parse(match[0]);
      else return Response.json({ error: 'Resposta inválida da IA' }, { status: 500 });
    }

    return Response.json({ analysis });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});