'use strict'

const assert = require('assert')
/**
 * stock service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('api::stock.stock', ({ strapi }) => ({
  async create(params) {
    console.log(params)
    let { data } = params
    console.log(data)
    let stock = await strapi.entityService.findMany('api::stock.stock', {
      // fields: ['id'],
      filters: {
        good: {
          id: data.good
        },
        size: data.size
      },
      populate: 'good'
    })
    // console.log(stock)
    assert(stock.length <= 1)
    if (stock.length === 0) {
      return await super.create(params)
    } else {
      stock = stock[0]
      console.log(`add stock ID ${stock.id} amount from ${stock.amount} to ${stock.amount + data.amount}`)
      return await strapi.entityService.update('api::stock.stock', stock.id, { data: { amount: stock.amount + data.amount } })
    }
  }
}))
