import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { newsCache } from '@/lib/news-cache';

export async function POST(request: NextRequest) {
    try {
        const { category, limit } = await request.json();

        const cacheKey = `news:${category || 'all'}:${limit || 10}`;
        const cached = newsCache.get(cacheKey);

        if (cached) {
            console.log('[News] Returning cached results');
            return NextResponse.json({ ...cached, cached: true });
        }

        // URL base de Orain.eus
        const validCategories = ['politica', 'economia', 'sociedad', 'cultura'];
        const selectedCategory = validCategories.includes(category) ? category : '';

        const baseUrl = 'https://orain.eus/es';
        const domain = 'https://orain.eus'; // Dominio base para reconstruir URLs
        const url = selectedCategory ? `${baseUrl}/${selectedCategory}` : baseUrl;

        console.log('[News] Fetching from:', url);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; EITBBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const news: any[] = [];

        // Selectores específicos para Orain.eus
        $('article, .noticia, .news-item, .card-noticia, .item-noticia').each((index, element) => {
            if (limit && news.length >= limit) return false;

            const $article = $(element);

            // Título
            const title = $article.find('h2, h3, h4, .titulo, .title, .headline').first().text().trim() ||
                $article.find('a').first().attr('title')?.trim() || '';

            const summary = $article.find('p, .sumario, .summary, .descripcion, .lead').first().text().trim();
            
            // --- CORRECCIÓN DE URL (ELIMINA EL /es/es/) ---
            const rawLink = $article.find('a').first().attr('href');
            let cleanUrl = null;
            if (rawLink) {
                if (rawLink.startsWith('http')) {
                    cleanUrl = rawLink;
                } else {
                    const normalizedPath = rawLink.startsWith('/') ? rawLink : `/${rawLink}`;
                    // Si el path ya tiene /es/, no lo volvemos a añadir
                    cleanUrl = normalizedPath.startsWith('/es') 
                        ? `${domain}${normalizedPath}` 
                        : `${domain}/es${normalizedPath}`;
                }
            }

            // --- CORRECCIÓN DE IMAGEN ---
            const rawImage = $article.find('img').first().attr('src') || $article.find('img').first().attr('data-src');
            let cleanImage = null;
            if (rawImage) {
                cleanImage = rawImage.startsWith('http') ? rawImage : `${domain}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
            }

            const date = $article.find('time, .fecha, .date, .published').first().text().trim() ||
                $article.find('time').first().attr('datetime');

            if (title && title.length > 10) {
                news.push({
                    title,
                    summary: summary || 'Sin resumen disponible',
                    url: cleanUrl,
                    image: cleanImage,
                    publishedAt: date || 'Hoy',
                    category: selectedCategory || 'general',
                    source: 'Orain.eus'
                });
            }
        });

        // Fallback: selectores más generales (Si la primera pasada falla)
        if (news.length === 0) {
            $('.item, .entry, .post, div[class*="noticia"]').each((index, element) => {
                if (limit && news.length >= limit) return false;

                const $item = $(element);
                const title = $item.find('h1, h2, h3, h4, h5').first().text().trim();
                const summary = $item.find('p').first().text().trim();
                const rawLink = $item.find('a').first().attr('href');
                
                let cleanUrl = null;
                if (rawLink) {
                    const path = rawLink.startsWith('/') ? rawLink : `/${rawLink}`;
                    cleanUrl = path.startsWith('/es') ? `${domain}${path}` : `${domain}/es${path}`;
                }

                if (title && title.length > 10) {
                    news.push({
                        title,
                        summary: summary || 'Sin resumen disponible',
                        url: cleanUrl,
                        image: null,
                        publishedAt: 'Hoy',
                        category: selectedCategory || 'general',
                        source: 'Orain.eus'
                    });
                }
            });
        }

        console.log(`[News] Found ${news.length} news articles`);

        const result = {
            success: true,
            count: news.length,
            category: selectedCategory || 'todas',
            news: news.slice(0, limit || 10),
            scrapedAt: new Date().toISOString(),
            cached: false,
            source: 'https://orain.eus/es/'
        };

        newsCache.set(cacheKey, result);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[News] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch news',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    return POST(
        new NextRequest(request.url, {
            method: 'POST',
            body: JSON.stringify({ category, limit }),
        })
    );
}