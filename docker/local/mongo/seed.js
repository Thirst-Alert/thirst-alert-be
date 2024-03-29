const mongoose = require('mongoose')
const { mongo } = require('../../../src/config')

mongoose.connect(mongo.uri, {
	ssl: false
})

mongoose.connection.once('open', async () => {
	console.log('Connected, starting seeding...')
	const User = require('../../../src/entities/user')
	const Measurement = require('../../../src/entities/measurement')
	const Sensor = require('../../../src/entities/sensor')

	const users = await User.create([
		{
			username: 'massi',
			password: 'Massi',
			email: 'massi@thirst-alert.com',
			active: true
		},
		{
			username: 'alsje',
			password: 'Alsje',
			email: 'alsje@thirst-alert.com',
			active: true
		},
		{
			username: 'maya',
			password: 'Maya',
			email: 'mayonnaise@thirst-alert.com',
			active: true
		}
	])

	const sensors = []
	for (const user of users) {
		const sensor = await Sensor.create({
			name: `${user.username}'s sensor`,
			owner: user._id
		})
		sensors.push(sensor)
	}

	for (const sensor of sensors) {
		await Measurement.create([
			{
				moisture: 1000,
				temperature: 25.5,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 19),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 978,
				temperature: 25.9,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 976,
				temperature: 26.3,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 17),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 967,
				temperature: 26.7,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 923,
				temperature: 27.1,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 15),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 901,
				temperature: 27.5,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 861,
				temperature: 27.9,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 13),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 824,
				temperature: 28.3,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 785,
				temperature: 28.7,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 11),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 743,
				temperature: 29.1,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 701,
				temperature: 29.5,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 667,
				temperature: 29.9,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 623,
				temperature: 30.3,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 584,
				temperature: 30.7,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 546,
				temperature: 31.1,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 502,
				temperature: 31.5,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 467,
				temperature: 31.9,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 429,
				temperature: 32.3,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 386,
				temperature: 32.7,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
				metadata: {
					sensorId: sensor._id,
				},
			},
			{
				moisture: 343,
				temperature: 33.1,
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 0),
				metadata: {
					sensorId: sensor._id,
				},
			}
		])
	}

	await mongoose.disconnect()
	console.log('Seeding complete, exiting...')
	process.exit(0)
})


