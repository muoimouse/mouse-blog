const Article = require('../models/Article');
const moment = require('moment');

/**
 * GET /admin/list-article
 * list article page
 */
exports.getListArticle = (req, res) => {
  Article.find().then((results) => {
    res.render('admin/list_article', {
      listArticle: results
    });
  }).catch((err) => {
    res.render('404');
  });
};

exports.getCreateArticle = (req, res) => {
  res.render('admin/create_article');
};
