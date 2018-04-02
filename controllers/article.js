const Article = require('../models/Article');
const moment = require('moment');
const fs = require('fs');

const now = moment(moment.now().ISO_8601).format('YYYY-MM-DD');

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

/**
 * GET /admin/create-article
 * create article page
 * @param req
 * @param res
 */
exports.getCreateArticle = (req, res) => {
  res.render('admin/create_article');
};

/**
 * POST /admin/create-article
 * @param req
 * @param res
 */
exports.postCreateArticle = (req, res) => {
  console.log('aaaa');
  console.log(req.file);
  req.assert('title', 'title is not empty').notEmpty();
  req.assert('articleCategory', 'category is not empty').notEmpty();
  req.assert('tags', 'tags is not empty').notEmpty();
  req.assert('content', 'content is not empty').notEmpty();
  Article.findOne({ title: req.body.title }).then((existting) => {
    if (existting) {
      req.flash('errors', 'Title is existing');
    }
    // Create new article
    const article = new Article({
      title: req.body.title,
      tags: req.body.tags.split(','),
      articleCategory: req.body.articleCategory,
      content: req.body.content
    });
    if (req.file) {
      article.image = `${now}/${req.file.filename}`;
    }
    article.save().then((success) => {
      req.flash('message', 'Create new Articles successful');
      res.redirect('/admin/create-article');
    }).catch((err) => {
      deleteFile(req);
      req.flash('errors', err);
      res.redirect('/admin/create-article');
    });
  }).catch((err) => {
    deleteFile(req);
    req.flash('errors', err);
    res.redirect('/admin/create-article');
  });
};

/**
 * @description used to delete file uploaded
 * @param req
 */
function deleteFile(req) {
  if (req.file) {
    const pathFile = now + '/' + req.file.fileName;
    fs.unlink(pathFile);
  }
}