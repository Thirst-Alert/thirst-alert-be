const Sensor = require('../../entities/sensor')

module.exports.post = {
	method: 'POST',
	path: '/sensor',
	requiresAuth: true,
	handler: async (req, res, _next) => {
		const { user } = req

		const sensor = await Sensor.create({
			owner: user._id
		})

		res.status(200).send({
			message: 'Sensor created successfully',
			sensor: sensor.toJSON()
		})
	}
}
