const router = require('express').Router();
const validation = require('../lib/validation');

/*
 * Schema describing required/optional fields of a beer object.
 */
const beerSchema = {
    name: { required: true },
    style: { required: true },
    abv: { required: true },
    ibu: { required: true },
    description: { required: true },
    image: { required: true },
};


// GET /beers
router.get('/', function(req, res) {

    res.status(200).send("GET beers");
});


// GET /beers/{id}
router.get('/:id', function(req, res) {

    res.status(200).send("GET beers/:id");
});


// POST /beers
router.post('/', function(req, res) {

    res.status(200).send("POST beers");
});


// PATCH /beers/{id}
router.patch('/:id', function(req, res) {

    res.status(200).send("PATCH beers/:id");
});


// DELETE /beers/{id}
router.delete('/:id', function(req, res) {

    res.status(200).send("DELETE beers/:id");
});


exports.router = router;