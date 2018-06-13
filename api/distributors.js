const router = require('express').Router();
const validation = require('../lib/validation');
var mysqlPool = require('./db').mysqlPool;


/*
 * Schema describing required/optional fields of a distributor object.
 */
const distributorSchema = {
    name: { required: true },
    address: { required: true },
    state: { required: true },
    zip: { required: true },
    ownerid: { required: true },
    phone: { required: true }
};


function getDistributorsCount() {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT COUNT(*) AS count FROM distributors',
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


// GET /distributors
function getDistributorsPage(page, count) {
    return new Promise((resolve, reject) => {
        const numPerPage = 10;
        const lastPage = Math.ceil(count / numPerPage);
        page = page < 1 ? 1 : page;
        page = page > lastPage ? lastPage : page;
        const offset = (page - 1) * numPerPage;
        mysqlPool.query(
            'SELECT * FROM distributors ORDER BY id LIMIT ?,?', [offset, numPerPage],
            function(err, results) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        distributors: results,
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
    getDistributorsCount()
        .then((count) => {
            return getDistributorsPage(parseInt(req.query.page) || 1, count);
        })
        .then((distributorsInfo) => {
            distributorsInfo.links = {};
            let {
                links,
                totalPages,
                pageNumber
            } = distributorsInfo;
            if (pageNumber < totalPages) {
                links.nextPage = '/distributors?page=' + (pageNumber + 1);
                links.lastPage = '/distributors?page=' + totalPages;
            }
            if (pageNumber > 1) {
                links.prevPage = '/distributors?page=' + (pageNumber - 1);
                links.firstPage = '/distributors?page=1';
            }
            res.status(200).json(distributorsInfo);
        })
        .catch((err) => {
            res.status(500).json({
                error: "Error getting distributors list:" + err
            });
        });
});


// GET /distributors/{id}
function getDistributor(id) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT * FROM distributors WHERE id = ?', [id],
            function(err, results) {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            }
        );
    });
}
router.get('/:id', function(req, res, next) {
    const distributorid = parseInt(req.params.id);

    getDistributor(distributorid)
        .then((distributor) => {
            if (distributor) {
                res.status(200).json(distributor);
            }
            next();
        })
        .catch((err) => {
            res.status(500).json({
                error: "Error getting distributor info: " + err
            });
        });
});


// GET /distributors/{id}/beers
function getDistributorBeers(id) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT * FROM beerDistributors INNER JOIN beer ON beer.id = beerDistributors.beerid WHERE beerDistributors.distributorid = ?;', [id],
            function(err, results) {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            }
        );
    });
}

router.get('/:id/beer', function(req, res, next) {
    const distributorId = parseInt(req.params.id);

    getDistributorBeers(distributorId)
        .then((beer) => {
            if (beer) {
                res.status(200).json(beer);
            } else {
                next();
            }
        })
        .catch((err) => {
            res.status(500).json({
                error: "Error getting distributor info: " + err
            });
        });
});


// POST /distributors
function insertDistributor(distributor) {
    return new Promise((resolve, reject) => {
        distributor = validation.extractValidFields(distributor, distributorSchema);
        mysqlPool.query(
            'INSERT INTO distributors SET ?', distributor,
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

router.post('/', function(req, res) {
    if (validation.validateAgainstSchema(req.body, distributorSchema)) {
        insertDistributor(req.body)
            .then((id) => {
                res.status(201).json({
                    id: id,
                    links: {
                        distributor: '/distributors/' + id
                    }
                });
            })
            .catch((err) => {
                res.status(500).json({
                    error: "Error inserting distributor object: " + err
                });
            });
    } else {
        res.status(400).json({
            error: "Incorrect JSON body"
        });
    }
});


// POST /distributors/{id}/beer
function postDistributorBeer(id, beerId) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'INSERT INTO beerDistributors (beerid, distributorid) VALUES (?,?);', [beerId, id],
            function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

router.post('/:id/beer', function(req, res) {
    const distributorId = parseInt(req.params.id);

    if (req.body && req.body.beerId) {
        postDistributorBeer(distributorId, req.body.beerId)
            .then((result) => {
                res.status(201).json({
                    links: {
                        distributor: '/distributors/' + distributorId + '/beers'
                    }
                });
            })
            .catch((err) => {
                res.status(500).json({
                    error: "Error posting beer for distributor object: " + err
                });
            });
    } else {
        res.status(400).json({
            error: "Incorrect JSON body"
        });
    }
});


// PATCH /distributors/{id}
function patchDistributor(id, distributor) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'UPDATE distributors SET ? WHERE id = ?', [distributor, id],
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

router.patch('/:id', function(req, res, next) {
    const distributorId = parseInt(req.params.id);
    if (req.body) {
        if (distributorId) {
            patchDistributor(distributorId, req.body)
                .then((result) => {
                    if (result) {
                        res.status(201).json({
                            id: distributorId,
                            links: {
                                beer: '/distributors/' + distributorId
                            }
                        });
                    } else {
                        next();
                        return;
                    }
                })
                .catch((err) => {
                    res.status(500).json({
                        error: "Error patching distributor object: " + err
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


// DELETE /distributors/{id}
function deleteDistributor(id) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'DELETE FROM distributors WHERE id = ? ', [id],
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

router.delete('/:id', function(req, res, next) {
    const id = parseInt(req.params.id);
    deleteDistributor(id)
        .then((deleteSuccessful) => {
            if (deleteSuccessful) {
                res.status(204).end();
            } else {
                next();
            }
        })
        .catch((err) => {
            res.status(500).json({
                error: "Cannot delete distributor entry: " + err
            });
        });
});


// DELETE /distributors/{id}/beer/{beerid}
function deleteDistributorBeer(id, beerid) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'DELETE FROM beerDistributors WHERE distributorid = ? AND beerid = ?', [id, beerid],
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

router.delete('/:id/beer/', function(req, res, next) {
    const id = parseInt(req.params.id);
    if (req.body && req.body.beerId) {
        deleteDistributorBeer(id, req.body.beerId)
            .then((deleteSuccessful) => {
                if (deleteSuccessful) {
                    res.status(204).end();
                } else {

                    next();
                }
            })
            .catch((err) => {
                res.status(500).json({
                    error: "Cannot delete distributor's beer: " + err
                });
            });
    } else {
        res.status(400).json({
            error: "Incorrect JSON body"
        });
    }
});


// GET /users/:username/distributors
function getDistributionsByUserId(username) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT * FROM distributors WHERE ownerid = ?;', [username],
            function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

exports.router = router;
exports.getDistributionsByUserId = getDistributionsByUserId;