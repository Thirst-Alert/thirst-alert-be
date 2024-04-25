const mongoose = require('mongoose')
const { Schema } = mongoose

const verifyEmailTokenSchema = new Schema({
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
	collection: 'verifyEmailToken',
})

verifyEmailTokenSchema.index({ token: 1 })

module.exports = mongoose.model('verifyEmailToken', verifyEmailTokenSchema)