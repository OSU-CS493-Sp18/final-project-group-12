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


function getBreweriesPage(page, count) {
  return new Promise((resolve, reject) => {
    const numPerPage = 10;
    const lastPage = Math.ceil(count / numPerPage);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const offset = (page - 1) * numPerPage;
    mysqlPool.query(
      'SELECT * FROM breweries ORDER BY id LIMIT ?,?', [offset, numPerPage],
      function (err, results) {
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
// GET /breweries
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
              links.nextPage = '/breweries?page=' + (pageNumber+1);
              links.lastPage = 'breweries?page=' + totalPages;
          }
          if (pageNumber > 1) {
              links.prevPage = '/breweries?page=' + (pageNumber - 1);
              links.firstPage = '/breweries?page=1';
          }
          res.status(200).json(breweriesInfo);
      })
      .catch((err) => {
          res.status(500).json({
              error: "Error getting breweries list"
          });
      });

});


// GET /breweries/{id}
function getBrewery(id) {
    return new Promise((resolve, reject) => {
      mysqlPool.query(
          'SELECT * FROM breweries WHERE id = ?',
          [id],
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

router.get('/:id', function(req, res) {

    const breweryid = parseInt(req.params.id);
    getBrewery(breweryid)
      .then((brewery) => {
        if(brewery) {
          res.status(200).json(brewery);
        } else {
            next();
        }

      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
            error: "Error getting beer info"
        });
      });

});


// GET /breweries/{id}/beers


function getBeerFromBreweryID(breweryID) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT * FROM beer WHERE brewerid = ?',
            [breweryID],
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

router.get('/:id/beers', function(req, res) {
  const breweryid = parseInt(req.params.id);
  getBeerFromBreweryID(breweryid)
    .then((beer) => {
      if(beer) {
        res.status(200).json(beer);
      } else {
        next();
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
          error: "Error getting brewery info"
      });
    });
});


// POST /breweries
function insertBrewery(brewery) {
  console.log('made it here with object' + JSON.stringify(brewery));
  return new Promise((resolve, reject) => {
      brewery = validation.extractValidFields(brewery, brewerySchema);
      mysqlPool.query(
          'INSERT INTO brewery SET ?',
          brewery,
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
router.post('/', function(req, res) {
  if(validation.validateAgainstSchema(req.body, brewerySchema)) {
      insertBeer(req.body)
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
              error: "Error inserting brewery object"
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
