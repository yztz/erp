'use strict';
const assert = require('assert')
const errors = require('@strapi/utils').errors
/**
 * sale-collection service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::sale-collection.sale-collection', ({ strapi }) => ({
  async create(params) {


    let { data } = params
    let { sales } = data

    //   if (syncFlag === undefined) {
    //     throw new errors.ApplicationError("syncFlag is required");
    //   }

    // 创建总单
    let entity = await super.create(params)
    assert(entity)

    // 创建详单
    strapi.log.info(`[sale-collection] creating ${sales.length} detail sales`)
    sales = sales.map(el => ({
      good: el.good.id,
      amount: el.amount,
      sale_collection: entity.id,
      size: el.size,
    }))
    for (let sale of sales) {
      strapi.log.info('[sale-collection creating ' + JSON.stringify(sale))
      let res = await strapi.service('api::sale.sale').create({
        data: sale
      })

    }

    return entity
  },
  async delete(id, params) {
    // 找到所有详单
    const deletedSales = await strapi.entityService.findMany('api::sale.sale', {
      filters: {
        sale_collection: {
          id: id
        }
      },
      populate: 'sale_collection'
    })
    // 删除
    await Promise.all(
      deletedSales.map(({ id }) =>
        strapi.db.query('api::sale.sale').delete({
          where: { id }
        })
      ))
    strapi.log.info(`[sale-collection] ${deletedSales.length} related items deleted`)
    // 删除自身
    return await super.delete(id, params)
  }
}))

