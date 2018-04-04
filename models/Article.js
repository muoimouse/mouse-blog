const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, unique: true },
  content: String,
  author: {
    type: String,
    default: 'Mouse'
  },
  tags: Array,
  articleCategory: String,
  image: String
}, { timestamps: true });

articleSchema.set('autoIndex', true);

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
