const routes = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    return { hello: 'world' }
  })
}

module.exports = routes
