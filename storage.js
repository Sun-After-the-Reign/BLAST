const fs = require('fs')
const path = require('path')

const STORAGE_FILE = path.join(__dirname, '.', 'seen-products.json')

function loadSeenAsins() {
  try {
    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8')
    return new Set(JSON.parse(raw))
  } catch (err) {
    // Fichier absent au premier lancement -> on part d'un set vide
    return new Set()
  }
}

function saveSeenAsins(seenSet) {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify([...seenSet], null, 2), 'utf-8')
}

module.exports = { loadSeenAsins, saveSeenAsins }
