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


// GET /breweries
function getBreweries() {
    return new Promise((resolve, reject) => {

    });
}
router.get('/', function(req, res) {

    res.status(200).send("GET breweries");
});


// GET /breweries/{id}
function getBrewery(id) {
    return new Promise((resolve, reject) => {

    });
}
router.get('/:id', function(req, res) {

    res.status(200).send("GET breweries/" + req.params.id);
});


// GET /breweries/{id}/beers
function getBreweryBeers(id) {
    return new Promise((resolve, reject) => {

    });
}
router.get('/:id/beers', function(req, res) {

    res.status(200).send("GET breweries/" + req.params.id + "/beers");
});


// POST /breweries
function insertBrewery(brewery) {
    return new Promise((resolve, reject) => {

    });
}
router.post('/', function(req, res) {

    res.status(200).send("POST breweries");
});


// PATCH /breweries/{id}
function patchBrewery(id, brewery) {
    return new Promise((resolve, reject) => {

    });
}
router.patch('/:id', function(req, res) {

    res.status(200).send("PATCH breweries/" + req.params.id);
});


// DELETE /breweries/{id}
function deleteBrewery(id) {
    return new Promise((resolve, reject) => {

    });
}
router.delete('/:id', function(req, res) {

    res.status(200).send("DELETE breweries/" + req.params.id);
});


exports.router = router;