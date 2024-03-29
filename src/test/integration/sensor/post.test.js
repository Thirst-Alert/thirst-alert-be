const request = require('supertest')
const { db, authenticatedAgent } = require('../../helpers')
const { ObjectId } = require('mongodb')

afterEach(async () => {
	await db.dropCollections()
})

describe('POST /sensor', () => {
	describe('Authentication', () => {
		it('should return 401 if client is not authenticated', async function () {
			const res = await request(global.app).post('/sensor')
			expect(res.status).toBe(401)
		})
	})

	// describe('Schema validation', () => {
	// })

	describe('Logic', () => {
		it('should create a sensor with authenticated user as its owner', async function() {
			const user = await db.createDummyUser()
			const res = await authenticatedAgent(user).post('/sensor').send({
				name: 'test'
			})
			expect(res.status).toBe(200)
			expect(res.body.message).toBe('Sensor created successfully')
			expect(res.body.sensor.name).toBe('')
			const sensor = await global.dbConnection.models.sensor.findOne({ owner: new ObjectId(user._id) })
			expect(sensor).toBeDefined()
			expect(sensor.owner.toString()).toBe(user._id.toString())
		})
	})
})