/**
 * SCRIPT TODO-EN-UNO: SCRAPE AHORA
 * Ejecuta: node scrape-ahora.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🚀 Iniciando proceso rápido...');

    try {
        console.log('📦 Instalando dependencias necesarias...');
        execSync('npm install cheerio', { stdio: 'inherit' });

        console.log('\n🏃 Ejecutando scraper principal...');
        require('./run-scraper.js');

        console.log('\n📄 Generando reporte PDF...');
        // Esperamos un momento para asegurar que el JSON se escribió
        setTimeout(() => {
            require('./json-to-pdf.js');

            setTimeout(() => {
                if (fs.existsSync('./data/scraping/reporte-vivla.pdf')) {
                    console.log('\n✅ ¡ÉXITO! Datos y PDF listos para compartir.');
                    console.log('Archivos en: ./data/scraping/');
                    console.log(' - noticias-completas.json');
                    console.log(' - reporte-vivla.pdf');
                }
            }, 2000);
        }, 2000);

    } catch (error) {
        console.error('❌ Error durante la ejecución:', error.message);
    }
}

main();
