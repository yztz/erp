import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ identifier: username.trim(), password: password }).then(res => {
        const { jwt, user } = res
        commit('SET_TOKEN', jwt)
        setToken(jwt)
        console.log("success");
        resolve()
      }).catch(error => {
        // console.log(JSON.stringify(error));
        reject(error)
      })
    })
  },



  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(res => {
        console.log(res);
        if (!res) {
          return reject('Verification failed, please Login again.')
        }

        const { username } = res
        console.log("username ", username)
        commit('SET_NAME', username)
        // commit('SET_AVATAR', avatar)
        resolve(res)
      }).catch(error => {
        reject(error)
      })
    })
  },

  logout({ commit }) {
    removeToken() // must remove  token  first
    resetRouter()
    commit('RESET_STATE')
  },
  // user logout
  // logout({ commit, state }) {
  //   return new Promise((resolve, reject) => {
  //     logout(state.token).then(() => {
  //       removeToken() // must remove  token  first
  //       resetRouter()
  //       commit('RESET_STATE')
  //       resolve()
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // },

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

