const router = require('express').Router();
const validation = require('../lib/validation');

/*
 * Schema describing required/optional fields of a distributor object.
 */
const distributorSchema = {
    name: { required: true },
    address: { required: true },
    state: { required: true },
    zip: { required: true },
    owner: { required: false },
    phone: { required: true }

};


// GET /distributors
router.get('/', function(req, res) {

    res.status(200).send("GET distributors");
});


// GET /distributors/{id}
router.get('/:id', function(req, res) {

    res.status(200).send("GET distributors/:id");
});


// GET /distributors/{id}/beers
router.get('/:id/beers', function(req, res) {

    res.status(200).send("GET distributors/:id/beers");
});


// POST /distributors
router.post('/', function(req, res) {

    res.status(200).send("POST distributors");
});


// PATCH /distributors/{id}
router.patch('/:id', function(req, res) {

    res.status(200).send("PATCH distributors/:id");
});


// DELETE /distributors/{id}
router.delete('/:id', function(req, res) {

    res.status(200).send("DELETE distributors/:id");
});


exports.router = router;