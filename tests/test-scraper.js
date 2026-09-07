const { fetchBeybladeXProducts } = require('./scraper');

async function test() {
  console.log('Appel de fetchBeybladeXProducts()...\n');
  const products = await fetchBeybladeXProducts();

  console.log(`Nombre de produits récupérés: ${products.length}\n`);

  products.slice(0, 5).forEach((p, i) => {
    console.log(`${i + 1}. ${p.title}`);
    console.log(`   ASIN: ${p.asin}`);
    console.log(`   Prix: ${p.price}`);
    console.log(`   Lien: ${p.link}\n`);
  });
}

test().catch((err) => console.error('Erreur:', err));
