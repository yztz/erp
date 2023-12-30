// import Cookies from 'js-cookie'
//
// const TokenKey = 'X-Token'

import strapi from '@/utils/request'

export function getToken() {
  return strapi.getToken()
}

export function setToken(token) {
  return strapi.setToken(token)
}

export function removeToken() {
  return strapi.removeToken()
}
