import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import qs from 'qs'

// create an axios instance
// const service = axios.create({
//   baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
//   // withCredentials: true, // send cookies when cross-domain requests
//   timeout: 5000, // request timeout
//   paramsSerializer(params) {
//     return qs.stringify(params, {arrayFormat: 'repeat'})
//   },
// })

import Strapi from 'strapi-sdk-js'

// console.log(process.env.VUE_APP_API_BASE_URL)
const strapi = new Strapi({
  url: process.env.VUE_APP_API_BASE_URL,
  prefix: process.env.VUE_APP_API_PREFIX,
  store: {
    key: "strapi_jwt",
    useLocalStorage: true,
    cookieOptions: { path: "/" },
  },
})

strapi.axios.interceptors.response.use(
  response => {
    // if the custom code is not 20000, it is judged as an error.
    return response
  },
  error => {
    console.log(error) // for debug

    if (error.response && error.response.data) {
      let { error: e } = error.response.data
      console.log(error)
      Message({
        message: e.message,
        type: 'error',
        duration: 5 * 1000
      })
    } else {
      Message({
        message: '网络错误',
        type: 'error',
        duration: 5 * 1000
      })
    }

  return Promise.reject(error)
})

// request interceptor
// service.interceptors.request.use(
//   config => {
//     // do something before request is sent
//
//     if (store.getters.token) {
//       // let each request carry token
//       // ['X-Token'] is a custom headers key
//       // please modify it according to the actual situation
//       config.headers['Authorization'] = `Bearer ${getToken()}`
//     }
//     return config
//   },
//   error => {
//     // do something with request error
//     console.log(error) // for debug
//     return Promise.reject(error)
//   }
// )

// response interceptor
// service.interceptors.response.use(
//   /**
//    * If you want to get http information such as headers or status
//    * Please return  response => response
//    */
//
//   /**
//    * Determine the request status by custom code
//    * Here is just an example
//    * You can also judge the status by HTTP Status Code
//    */
//   response => {
//     // console.log(response);
//     const res = response.data
//
//     // if the custom code is not 20000, it is judged as an error.
//     if (response.status !== 200) {
//       let err = res.error
//       Message({
//         message: err.message || 'Error',
//         type: 'error',
//         duration: 5 * 1000
//       })
//
//       // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
//       // if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
//       //   // to re-login
//       //   MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
//       //     confirmButtonText: 'Re-Login',
//       //     cancelButtonText: 'Cancel',
//       //     type: 'warning'
//       //   }).then(() => {
//       //     store.dispatch('user/resetToken').then(() => {
//       //       location.reload()
//       //     })
//       //   })
//       // }
//       console.log('unknown status code')
//       return Promise.reject(new Error(err.message || 'Error'))
//     } else {
//       return res
//     }
//   },
//   error => {
//     console.log('err' + error) // for debug
//     Message({
//       message: error.message,
//       type: 'error',
//       duration: 5 * 1000
//     })
//     return Promise.reject(error)
//   }
// )

export default strapi
