const Article = require('../models/Article');
const category = require('../controllers/category');
const Category = require('../models/Category');

const moment = require('moment');
const fs = require('fs');

const now = moment(moment.now().ISO_8601).format('YYYY-MM-DD');

/**
 * @description used to delete file uploaded
 * @param req
 */
function deleteFile(req) {
  if (req.file) {
    const pathFile = `${now}'/'${req.file.fileName}`;
    fs.unlink(pathFile);
  }
}

/**
 * @description used to create tags
 * @param req
 */
function createTags(req) {
  category.postCategory(req);
}

/**
 * GET /admin/list-article
 * list article page
 */
exports.getListArticle = async (req, res) => {
  await Article.find().then((results) => {
    const options = {
      username: req.user.profile.name,
      listArticle: results
    };
    if (req.flash) {
      options.errors = req.flash('errors');
      options.message = req.flash('message');
    }
    res.render('admin/list_article', options);
  }).catch(() => {
    res.render('404');
  });
};

/**
 * GET /admin/create-article
 * create article page
 * @param req
 * @param res
 */
exports.getCreateArticle = async (req, res) => {
  const options = {
    username: req.user.profile.name,
    article: {}
  };
  await Category.find({ type: 'category' }).then((results) => {
    options.listCategory = results;
  });
  // If have query title do get article info and return to response
  if (req.query.title) {
    req.assert('title', 'title is not empty');
    const errors = req.validationErrors();
    if (errors) {
      req.flash('errors', errors);
    }
    await Article.findOne({ title: req.query.title }).then((result) => {
      if (!result) {
        req.flash('errors', { msg: 'article not found' });
      }
      options.article = result;
    }).catch(() => {
      req.flash('errors', { msg: 'article not found' });
    });
  }
  // If has flash in req
  if (req.flash) {
    options.errors = req.flash('errors');
    options.message = req.flash('message');
  }
  console.log(options);
  res.render('admin/create_article', options);
};

/**
 * POST /admin/create-article
 * @param req
 * @param res
 */
exports.postCreateArticle = (req, res) => {
  req.assert('title', 'title is not empty').notEmpty();
  req.assert('articleCategory', 'category is not empty').notEmpty();
  req.assert('tags', 'tags is not empty').notEmpty();
  req.assert('content', 'content is not empty').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
  }
  Article.findOne({ title: req.body.title }).then((existting) => {
    if (existting) {
      req.flash('errors', { msg: 'Title is existing' });
    }
    // Define new article
    const article = new Article({
      title: req.body.title,
      tags: req.body.tags.split(','),
      articleCategory: req.body.articleCategory,
      content: req.body.content
    });
    // If file is exists do add image by filename
    if (req.file) {
      article.image = `${now}/${req.file.filename}`;
    }
    // Save new article
    article.save().then(() => {
      // Define flash to req
      req.flash('message', { msg: 'Create new Articles successful' });
      req.body.name = req.body.tags;
      req.body.type = 'tag';
      createTags(req);
      res.redirect('/admin/create-article');
    }).catch(() => {
      deleteFile(req);
      // Define flash to req
      req.flash('errors', { msg: 'Create article failed' });
      res.redirect('/admin/create-article');
    });
  }).catch((err) => {
    // If save fail do delete file uploaded
    deleteFile(req);
    req.flash('errors', err);
    res.redirect('/admin/create-article');
  });
};

/**
 * POST /admin/update-article
 * @param req
 * @param res
 */
exports.postUpdateArticle = (req, res) => {
  console.log(req);
  req.assert('title', 'title is not empty').notEmpty();
  req.assert('articleCategory', 'category is not empty').notEmpty();
  req.assert('tags', 'tags is not empty').notEmpty();
  req.assert('content', 'content is not empty').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/admin/create-article');
  }
  const article = {
    title: req.body.title,
    tags: req.body.tags.split(','),
    articleCategory: req.body.articleCategory,
    content: req.body.content
  };
  if (req.file) {
    article.image = `${now}/${req.file.filename}`;
  }
  const redirectPath = '/admin/create-article?title=' + req.body.title;
  Article.findOneAndUpdate({ title: req.body.title }, article).then((success) => {
    if (success) {
      req.flash('message', { msg: 'Update article success' });
      res.redirect(redirectPath);
    }
  }).catch(() => {
    deleteFile(req);
    req.flash('errors', { msg: 'Update article fail' });
    res.redirect(redirectPath);
  });
};

/**
 * GET /admin/delete-article
 * delete article
 * @param req
 * @param res
 */
exports.getDeleteArticle = (req, res) => {
  req.assert('title', 'title is not empty').notEmpty();
  Article.findOneAndRemove({ title: req.query.title }).then((success) => {
    if (success) {
      req.flash('message', { msg: 'Article was deleted' });
      res.redirect('/admin/list-article');
    }
    console.log(success);
    req.flash('errors', { msg: 'Delete article failed' });
    res.redirect('/admin/list-article');
  }).catch(() => {
    req.flash('errors', { msg: 'Delete article failed' });
    res.redirect('/admin/list-article');
  });
};
