const Article = require('../models/Article');

/**
 * Get last article
 * @param req
 * @param res
 */
exports.getLastArticle = (req, res) => {
  const response = {};
  Article.find().sort('-createdAt').then((results) => {
    response.data = results;
    res.json(response);
  }).catch(() => {
    res.json({ error: 'get top article fail' });
  });
};

/**
 * Get article info
 * @param req
 * @param res
 */
exports.getArticleInfo = (req, res) => {
  const response = {};
  req.assert('id', 'id can not be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    response.errors = errors.msg;
  }

  Article.findOne({
    _id: req.query.id,
  }).then((result) => {
    response.data = result || {};
    res.json(response);
  }).catch(() => {
    response.errors = 'get article fail';
    res.json(response);
  });
};

/**
 * Get article by tag
 * @param req
 * @param res
 */
exports.getArticleByTag = (req, res) => {
  console.log(req.query);
  const response = {};
  req.assert('tag', 'tag can not be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    response.errors = errors.msg;
  }

  Article.find({
    tags: { $in: [req.query.tag] }
  }).sort('-createdAt').then((results) => {
    response.data = results || [];
    res.json(response);
  }).catch(() => {
    response.errors = 'get articles by tag fail';
    res.json(response);
  });
};

/**
 * Get article by category
 * @param req
 * @param res
 */
exports.getArticleByCategory = (req, res) => {
  console.log(req.query);
  const response = {};
  req.assert('category', 'category can not be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    response.errors = errors.msg;
  }

  Article.find({
    articleCategory: req.query.category
  }).sort('-createdAt').then((results) => {
    response.data = results || [];
    res.json(response);
  }).catch(() => {
    response.errors = 'get articles by category fail';
    res.json(response);
  });
};
