const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const path = require('path')
const handlebars = require('express-handlebars')
const { strategy } = require('./middlewares/passport-config')
const reqLogger = require('./middlewares/reqLogger')
const { noPathHandler, errorHandler } = require('./middlewares/errors')
const { server, mongo } = require('./config')

const app = express()
app.set('view engine', 'handlebars')
app.engine('handlebars', handlebars.engine({ defaultLayout: false }))
app.set('views', path.resolve(__dirname, 'html', 'views'))

passport.use(strategy)

mongoose.connect(mongo.uri, {
	ssl: false
})
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'))
if (process.env.NODE_ENV === 'local') {
	mongoose.connection.once('open', () => {
		console.log('Connected to MongoDB')
	})
}

app.use(express.json())
app.use(reqLogger)

const router = require('express').Router()
require('./routes/routes').attachRoutes(router)
app.use(router)
app.use(noPathHandler)
app.use(errorHandler)

const httpServer = app.listen(server.port, () => {
	if (process.env.NODE_ENV === 'local') console.log(`Server is running at http://localhost:${server.port}`)
})

module.exports = {
	app,
	httpServer,
	dbConnection: mongoose.connection
}