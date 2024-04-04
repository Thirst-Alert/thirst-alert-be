const request = require('supertest')
const { db, authenticatedAgent } = require('../../helpers')

afterEach(async () => {
	await db.dropCollections()
})

describe('GET /measurement/:sensorId', () => {
	describe('Authentication', () => {
		it('should return 401 if client is not authenticated', async function () {
			const res = await request(global.app).get('/measurement/65ecd6fbc66268658ae1fd09')
			expect(res.status).toBe(401)
		})
	})

	describe('Schema validation', () => {
		it('should validate sensorId correctly', async function() {
			const user = await db.createDummyUser()
			const res = await authenticatedAgent(user).get('/measurement/123')
			expect(res.status).toBe(422)
			expect(res.body.result[0].message).toBe('must match pattern "^[0-9a-fA-F]{24}$"')
		})

		it('should validate limit correctly', async function() {
			const user = await db.createDummyUser()
			const res1 = await authenticatedAgent(user).get('/measurement/65ecd6fbc66268658ae1fd09?limit=0')
			expect(res1.status).toBe(422)
			expect(res1.body.result[0].message).toBe('must be >= 48')
			const res2 = await authenticatedAgent(user).get('/measurement/65ecd6fbc66268658ae1fd09?limit=1537')
			expect(res2.status).toBe(422)
			expect(res2.body.result[0].message).toBe('must be <= 1536')
			const res3 = await authenticatedAgent(user).get('/measurement/65ecd6fbc66268658ae1fd09?limit=test')
			expect(res3.status).toBe(422)
			expect(res3.body.result[0].message).toBe('must be integer')
		})

		it('should validate offset correctly', async function() {
			const user = await db.createDummyUser()
			const res1 = await authenticatedAgent(user).get('/measurement/65ecd6fbc66268658ae1fd09?offset=-1')
			expect(res1.status).toBe(422)
			expect(res1.body.result[0].message).toBe('must be >= 0')
			const res2 = await authenticatedAgent(user).get('/measurement/65ecd6fbc66268658ae1fd09?offset=test')
			expect(res2.status).toBe(422)
			expect(res2.body.result[0].message).toBe('must be integer')
		})

		it('should validate sort correctly', async function() {
			const user = await db.createDummyUser()
			const res1 = await authenticatedAgent(user).get('/measurement/65ecd6fbc66268658ae1fd09?sort=0')
			expect(res1.status).toBe(422)
			expect(res1.body.result[0].message).toBe('must be equal to one of the allowed values')
			const res2 = await authenticatedAgent(user).get('/measurement/65ecd6fbc66268658ae1fd09?sort=test')
			expect(res2.status).toBe(422)
			expect(res2.body.result[0].message).toBe('must be integer')
		})

		it('should validate startDate correctly', async function() {
			const user = await db.createDummyUser()
			const res = await authenticatedAgent(user).get('/measurement/65ecd6fbc66268658ae1fd09?startDate=notadate')
			expect(res.status).toBe(422)
			expect(res.body.result[0].message).toBe('must match format "date-time"')
		})
	})

	describe('Logic', () => {
		it('should return measurements for a sensor', async function() {
			const user = await db.createDummyUser()
			const sensor = await db.createDummySensor(user._id)
			await db.createDummyMeasurement(sensor._id, {
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 0)
			})
			await db.createDummyMeasurement(sensor._id, {
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1)
			})
			await db.createDummyMeasurement(sensor._id, {
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
			})
			const res1 = await authenticatedAgent(user).get(`/measurement/${sensor._id}`)
			expect(res1.status).toBe(200)
			expect(res1.body.message).toBe('Measurements fetched successfully')
			expect(res1.body.measurements.length).toBe(1)
			const res2 = await authenticatedAgent(user).get(`/measurement/${sensor._id}?limit=48`)
			expect(res2.body.measurements.length).toBe(1)
			const res3 = await authenticatedAgent(user).get(`/measurement/${sensor._id}?offset=2`)
			expect(res3.body.measurements.length).toBe(1)
			const res4 = await authenticatedAgent(user).get(`/measurement/${sensor._id}?sort=-1`)
			expect(res4.body.measurements.length).toBe(1)
			const res5 = await authenticatedAgent(user).get(`/measurement/${sensor._id}?startDate=${new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString()}`)
			expect(res5.body.measurements.length).toBe(1)
		})

		it('should error if sensor does not exist', async function() {
			const user = await db.createDummyUser()
			const res = await authenticatedAgent(user).get('/measurement/65ecd6fbc66268658ae1fd09')
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
			const res = await authenticatedAgent(user2).get(`/measurement/${sensor._id}`)
			expect(res.status).toBe(404)
			expect(res.body.error.message).toBe('Sensor not found')
		})
	})
})