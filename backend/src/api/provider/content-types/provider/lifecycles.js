"use strict";

const { getUUID } = require('../../../../utils/uuid.js')

module.exports = {
  beforeCreate: async (data) => {
    if (!data.params.data.uuid) {
      data.params.data.uuid = getUUID();
    }
  },
};
