/**
 * EJEMPLO DE INTEGRACIÓN RAG
 * Este script muestra cómo usarías los datos ya escrapeados en tu agente.
 */

const fs = require('fs');

async function simulateAgentQuery(query) {
    console.log(`🤖 Agente procesando consulta: "${query}"`);

    // 1. Cargar base de conocimiento (ya escrapeada)
    const dataPath = './data/scraping/noticias-completas.json';
    if (!fs.existsSync(dataPath)) {
        console.log("❌ Error: No hay base de conocimiento. Ejecuta run-scraper.js primero.");
        return;
    }

    const { articles } = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // 2. Simulación de búsqueda semántica (aquí usarías Embeddings/VectorDB)
    // Para el ejemplo, hacemos una búsqueda de palabras clave simple
    const keywords = query.toLowerCase().split(' ');
    const relevantArticles = articles.filter(a =>
        keywords.some(k => a.title.toLowerCase().includes(k) || (a.content && a.content.toLowerCase().includes(k)))
    ).slice(0, 3);

    if (relevantArticles.length === 0) {
        console.log("🤷 No encontré noticias recientes sobre ese tema en mi base de datos.");
        return;
    }

    console.log(`\n📚 Contexto recuperado (${relevantArticles.length} artículos):`);
    relevantArticles.forEach(a => {
        console.log(`- [${a.source.toUpperCase()}] ${a.title}`);
    });

    console.log("\n💡 Respuesta generada por el Agente (Simulación):");
    console.log(`Según las últimas noticias de Orain y Kirolak, ${relevantArticles[0].summary}...`);
}

// Probar el ejemplo
simulateAgentQuery("reunión consejo gobierno vasco");
