const mongoose = require('mongoose')
const { Schema } = mongoose

const measurementSchema = new Schema({
	moisture: {
		type: Number,
		required: true
	},
	temperature: {
		type: Number,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	metadata: {
		sensorId: {
			type: Schema.Types.ObjectId,
			ref: 'sensor'
		}
	}
}, {
	collection: 'measurement',
	timeseries: {
		timeField: 'createdAt',
		metaField: 'metadata',
		granularity: 'minutes',
	},
	methods: {
		toJSON() {
			return {
				moisture: this.moisture,
				temperature: this.temperature,
				createdAt: this.createdAt
			}
		}
	}
	// expireAfterSeconds: 10
})

// measurementSchema.index(
//   { 'createdAt': 1 },
//   {
//     expireAfterSeconds: 10,
//     partialFilterExpression: { 'metadata.sensorId': { $exists: true } }
//   }
// )

measurementSchema.pre('save', function(next) {
	if (!this.isModified('moisture')) return next()
	this.moisture = Math.round(this.moisture / 10)
	next()
})

module.exports = mongoose.model('measurement', measurementSchema)