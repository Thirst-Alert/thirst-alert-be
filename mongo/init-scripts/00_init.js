/* eslint no-undef: OFF */

db.createUser({
	user: process.env.MONGO_USER,
	pwd: process.env.MONGO_PASSWORD,
	roles: [{ role: 'readWrite', db: process.env.MONGO_DB }]
})

db.auth(process.env.MONGO_USER, process.env.MONGO_PASSWORD)

db.getSiblingDB(process.env.MONGO_DB)

db.user.insertMany([
	{ 
		username: 'Massi' ,
		email: 'massi@email.com',
		password: '12345678',
		role: 'admin',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{ 
		username: 'Alsje' ,
		email: 'alsje@email.com',
		password: '12345678',
		role: 'admin',
		createdAt: new Date(),
		updatedAt: new Date(),
	}
])