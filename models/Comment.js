const mongoose = require('mongoose');

const commentScheema = new mongoose.Schema({
  username: { type: String, default: 'Anonymous' },
  email: String,
  content: String,
  articleName: String,
  replyTo: Object,
  active: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

commentScheema.set('autoIndex', true);

const Comment = mongoose.model('Comment', commentScheema);

module.exports = Comment;

