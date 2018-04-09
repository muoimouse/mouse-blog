const Comment = require('../models/Comment');

/**
 * @description use to update comment info
 * @param req
 * @param res
 * @param updateParams
 */
function updateComment(req, res, updateParams) {
  Comment.findOneAndUpdate({ _id: updateParams._id }, updateParams).then(() => {
    req.flash('message', { msg: 'Update comment successful' });
    res.redirect('/admin/list-comment');
  }).catch(() => {
    req.flash('errors', { msg: 'Update comment fail' });
    res.redirect('/admin/list-comment');
  });
}

/**
 * @description use to get all comment info
 * @param req
 * @param res
 */
exports.getAllComment = (req, res) => {
  Comment.find().then((results) => {
    const options = {
      comments: results
    };
    res.render('admin/list_comment', options);
  });
};


/**
 * @function deleteComment
 * @description use to delete comment info
 * @param req
 * @param res
 */
exports.deleteComment = (req, res) => {
  req.assert('id', 'id cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
  }
  Comment.findOneAndRemove({ _id: req.query.id }).then(() => {
    res.redirect('/admin/list-comment');
  }).catch(() => {
    req.flash('errors', { msg: 'Delete comment failed' });
    res.redirect('/admin/list-comment');
  });
};

/**
 * @description use to update comment
 * @param req
 * @param res
 */
exports.updateComment = (req, res) => {
  if (req.user._id !== req.body.userId) {
    req.flash('errors', { msg: 'permission denied' });
    req.render('404');
  }

  req.assert('id', 'id can not be blank').notEmpty();
  req.assert('username', 'username can not be blank').notEmpty();
  req.assert('userId', 'userId can not be blank').notEmpty();
  req.assert('content', 'content can not be blank').notEmpty();
  req.assert('articleTitle', 'article title can not be blank').notEmpty();
  req.assert('articleId', 'article id can not be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
  }

  const updateParams = {
    _id: req.body.id,
    username: req.body.username,
    userId: req.body.userId,
    content: req.body.content,
    articleTitle: req.body.articleTitle,
    articleId: req.body.articleId,
    replyTo: req.body.replyTo,
  };
  // update comment using function updateComment
  return updateComment(req, res, updateParams);
};

/**
 * @description use to update active in comment
 * @param req
 * @param res
 */
exports.updateActiveComment = (req, res) => {
  req.assert('id', 'id can not be blank').notEmpty();
  req.assert('active', 'actice can not be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
  }

  const updateParams = {
    _id: req.query.id,
    active: req.query.active
  };

  return updateComment(req, res, updateParams);
};

exports.createComment = (req, res) => {
  req.assert('username', 'username can not be blank').notEmpty();
  req.assert('userId', 'userId can not be blank').notEmpty();
  req.assert('content', 'content can not be blank').notEmpty();
  req.assert('articleTitle', 'article title can not be blank').notEmpty();
  req.assert('articleId', 'article id can not be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
  }

  const createParams = {
    username: req.body.username,
    userId: req.body.userId,
    content: req.body.content,
    articleTitle: req.body.articleTitle,
    articleId: req.body.articleId,
    replyTo: req.body.replyTo,
  };

  Comment.save(createParams).then(() => {
    req.flash('message', 'create comment successful');
    res.redirect();
  }).catch(() => {
    req.flash('errors', 'create comment fail');
  });
};

