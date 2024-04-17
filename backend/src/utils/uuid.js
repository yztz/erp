const {nanoid} = require('nanoid')


module.exports = {
  getUUID() {
    return nanoid(12)
  }
}


