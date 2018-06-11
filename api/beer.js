const router = require('express').Router();
const express = require('express');
const validation = require('../lib/validation');
const mysql = require('mysql');
const app = express();

/*const mysqlHost = process.env.MYSQL_HOST;
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
}); */

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