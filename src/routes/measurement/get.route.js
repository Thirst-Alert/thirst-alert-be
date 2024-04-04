const Measurement = require('../../entities/measurement')
const Sensor = require('../../entities/sensor')
const { subMonths, subWeeks } = require('date-fns')

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
			additionalProperties: false,
			required: ['view'],
			properties: {
				view: {
					type: 'string',
					enum: ['month', 'week'],
				},
			},
		},
	},
	handler: async (req, res, next) => {
		const {
			user: { _id: owner },
		} = req
		const { sensorId } = req.params
		const { view } = req.query

		try {
			const sensor = await Sensor.findOne({ _id: sensorId, owner })
			if (!sensor) return next(new StatusError('Sensor not found', 404))

			const currentDate = new Date()
			let startDate

			if (view === 'week') {
				startDate = subWeeks(currentDate, 1)
			} else if (view === 'month') {
				startDate = subMonths(currentDate, 1)
			} else {
				throw new Error(
					'Invalid view parameter. It should be either \'week\' or \'month\'.'
				)
			}

			const measurements = await Measurement.find({
				'metadata.sensorId': sensorId,
				createdAt: { $gte: startDate },
			})

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
				const totalMoisture = measurementsOfDay.reduce(
					(sum, measurement) => sum + measurement.moisture,
					0
				)
				const totalTemperature = measurementsOfDay.reduce(
					(sum, measurement) => sum + measurement.temperature,
					0
				)
				const moisture = parseFloat(
					(totalMoisture / measurementsOfDay.length).toFixed(2)
				)
				const temperature = parseFloat(
					(totalTemperature / measurementsOfDay.length).toFixed(2)
				)
				averages.push({ moisture, temperature, createdAt })
			}

			return res.status(200).send({
				message: 'Measurements fetched successfully',
				measurements: averages,
			})
		} catch (error) {
			return next(new Error(error.message))

		}
	},
}
