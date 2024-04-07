const Measurement = require('../../entities/measurement')
const Sensor = require('../../entities/sensor')
const { add, subMonths, subWeeks, eachDayOfInterval } = require('date-fns')

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

			const endDate = add(new Date(), { days: 1 }) // gotta end tomorrow so that interval is inclusive of today
			const startDate = view === 'week' ? subWeeks(endDate, 1) : subMonths(endDate, 1)
			const dateRange = eachDayOfInterval({ start: startDate, end: endDate })

			const measurements = await Measurement.find({
				'metadata.sensorId': sensorId,
				createdAt: { $gte: startDate }
			})

			const measurementsByDay = {}
			measurements.forEach((measurement) => {
				const createdAt = measurement.createdAt.toISOString().split('T')[0]
				if (!measurementsByDay[createdAt]) {
					measurementsByDay[createdAt] = []
				}
				measurementsByDay[createdAt].push(measurement)
			})

			const averages = dateRange.map((date) => {
				const formattedDate = date.toISOString().split('T')[0]
				const measurementsOfDay = measurementsByDay[formattedDate] || []
				if (measurementsOfDay.length === 0) {
					return { moisture: null, temperature: null, createdAt: formattedDate }
				}
				const totalMoisture = measurementsOfDay.reduce((sum, measurement) => sum + measurement.moisture, 0)
				const totalTemperature = measurementsOfDay.reduce((sum, measurement) => sum + measurement.temperature, 0)
				const moisture = parseFloat((totalMoisture / measurementsOfDay.length).toFixed(2))
				const temperature = parseFloat((totalTemperature / measurementsOfDay.length).toFixed(2))
				return { moisture, temperature, createdAt: formattedDate }
			})

			return res.status(200).send({
				message: 'Measurements fetched successfully',
				measurements: averages,
			})
		} catch (error) {
			next(new StatusError('Something went wrong while fetching measurements', 500))
		}
	},
}
