const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../../entities/user')
const RefreshToken = require('../../entities/refreshToken')

module.exports.post = {
	method: 'POST',
	path: '/auth/login',
	schema: {
		body: {
			type: 'object',
			additionalProperties: false,
			required: ['identity', 'password'],
			properties: {
				identity: {
					type: 'string',
				},
				password: {
					type: 'string',
				},
			},
		},
	},
	handler: async (req, res, next) => {
		const { identity, password } = req.body

		const user = await User.findOne({ $or: [{ username: identity }, { email: identity }] })

		if (!user) return next(new StatusError('Invalid username/email or password', 404))
		if (!user.active) return next(new StatusError('Email not verified', 403))
		if (!user.comparePassword(password)) return next(new StatusError('Invalid username/email or password', 404))

		await RefreshToken.deleteMany({ owner: user._id }) // delete refresh tokens for this user
		const refreshToken = new RefreshToken({
			token: crypto.randomBytes(64).toString('hex'),
			owner: user._id,
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
		})
		await refreshToken.save()

		const token = jwt.sign(
			user.toJWTPayload(),
			process.env.JWT_SECRET,
			{
				expiresIn: process.env.JWT_EXPIRATION_TIME || '1h',
			}
		)
		return res.status(200).send({
			message: 'Logged in successfully',
			token,
			refreshToken: refreshToken.token,
			user: user.toJWTPayload()
		})
	},
}
