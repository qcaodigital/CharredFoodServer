const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuItemSchema = new Schema({
	name: { type: String, required: true },
	category: { type: Schema.ObjectId, ref: 'Category' },
	price: { type: Number, required: true },
	options: {
		type: [
			{
				option_name: { type: String, required: true },
				option_price: { type: Number, required: true },
			},
		],
	},
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
