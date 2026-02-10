import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { newsCache } from '@/lib/news-cache';

export async function POST(request: NextRequest) {
    try {
        const { station, date } = await request.json();

        const cacheKey = `radio:${station || 'all'}:${date || 'today'}`;
        const cached = newsCache.get(cacheKey);

        if (cached) {
            console.log('[Radio Schedule] Returning cached results');
            return NextResponse.json({ ...cached, cached: true });
        }

        // NOTA: Se ha eliminado el scraping de Guau (guau.eus) por requerimiento del proyecto.
        // Se mantiene la estructura para posibles futuras integraciones o datos locales.
        const schedule: any[] = [];

        // Fallback usando scheduleData existente
        console.log('[Radio Schedule] Using internal schedule data');

        const { scheduleData } = await import('@/data/schedule-loader');
        const { ScheduleParser } = await import('@/lib/schedule-parser');

        const parser = new ScheduleParser(scheduleData);
        const results = parser.search(station || 'radio');

        // Filtrar solo contenido de radio
        const radioResults = results.filter((item: any) => {
            const title = item.title?.toLowerCase() || '';
            const category = item.category?.toLowerCase() || '';
            return title.includes('radio') || category.includes('radio');
        });

        radioResults.slice(0, 20).forEach((item: any) => {
            schedule.push({
                station: item.station || station || 'Radio Euskadi',
                program: item.title || item.name || 'Programa',
                time: item.time || item.schedule || 'N/A',
                host: item.host || item.presenter || '',
                description: item.description || item.summary || '',
                image: item.image || null,
                url: item.url || null,
                podcast: item.podcast || false,
                category: 'radio',
                source: 'EITB Radio (datos internos)'
            });
        });

        console.log(`[Radio Schedule] Found ${schedule.length} programs`);

        const result = {
            success: true,
            station: station || 'todas las emisoras',
            date: date || 'hoy',
            count: schedule.length,
            schedule: schedule.slice(0, 20),
            timestamp: new Date().toISOString(),
            cached: false,
            source: 'EITB Radio (datos internos)'
        };

        newsCache.set(cacheKey, result);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[Radio Schedule] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch radio schedule',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const station = searchParams.get('station') || undefined;
    const date = searchParams.get('date') || undefined;

    return POST(
        new NextRequest(request.url, {
            method: 'POST',
            body: JSON.stringify({ station, date }),
        })
    );
}
