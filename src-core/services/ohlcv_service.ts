import axios, { type AxiosResponse } from 'axios'
import type { CandlestickData, OhlcvData, OhlcvRequest } from '../types/Ohlcv'

/**
 * fetchOhlcvData description
 * @param {OhlcvRequest} ohlvcRequest - Requête pour les données des candlestick
 * @returns {Promise<CandlestickData[] | undefined>} - Data pour les candlestick
 */
export const fetchOhlcvData: (ohlvcRequest: OhlcvRequest) => Promise<CandlestickData[] | undefined> = async (
  ohlvcRequest: OhlcvRequest,
): Promise<CandlestickData[] | undefined> => {
  try {
    const response: AxiosResponse<OhlcvData[], any> = await axios.get<OhlcvData[]>(
      `https://api.binance.com/api/v3/klines?symbol=${ohlvcRequest.symbol}&interval=${ohlvcRequest.interval}&limit=${ohlvcRequest.limit}`,
    )

    let transformedDataList: OhlcvData[] | null = null

    // Transformation des données brutes pour les adapter au graphique
    transformedDataList = response.data.map(
      (data: any): OhlcvData => ({
        timestampStart: data[0], // Timestamp début (ouverture)
        openPrice: data[1], // Prix d'ouverture
        highPrice: data[2], // Prix le plus haut
        lowPrice: data[3], // Prix le plus bas
        closePrice: data[4], // Prix de clôture
        volume: data[5], // Volume des échanges
        timestampEnd: data[6], // Timestamp fin
        quoteAssetVolume: data[7], // Volume en asset coté
        trades: data[8], // Nombre d'échanges
        takerBuyBaseAssetVolume: data[9],
        takerBuyQuoteAssetVolume: data[10],
        ignore: data[11],
      }),
    )

    // Préparation des données pour le graphique
    return transformedDataList.map(
      (item: OhlcvData): CandlestickData => ({
        x: new Date(item.timestampStart), // Conversion du timestamp en Date
        y: [
          parseFloat(item.openPrice), // Prix d'ouverture
          parseFloat(item.highPrice), // Prix le plus haut
          parseFloat(item.lowPrice), // Prix le plus bas
          parseFloat(item.closePrice), // Prix de clôture
        ],
      }),
    )
  } catch (err) {
    console.error('Erreur lors de la récupération des données :', err)
  }
}
