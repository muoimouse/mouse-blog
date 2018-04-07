const Comment = require('../models/Comment');

/**
 * @description use to get all comment info
 */
exports.getAllComment = (req, res) => {
  Comment.find().then((results) => {
    let options = {
      comments: results
    };
    res.render('admin/list_comment', options);
  });
};

exports.getComment = (req, res) => {
  req.assert('id', 'Id is not empty').notEmpty();

  // check errors
  const errors = req.validatorError();

  if (errors) {
    req.flash('errors', errors);
  }

  Comment.findOne({  })
};
