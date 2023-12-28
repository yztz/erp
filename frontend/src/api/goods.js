import request from '@/utils/request'

export function queryAll() {
    return request({
        url: '/goods?populate=*',
        method: 'get',
    })
}

export function update(params) {
    return request({
        url: `/goods/${params.id}`,
        method: 'put',
        data: {"data":params}
    })
}

export function del() {
    return request({
        url: '/goods',
        method: 'get',
        params
    })
}


export function add(data) {
    return request({
        url: '/goods',
        method: 'post',
        data: {"data":data}
    })
}