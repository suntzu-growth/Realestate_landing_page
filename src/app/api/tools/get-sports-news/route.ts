// app/api/tools/get-sports-news/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { team, limit = 10 } = body; // Mantenemos tu flexibilidad de límite
    
    const domain = 'https://kirolakeitb.eus';
    const baseUrl = `${domain}/es/`;
    
    // 1. Petición única a la portada (Caché de 5 min para ser "invisible")
    // Aumentamos revalidate de 60 a 300 para mayor seguridad en producción
    const response = await fetch(baseUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 300 } 
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // 2. Mapeo instantáneo de TODA la lista de la portada
    let allNews = $('article, .noticia, .li_submenu').map((_, el) => {
      const $el = $(el);
      let link = $el.is('a') ? $el.attr('href') : $el.find('a').first().attr('href');
      const title = $el.find('h2, h3, h4, .titulo').first().text().trim() || $el.text().slice(0, 60).trim();
      
      return {
        title,
        url: link?.startsWith('http') ? link : `${domain}${link}`,
        summaryFromList: $el.find('p, .sumario, .lead').first().text().trim()
      };
    }).get();

    // 3. Filtrado por equipo (usando tus funciones helper)
    if (team) {
      const teamLower = team.toLowerCase();
      const normTeam = normalizeTeamName(teamLower);
      allNews = allNews.filter(n => 
        n.title.toLowerCase().includes(teamLower) || 
        n.title.toLowerCase().includes(normTeam)
      );
    }

    const selectedNews = allNews.slice(0, limit);

    // 4. PARALELISMO TOTAL (Rápido y eficiente)
    // Procesamos todas las noticias (hasta 10) simultáneamente
    const news = await Promise.all(
      selectedNews.map(async (newsItem) => {
        try {
          // Timeout individual corto (2.5s) para que una noticia lenta no frene todo
          const detailRes = await fetch(newsItem.url, { 
            signal: AbortSignal.timeout(2500),
            next: { revalidate: 3600 } 
          });

          if (!detailRes.ok) throw new Error();

          const detailHtml = await detailRes.text();
          const $detail = cheerio.load(detailHtml);
          
          return {
            title: newsItem.title,
            url: newsItem.url,
            summary: $detail('meta[property="og:description"]').attr('content') || newsItem.summaryFromList || "Detalles en la web.",
            image: $detail('meta[property="og:image"]').attr('content') || null,
            team: detectTeam(newsItem.title)
          };
        } catch (e) {
          // Fallback: Si el detalle falla, enviamos lo que ya tenemos de la portada
          return {
            title: newsItem.title,
            url: newsItem.url,
            summary: newsItem.summaryFromList || "Consulta la noticia en Kirolak EITB.",
            image: null,
            team: detectTeam(newsItem.title)
          };
        }
      })
    );

    return NextResponse.json({ 
      success: true, 
      count: news.length,
      news: news.filter(n => n.title.length > 5) 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, news: [] }, { status: 500 });
  }
}

// Helper: Normalizar nombres de equipos (Mantenemos tu lógica exacta)
function normalizeTeamName(team: string): string {
  const teamMap: Record<string, string> = {
    'athletic': 'athletic club',
    'athletic club': 'athletic',
    'bilbao': 'athletic',
    'real sociedad': 'real',
    'real': 'real sociedad',
    'la real': 'real sociedad',
    'donostia': 'real sociedad',
    'alaves': 'alavés',
    'alavés': 'deportivo alavés',
    'vitoria': 'alavés',
    'eibar': 'sd eibar',
    'baskonia': 'baskonia saski'
  };
  return teamMap[team] || team;
}

// Helper: Detectar equipo en texto (Mantenemos tu lógica exacta)
function detectTeam(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('athletic')) return 'Athletic Club';
  if (lowerText.includes('real sociedad') || lowerText.includes('la real')) return 'Real Sociedad';
  if (lowerText.includes('alavés') || lowerText.includes('alaves')) return 'Deportivo Alavés';
  if (lowerText.includes('eibar')) return 'SD Eibar';
  if (lowerText.includes('baskonia')) return 'Baskonia';
  return 'General';
}