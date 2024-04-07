const jwt = require('jsonwebtoken')
const RefreshToken = require('../../entities/refreshToken')

module.exports.post = {
	method: 'POST',
	path: '/auth/refresh',
	schema: {
		body: {
			type: 'object',
			additionalProperties: false,
			required: ['refreshToken', 'username'],
			properties: {
				refreshToken: {
					type: 'string',
				},
				username: {
					type: 'string',
				},
			}
		}
	},
	handler: async (req, res, next) => {
		const { refreshToken, username } = req.body

		try {
			const refreshTokenDoc = await RefreshToken.findOne({ token: refreshToken }).populate('owner')
			if (!refreshTokenDoc) {
				return next(new StatusError('Invalid refresh token', 403))
			}
			if (refreshTokenDoc.owner.username !== username) {
				return next(new StatusError('Invalid refresh token', 403))
			}
			if (refreshTokenDoc.expiresAt < new Date()) {
				return next(new StatusError('Refresh token expired', 403))
			}

			const newToken = jwt.sign(
				refreshTokenDoc.owner.toJWTPayload(),
				process.env.JWT_SECRET,
				{
					expiresIn: process.env.JWT_EXPIRATION_TIME || '1h'
				}
			)
			res.status(200).send({ message: 'New access token generated', token: newToken })
		} catch (error) {
			return next(new StatusError('Something went wrong while refreshing access token', 500))
		}
	},
}