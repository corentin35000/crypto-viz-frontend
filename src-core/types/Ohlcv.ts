/**
 * Type pour définir les paramètres de la requête OHLCV
 * @property {string} symbol - Le symbole de la paire de trading (par exemple "BTCUSDT")
 * @property {string} interval - L'intervalle de temps des bougies (par exemple "1h")
 * @property {number} limit - Le nombre maximum de bougies à récupérer
 */
export type OhlcvRequest = {
  symbol: string // Symbole de la paire de trading
  interval: string // Intervalle de temps des bougies (ex. "1h", "5m", etc.)
  limit: number // Limite du nombre de bougies à retourner
}

/**
 * Type pour définir les données OHLCV
 * @property {number} timestampStart - Le timestamp de début de la bougie (en millisecondes)
 * @property {number} timestampEnd - Le timestamp de fin de la bougie (en millisecondes)
 * @property {number} openPrice - Le prix d'ouverture de la bougie
 * @property {number} highPrice - Le prix le plus haut de la bougie
 * @property {number} lowPrice - Le prix le plus bas de la bougie
 * @property {number} closePrice - Le prix de clôture de la bougie
 * @property {number} volume - Le volume échangé dans la bougie
 * @property {number} quoteAssetVolume - Le volume de l'actif coté dans la bougie
 * @property {number} trades - Le nombre de transactions dans la bougie
 * @property {number} takerBuyBaseAssetVolume - Le volume d'achats de l'actif de base par les preneurs
 * @property {number} takerBuyQuoteAssetVolume - Le volume d'achats de l'actif coté par les preneurs
 * @property {string} ignore - Un champ ignoré, non utilisé
 */
export type OhlcvData = {
  timestampStart: number // Timestamp de début
  timestampEnd: number // Timestamp de fin
  openPrice: string // Prix d'ouverture
  highPrice: string // Prix le plus haut
  lowPrice: string // Prix le plus bas
  closePrice: string // Prix de clôture
  volume: string // Volume échangé
  quoteAssetVolume: number // Volume en valeur de l'actif coté
  trades: number // Nombre de transactions
  takerBuyBaseAssetVolume: string // Volume d'achats de l'actif de base
  takerBuyQuoteAssetVolume: string // Volume d'achats de l'actif coté
  ignore: string // Champ ignoré (non utilisé)
}

/**
 * Type pour représenter les données d'un graphique en chandelier (candlestick chart).
 * @type {CandlestickData}
 * @property {Date} x - La date associée au point de données.
 * @property {Array<number>} y - Un tableau contenant les valeurs OHLC (Open, High, Low, Close).
 * @property {number} y[0] - Le prix d'ouverture (Open).
 * @property {number} y[1] - Le prix le plus haut (High).
 * @property {number} y[2] - Le prix le plus bas (Low).
 * @property {number} y[3] - Le prix de clôture (Close).
 */
export type CandlestickData = {
  x: Date // La date du point de données
  y: number[]
}
