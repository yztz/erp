const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(knex) {
    // 获取good表中uuid为空的所有行
    const goods = await knex('goods').whereNull('uuid');
    // 对于每一行，生成一个新的UUID并更新数据库
    for (const good of goods) {
      await knex('goods').where({ id: good.id }).update({ uuid: uuidv4() });
    }

    // 获取provider表中uuid为空的所有行
    const providers = await knex('providers').whereNull('uuid');
    // 对于每一行，生成一个新的UUID并更新数据库
    for (const provider of providers) {
      await knex('providers').where({ id: provider.id }).update({ uuid: uuidv4() });
    }
  },
};
