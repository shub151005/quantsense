import axios from 'axios'

const BASE_URL = 'https://subh151005-quantsense-backend.hf.space'

export const analyzeStock = async (ticker) => {
  const response = await axios.get(`${BASE_URL}/stock/analyze/${ticker}`)
  return response.data
}

export const getStockHistory = async (ticker, period = '1y') => {
  const response = await axios.get(`${BASE_URL}/stock/history/${ticker}?period=${period}`)
  return response.data
}

export const getEMABacktest = async (ticker) => {
  const response = await axios.get(`${BASE_URL}/stock/ema/${ticker}`)
  return response.data
}
export const getMarketNews = async () => {
  const response = await axios.get(`${BASE_URL}/sentiment/market-news`)
  return response.data
}
export const saveReport = async (token, ticker, analysisData) => {
  const response = await axios.post(
    `${BASE_URL}/user/reports/save`,
    { ticker, ...analysisData },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.data
}
export const addToWatchlist = async (token, ticker) => {
  const response = await axios.post(
    `${BASE_URL}/user/watchlist/add?ticker=${ticker}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.data
}

