module.exports = ({ env }) => ({
  // ..

  io: {
    enabled: true,
    config: {
      // This will listen for all supported events on the article content type
      contentTypes: ['api::barcode::result'],
      socket: {
        serverOptions: {
          cors: { origin: '*', methods: ['GET', 'POST'] },
        },
      },
      events: [
        {
          name: 'connection',
          handler({ strapi, io }, socket) {
            // will log whenever a socket connects
            strapi.log.info(`[io] new connection with id ${socket.id}`)
            console.log(socket.rooms)
          },
        },
        {
          name: 'barcode.scan',
          handler({ strapi, io }, socket, data) {
            // will log whenever 'custom-event-name' is called by a socket
            strapi.log.info(`[io] scan data = ${data}`)
            io.server.emit('barcode.result', data)
          },
        },
        {
          name: 'barcode.discover',
          handler({ strapi, io }, socket) {
            // will log whenever 'custom-event-name' is called by a socket
            strapi.log.info('[io] barcode discover')
            io.server.emit('barcode.discover')
          },
        },
        {
          name: 'barcode.found',
          handler({ strapi, io }, socket) {
            // will log whenever 'custom-event-name' is called by a socket
            strapi.log.info(`[io] barcode found`)
            io.server.emit('barcode.found')
          },
        },
        {
          name: 'barcode.commit',
          handler({ strapi, io }, socket) {
            // will log whenever 'custom-event-name' is called by a socket
            strapi.log.info(`[io] barcode commit`)
            io.server.emit('barcode.commit')
          },
        },
      ],
    },
  },
  'transformer': {
    enabled: true,
    config: {
      responseTransforms: {
        removeAttributesKey: true,
        removeDataKey: true,
      },
      requestTransforms: {
        wrapBodyWithDataKey: true,
      },
      // hooks: {
      //   preResponseTransform : (ctx) => console.log('hello from the preResponseTransform hook!'),
      //   postResponseTransform : (ctx) => console.log('hello from the postResponseTransform hook!')
      // },
      // contentTypeFilter: {
      //   mode: 'allow',
      //   uids: {
      //     'api::article.article': true,
      //     'api::category.category': {
      //       'GET':true,
      //     }
      //   }
      // },
      plugins: {
        ids: {
          'slugify': true,
        },

      },

    },
  },
  // ..
})
