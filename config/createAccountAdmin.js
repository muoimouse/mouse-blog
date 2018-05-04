const User = require('../models/User');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

console.log('Creating Account');
dotenv.load({ path: '.env.example' });
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://mongo:27017/mouse-blog').then(() => {
  const user = new User({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    userCategory: 'admin'
  });
  User.findOne({ email: user.email }).then((results) => {
    if (!results) {
      return user.save().then(() => {
        console.log('Account created');
      }).then(() => { mongoose.connection.close(); }).catch(() => { console.log('Create account fail'); });
    }
    console.log('Account is existing');
    mongoose.connection.close();
  }).catch((err) => { console.log(err); });
}).catch((err) => { console.log(err); });
