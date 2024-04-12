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
      throw new errors.ApplicationError('syncFlag is required')
    }

    // 创建总单
    let entity = await super.create(params)
    assert(entity)

    // 创建详单
    strapi.log.info(`[purchase-collection] creating ${purchases.length} detail purchases`)
    purchases = purchases.map(el => ({
      good: el.good.id,
      amount: el.amount,
      purchase_collection: entity.id,
      size: el.size,
      sync: syncFlag,
    }))
    for (let purchase of purchases) {
      strapi.log.info('[purchase-collection] creating ' + JSON.stringify(purchase))
      try {
        let res = await strapi.service('api::purchase.purchase').create({
          data: purchase,
        })
      } catch (e) {
        strapi.log.info('[purchase-collection error detect but ignored: ' + e)
      }
    }

    return entity
  },
  async delete(id, params) {
    // 找到所有详单
    const deletedPurchases = await strapi.entityService.findMany('api::purchase.purchase', {
      filters: {
        purchase_collection: {
          id: id,
        },
      },
      populate: 'purchase_collection',
    })
    // 删除
    await Promise.all(
      deletedPurchases.map(({ id }) =>
        strapi.db.query('api::purchase.purchase').delete({
          where: { id },
        }),
      ))
    strapi.log.info(`[purchase-collection] ${deletedPurchases.length} related items deleted`)
    // 删除自身
    return await super.delete(id, params)
  },
}))
