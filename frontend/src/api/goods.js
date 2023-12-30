import strapi from '@/utils/request'
import assert from 'assert'

export async function queryAll(params) {
  let res = await strapi.find('goods', {
    ...params
  })
  // console.log(res)
  let { data,  meta  } = res
  // console.log(res)
  return { data, meta }
}

function transformData(data) {
  if (data.picture) {
    data.picture = data.picture.id
  }
  assert(data.provider)
  data.provider = data.provider.id

  return data
}

export function update(id, data, params) {
  // data = transformData(data)
  return strapi.update('goods', id, data, params)
}

export function del(id, params) {
  return strapi.delete("goods", id, params)
}

export function add(data) {
  // data = transformData(data)
  return strapi.create('goods', data)
}
