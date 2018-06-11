const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
const MongoClient = require('mongodb').MongoClient;

const api = require('./api');

// Application
const app = express();
const port = process.env.PORT || 8000;

// MongoDB
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || '27017';
const mongoDBName = process.env.MONGO_DATABASE;
const mongoUser = process.env.MONGO_INITDB_ROOT_USERNAME;
const mongoPassword = process.env.MONGO_INITDB_ROOT_PASSWORD;

const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}?authSource=admin`
console.log("== MONGO URL: " + mongoURL);


// Pre-middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bearerToken());


// API routes
app.use('/', api);

// 404 - Not Found
app.use('*', function(req, res, next) {
    res.status(404).json({
        error: "Requested resource " + req.originalUrl + " does not exist"
    });
});


// Mongo connect and start listening
setTimeout(function() {
    MongoClient.connect(mongoURL, { useNewUrlParser: true }, function(err, client) {
        if (err) { console.log(err); }

        if (!err) {
            app.locals.mongoDB = client.db(mongoDBName);
            app.listen(port, function() {
                console.log("== Server is running on port", port);
            });
        }
    });
}, 5000);