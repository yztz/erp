import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import socket from '@/socket'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  // SET_TOKEN: (state, token) => {
  //   state.token = token
  // },
  SET_NAME: (state, name) => {
    state.name = name
  }
}

const actions = {
  // user login
  async login({ commit }, userInfo) {
    const { username, password } = userInfo
    await login(username, password)
  },

  // get user info
  async getInfo({ commit, state }) {
    let info = await getInfo()
    if (!info) {
      throw new Error('身份验证失败，请重新登录')
    }
    // console.log("username ", username)
    // console.log(info)
    commit('SET_NAME', info.username)

  },

  logout({ commit }) {
    removeToken() // must remove  token  first
    resetRouter()
    socket.disconnect()
    commit('RESET_STATE')
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

