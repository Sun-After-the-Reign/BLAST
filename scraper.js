const axios = require('axios');
const cheerio = require('cheerio');

// Recherche "beyblade x" sur Amazon.co.jp, triée par date de sortie (les plus récents en premier)
// s=date-desc-rank aide à repérer plus vite les nouveautés
const SEARCH_URL = 'https://www.amazon.co.jp/s?k=beyblade+x&s=date-desc-rank';

async function fetchBeybladeXProducts() {
  const { data: html } = await axios.get(SEARCH_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8',
    },
    timeout: 15000,
  });

  const $ = cheerio.load(html);
  const products = [];

  $('div[data-component-type="s-search-result"]').each((_, el) => {
    const asin = $(el).attr('data-asin');
    if (!asin) return;

    // Amazon a inversé la structure : le <a> englobe désormais le <h2>
    // (et non l'inverse). Le <h2> porte le titre complet en aria-label.
    const title = $(el).find('h2').first().attr('aria-label')
      || $(el).find('[data-cy="title-recipe"] span').first().text().trim();
    if (!title) return;

    const hrefPath = $(el).find('a[href*="/dp/"]').first().attr('href');
    const link = hrefPath
      ? `https://www.amazon.co.jp${hrefPath.split('?')[0]}`
      : `https://www.amazon.co.jp/dp/${asin}`;

    // .a-offscreen contient le prix formaté prêt à l'emploi (ex: "EUR 54.99" ou "￥5,000")
    const price = $(el).find('.a-price .a-offscreen').first().text().trim() || 'Prix non affiché';

    const image = $(el).find('img.s-image').attr('src');

    products.push({ asin, title, link, price, image });
  });

  return products;
}

module.exports = { fetchBeybladeXProducts };