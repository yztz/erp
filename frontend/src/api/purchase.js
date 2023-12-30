import strapi from '@/utils/request'

export async function queryAllPurchaseCollections(params) {
  let { data, meta } = await strapi.find('purchase-collections', params)
  // data = data.map((el) => ({ id: el.id, ...el.attributes }))
  return { data, meta }
}

export async function queryPurchaseFromID(id, params) {
  let { data, meta } = await strapi.find('purchases', {
    // fields: ["purchases"],
    filters: {
      purchase_collection: {
        id: {
          $eq: id
        }
      }
    },
    populate: {
      good: {
        fields: ['code'],
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

export async function addPurchaseCollection(data) {
  return strapi.create('purchase-collections', data)
}

export async function addPurchase(data) {
  return strapi.create('purchases', data)
}

export async function delPurchaseCollection(id, params) {
  return strapi.delete('purchase-collections', id, params)
}

export async function updatePurchaseCollection(id, data) {
  return strapi.update("purchase-collections", id, data)
}





