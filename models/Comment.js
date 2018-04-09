const mongoose = require('mongoose');

const commentScheema = new mongoose.Schema({
  userId: Object,
  username: { type: String, default: 'Anonymous' },
  content: String,
  articleTitle: String,
  articleId: Object,
  replyTo: {
    type: Object,
    default: null
  },
  active: {
    type: Boolean,
    default: true
  },
}, { timestamps: true });

commentScheema.set('autoIndex', true);

const Comment = mongoose.model('Comment', commentScheema);

module.exports = Comment;

