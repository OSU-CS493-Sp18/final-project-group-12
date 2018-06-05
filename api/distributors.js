const router = require('express').Router();
const validation = require('../lib/validation');

/*
 * Schema describing required/optional fields of a review object.
 */
const distributorsSchema = {
  name: { required: true },
  address: { required: true },
  state: { required: true },
  zip: { required: true },
  owner: { required: false },
  phone: { required: true }

};


router.get('/', function(req, res){

});

router.get('/:id', function(req, res){

});

router.get('/:id/beers', function(req, res){

});

router.post('/', function(req, res){

});

router.patch('/:id', function(req, res){

});

router.delete('/:id', function(req, res){

});

exports.router = router;
