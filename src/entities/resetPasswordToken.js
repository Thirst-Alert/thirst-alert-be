const mongoose = require('mongoose')
const crypto = require('crypto')
const { Schema } = mongoose

const resetPasswordTokenSchema = new Schema({
	token: {
		type: String,
		default: () => crypto.randomBytes(64).toString('hex'),
		required: true
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	expiresAt: {
		type: Date,
		default: Date.now() + 1000 * 60 * 60,
		expires: 0
	},
}, {
	collection: 'resetPasswordToken',
})

resetPasswordTokenSchema.index({ owner: 1 })

resetPasswordTokenSchema.pre('save', async function(next) {
	await mongoose.model('resetPasswordToken').deleteMany({ owner: this.owner })
	next()
})

module.exports = mongoose.model('resetPasswordToken', resetPasswordTokenSchema)