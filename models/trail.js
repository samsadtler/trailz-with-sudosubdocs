var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var stepEntry = new Schema({
	stepID: Number,
	siteTile: String,
	favicon: String,
	url: String,
	highlight:String,
	note: String,
	parentURL: [String],
	childrenURL: [String],
	tags: [String],
	dateAdded : { type: Date, default: Date.now },
	dateAccessed : { type: Date, default: Date.now }, 
})

var trailEntry = new Schema({
	trailID: Number,
	title: String,
	steps: [stepEntry],
	dateAdded : { type: Date, default: Date.now },
	dateAccessed : { type: Date, default: Date.now }, 
})
module.exports = mongoose.model('TrailEntry', trailEntry);