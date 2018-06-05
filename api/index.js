const router = module.exports = require('express').Router();

router.use('/beer', require('./beer').router);
router.use('/reviews', require('./breweries').router);
router.use('/photos', require('./distributors').router);
// router.use('/users', require('./users').router);
