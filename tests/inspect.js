const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SEARCH_URL = 'https://www.amazon.co.jp/s?k=beyblade+x&s=date-desc-rank';

async function inspect() {
  const response = await axios.get(SEARCH_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8',
    },
    timeout: 15000,
  });

  const $ = cheerio.load(response.data);
  const first = $('div[data-component-type="s-search-result"]').first();

  const outPath = path.join(__dirname, '.', 'sample-result.html');
  fs.writeFileSync(outPath, $.html(first), 'utf-8');
  console.log(`HTML du premier résultat sauvegardé dans: ${outPath}\n`);

  // On teste une série de sélecteurs candidats pour le titre, le lien et le prix
  console.log('--- Candidats pour le TITRE ---');
  ['h2 a span', 'h2 span', 'h2', '.a-size-base-plus', '.a-size-medium', '[data-cy="title-recipe"] span']
    .forEach((sel) => {
      const txt = first.find(sel).first().text().trim();
      console.log(`  "${sel}" -> "${txt.slice(0, 60)}"`);
    });

  console.log('\n--- Candidats pour le LIEN ---');
  ['h2 a', 'a.a-link-normal', '.a-link-normal.s-line-clamp-2', 'a[href*="/dp/"]'].forEach((sel) => {
    const href = first.find(sel).first().attr('href');
    console.log(`  "${sel}" -> ${href || '(vide)'}`);
  });

  console.log('\n--- Candidats pour le PRIX ---');
  ['.a-price .a-price-whole', '.a-price .a-offscreen', '.a-color-price'].forEach((sel) => {
    const txt = first.find(sel).first().text().trim();
    console.log(`  "${sel}" -> "${txt}"`);
  });

  console.log('\ndata-asin de cet élément:', first.attr('data-asin'));
}

inspect().catch((err) => console.error('Erreur:', err.message));