import strapi from '@/utils/request'

export async function queryAll(params) {
  let res = await strapi.find('providers', params)
  // console.log(res)
  let { data, meta } = res
  // data = data.map((el) => ({ id: el.id, ...el.attributes }))

  return {data, meta}
}

export function update(id, data) {
  return strapi.update('providers', id, data)
}

export function del(id, params) {
  return strapi.delete('providers', id, params)
}

export function add(data) {
  return strapi.create('providers', data)
}
