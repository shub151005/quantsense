import axios from 'axios'

const BASE_URL = 'https://quantsense-backend.onrender.com'

export const signupUser = async (name, email, password) => {
  const response = await axios.post(`${BASE_URL}/auth/signup`, {
    name, email, password
  })
  return response.data
}

export const loginUser = async (email, password) => {
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    email, password
  })
  return response.data
}

export const getMe = async (token) => {
  const response = await axios.get(`${BASE_URL}/user/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const getWatchlist = async (token) => {
  const response = await axios.get(`${BASE_URL}/user/watchlist`, {
    headers: { Authorization: `Bearer ${token}` }
  })
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

export const removeFromWatchlist = async (token, ticker) => {
  const response = await axios.delete(
    `${BASE_URL}/user/watchlist/${ticker}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.data
}

