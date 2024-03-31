const mongoose = require('mongoose')
const { Schema } = mongoose

const sensorSchema = new Schema({
	name: {
		type: String,
		maxlength: 18,
		trim: true,
		default: ''
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'user',
		required: true
	},
	active: {
		type: Boolean,
		default: true
	},
	thirstLevel: {
		type: Schema.Types.Number,
		enum: [ 0, 1, 2 ],
		default: 1
	},
	hasCustomImage: {
		type: Boolean,
		default: false
	}
}, {
	collection: 'sensor',
	timestamps: true,
	methods: {
		toJSON() {
			return {
				id: this._id,
				name: this.name,
				active: this.active,
				thirstLevel: this.thirstLevel,
				hasCustomImage: this.hasCustomImage
			}
		}
	}
})

module.exports = mongoose.model('sensor', sensorSchema)