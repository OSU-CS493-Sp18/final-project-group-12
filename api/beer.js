const router = require('express').Router();
const express = require('express');
const validation = require('../lib/validation');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const mysqlHost = process.env.MYSQL_HOST;
const mysqlPort = process.env.MYSQL_PORT || '3306';
const mysqlDBName = process.env.MYSQL_DATABASE;
const mysqlUser = process.env.MYSQL_USER;
const mysqlPassword = process.env.MYSQL_PASSWORD;

const maxMySQLConnections = 10;
const mysqlPool = mysql.createPool({
    connectionLimit: maxMySQLConnections,
    host: mysqlHost,
    port: mysqlPort,
    database: mysqlDBName,
    user: mysqlUser,
    password: mysqlPassword
});

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

function getBeerCount() {
    return new Promise((resolve, reject) => {
      mysqlPool.query(
        'SELECT COUNT(*) AS count FROM beer',
        function (err, results) {
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
        function (err, results) {
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
                links.nextPage = '/beer?page=' + (pageNumber+1);
                links.lastPage = 'beer?page=' + totalPages;
            }      
            if (pageNumber > 1) {
                links.prevPage = '/beer?page=' + (pageNumber - 1);
                links.firstPage = '/beer?page=1';
            }
            res.status(200).json(beerInfo);
        })
        .catch((err) => {
            res.status(500).json({
                error: "Error getting beer list"
            });
        });
});

// GET /beers/{id}
function getBeerByID(beerID) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT * FROM beer WHERE id = ?',
            [beerID],
            function (err, results) {
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
            'SELECT * FROM breweries WHERE id = (SELECT brewerid FROM beer WHERE id = ?)',
            [beerID],
            function(err, results) {
                if(err) {
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
            'SELECT * FROM distributors WHERE id = (SELECT distributorid FROM beerDistributors WHERE beerid = ?)',
            [beerID],
            function(err, results) {
                if(err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            }
        )
    });
}

router.get('/:beerID', function(req, res) {
    var BeerObj;
    const beerID = parseInt(req.params.beerID);
    getBeerByID(beerID)
        .then((beer) => {
            if(beer) {
                BeerObj = beer;
                return getBreweryFromBeerID(beerID);
            } else {
                next();
            }
        })
        .then ((brewery) => {
            if(brewery) {
                BeerObj.brewery = brewery;
                return getDistributorFromBeerID(beerID);
            }
        })
        .then ((distributor) => {
            if(distributor) {
                BeerObj.distributor = distributor;
            }
            res.status(200).json(BeerObj);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: "Error getting beer info"
            });
        });
});


// POST /beers
function insertBeer(beer) {
    console.log('made it here with object' + JSON.stringify(beer));
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'INSERT INTO beer (name, style, abv, ibu, description, image, brewerid) VALUES (?,?,?,?,?,?,?)',
            [beer.name, beer.style, beer.abv, beer.ibu, beer.description, beer.image, beer.brewerid],
            function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    resolve(result.insertId);
                }
            }
        );
    });
}

router.post('/', function(req, res, next) {
    if(req.body && req.body.name && req.body.style && req.body.abv && req.body.ibu && req.body.brewerid) {
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
                error: "Error inserting beer object"
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
    console.log('made it here with object' + JSON.stringify(beer));
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'UPDATE beer SET name = ? , style = ?, abv = ?, ibu = ?, description = ?, image = ?, brewerid = ? WHERE id = ?',
            [beer.name, beer.style, beer.abv, beer.ibu, beer.description, beer.image, beer.brewerid, beerID],
            function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    resolve(result.insertId);
                }
            }
        );
    });
}

router.patch('/:beerID', function(req, res) {
    const beerID = parseInt(req.params.beerID);
    console.log('made it here with object' + JSON.stringify(req.body));
    if(req.body && (req.body.name || req.body.style || req.body.abv || req.body.ibu || req.body.description || req.body.image || req.body.brewerid)) {
        updateBeer(beerID, req.body)
        .then((id) => {
            res.status(201).json({
                id: id,
                links: {
                    beer: '/beer/' + beerID
                }
            });
        }) 
        .catch((err) => {
            res.status(500).json({
                error: "Error patching beer object"
            });
        });
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
            'DELETE FROM beer WHERE id = ? ',
            [beerID],
            function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.affectedRows > 0);
                }
            }
        );
    });
}

router.delete('/:beerID', function (req, res, next) {
    const beerID = parseInt(req.params.beerID);
    deleteBeerByID(beerID)
        .then((deleteSuccessful) => {
            if (deleteSuccessful) {
                res.status(204).end();
                console.log('Deleted the beer entry');
            } else {
                next();
            }
        })
        .catch((err) => {
            res.status(500).json({
                error: "Cannot delete beer entry "
            });
        });
});

exports.router = router;