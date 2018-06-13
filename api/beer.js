const router = require('express').Router();
const validation = require('../lib/validation');
var mysqlPool = require('./db').mysqlPool;


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
    brewerid: { required: true }
};

function getBeerCount() {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT COUNT(*) AS count FROM beer',
            function(err, results) {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0].count);
                }
            }
        );
    });
}

function getBeerPage(page, count) {
    return new Promise((resolve, reject) => {
        const numPerPage = 10;
        const lastPage = Math.ceil(count / numPerPage);
        page = page < 1 ? 1 : page;
        page = page > lastPage ? lastPage : page;
        const offset = (page - 1) * numPerPage;
        mysqlPool.query(
            'SELECT * FROM beer ORDER BY id LIMIT ?,?', [offset, numPerPage],
            function(err, results) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        beer: results,
                        pageNumber: page,
                        totalPages: lastPage,
                        pageSize: numPerPage,
                        totalCount: count
                    });
                }
            }
        );
    });
}

router.get('/', function(req, res) {
    getBeerCount()
        .then((count) => {
            return getBeerPage(parseInt(req.query.page) || 1, count);
        })
        .then((beerInfo) => {
            beerInfo.links = {};
            let {
                links,
                totalPages,
                pageNumber
            } = beerInfo;
            if (pageNumber < totalPages) {
                links.nextPage = '/beer?page=' + (pageNumber + 1);
                links.lastPage = '/beer?page=' + totalPages;
            }
            if (pageNumber > 1) {
                links.prevPage = '/beer?page=' + (pageNumber - 1);
                links.firstPage = '/beer?page=1';
            }
            res.status(200).json(beerInfo);
        })
        .catch((err) => {
            res.status(500).json({
                error: "Error getting beer list: " + err
            });
        });
});

// GET /beers/{id}
function getBeerByID(beerID) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT * FROM beer WHERE id = ?', [beerID],
            function(err, results) {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            }
        )
    });
}

function getBreweryFromBeerID(beerID) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT * FROM breweries WHERE id = (SELECT brewerid FROM beer WHERE id = ?)', [beerID],
            function(err, results) {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            }
        )
    });
}

function getDistributorFromBeerID(beerID) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT * FROM distributors WHERE id = (SELECT distributorid FROM beerDistributors WHERE beerid = ?)', [beerID],
            function(err, results) {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            }
        )
    });
}

router.get('/:beerID', function(req, res, next) {
    var BeerObj;
    const beerID = parseInt(req.params.beerID);

    getBeerByID(beerID)
        .then((beer) => {
            if (beer) {
                BeerObj = beer;
                return getBreweryFromBeerID(beerID);
            }
            next();
        })
        .then((brewery) => {
            if (brewery) {
                BeerObj.brewery = brewery;
                return getDistributorFromBeerID(beerID);
            }
            return Promise.reject("Brewery for beer not found");
        })
        .then((distributor) => {
            if (distributor) {
                BeerObj.distributor = distributor;
            }
            res.status(200).json(BeerObj);
        })
        .catch((err) => {
            res.status(500).json({
                error: "Error getting beer info: " + err
            });
        });
});


// POST /beers
function insertBeer(beer) {
    return new Promise((resolve, reject) => {
        beer = validation.extractValidFields(beer, beerSchema);
        mysqlPool.query(
            'INSERT INTO beer SET ?', [beer],
            function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.insertId);
                }
            }
        );
    });
}

router.post('/', function(req, res, next) {
    if (validation.validateAgainstSchema(req.body, beerSchema)) {
        insertBeer(req.body)
            .then((id) => {
                res.status(201).json({
                    id: id,
                    links: {
                        beer: '/beer/' + id
                    }
                });
            })
            .catch((err) => {
                res.status(500).json({
                    error: "Error inserting beer object: " + err
                });
            });
    } else {
        res.status(400).json({
            error: "Incorrect JSON body"
        });
    }
});


// PATCH /beers/{id}
function updateBeer(beerID, beer) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'UPDATE beer SET ? WHERE id = ?', [beer, beerID],
            function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    if (result && result.affectedRows > 0) {
                        resolve(result);
                    } else {
                        resolve(null);
                    }
                }
            }
        );
    });
}

router.patch('/:beerID', function(req, res, next) {
    const beerID = parseInt(req.params.beerID);
    if (req.body) {
        if (beerID) {
            updateBeer(beerID, req.body)
                .then((result) => {
                    if (result) {
                        res.status(201).json({
                            id: beerID,
                            links: {
                                beer: '/beer/' + beerID
                            }
                        });
                    } else {
                        next();
                        return;
                    }
                })
                .catch((err) => {
                    res.status(500).json({
                        error: "Error patching beer object: " + err
                    });
                });
        } else {
            next();
            return;
        }
    } else {
        res.status(400).json({
            error: "Incorrect JSON body"
        });
    }
});


// DELETE /beers/{id}
function deleteBeerByID(beerID) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'DELETE FROM beer WHERE id = ? ', [beerID],
            function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.affectedRows > 0);
                }
            }
        );
    });
}

router.delete('/:beerID', function(req, res, next) {
    const beerID = parseInt(req.params.beerID);

    if (beerID) {
        deleteBeerByID(beerID)
            .then((deleteSuccessful) => {
                if (deleteSuccessful) {
                    res.status(204).end();
                } else {
                    next();
                }
            })
            .catch((err) => {
                res.status(500).json({
                    error: "Cannot delete beer entry: " + err
                });
            });
    } else {
        next();
    }
});


exports.router = router;