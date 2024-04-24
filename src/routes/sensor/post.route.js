const Sensor = require('../../entities/sensor')

module.exports.post = {
	method: 'POST',
	path: '/sensor',
	requiresAuth: true,
	schema: {
		body: {
			type: 'object',
			additionalProperties: false,
			properties: {
				name: {
					type: 'string',
					minLength: 1,
					maxLength: 18
				}
			}
		}
	},
	handler: async (req, res, _next) => {
		const { name } = req.body
		const { user } = req

		const sensor = await Sensor.create({
			name: name ?? '',
			owner: user._id
		})

		res.status(200).send({
			message: 'Sensor created successfully',
			sensor: sensor.toJSON()
		})
	}
}
