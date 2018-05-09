const Article = require('../models/Article');

/**
 * Get last article
 * @param req
 * @param res
 */
exports.getLastArticle = (req, res) => {
  const { tags, keyword, articleCategory } = req.query;
  const response = {};
  const search = {};
  if (tags) {
    search.tags = { $in: [tags] };
  }
  if (keyword) {
    search.keyword = new RegExp(keyword, 'i');
  }
  if (articleCategory) {
    search.articleCategory = articleCategory;
  }
  Article.find(search).sort('-createdAt').limit(1)
    .then((results) => {
      response.data = results;
      res.json(response);
    })
    .catch(() => {
      res.json({ error: 'get article fail' });
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
