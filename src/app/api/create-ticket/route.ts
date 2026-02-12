import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contactId,
      subject,
      content,
      pipeline,
      priority,
      stage
    } = body;

    // Validación de campos requeridos
    if (!contactId || !subject || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: contactId, subject, content'
        },
        { status: 400 }
      );
    }

    const hubspotToken = process.env.HUBSPOT_API_TOKEN;

    if (!hubspotToken) {
      return NextResponse.json(
        { success: false, error: 'HubSpot API token not configured' },
        { status: 500 }
      );
    }

    // 1. Crear el ticket
    const ticketData = {
      properties: {
        subject: subject,
        content: content,
        hs_pipeline: pipeline || '0',
        hs_ticket_priority: priority || 'HIGH',
        hs_pipeline_stage: stage || '1'
      }
    };

    const createTicketResponse = await fetch('https://api.hubapi.com/crm/v3/objects/tickets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticketData)
    });

    if (!createTicketResponse.ok) {
      const errorData = await createTicketResponse.json();
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create ticket in HubSpot',
          details: errorData
        },
        { status: createTicketResponse.status }
      );
    }

    const ticketResult = await createTicketResponse.json();
    const ticketId = ticketResult.id;

    // 2. Asociar el ticket al contacto
    const associationData = {
      inputs: [
        {
          from: { id: ticketId },
          to: { id: contactId },
          type: 'ticket_to_contact'
        }
      ]
    };

    const associateResponse = await fetch('https://api.hubapi.com/crm/v4/associations/tickets/contacts/batch/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(associationData)
    });

    if (!associateResponse.ok) {
      const errorData = await associateResponse.json();
      console.error('Failed to associate ticket to contact:', errorData);
      // No retornamos error aquí porque el ticket ya fue creado
      return NextResponse.json({
        success: true,
        ticketId: ticketId,
        warning: 'Ticket created but association to contact failed',
        associationError: errorData
      });
    }

    return NextResponse.json({
      success: true,
      ticketId: ticketId,
      message: 'Ticket created and associated to contact successfully'
    });

  } catch (error) {
    console.error('Error in create-ticket:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
