const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');

var db = require('./api/db');
const api = require('./api');

// Application
const app = express();
const port = process.env.PORT || 8000;


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
    db.MongoClient.connect(db.mongoURL, { useNewUrlParser: true }, function(err, client) {
        if (err) { console.log(err); }

        if (!err) {
            app.locals.mongoDB = client.db(db.mongoDBName);
            app.listen(port, function() {
                console.log("== Server is running on port", port);
            });
        }
    });
}, 5000);