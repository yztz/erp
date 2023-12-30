'use strict'

const assert = require('assert')
const errors = require('@strapi/utils').errors
/**
 * purchase-collection service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('api::purchase-collection.purchase-collection', ({ strapi }) => ({
  async create(params) {
    // console.log(JSON.stringify(params))


    let { data } = params
    let { purchases, syncFlag } = data

    if (syncFlag === undefined) {
      throw new errors.ApplicationError("syncFlag is required");
    }

    // 创建总单
    let entity = await super.create(params)
    assert(entity)
    console.log(entity)

    // 创建详单
    console.log(`creating ${purchases.length} detail purchases`)
    purchases = purchases.map(el => ({
      good: el.good.id,
      amount: el.amount,
      purchase_collection: entity.id,
      size: el.size,
      sync: syncFlag,
    }))
    for (let purchase of purchases) {
      console.log('creating ' + JSON.stringify(purchase))
      let res = await strapi.entityService.create('api::purchase.purchase', {
        data: purchase
      })

      // 增加库存
      if (syncFlag) {
        let stock = await strapi.entityService.findMany('api::stock.stock', {
          // fields: ['id'],
          filters: {
            good: {
              id: purchase.good
            },
            size: purchase.size
          },
          populate: 'good'
        })
        assert(stock.length <= 1)
        if (stock.length === 1) { // 库存存在
          stock = stock[0]
          await strapi.entityService.update('api::stock.stock', stock.id, { data: { amount: stock.amount + purchase.amount } })
          console.log(`add stock ID ${stock.id} amount from ${stock.amount} to ${stock.amount + purchase.amount}`)
        } else { // 不存在
          stock = await strapi.entityService.create('api::stock.stock', {
            data: {
              amount: purchase.amount,
              size: purchase.size,
              good: purchase.good
            }
          })
          console.log(`create stock ${stock}`)
        }
      }
    }

    return entity
  },
  async delete(id, params) {
    // 找到所有详单
    const deletedPurchases = await strapi.entityService.findMany('api::purchase.purchase', {
      filters: {
        purchase_collection: {
          id: id
        }
      },
      populate: 'purchase_collection'
    })
    // 删除
    await Promise.all(
      deletedPurchases.map(({ id }) =>
        strapi.db.query('api::purchase.purchase').delete({
          where: { id }
        })
      ))
    console.log(`${deletedPurchases.length} related items deleted`)
    // 删除自身
    return await super.delete(id, params)
  }
}))
