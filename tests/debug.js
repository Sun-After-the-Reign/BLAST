const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SEARCH_URL = 'https://www.amazon.co.jp/s?k=beyblade+x&s=date-desc-rank';

async function diagnose() {
  console.log(`Requête vers: ${SEARCH_URL}\n`);

  const response = await axios.get(SEARCH_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    },
    timeout: 15000,
    validateStatus: () => true, // on veut voir même les erreurs 4xx/5xx
  });

  console.log('Status HTTP:', response.status);
  console.log('Taille de la réponse (caractères):', response.data.length);

  const html = response.data;

  // Sauvegarde pour inspection manuelle
  const outPath = path.join(__dirname, '.', 'debug-output.html');
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`\nHTML brut sauvegardé dans: ${outPath}`);

  // Indices classiques de blocage / CAPTCHA côté Amazon
  const blockIndicators = [
    'api-services-support@amazon.com',
    'To discuss automated access',
    'captcha',
    'ロボットではないことを確認',
    'Robot Check',
    "Sorry, we just need to make sure you're not a robot",
  ];

  const found = blockIndicators.filter((kw) =>
    html.toLowerCase().includes(kw.toLowerCase())
  );

  if (found.length > 0) {
    console.log('\n⚠️  Indices de blocage détectés dans la page:', found);
  } else {
    console.log('\n✅ Aucun indice de blocage/CAPTCHA détecté dans le texte brut.');
  }

  // Test de plusieurs sélecteurs possibles pour voir lequel matche
  const $ = cheerio.load(html);
  const selectorsToTest = [
    'div[data-component-type="s-search-result"]',
    'div.s-result-item[data-asin]',
    'div[data-asin]:not([data-asin=""])',
    '.s-search-results .s-result-item',
  ];

  console.log('\nTest des sélecteurs CSS:');
  selectorsToTest.forEach((sel) => {
    console.log(`  ${sel} -> ${$(sel).length} élément(s)`);
  });
}

diagnose().catch((err) => {
  console.error('Erreur pendant le diagnostic:', err.message);
});