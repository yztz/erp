'use strict';

/**
 * provider service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::provider.provider',({ strapi }) =>  ({
  async find(params){
    params.filters = {deleted: false, ...params.filters}
    const { results, pagination } = await super.find(params);

    return { results, pagination };
  },
  async delete(id) {
    // 标记供应商为删除状态
    let entity = await strapi.entityService.update('api::provider.provider', id, {
      data: {
        deleted: true
      }
    })
    console.log(`Provider ID ${entity.id} deleted`)
    // 删除所有相关商品
    let deletedGoods = await strapi.db.query('api::good.good').findMany({
      where: {
        deleted: false,
        provider: {
          id: {
            $eq: id
          }
        }
      },
      populate: true
    })
    await Promise.all(
      deletedGoods.map(({ id }) =>
        strapi.service('api::good.good').delete(id)
      )
    );
    // console.log(deletedStocks)
    console.log(`${deletedGoods.length} related goods deleted`)
    return entity
  }
}));
