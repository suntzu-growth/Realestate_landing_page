// app/api/tools/get-sports-news/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { team, limit } = body;
    
    // Defaults
    limit = limit || 5;
    team = team || '';
    
    console.log('[get_sports_news] Recibido:', { team, limit });

    const domain = 'https://kirolakeitb.eus';
    const baseUrl = `${domain}/es/`;
    
    console.log('[get_sports_news] URL:', baseUrl);

    // Fetch con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(baseUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9'
      },
      signal: controller.signal,
      next: { revalidate: 60 }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Selectores para noticias deportivas
    const selectors = [
      'article.noticia',
      'article',
      '.noticia-item',
      '.news-item',
      'div[class*="noticia"]'
    ];

    let elements: any[] = [];
    
    for (const selector of selectors) {
      elements = $(selector).toArray();
      if (elements.length > 0) {
        console.log(`[get_sports_news] Usando selector: ${selector} (${elements.length} elementos)`);
        break;
      }
    }

    // Si se especificó equipo, filtrar
    if (team) {
      const teamLower = team.toLowerCase();
      elements = elements.filter(el => {
        const $el = $(el);
        const text = $el.text().toLowerCase();
        return text.includes(teamLower) || 
               text.includes(normalizeTeamName(teamLower));
      });
      console.log(`[get_sports_news] Filtrado por equipo "${team}": ${elements.length} elementos`);
    }

    // Limitar resultados
    elements = elements.slice(0, Math.min(limit, 10));

    console.log('[get_sports_news] Artículos encontrados:', elements.length);

    if (elements.length === 0) {
      console.warn('[get_sports_news] No se encontraron noticias');
      elements = $('a[href*="/es/"]').filter((_, el) => {
        const text = $(el).text().trim();
        return text.length > 20;
      }).toArray().slice(0, limit);
      
      console.log('[get_sports_news] Fallback encontró:', elements.length, 'elementos');
    }

    // Procesar noticias
    const news = await Promise.all(
      elements.map(async (el) => {
        const $el = $(el);
        
        let link = $el.is('a') ? $el.attr('href') : $el.find('a').first().attr('href');
        const fullUrl = link?.startsWith('http') ? link : `${domain}${link}`;

        let title = $el.find('h2, h3, h4, .titulo, .title').first().text().trim();
        if (!title) {
          title = $el.is('a') ? $el.text().trim() : $el.find('a').first().text().trim();
        }

        let itemData = {
          title: title,
          url: fullUrl,
          summary: $el.find('p, .sumario, .lead, .descripcion').first().text().trim(),
          image: null as string | null,
          team: detectTeam(title + ' ' + $el.text())
        };

        // Obtener detalles
        try {
          const detailController = new AbortController();
          const detailTimeoutId = setTimeout(() => detailController.abort(), 5000);

          const detailRes = await fetch(fullUrl, { 
            headers: { 
              'User-Agent': 'Mozilla/5.0',
              'Accept': 'text/html,application/xhtml+xml'
            },
            signal: detailController.signal
          });

          clearTimeout(detailTimeoutId);

          if (detailRes.ok) {
            const detailHtml = await detailRes.text();
            const $detail = cheerio.load(detailHtml);
            
            itemData.image = 
              $detail('meta[property="og:image"]').attr('content') || 
              $detail('meta[name="twitter:image"]').attr('content') ||
              $detail('article img').first().attr('src') || 
              null;
            
            if (itemData.image && !itemData.image.startsWith('http')) {
              itemData.image = `${domain}${itemData.image}`;
            }
            
            const ogDesc = $detail('meta[property="og:description"]').attr('content');
            const twitterDesc = $detail('meta[name="twitter:description"]').attr('content');
            const bestDesc = ogDesc || twitterDesc;
            
            if (bestDesc && bestDesc.length > itemData.summary.length) {
              itemData.summary = bestDesc;
            }
          }
        } catch (e) {
          console.warn('[get_sports_news] Error obteniendo detalles de:', fullUrl);
        }

        return itemData;
      })
    );

    const validNews = news.filter(n => 
      n.title !== "" && 
      n.title.length > 10 &&
      n.url.includes('/es/')
    );

    console.log('[get_sports_news] Noticias válidas:', validNews.length);

    return NextResponse.json({ 
      success: true, 
      count: validNews.length,
      team: team || 'general',
      source: baseUrl,
      news: validNews
    });

  } catch (error: any) {
    console.error('[get_sports_news] Error:', error.message);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      news: []
    }, { status: 500 });
  }
}

// Helper: Normalizar nombres de equipos
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

// Helper: Detectar equipo en texto
function detectTeam(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('athletic')) return 'Athletic Club';
  if (lowerText.includes('real sociedad') || lowerText.includes('la real')) return 'Real Sociedad';
  if (lowerText.includes('alavés') || lowerText.includes('alaves')) return 'Deportivo Alavés';
  if (lowerText.includes('eibar')) return 'SD Eibar';
  if (lowerText.includes('baskonia')) return 'Baskonia';
  
  return 'General';
}