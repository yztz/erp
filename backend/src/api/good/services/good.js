'use strict';

/**
 * good service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::good.good', ({ strapi }) =>  ({
  async find(params){
    params.filters = {deleted: false, ...params.filters}
    const { results, pagination } = await super.find(params);

    return { results, pagination };
  },
  async delete(id) {
    // 标记商品为删除状态
    let entity = await strapi.entityService.update('api::good.good', id, {
      data: {
        deleted: true
      }
    })
    console.log(`Good ID ${entity.id} deleted`)
    // 删除所有相关库存
    let deletedStocks = await strapi.db.query('api::stock.stock').findMany({
      where: {
        good: {
          id: {
            $eq: id
          }
        }
      },
      populate: true
    })
    await Promise.all(
      deletedStocks.map(({ id }) =>
        strapi.db.query("api::stock.stock").delete({
          where: { id },
        })
      )
    );
    // console.log(deletedStocks)
    console.log(`${deletedStocks.length} related stocks deleted`)
    return entity
  }
}));
