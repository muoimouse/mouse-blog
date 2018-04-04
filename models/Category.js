const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, unique: true },
  type: { type: String, default: 'tag' }
}, { timestamp: true });

categorySchema.set('autoIndex', true);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
