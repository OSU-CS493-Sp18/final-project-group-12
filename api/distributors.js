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


router.get('/', function(req, res) {

    res.status(200).send("GET distributors");
});


router.get('/:id', function(req, res) {

    res.status(200).send("GET distributors/:id");
});


router.get('/:id/beers', function(req, res) {

    res.status(200).send("GET distributors/:id/beers");
});


router.post('/', function(req, res) {

    res.status(200).send("POST distributors");
});


router.patch('/:id', function(req, res) {

    res.status(200).send("PATCH distributors/:id");
});


router.delete('/:id', function(req, res) {

    res.status(200).send("DELETE distributors/:id");
});


exports.router = router;