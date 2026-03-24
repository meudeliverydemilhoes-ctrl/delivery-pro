import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mentoradoNome, mentoradoEmail, titulo, dataInicio, dataFim, descricao, link } = await req.json();

    if (!mentoradoEmail || !titulo || !dataInicio || !dataFim) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

    const event = {
      summary: titulo,
      description: descricao || `Mentoria com ${mentoradoNome}`,
      start: {
        dateTime: new Date(dataInicio).toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: new Date(dataFim).toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      attendees: [
        { email: user.email, organizer: true, responseStatus: 'accepted' },
        { email: mentoradoEmail, responseStatus: 'needsAction' },
      ],
      conferenceData: link ? {
        createRequest: {
          requestId: `meeting-${Date.now()}`,
          conferenceSolutionKey: {
            key: 'hangoutsMeet',
          },
        },
      } : undefined,
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.json();
      return Response.json({ error: error.error || 'Failed to create event' }, { status: response.status });
    }

    const eventData = await response.json();

    return Response.json({
      success: true,
      eventId: eventData.id,
      eventLink: eventData.htmlLink,
      hangoutLink: eventData.conferenceData?.entryPoints?.[0]?.uri,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});