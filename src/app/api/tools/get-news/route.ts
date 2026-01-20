import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { category, limit = 5 } = await request.json();
    const domain = 'https://orain.eus';
    
    // Mapeo de categorías para asegurar que la URL sea correcta
    const categoryMap: { [key: string]: string } = {
      'politica': 'politica',
      'economía': 'economia',
      'economia': 'economia',
      'sociedad': 'sociedad',
      'cultura': 'cultura',
      'deportes': 'deportes'
    };

    const cleanCategory = category ? categoryMap[category.toLowerCase()] || category.toLowerCase() : '';
    const url = `${domain}/es/${cleanCategory}`;

    console.log("Consultando URL:", url);

    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9'
      },
    });

    if (!response.ok) throw new Error(`Error en la web de EITB: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Selector más amplio para capturar noticias en diferentes secciones
    const elements = $('article, .noticia, .news-block, .card-noticia').toArray().slice(0, limit);

    if (elements.length === 0) {
      return NextResponse.json({ success: true, news: [], message: "No se encontraron artículos" });
    }

    const news = await Promise.all(elements.map(async (el) => {
      const $el = $(el);
      const link = $el.find('a').first().attr('href');
      if (!link) return null;
      
      const cleanUrl = link.startsWith('http') ? link : `${domain}${link}`;

      let data = {
        title: $el.find('h2, h3, .titulo').first().text().trim(),
        image: null as string | null,
        url: cleanUrl,
        summary: $el.find('p, .sumario, .lead').first().text().trim()
      };

      try {
        const detailRes = await fetch(cleanUrl, { 
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(2000) 
        });
        const detailHtml = await detailRes.text();
        const $m = cheerio.load(detailHtml);
        data.image = $m('meta[property="og:image"]').attr('content') || null;
        if (!data.summary) data.summary = $m('meta[property="og:description"]').attr('content') || "";
      } catch (e) {
        console.error("Error metadatos:", cleanUrl);
      }

      return data;
    }));

    return NextResponse.json({ 
      success: true, 
      news: news.filter(n => n !== null && n.title !== "") 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}