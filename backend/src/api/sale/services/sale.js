'use strict'
const assert = require('assert')

const { errors } = require('@strapi/utils');
const { ApplicationError } = errors;
/**
 * sale service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('api::sale.sale', ({ strapi }) => ({
  async create(params) {
    let { data: sale } = params

    if (!sale ||  isNaN(sale.good)) {
      strapi.log.info(`[sale] format error, sale: ` + JSON.stringify(sale))
      throw new ApplicationError("请求格式错误");
    }
    // 先确保商品存在
    let good = await strapi.entityService.findOne('api::good.good', sale.good)
    if (!good || good.deleted) throw new ApplicationError("商品不存在或已被删除");

    let entity = await super.create(params)
    strapi.log.info(`[sale] syncing entity ${entity.id} to stock`)
    let stocks = await strapi.entityService.findMany('api::stock.stock', {
      // fields: ['id'],
      filters: {
        good: {
          id: sale.good,
        },
        size: sale.size,
      },
      populate: 'good',
    })
    assert(stocks.length <= 1)
    if (stocks.length === 1) { // 库存存在
      let stock = stocks[0]
      await strapi.entityService.update('api::stock.stock', stock.id, { data: { amount: stock.amount - sale.amount } })
      strapi.log.info(`[sale] sub stock ID ${stock.id} amount from ${stock.amount} to ${stock.amount - sale.amount}`)
    } else { // 不存在
      let stock = await strapi.entityService.create('api::stock.stock', {
        data: {
          amount: -sale.amount,
          size: sale.size,
          good: sale.good,
        },
      })
      strapi.log.info(`[sale] created stock ${stock}`)
    }

    return entity
  },

}))
