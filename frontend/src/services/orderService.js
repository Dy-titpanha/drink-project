import axios from 'axios'
import api from './api.js'

export function checkout(payload) {
  return api.post('/checkout', payload)
}

// EZorder guests arrive by scanning the table QR, often from a phone on
// the café Wi-Fi — derive the API host from the page URL so it works on
// both localhost and LAN addresses.
function ezClient() {
  return axios.create({
    baseURL: `${window.location.protocol}//${window.location.hostname}:8000/api`,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 15000,
  })
}

export function placeEzOrder(payload) {
  return ezClient().post('/orders', payload)
}
