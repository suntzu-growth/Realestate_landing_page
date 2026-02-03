const cheerio = require('cheerio');

async function inspect() {
    const url = 'https://orain.eus/es/actualidad/economia/2026/02/02/sindicatos-estiman-en-al-menos-130-los-despidos-en-tubos-reunidos-se-confirma-el-ere/';
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    $('article').each((i, el) => {
        console.log(`Article ${i} class:`, $(el).attr('class'), 'P count:', $(el).find('p').length);
    });
}

inspect();
