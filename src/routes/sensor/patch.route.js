const Sensor = require('../../entities/sensor')

module.exports.patch = {
	method: 'PATCH',
	path: '/sensor/:sensorId',
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
				},
				thirstLevel: {
					type: 'integer',
					enum: [0, 1, 2]
				},
				hasCustomImage: {
					type: 'boolean'
				}
			},
		},
		params: {
			type: 'object',
			additionalProperties: false,
			required: ['sensorId'],
			properties: {
				sensorId: {
					type: 'string',
					pattern: '^[0-9a-fA-F]{24}$'
				}
			}
		}
	},
	handler: async (req, res, next) => {
		const { user: { _id: owner } } = req
		const { sensorId } = req.params

		const sensor = await Sensor.findOne({ _id: sensorId, owner })
		if (!sensor) return next(new StatusError('Sensor not found', 404))

		sensor.set(req.body)
		await sensor.save()

		res.status(200).send({
			message: 'Sensor updated successfully',
			sensor: sensor.toJSON()
		})
	}
}
