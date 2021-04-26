const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
	name: { type: String, required: true },
	items: [{ type: Schema.ObjectId, ref: 'MenuItem' }],
});

module.exports = mongoose.model('Category', categorySchema);
