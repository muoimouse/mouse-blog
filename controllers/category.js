const Category = require('../models/Category');
const moment = require('moment');

function saveCategory(req, res) {
  const redirectPath = '/admin/create-category';
  const category = new Category({
    name: req.categoryName || req.body.name,
    type: req.body.type
  });
  category.save().then(() => {
    req.flash('message', { msg: 'create category success' });
    res.redirect(redirectPath);
  }).catch(() => {
    req.flash('errors', { msg: 'create category fail' });
    res.redirect(redirectPath);
  });
}

/**
 * GET /admin/list-category
 * get category page
 * @param req
 * @param res
 */
exports.getListCategory = (req, res) => {
  Category.find().then((results) => {
    const options = {
      listCategory: results,
      mnt: moment
    };
    if (req.flash) {
      options.errors = req.flash('errors');
      options.message = req.flash('message');
    }
    res.render('admin/list_category', options);
  }).catch(() => {
    res.redirect('/404');
  });
};

exports.getCreateCategory = (req, res) => {
  const options = {};
  if (req.flash) {
    options.errors = req.flash('errors');
    options.message = req.flash('message');
  }
  res.render('admin/create_category', options);
};

/**
 * POST /admin/create-category
 * @param req
 * @param res
 */
exports.postCategory = (req, res) => {
  console.log(req);
  const redirectPath = '/admin/create-category';
  req.assert('name', 'name is not empty').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
  }
  const listName = req.body.name.split(',');
  for (const i in listName) {
    Category.findOne({ name: listName[i] }).then((result) => {
      if (!result) {
        req.categoryName = listName[i];
        saveCategory(req, res);
      }
    }).catch(() => {
      req.flash('errors', { msg: 'create category fail' });
      res.redirect(redirectPath);
    });
  }
};
