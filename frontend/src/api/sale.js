import strapi from '@/utils/request'

export async function queryAllSaleCollections(params) {
  let { data, meta } = await strapi.find('sale-collections', params)
  // data = data.map((el) => ({ id: el.id, ...el.attributes }))
  return { data, meta }
}

export async function querySales(params) {
  return await strapi.find('sales', {
    ...params
  })
}

export async function querySaleFromID(id, params) {
  let { data, meta } = await strapi.find('sales', {
    // fields: ["sales"],
    filters: {
      sale_collection: {
        id: {
          $eq: id
        }
      }
    },
    populate: {
      good: {
        fields: ['code', 'color'],
        populate: {
          provider: {
            fields: ['name']
          }
        }
      }
    },
    ...params
  })
  // console.log(data)
  // data = data.map((el) => ({ id: el.id, ...el.attributes }))
  return { data, meta }
}

export async function addSaleCollection(data) {
  return strapi.create('sale-collections', data)
}

export async function addSale(data) {
  return strapi.create('sales', data)
}

export async function delSaleCollection(id, params) {
  return strapi.delete('sale-collections', id, params)
}

export async function updateSaleCollection(id, data) {
  return strapi.update("sale-collections", id, data)
}





