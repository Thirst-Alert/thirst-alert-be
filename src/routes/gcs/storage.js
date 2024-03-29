const { Storage } = require('@google-cloud/storage')

const storage = new Storage({
	projectId: 'thirst-alert-app',
	...process.env.NODE_ENV === 'local' && {keyFilename: 'key.json'}
})

const GET_EXPIRES_IN_SECONDS = 60
const PUT_EXPIRES_IN_SECONDS = 300

module.exports = {
	signGetURL: async (fileName) => {
		const [url] = await storage
			.bucket(process.env.GCS_SENSOR_BUCKET)
			.file(fileName)
			.getSignedUrl({
				version: 'v4',
				action: 'read',
				expires: Date.now() + GET_EXPIRES_IN_SECONDS * 1000,
			})

		return url
	},

	signPutURL: async (fileName) => {
		const [url] = await storage
			.bucket(process.env.GCS_SENSOR_BUCKET)
			.file(fileName)
			.getSignedUrl({
				version: 'v4',
				action: 'write',
				expires: Date.now() + PUT_EXPIRES_IN_SECONDS * 1000,
			})

		return url
	}
}