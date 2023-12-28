import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth/local',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/users/me',
    method: 'get',
    // params: { token }
  })
}

export function query(params) {
  return request({
    url: '/user/query',
    method: 'get',
    params
  })

}

export function deleteUsers(params) {
  return request({
    url: '/user/delete',
    method: 'get',
    params
  })
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
