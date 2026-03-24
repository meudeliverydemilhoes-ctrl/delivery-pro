import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { system, prompt } = await req.json();

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 });

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 2000,
        system: system || 'Responda SOMENTE com JSON válido sem markdown.',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await resp.json();
    if (!resp.ok) return Response.json({ error: data.error?.message || 'Erro Anthropic' }, { status: 500 });

    const raw = data.content[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
    return Response.json({ resultado: JSON.parse(raw) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});