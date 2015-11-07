var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var stepSchema = new Schema({
	title: String,
	text: String,
	note: String,
	favicon: String,
	// name: {type: String, required: true}, // this version requires this field to exist
	// name: {type: String, unique: true}, // this version requires this field to be unique in the db
	tags: [String],
	url: String,
	location: {
		geo: { type: [Number], index: { type: '2dsphere', sparse: true } },
		name: String
	},	
	dateAdded : { type: Date, default: Date.now },
})
// var stepEntry = new Schema({
// 	stepID: Number,
// 	siteTile: String,
// 	favicon: String,
// 	url: String,
// 	highlight:String,
// 	note: String,
// 	parentURL: [String],
// 	childrenURL: [String],
// 	tags: [String],
// 	dateAdded : { type: Date, default: Date.now },
// 	dateAccessed : { type: Date, default: Date.now }, 
// })

var trailEntry = new Schema({
	title: String,
	steps: [stepSchema],
	dateAdded : { type: Date, default: Date.now },
	dateAccessed : { type: Date, default: Date.now }, 
})

// export 'Animal' model so we can interact with it in other files
// module.exports = mongoose.model('Trail',trailEntry);
module.exports = mongoose.model('Step',stepSchema);