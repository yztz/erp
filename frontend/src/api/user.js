import strapi from '@/utils/request'

export function login(identifier, password) {
  return strapi.login({
    identifier, password
  })
}

export function getInfo() {
  return strapi.fetchUser()
}

export function update(data) {
  return request({
    url: '/user/update',
    method: 'post',
    data: {"data":data}
  })
}

export function add(data) {
  return request({
    url: '/user/add',
    method: 'post',
    data
  })
}
