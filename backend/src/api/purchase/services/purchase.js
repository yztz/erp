'use strict';

const assert = require('assert')
const { errors } = require('@strapi/utils');
const { ApplicationError } = errors;
/**
 * purchase service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::purchase.purchase', ({ strapi }) => ({
  async create(params) {
    let { data: purchase } = params

    // 先确保商品存在
    let good = await strapi.entityService.findOne('api::good.good', purchase.good)
    if (!good || good.deleted) throw new ApplicationError("商品不存在或已被删除");

    let entity = await super.create(params)

    if (purchase.sync) {
      strapi.log.info(`[purchase] syncing entity ${entity.id} to stock`)
      let stocks = await strapi.entityService.findMany('api::stock.stock', {
        // fields: ['id'],
        filters: {
          good: {
            id: purchase.good
          },
          size: purchase.size
        },
        populate: 'good'
      })
      assert(stocks.length <= 1)
      if (stocks.length === 1) { // 库存存在
        let stock = stocks[0]
        await strapi.entityService.update('api::stock.stock', stock.id, { data: { amount: stock.amount + purchase.amount } })
        strapi.log.info(`[purchase] add stock ID ${stock.id} amount from ${stock.amount} to ${stock.amount + purchase.amount}`)
      } else { // 不存在
        let stock = await strapi.entityService.create('api::stock.stock', {
          data: {
            amount: purchase.amount,
            size: purchase.size,
            good: purchase.good
          }
        })
        strapi.log.info(`[purchase] created stock ${stock}`)
      }
    }

    return entity
  }

}));
