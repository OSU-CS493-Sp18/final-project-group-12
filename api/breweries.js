const router = require('express').Router();
const validation = require('../lib/validation');
var mysqlPool = require('./db').mysqlPool;


/*
 * Schema describing required/optional fields of a brewery object.
 */
const brewerySchema = {
    name: { required: true },
    address: { required: false },
    city: { required: true },
    state: { required: true },
    zip: { required: true },
    phone: { required: true }
};


function getBreweriesCount() {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT COUNT(*) AS count FROM breweries',
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


// GET /breweries
function getBreweriesPage(page, count) {
    return new Promise((resolve, reject) => {
        const numPerPage = 10;
        const lastPage = Math.ceil(count / numPerPage);
        page = page < 1 ? 1 : page;
        page = page > lastPage ? lastPage : page;
        const offset = (page - 1) * numPerPage;
        mysqlPool.query(
            'SELECT * FROM breweries ORDER BY id LIMIT ?,?', [offset, numPerPage],
            function(err, results) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        breweries: results,
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
    getBreweriesCount()
        .then((count) => {
            return getBreweriesPage(parseInt(req.query.page) || 1, count);
        })
        .then((breweriesInfo) => {
            breweriesInfo.links = {};
            let {
                links,
                totalPages,
                pageNumber
            } = breweriesInfo;
            if (pageNumber < totalPages) {
                links.nextPage = '/breweries?page=' + (pageNumber + 1);
                links.lastPage = '/breweries?page=' + totalPages;
            }
            if (pageNumber > 1) {
                links.prevPage = '/breweries?page=' + (pageNumber - 1);
                links.firstPage = '/breweries?page=1';
            }
            res.status(200).json(breweriesInfo);
        })
        .catch((err) => {
            res.status(500).json({
                error: "Error getting breweries list:" + err
            });
        });
});


// GET /breweries/{id}
function getBrewery(id) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT * FROM breweries WHERE id = ?', [id],
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
    const breweryID = parseInt(req.params.id);

    getBrewery(breweryID)
        .then((brewery) => {
            if (brewery) {
                res.status(200).json(brewery);
            }
            next();
        })
        .catch((err) => {
            res.status(500).json({
                error: "Error getting brewery info: " + err
            });
        });
});


// GET /breweries/{id}/beers
function getBeerFromBreweryID(breweryID) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT * FROM beer WHERE brewerid = ?', [breweryID],
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

router.get('/:id/beers', function(req, res, next) {
    const breweryid = parseInt(req.params.id);

    getBeerFromBreweryID(breweryid)
        .then((beer) => {
            if (beer) {
                res.status(200).json(beer);
            }
            next();
        })
        .catch((err) => {
            res.status(500).json({
                error: "Error getting brewery info: " + err
            });
        });
});


// POST /breweries
function insertBrewery(brewery) {
    return new Promise((resolve, reject) => {
        brewery = validation.extractValidFields(brewery, brewerySchema);
        mysqlPool.query(
            'INSERT INTO breweries SET ?', brewery,
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
    if (validation.validateAgainstSchema(req.body, brewerySchema)) {
        insertBrewery(req.body)
            .then((id) => {
                res.status(201).json({
                    id: id,
                    links: {
                        brewery: '/breweries/' + id
                    }
                });
            })
            .catch((err) => {
                res.status(500).json({
                    error: "Error inserting brewery object: " + err
                });
            });
    } else {
        res.status(400).json({
            error: "Incorrect JSON body"
        });
    }
});


// PATCH /breweries/{id}
function patchBrewery(id, brewery) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'UPDATE breweries SET ? WHERE id = ?', [brewery, id],
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
    const breweryid = parseInt(req.params.id);
    if (req.body) {
        if (breweryid) {
            patchBrewery(breweryid, req.body)
                .then((result) => {
                    if (result) {
                        res.status(201).json({
                            id: breweryid,
                            links: {
                                beer: '/breweries/' + breweryid
                            }
                        });
                    } else {
                        next();
                        return;
                    }
                })
                .catch((err) => {
                    res.status(500).json({
                        error: "Error patching brewery object: " + err
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


// DELETE /breweries/{id}
function deleteBrewery(id) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'DELETE FROM breweries WHERE id = ? ', [id],
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
    deleteBrewery(id)
        .then((deleteSuccessful) => {
            if (deleteSuccessful) {
                res.status(204).end();
            } else {
                next();
            }
        })
        .catch((err) => {
            res.status(500).json({
                error: "Cannot delete brewery entry: " + err
            });
        });
});


exports.router = router;