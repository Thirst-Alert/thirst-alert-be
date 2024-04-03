const mailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')

require('dotenv').config()

const transport = mailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		type: 'OAuth2',
		user: 'noreply@thirst-alert.com',
		clientId: process.env.MAILER_CLIENT_ID,
		clientSecret: process.env.MAILER_CLIENT_SECRET,
		refreshToken: process.env.MAILER_REFRESH_TOKEN,
		accessToken: process.env.MAILER_ACCESS_TOKEN
	},
})

const hbsOptions = {
	viewEngine: {
		partialsDir: path.resolve(__dirname, 'html', 'emails'),
		defaultLayout: false,
	},
	viewPath: path.resolve(__dirname, 'html', 'emails')
}

transport.use('compile', hbs(hbsOptions))

module.exports = {
  server: {
    baseUrl: process.env.BASE_URL,
    port: process.env.PORT || 3000,
  },
  mongo: {
   // uri: "mongodb://ta-dev:6vplssi5a16Oi4We@localhost:27017/ta-dev?replicaSet=rs0",
    uri: process.env.NODE_ENV === 'local'
    	? `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@127.0.0.1:27017/${process.env.MONGO_DB}?replicaSet=rs0`
    	: process.env.MONGO_URI,
  },
  mailer: transport,
};