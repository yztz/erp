"use strict";

const { v4: uuidV4 } = require('uuid');

module.exports = {
  beforeCreate: async (data) => {
    if (!data.params.data.uuid) {
      data.params.data.uuid = uuidV4();
    }
  },
};
