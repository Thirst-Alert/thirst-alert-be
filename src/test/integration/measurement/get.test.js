const request = require('supertest')
const { db, authenticatedAgent } = require('../../helpers')

afterEach(async () => {
	await db.dropCollections()
})

describe('GET /measurement/:sensorId', () => {
	describe('Authentication', () => {
		it('should return 401 if client is not authenticated', async function () {
			const res = await request(global.app).get('/measurement/65ecd6fbc66268658ae1fd09?view=week')
			expect(res.status).toBe(401)
		})
	})

	describe('Schema validation', () => {
		it('should validate sensorId and view correctly', async function() {
			const user = await db.createDummyUser()
			const res = await authenticatedAgent(user).get('/measurement/123?view=week')
			expect(res.status).toBe(422)
			expect(res.body.result[0].message).toBe('must match pattern "^[0-9a-fA-F]{24}$"')
			const res1 = await authenticatedAgent(user).get('/measurement/65ecd6fbc66268658ae1fd09?view=something')
			expect(res1.status).toBe(422)
			expect(res1.body.result[0].message).toBe('must be equal to one of the allowed values')			
		})
	})

	describe('Logic', () => {
		it('should error if sensor does not exist', async function() {
			const user = await db.createDummyUser()
			const res = await authenticatedAgent(user).get('/measurement/65ecd6fbc66268658ae1fd09?view=week')
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
			const res = await authenticatedAgent(user2).get(`/measurement/${sensor._id}?view=week`)
			expect(res.status).toBe(404)
			expect(res.body.error.message).toBe('Sensor not found')
		})
	})
})