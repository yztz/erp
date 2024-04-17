'use strict';

/**
 * purchase controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::purchase.purchase', ({strapi})=>({
  async create(ctx) {
    console.log(ctx)
    return await super.create(ctx);
  }
}));
