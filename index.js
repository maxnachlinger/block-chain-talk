require('make-promises-safe')

const fastify = require('fastify')({
  logger: true
})
const port = 3000

fastify.register(require('./routes'))

const start = async () => {
  try {
    await fastify.listen(port)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
