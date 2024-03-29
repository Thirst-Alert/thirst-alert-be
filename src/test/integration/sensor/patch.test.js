const request = require('supertest')
const { db, authenticatedAgent } = require('../../helpers')

afterEach(async () => {
	await db.dropCollections()
})

describe('PATCH /sensor/:sensorId', () => {
	describe('Authentication', () => {
		it('should return 401 if client is not authenticated', async function () {
			const res = await request(global.app).patch('/sensor/65ecd6fbc66268658ae1fd09')
			expect(res.status).toBe(401)
		})
	})

	describe('Schema validation', () => {
		it('should validate sensorId correctly', async function() {
			const user = await db.createDummyUser()
			const res = await authenticatedAgent(user).patch('/sensor/123')
			expect(res.status).toBe(422)
			expect(res.body.result[0].message).toBe('must match pattern "^[0-9a-fA-F]{24}$"')
		})

		it('should validate name correctly', async function() {
			const user = await db.createDummyUser()
			const res1 = await authenticatedAgent(user).patch('/sensor/65ecd6fbc66268658ae1fd09').send({
				name: ''
			})
			expect(res1.status).toBe(422)
			expect(res1.body.result[0].message).toBe('must NOT have fewer than 1 characters')
			const res2 = await authenticatedAgent(user).patch('/sensor/65ecd6fbc66268658ae1fd09').send({
				name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
			})
			expect(res2.status).toBe(422)
			expect(res2.body.result[0].message).toBe('must NOT have more than 18 characters')
		})
	})

	describe('Logic', () => {
		it('should patch a sensor', async function() {
			const user = await db.createDummyUser()
			const sensor = await db.createDummySensor(user._id)
			const res = await authenticatedAgent(user).patch(`/sensor/${sensor._id}`).send({
				name: 'new name'
			})
			expect(res.status).toBe(200)
			expect(res.body.message).toBe('Sensor updated successfully')
			expect(res.body.sensor.name).toBe('new name')
		})

		it('should error if sensor does not exist', async function() {
			const user = await db.createDummyUser()
			const res = await authenticatedAgent(user).patch('/sensor/65ecd6fbc66268658ae1fd09').send({
				name: 'new name'
			})
			expect(res.status).toBe(404)
			expect(res.body.error.message).toBe('Sensor not found')
		})

		it('should error if sensor does not belong to user', async function() {
			const user1 = await db.createDummyUser({
				username: 'test1',
				email: 'test1@email.com'
			})
			const user2 = await db.createDummyUser({
				username: 'test2',
				email: 'test2@email.com'
			})
			const sensor = await db.createDummySensor(user1._id)
			const res = await authenticatedAgent(user2).patch(`/sensor/${sensor._id}`).send({
				name: 'new name'
			})
			expect(res.status).toBe(404)
			expect(res.body.error.message).toBe('Sensor not found')
		})
	})
})