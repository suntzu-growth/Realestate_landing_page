import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, telefono, url_vivienda, horario } = body;

    // Validar campos obligatorios
    if (!nombre || !telefono || !url_vivienda || !horario) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: nombre, telefono, url_vivienda, horario'
      }, { status: 400 });
    }

    // Variables de entorno
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
    const templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'es';

    if (!apiKey || !phoneNumberId || !templateName) {
      console.error('[notify-whatsapp] Missing environment variables');
      return NextResponse.json({
        success: false,
        error: 'WhatsApp configuration incomplete'
      }, { status: 500 });
    }

    console.log('\n' + '='.repeat(50));
    console.log('[notify-whatsapp] ENVIANDO NOTIFICACION AL LEAD');
    console.log('------------------------------------------');
    console.log(`Lead: ${nombre} | Tel: ${telefono}`);
    console.log(`Vivienda: ${url_vivienda}`);
    console.log(`Horario: ${horario}`);
    console.log('='.repeat(50) + '\n');

    // Parámetros de la plantilla: {{1}}=nombre, {{2}}=horario, {{3}}=url_vivienda
    const templateParameters = [
      { type: "text", text: nombre },
      { type: "text", text: horario },
      { type: "text", text: url_vivienda }
    ];

    // Llamar a ElevenLabs WhatsApp API
    const response = await fetch('https://api.elevenlabs.io/v1/whatsapp/outbound-message', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_number_id: phoneNumberId,
        to: telefono,
        template_name: templateName,
        template_language: templateLanguage,
        components: [
          {
            type: "body",
            parameters: templateParameters
          }
        ]
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('[notify-whatsapp] WhatsApp enviado al lead correctamente:', result);
      return NextResponse.json({
        success: true,
        message: 'WhatsApp notification sent to lead',
        data: result
      });
    } else {
      console.error('[notify-whatsapp] Error de API:', result);
      return NextResponse.json({
        success: false,
        error: 'WhatsApp API error',
        details: result
      }, { status: response.status });
    }

  } catch (error: any) {
    console.error('[notify-whatsapp] Error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
