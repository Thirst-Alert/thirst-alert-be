const { mailer } = require('../../config')
const User = require('../../entities/user')
const VerifyEmailToken = require('../../entities/verifyEmailToken')

const generateToken = () => {
	const max = Math.pow(10, 7)
	const min = max / 10
	const rndInt = Math.floor(Math.random() * (max - min + 1) ) + min

	return ('' + rndInt).substring(1)
}

module.exports.post = {
	method: 'POST',
	path: '/auth/register',
	schema: {
		body: {
			type: 'object',
			additionalProperties: false,
			required: ['username', 'email', 'password'],
			properties: {
				username: {
					type: 'string',
				},
				email: {
					type: 'string',
					format: 'email',
				},
				password: {
					type: 'string',
				},
			},
		},
	},
	handler: async (req, res, next) => {
		const { username, email, password } = req.body

		const existingUsername = await User.findOne({ username })
		const existingEmail = await User.findOne({ email })
		if (existingUsername) return next(new StatusError('Username already in use', 409))
		if (existingEmail) return next(new StatusError('Email already in use', 409))

		try {
			// probably should be a transaction, but mongo support transactions only for replica sets.
			// this could fail at any point, and data could be inconsistent
			// consider switching to replica set
			const newUser = await User.create({
				username,
				email,
				password
			})

			const verifyEmailToken = await VerifyEmailToken.create({
				token: generateToken(),
				owner: newUser._id
			})

			await mailer.sendMail({
				to: email,
				subject: 'Thirst Alert - Verify your email address',
				template: 'verifyEmail',
				context: {
					username: newUser.username,
					token: verifyEmailToken.token.split('')
				}
			})

			res.status(201).send({ message: 'User registered successfully', user: newUser.toJWTPayload() })
		} catch (error) {
			next(new StatusError('Something went wrong while registering user', 500))
		}
	}
}

module.exports.verify = {
	method: 'POST',
	path: '/auth/verify',
	schema: {
		body: {
			type: 'object',
			additionalProperties: false,
			required: ['token', 'identity'],
			properties: {
				token: {
					type: 'string',
				},
				identity: {
					type: 'string',
				},
			},
		},
	},
	handler: async (req, res, next) => {
		const { token, identity } = req.body

		const verifyEmailToken = await VerifyEmailToken.findOne({ token }).populate('owner')
		if (!verifyEmailToken) return next(new StatusError('Invalid token', 400))
		const user = verifyEmailToken.owner
		if (user.email !== identity && user.username !== identity) return next(new StatusError('Invalid token', 400))

		await User.updateOne({ _id: user._id }, { active: true })
		await VerifyEmailToken.deleteOne({ _id: verifyEmailToken._id })

		res.status(200).send({ message: 'Email verified successfully' })
	}
}