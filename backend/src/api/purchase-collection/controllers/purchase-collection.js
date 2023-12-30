'use strict';

/**
 * purchase-collection controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::purchase-collection.purchase-collection', ({strapi}) => ({
  // async create(ctx) {
  //
  // }
  // async find(ctx) {
  //   // some logic here
  //   const { data, meta } = await super.find(ctx);
  //   // some more logic
  //
  //   return { data, meta };
  // },
  // async delete(ctx) {
  //   await this.validateQuery(ctx);
  //   const { id } = ctx.params;
  //
  //   const entries = await strapi.entityService.findMany('api::purchase.purchase',  {
  //     filters: {
  //       purchase_collection: {
  //         id: id
  //       }
  //     },
  //     populate: { purchase_collection: true },
  //   });
  //   for (let entry of entries) {
  //     await strapi.entityService.delete('api::purchase.purchase', entry.id)
  //   }
  //   console.log(`${entries.length} items deleted`)
  //   const response = await super.delete(ctx);
  //   // console.log(response)
  //   return response
  // }
}));
