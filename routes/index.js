
const routes = async (fastify, options) => {
  fastify.post('/block', async (request, reply) => {
    return { hello: 'world' }
  })
}

/*

@app.route('/new_transaction', methods=['POST'])
def new_transaction():
    tx_data = request.get_json()
    required_fields = ["author", "content"]

    for field in required_fields:
        if not tx_data.get(field):
            return "Invlaid transaction data", 404

    tx_data["timestamp"] = time.time()

    blockchain.add_new_transaction(tx_data)

    return "Success", 201
 */

module.exports = routes
