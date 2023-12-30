import strapi from '@/utils/request'


export function queryAllStocks(params) {
  return strapi.find("stocks", {
    populate: 'good.provider',
    ...params
  })
}

export function delStock(id, params) {
  return strapi.delete('stocks', id, params)
}

export function addStock(data, params) {
  return strapi.create('stocks', data, params)
}


export function updateStock(id, data, params) {
  return strapi.update("stocks", id, data)
}
