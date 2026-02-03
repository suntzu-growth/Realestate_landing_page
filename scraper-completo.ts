import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

interface Article {
    id: string;
    source: 'vivla';
    title: string;
    url: string;
    category: string;
    summary: string;
    content?: string;
    image?: string;
    publishDate?: string;
    scrapedAt: string;
}

interface ScrapingResult {
    timestamp: string;
    totalArticles: number;
    sources: {
        vivla: number;
    };
    articles: Article[];
}

export async function scrapeEverything(): Promise<ScrapingResult> {
    const timestamp = new Date().toISOString();
    let allArticles: Article[] = [];

    // Vivla scraper logic
    console.log('\n========== SCRAPING VIVLA.COM ==========');
    try {
        const res = await fetch('https://www.vivla.com/es/listings', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        if (res.ok) {
            const html = await res.text();
            const $ = cheerio.load(html);
            const listingLinks = $('a').filter((_, el) => $(el).text().trim().toLowerCase() === 'ver casa').get();
            console.log(`[Vivla] Encontrados ${listingLinks.length} listados. Iniciando extracción...`);

            const vivlaArticles: Article[] = [];
            for (const linkEl of listingLinks) {
                const $link = $(linkEl);
                const href = $link.attr('href');
                if (!href) continue;
                const fullUrl = href.startsWith('http') ? href : `https://www.vivla.com${href}`;

                const $container = $link.closest('div').parent();
                const title = $container.find('h2').first().text().trim() || 'Casa Vivla';
                const price = $container.find('h6').first().text().trim();

                const specs = $container.find('h4, h5').map((_, el) => $(el).text().trim()).get();
                const summary = specs.join(' | ') + (price ? ` | Precio: ${price}` : '');

                const art: Article = {
                    id: Buffer.from(fullUrl).toString('base64').substring(0, 10),
                    source: 'vivla' as const,
                    title,
                    url: fullUrl,
                    category: 'inmobiliaria',
                    summary,
                    scrapedAt: timestamp
                };

                process.stdout.write(`  Extrayendo detalle de Vivla: ${title.substring(0, 30)}...\r`);

                try {
                    const detRes = await fetch(fullUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                    if (detRes.ok) {
                        const detHtml = await detRes.text();
                        const $d = cheerio.load(detHtml);
                        let content = $d('p')
                            .map((_, p) => $d(p).text().trim())
                            .get()
                            .filter(t => t.length > 50)
                            .slice(0, 10)
                            .join('\n\n');

                        art.content = content || summary;
                        art.image = $d('meta[property="og:image"]').attr('content');
                        if (!art.image) art.image = $container.find('img').first().attr('src');
                    }
                    await new Promise(r => setTimeout(r, 100));
                } catch (e) { }
                vivlaArticles.push(art);
            }
            console.log('\n✅ Vivla completado.');
            allArticles = [...allArticles, ...vivlaArticles];
        }
    } catch (e) { }

    return {
        timestamp,
        totalArticles: allArticles.length,
        sources: {
            vivla: allArticles.length
        },
        articles: allArticles
    };
}
