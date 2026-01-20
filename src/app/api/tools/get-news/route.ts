import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
    try {
        const { category, limit = 5 } = await request.json();
        const domain = 'https://orain.eus';
        const baseUrl = 'https://orain.eus/es';
        const url = category ? `${baseUrl}/${category}` : baseUrl;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        });

        const html = await response.text();
        const $ = cheerio.load(html);
        const elements = $('article, .noticia, .news-item, .card-noticia').toArray().slice(0, limit);

        const news = await Promise.all(elements.map(async (el) => {
            const $el = $(el);
            const rawLink = $el.find('a').first().attr('href');
            let cleanUrl = rawLink?.startsWith('http') ? rawLink : `${domain}${rawLink?.startsWith('/') ? '' : '/es/'}${rawLink}`;

            let data = {
                title: $el.find('h2, h3, .titulo').first().text().trim() || 'Noticia EITB',
                summary: $el.find('p, .sumario').first().text().trim(),
                image: null as string | null
            };

            if (cleanUrl) {
                try {
                    const detailRes = await fetch(cleanUrl, { signal: AbortSignal.timeout(2000) });
                    const detailHtml = await detailRes.text();
                    const $meta = cheerio.load(detailHtml);
                    data.title = $meta('meta[property="og:title"]').attr('content') || data.title;
                    data.summary = $meta('meta[property="og:description"]').attr('content') || $meta('meta[name="description"]').attr('content') || data.summary;
                    data.image = $meta('meta[property="og:image"]').attr('content') || null;
                } catch (e) { console.warn("Meta error"); }
            }

            return { ...data, fullContent: data.summary, url: cleanUrl, source: 'Orain.eus' };
        }));

        return NextResponse.json({ success: true, news });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}