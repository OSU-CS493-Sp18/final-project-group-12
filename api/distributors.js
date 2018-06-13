const router = require('express').Router();
const express = require('express');
const validation = require('../lib/validation');
var mysqlPool = require('./db').mysqlPool;
const app = express();


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


// Users
function getDistributionsByUserId(userId) {
    return new Promise((resolve, reject) => {

    });
}


// GET /distributors
function getDistributors() {
    return new Promise((resolve, reject) => {

    });
}
router.get('/', function(req, res) {

    res.status(200).send("GET distributors");
});


// GET /distributors/{id}
function getDistributor(id) {
    return new Promise((resolve, reject) => {

    });
}
router.get('/:id', function(req, res) {

    res.status(200).send("GET distributors/" + req.params.id);
});


// GET /distributors/{id}/beers
function getDistributorBeers(id) {
    return new Promise((resolve, reject) => {

    });
}
router.get('/:id/beers', function(req, res) {

    res.status(200).send("GET distributors/" + req.params.id + "/beers");
});


// POST /distributors
function insertDistributor(distributor) {
    return new Promise((resolve, reject) => {

    });
}
router.post('/', function(req, res) {

    res.status(200).send("POST distributors");
});


// PATCH /distributors/{id}
function patchDistributor(id, distributor) {
    return new Promise((resolve, reject) => {

    });
}
router.patch('/:id', function(req, res) {

    res.status(200).send("PATCH distributors/" + req.params.id);
});


// DELETE /distributors/{id}
function deleteDistributor(id) {
    return new Promise((resolve, reject) => {

    });
}
router.delete('/:id', function(req, res) {

    res.status(200).send("DELETE distributors/" + req.params.id);
});


exports.router = router;