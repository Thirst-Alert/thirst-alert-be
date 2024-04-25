const mongoose = require('mongoose')
const { Schema } = mongoose

const refreshTokenSchema = new Schema({
	token: String,
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	expiresAt: {
		type: Date,
		expires: 0
	},
}, {
	collection: 'refreshToken',
})

refreshTokenSchema.index({ token: 1 })

module.exports = mongoose.model('refreshToken', refreshTokenSchema)