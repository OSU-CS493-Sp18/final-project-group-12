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
function getBeers() {
    return new Promise((resolve, reject) => {

    });
}
router.get('/', function(req, res) {

    res.status(200).send("GET beers");
});


// GET /beers/{id}
function getBeer(id) {
    return new Promise((resolve, reject) => {

    });
}
router.get('/:id', function(req, res) {

    res.status(200).send("GET beers/" + req.params.id);
});


// POST /beers
function insertBeer(beer) {
    return new Promise((resolve, reject) => {

    });
}
router.post('/', function(req, res) {

    res.status(200).send("POST beers");
});


// PATCH /beers/{id}
function patchBeer(id, beer) {
    return new Promise((resolve, reject) => {

    });
}
router.patch('/:id', function(req, res) {

    res.status(200).send("PATCH beers/" + req.params.id);
});


// DELETE /beers/{id}
function deleteBeer(id) {
    return new Promise((resolve, reject) => {

    });
}
router.delete('/:id', function(req, res) {

    res.status(200).send("DELETE beers/" + req.params.id);
});


exports.router = router;