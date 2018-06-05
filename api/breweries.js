const router = require('express').Router();
const validation = require('../lib/validation');

/*
 * Schema describing required/optional fields of a photo object.
 */
const breweriesSchema = {
  name: { required: true },
  locations: { required: true },
  address: { required: false },
  state: { required: true },
  zip: { required: true },
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
