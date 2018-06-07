const router = require('express').Router();
const validation = require('../lib/validation');

/*
 * Schema describing required/optional fields of a brewery object.
 */
const brewerySchema = {
    name: { required: true },
    locations: { required: true },
    address: { required: false },
    state: { required: true },
    zip: { required: true },
    phone: { required: true }
};


router.get('/', function(req, res) {

    res.status(200).send("GET breweries");
});


router.get('/:id', function(req, res) {

    res.status(200).send("GET breweries/:id");
});


router.get('/:id/beers', function(req, res) {

    res.status(200).send("GET breweries/:id/beers");
});


router.post('/', function(req, res) {

    res.status(200).send("POST breweries");
});


router.patch('/:id', function(req, res) {

    res.status(200).send("PATCH breweries/:id");
});


router.delete('/:id', function(req, res) {

    res.status(200).send("DELETE breweries/:id");
});


exports.router = router;