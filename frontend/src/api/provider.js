import request from '@/utils/request'

export function queryAll() {
    return request({
        url: '/providers',
        method: 'get',
    })
}

export function update(params) {
    return request({
        url: `/providers/${params.id}`,
        method: 'put',
        data: {"data":params}
    })
}

export function del() {
    return request({
        url: '/providers',
        method: 'get',
        params
    })
}


export function add(data) {
    return request({
        url: '/providers',
        method: 'post',
        data: {"data":data}
    })
}