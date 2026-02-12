import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, email, telefono, url_vivienda, horario, notas } = body;

    if (!nombre || !email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: nombre, email'
      }, { status: 400 });
    }

    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!slackWebhookUrl) {
      console.error('[notify-slack] Missing SLACK_WEBHOOK_URL');
      return NextResponse.json({
        success: false,
        error: 'Slack configuration incomplete'
      }, { status: 500 });
    }

    console.log('\n' + '='.repeat(50));
    console.log('[notify-slack] ENVIANDO NOTIFICACION A SLACK');
    console.log('------------------------------------------');
    console.log(`Lead: ${nombre} | ${email} | ${telefono || 'N/A'}`);
    console.log('='.repeat(50) + '\n');

    // Construir mensaje de Slack con bloques
    const slackMessage = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🏠 Nuevo Lead desde Vivla Chat",
            emoji: true
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Nombre:*\n${nombre}`
            },
            {
              type: "mrkdwn",
              text: `*Email:*\n${email}`
            },
            {
              type: "mrkdwn",
              text: `*Teléfono:*\n${telefono || 'No proporcionado'}`
            },
            {
              type: "mrkdwn",
              text: `*Horario preferido:*\n${horario || 'No especificado'}`
            }
          ]
        },
        ...(url_vivienda ? [{
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Vivienda de interés:*\n<${url_vivienda}|Ver propiedad>`
          }
        }] : []),
        ...(notas ? [{
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Notas:*\n${notas}`
          }
        }] : []),
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `📅 ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}`
            }
          ]
        }
      ]
    };

    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });

    if (response.ok) {
      console.log('[notify-slack] Notificación enviada a Slack correctamente');
      return NextResponse.json({
        success: true,
        message: 'Slack notification sent'
      });
    } else {
      const errorText = await response.text();
      console.error('[notify-slack] Error de Slack:', errorText);
      return NextResponse.json({
        success: false,
        error: 'Slack API error',
        details: errorText
      }, { status: response.status });
    }

  } catch (error: any) {
    console.error('[notify-slack] Error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
