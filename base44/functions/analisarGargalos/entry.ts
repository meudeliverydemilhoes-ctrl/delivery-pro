import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { briefing, mentorado } = await req.json();

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) return Response.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 });

    const prompt = `Analise o briefing deste mentorado de delivery/restaurante e gere um diagnóstico completo:

MENTORADO: ${mentorado?.nome || 'N/A'} — ${mentorado?.negocio || 'N/A'} (${mentorado?.cidade || 'N/A'})

DADOS FINANCEIROS:
- Faturamento Mensal: R$ ${briefing?.faturamento_mensal || 'Não informado'}
- Ticket Médio: R$ ${briefing?.ticket_medio || 'Não informado'}
- CMV: ${briefing?.cmv ? briefing.cmv + '%' : 'NÃO DEFINIDO'}
- Pedidos/dia: ${briefing?.media_pedidos_dia || 'Não informado'}
- Raio de entrega: ${briefing?.raio_entrega || 'Não informado'}

ESTRUTURA:
- Equipe: ${briefing?.estrutura_equipe || 'Não informado'}
- Tem fichas técnicas: ${briefing?.fichas_tecnicas?.length > 0 ? 'SIM (' + briefing.fichas_tecnicas.length + ' fichas)' : 'NÃO'}
- Tem fluxogramas: ${briefing?.fluxogramas_data && Object.keys(briefing.fluxogramas_data).length > 0 ? 'SIM' : 'NÃO'}

CHECKLIST MATURIDADE:
${briefing?.checklist_maturidade ? Object.entries(briefing.checklist_maturidade).map(([k,v]) => `- ${k.replace(/_/g,' ')}: ${v ? 'SIM' : 'NÃO'}`).join('\n') : 'Não preenchido'}

PROBLEMAS E OBJETIVOS:
- Problemas: ${briefing?.problemas_identificados || 'Não informado'}
- Objetivos: ${briefing?.objetivos || 'Não informado'}
- Diagnóstico inicial: ${briefing?.diagnostico_inicial || 'Não informado'}

Retorne APENAS JSON válido (sem markdown):
{
  "panorama_executivo": "3-4 parágrafos de análise profissional separados por \\n\\n",
  "faturamento_potencial": número estimado em reais após 12 semanas,
  "percentual_crescimento": número percentual estimado,
  "gargalos_ia": [
    {
      "titulo": "título do gargalo",
      "criticidade": "critico" | "alto" | "medio",
      "descricao": "descrição detalhada do problema",
      "impacto": "impacto financeiro/operacional",
      "acao": "ação recomendada específica",
      "semana_foco": "ex: Semana 1-2"
    }
  ],
  "plano_semanas": [
    {
      "semanas": "1-2",
      "tema": "título do tema",
      "objetivo": "objetivo principal",
      "acoes": ["ação 1", "ação 2", "ação 3"],
      "gargalo_foco": "qual gargalo principal trabalhar"
    }
  ],
  "insights_finais": ["insight 1", "insight 2", "insight 3"]
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
        max_tokens: 3000,
        system: 'Você é um analista especialista em delivery e restaurantes. Analise os dados do briefing e gere um diagnóstico completo e profissional em português. Responda sempre com JSON válido, sem markdown.',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `Erro na API: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content[0].text;

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) analysis = JSON.parse(match[0]);
      else return Response.json({ error: 'Resposta inválida da IA' }, { status: 500 });
    }

    return Response.json({ analysis });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});