const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js')
const cron = require('node-cron')
const { fetchBeybladeXProducts } = require('./scraper')
const { loadSeenAsins, saveSeenAsins } = require('./storage')

const config = require("./config.json")

const TOKEN = config.token
const CHANNEL_LOG = config.log
const CHANNEL_ALERT = config.alert
const PING = config.ping

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

let seenAsins = loadSeenAsins()
let isFirstRun = seenAsins.size === 0

async function checkForNewProducts() {
  console.log(`[${new Date().toISOString()}] Vérification des produits Beyblade X...`)

  let products
  try {
    products = await fetchBeybladeXProducts()
  } catch (err) {
    console.error('Erreur lors du scraping Amazon:', err.message)
    return
  }

  const newProducts = products.filter((p) => !seenAsins.has(p.asin))

  if (isFirstRun) {
    products.forEach((p) => seenAsins.add(p.asin))
    saveSeenAsins(seenAsins)
    isFirstRun = false
    console.log(`Initialisation: ${products.length} produit(s) existant(s) enregistré(s).`)
    return
  }

  const channel_log = await client.channels.fetch(CHANNEL_LOG).catch(() => null)
  if (!channel_log) {
    console.error('Impossible de récupérer le salon Discord log (vérifie CHANNEL_LOG).')
    return
  }

  const channel_alert = await client.channels.fetch(CHANNEL_ALERT).catch(() => null)
  if (!channel_alert) {
    console.error('Impossible de récupérer le salon Discord alerte (vérifie CHANNEL_ALERT).')
    return
  }

  if (newProducts.length === 0) {
    console.log('Aucun nouveau produit.')
    await channel_log.send('Aucun nouveau produit.')
    return
  }

  for (const product of newProducts) {
    const embed = new EmbedBuilder()
      .setTitle(product.title)
      .setURL(product.link)
      .setDescription(`Prix: ${product.price}`)
      .setColor(0xe54d00)
      .setFooter({ text: 'Nouveau produit Beyblade X détecté sur Amazon Japan' })

    if (product.image) embed.setThumbnail(product.image)

    await channel_alert.send({ content: `<@${PING}>`, embeds: [embed] })
    seenAsins.add(product.asin)
  }

  saveSeenAsins(seenAsins)
  console.log(`✅ ${newProducts.length} nouveau(x) produit(s) notifié(s).`)
}

client.once('clientReady', () => {
  console.log(`Connecté en tant que ${client.user.tag}`)

  checkForNewProducts()
  cron.schedule('0 * * * *', checkForNewProducts)
  client.user.setPresence({activities: [{ name: "Scroll et analyser Amazon JP.", type: 0 }], status: "online"})
})

client.login(TOKEN)
