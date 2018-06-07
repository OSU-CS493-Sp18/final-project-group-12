const router = module.exports = require('express').Router();

router.use('/beer', require('./beer').router);
router.use('/breweries', require('./breweries').router);
router.use('/distributors', require('./distributors').router);
// router.use('/users', require('./users').router);