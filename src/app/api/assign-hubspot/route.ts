import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, email, telefono } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: email'
      }, { status: 400 });
    }

    const hubspotToken = process.env.HUBSPOT_API_TOKEN;
    const ownerId = process.env.HUBSPOT_OWNER_ID;

    if (!hubspotToken || !ownerId) {
      console.error('[assign-hubspot] Missing environment variables');
      return NextResponse.json({
        success: false,
        error: 'HubSpot configuration incomplete'
      }, { status: 500 });
    }

    console.log('\n' + '='.repeat(50));
    console.log('[assign-hubspot] ASIGNANDO LEAD EN HUBSPOT');
    console.log('------------------------------------------');
    console.log(`Lead: ${nombre || 'N/A'} | Email: ${email} | Tel: ${telefono || 'N/A'}`);
    console.log(`Owner ID: ${ownerId}`);
    console.log('='.repeat(50) + '\n');

    // Paso 1: Buscar contacto por email
    const searchResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email
          }]
        }]
      })
    });

    const searchResult = await searchResponse.json();

    let contactId: string;

    if (searchResult.total > 0) {
      // Contacto existente
      contactId = searchResult.results[0].id;
      console.log(`[assign-hubspot] Contacto encontrado: ${contactId}`);
    } else {
      // Crear contacto nuevo
      console.log('[assign-hubspot] Contacto no encontrado, creando nuevo...');
      const nameParts = (nombre || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const createResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hubspotToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            email,
            firstname: firstName,
            lastname: lastName,
            phone: telefono || ''
          }
        })
      });

      const createResult = await createResponse.json();

      if (!createResponse.ok) {
        console.error('[assign-hubspot] Error creando contacto:', createResult);
        return NextResponse.json({
          success: false,
          error: 'Failed to create HubSpot contact',
          details: createResult
        }, { status: createResponse.status });
      }

      contactId = createResult.id;
      console.log(`[assign-hubspot] Contacto creado: ${contactId}`);
    }

    // Paso 2: Asignar owner al contacto
    const updateResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${hubspotToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          hubspot_owner_id: ownerId
        }
      })
    });

    const updateResult = await updateResponse.json();

    if (updateResponse.ok) {
      console.log(`[assign-hubspot] Owner asignado correctamente al contacto ${contactId}`);
      return NextResponse.json({
        success: true,
        message: `Lead asignado al propietario en HubSpot`,
        contactId
      });
    } else {
      console.error('[assign-hubspot] Error asignando owner:', updateResult);
      return NextResponse.json({
        success: false,
        error: 'Failed to assign owner',
        details: updateResult
      }, { status: updateResponse.status });
    }

  } catch (error: any) {
    console.error('[assign-hubspot] Error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
