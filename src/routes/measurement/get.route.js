const Measurement = require('../../entities/measurement')
const Sensor = require('../../entities/sensor')

module.exports.get = {
	method: 'GET',
	path: '/measurement/:sensorId',
	requiresAuth: true,
	schema: {
		params: {
			type: 'object',
			additionalProperties: false,
			required: ['sensorId'],
			properties: {
				sensorId: {
					type: 'string',
					pattern: '^[0-9a-fA-F]{24}$',
				},
			},
		},
		querystring: {
			type: 'object',
			additionalProperties: true,
			properties: {
				limit: {
					type: 'integer',
					minimum: 48, // 1 day
					maximum: 1536, // 32 (days) * 48 (daily readings)
					default: 1536,
				},
				offset: {
					type: 'integer',
					minimum: 0,
					default: 0,
				},
				sort: {
					type: 'integer',
					enum: [1, -1],
					default: 1,
					// 1 for ascending, -1 for descending
				},
				startDate: {
					type: 'string',
					format: 'date-time',
				},
			},
		},
		options: {
			coerceTypes: true,
			useDefaults: true,
		},
	},
	handler: async (req, res, next) => {
		const {
			user: { _id: owner },
		} = req
		const { sensorId } = req.params
		const { limit, offset, sort, startDate } = req.query

		const sensor = await Sensor.findOne({ _id: sensorId, owner })
		if (!sensor) return next(new StatusError('Sensor not found', 404))

		const measurements = await Measurement.find({
			'metadata.sensorId': sensorId,
			...(startDate && { createdAt: { $gte: new Date(startDate) } }),
		})
			.sort({ createdAt: sort })
			.limit(limit)
			.skip(offset)
			.exec()

		const measurementsByDay = {}
		measurements.forEach((measurement) => {
			const createdAt = measurement.createdAt.toISOString().split('T')[0]
			if (!measurementsByDay[createdAt]) {
				measurementsByDay[createdAt] = []
			}
			measurementsByDay[createdAt].push(measurement)
		})

		const averages = []
		for (const createdAt in measurementsByDay) {
			const measurementsOfDay = measurementsByDay[createdAt]
			const totalMoisture = measurementsOfDay.reduce((sum, measurement) => sum + measurement.moisture, 0)
			const totalTemperature = measurementsOfDay.reduce((sum, measurement) => sum + measurement.temperature, 0)
			const moisture = parseFloat((totalMoisture / measurementsOfDay.length).toFixed(2))
			const temperature = parseFloat((totalTemperature / measurementsOfDay.length).toFixed(2))
			averages.push({ moisture, temperature, createdAt })
		}

		return res.status(200).send({
			message: 'Measurements fetched successfully',
			measurements: averages,
		})
	},
}
